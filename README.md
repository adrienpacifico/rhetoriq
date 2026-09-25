# Rhetoriq — analyse du discours politique en direct

POC d'interface pour lire un débat politique **avec des lunettes critiques** : la vidéo YouTube
à gauche, le transcript qui défile à droite, et au fil de la parole des annotations qui
apparaissent (sophismes, procédés rhétoriques, fact-checks notés de 0 à 100 % « fake »,
moments-clés au sens de Habermas).

Premier exemple : le débat France Inter entre Manuel Bompard et Laurent Nuñez
(https://www.youtube.com/watch?v=RtS0Aap_hts).

## Lancer

```bash
bun install
bun run dev        # http://localhost:5173
```

Deux pages, routées par le hash de l'URL :

- `/` : **bibliothèque** — miniatures YouTube de toutes les vidéos, badge du score Habermas,
  compteurs (sophismes, procédés, faits + fake moyen, moments), recherche par titre / chaîne /
  intervenant·e. Une vidéo dont seul le transcript existe apparaît grisée « transcript seul ».
- `#v=<videoId>` : **page d'analyse** — lecteur + transcript annoté. Le logo ou le bouton
  « Vidéos » ramènent à la bibliothèque.

La vidéo n'est jamais téléchargée : elle est lue via l'iframe YouTube, dont on lit le temps
courant pour synchroniser le texte. Pré-requis : [bun](https://bun.sh) et [uv](https://docs.astral.sh/uv/).

## Ajouter une vidéo

### Avec Claude Code (recommandé)

```
/analyze-video https://www.youtube.com/watch?v=XXXXXXXXXXX
```

Le skill [.claude/skills/analyze-video/SKILL.md](.claude/skills/analyze-video/SKILL.md) orchestre
tout : sous-titres, agent de diarisation (Sonnet), puis trois agents Opus en parallèle
(sophismes / procédés, fact-check avec recherche web, évaluation habermassienne), validation,
fusion. Comptez 10 à 15 minutes pour une vidéo de 15 minutes. La nouvelle vidéo apparaît dans le
sélecteur en haut de l'UI.

### À la main

```bash
uv run scripts/fetch_transcript.py <url-ou-id> [--lang fr]   # 1. sous-titres → transcript daté
# 2. lancer les agents avec les prompts de analysis/prompts/*.md (diarization d'abord,
#    puis fallacies / facts / habermas) : ils écrivent analysis/<id>/*.json
uv run scripts/check_analysis.py <id>                        # 3. validation (citations exactes, ids…)
uv run scripts/build_analysis.py <id>                        # 4. fusion → src/data/videos/<id>/analysis.json
```

Les prompts sont des templates avec placeholders (`{{VIDEO_ID}}`, `{{CONTEXT}}`, `{{SPEAKERS}}`…),
décrits dans [analysis/prompts/README.md](analysis/prompts/README.md). Le contrat de données
entre agents et UI est dans [analysis/SCHEMA.md](analysis/SCHEMA.md).

## Pipeline de données

```
YouTube auto-captions ──▶ scripts/fetch_transcript.py ──▶ src/data/videos/<id>/transcript.json (mots datés)
                                                    └──▶ analysis/<id>/transcript.txt (pour les agents)

agent Sonnet   ──▶ analysis/<id>/speakers.json    diarisation (ids de locuteurs) + chapitres
agents Opus ×3 ──▶ analysis/<id>/fallacies.json   sophismes + procédés rhétoriques
               ──▶ analysis/<id>/facts.json       fact-checks sourcés (recherche web)
               ──▶ analysis/<id>/habermas.json    qualité délibérative

scripts/check_analysis.py ──▶ validation (exit 1 si erreur ; les agents l'exécutent eux-mêmes)
scripts/build_analysis.py ──▶ src/data/videos/<id>/analysis.json + src/data/videos.json (index)
```

## Ce que montre l'UI

- **Transcript karaoké** : les mots déjà prononcés s'allument, les suivants restent en retrait ;
  le défilement suit la parole et s'arrête dès qu'on scrolle (pastille « Reprendre le suivi »).
- **Annotations en direct** : un passage se surligne quand il vient d'être dit, avec une carte
  en marge (sophisme, procédé, fait). L'intensité du surlignage suit la gravité.
- **Agents de vérification** : sur une affirmation factuelle, un agent est « dépêché » (scan
  animé), puis rend un verdict avec un fake-o-mètre 0-100 et des sources.
- **Timeline forensique** : chapitres, tours de parole, ticks colorés par annotation.
- **Fiches locuteurs** : compteurs, temps de parole, et jauge Habermas en direct (vérité,
  justesse, sincérité, clarté) qui bouge à chaque moment-clé.
- **Bilan** : la situation idéale de parole selon Habermas, scores et verdicts (Échap pour fermer).
- **Filtres** par couche, mode « Tout révéler », sélecteur de vidéo dans le header.

## Arborescence

```
.claude/skills/analyze-video/   skill Claude Code /analyze-video
analysis/SCHEMA.md              contrat de données agents ↔ UI
analysis/prompts/               templates de prompts des agents
analysis/<id>/                  sorties des agents pour une vidéo
scripts/                        fetch_transcript, check_analysis, build_analysis (uv)
src/data/videos/<id>/           transcript.json + analysis.json consommés par l'UI
src/data/videos.json            index des vidéos (généré)
src/App.tsx                     routage (bibliothèque ↔ page d'analyse), chargement paresseux
src/Workspace.tsx               espace de lecture d'une vidéo
src/components/                 Gallery, Header, Player, Timeline, Transcript, AnnotationCard, SpeakerPanel, AgentFeed, HabermasSheet
src/lib/                        youtube (IFrame API), analysis (placement des citations), format
```

## Limites

- Transcript issu des sous-titres automatiques : noms propres déformés, ponctuation approximative.
  Les annotations citent ce texte tel quel.
- La latence des agents dans l'UI est simulée : les fact-checks sont précalculés.
- Les analyses sont produites par des agents et servent à démontrer l'interface : ce sont des
  grilles de lecture, pas des verdicts.
