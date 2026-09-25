---
name: analyze-video
description: Analyse une vidéo YouTube de discours politique pour Rhetoriq — sous-titres, diarisation (Sonnet), sophismes / fact-check / Habermas (Opus), fusion, vérification. Usage: /analyze-video <url ou id YouTube> [--lang fr]
---

# /analyze-video — pipeline complet pour une nouvelle vidéo

Argument reçu : `$ARGUMENTS` (URL YouTube ou id de 11 caractères, option `--lang xx` si la vidéo
n'est pas en français). Tout se fait depuis la racine du dépôt. Ne commite rien sauf demande.

## 0. Pré-requis
- `uv` et `bun` installés ; la vidéo reste sur YouTube, on ne télécharge que les sous-titres.
- Contrat de données : `analysis/SCHEMA.md`. Templates de prompts : `analysis/prompts/*.md`.

## 1. Transcript
```bash
uv run scripts/fetch_transcript.py <url-ou-id> [--lang fr]
```
Note l'id `<VID>` et le nombre de segments affichés. Sorties :
`src/data/videos/<VID>/transcript.json` et `analysis/<VID>/transcript.txt`.
Si aucun sous-titre n'existe dans la langue demandée, le script liste les langues disponibles :
relance avec `--lang`.

## 2. Contexte
Lis les 40 premières lignes et quelques passages du milieu/fin de `analysis/<VID>/transcript.txt`.
Rédige `CONTEXT` (2 à 4 phrases) : type de vidéo (débat, interview, discours, question au
gouvernement…), participants et leur rôle, thèmes, date, et les déformations de noms propres
repérées dans les sous-titres (ex. « Lunis » = Nuñez). Si les participants ne sont pas clairs,
une recherche web sur le titre (WebSearch) suffit. Note aussi `LAST_SEGMENT` (dernier id, ex. s179).

## 3. Diarisation (Sonnet, d'abord)
Lis `analysis/prompts/diarization.md`, remplace `{{VIDEO_ID}}`, `{{TITLE}}`, `{{CONTEXT}}`,
`{{LAST_SEGMENT}}`, puis lance UN agent :
- `subagent_type: general-purpose`, `model: sonnet`, `run_in_background: true`, prompt = template rempli.
Attends sa notification de fin (rien d'autre à faire pendant ce temps, sauf préparer les prompts
suivants). Lis ensuite le bloc `speakers` de `analysis/<VID>/speakers.json` et construis
`SPEAKERS`, une ligne par locuteur : `- <id> : <name> (<role>, <kind>)`.

## 4. Analyses (Opus, en parallèle)
Remplis `analysis/prompts/fallacies.md`, `facts.md`, `habermas.md` avec les mêmes placeholders
plus `{{SPEAKERS}}`, et lance les TROIS agents dans le même tour :
- `subagent_type: general-purpose`, `model: opus`, `run_in_background: true`.
- L'agent facts a besoin de WebSearch/WebFetch (le prompt lui dit de les charger via ToolSearch).
Durées indicatives pour 16 min de vidéo : diarisation ≈ 5 min, sophismes ≈ 8 min,
fact-check ≈ 10 min, Habermas ≈ 4 min. Pour une vidéo > 45 min, préviens l'utilisateur que ce
sera long ; tu peux scinder le prompt sophismes en deux agents par plage de segments et fusionner
les tableaux `annotations` à la main (ids uniques).

## 5. Vérification et fusion
Quand les trois notifications sont arrivées :
```bash
uv run scripts/check_analysis.py <VID>
```
- Erreurs sur un fichier → renvoie le message d'erreur à l'agent concerné avec SendMessage
  (« corrige et relance la validation ») plutôt que de réécrire son JSON toi-même, sauf pour une
  coquille évidente.
- Quand tout est `OK` :
```bash
uv run scripts/build_analysis.py <VID>
```
Cela écrit `src/data/videos/<VID>/analysis.json` et rafraîchit `src/data/videos.json`
(le sélecteur de vidéos de l'UI se met à jour tout seul).

## 6. Contrôle visuel
Lance ou réutilise le serveur (`bun run dev`, configuration `rhetoriq-dev` dans
`.claude/launch.json`) et ouvre `http://localhost:5173/#v=<VID>`. Vérifie : lecteur chargé,
tours de parole nommés, annotations qui apparaissent en direct, fiches locuteurs remplies.

## 7. Rapport à l'utilisateur
Compte-rendu court : lien local, tableau (locuteurs, chapitres, sophismes, procédés, faits +
fake moyen, moments Habermas, score global), 3 à 5 détections marquantes, et les limites
(citations approximatives signalées `[approx]`, faits invérifiables, segments à l'attribution
douteuse).
