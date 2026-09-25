# Rhetoriq — schéma d'analyse (contrat entre les agents d'analyse et l'UI)

Chaque vidéo a son dossier `analysis/<videoId>/` :

| Fichier | Produit par | Rôle |
|---|---|---|
| `transcript.txt` | `scripts/fetch_transcript.py` | source : une ligne par segment `[sNNN mm:ss-mm:ss] texte` |
| `speakers.json` | agent diarisation (Sonnet) | locuteurs, tour de parole par segment, chapitres |
| `fallacies.json` | agent sophismes (Opus) | arguments fallacieux + procédés rhétoriques |
| `facts.json` | agent fact-check (Opus + recherche web) | affirmations vérifiées, sources |
| `habermas.json` | agent Habermas (Opus) | qualité délibérative |

Le texte vient des sous-titres automatiques YouTube : il contient des erreurs de transcription
(noms propres déformés, ponctuation approximative). **Cite toujours le texte tel quel.**

Toutes les sorties sont des fichiers JSON **valides** (pas de commentaires, pas de virgule
finale), encodés en UTF-8, textes en français. Validation : `uv run scripts/check_analysis.py <videoId>`.
Fusion pour l'UI : `uv run scripts/build_analysis.py <videoId>` → `src/data/videos/<videoId>/analysis.json`.

---

## 1. `speakers.json` — diarisation + chapitres

```json
{
  "speakers": {
    "moderator": { "name": "Journaliste France Inter", "role": "Modération", "party": null, "kind": "moderator" },
    "bompard":   { "name": "Manuel Bompard", "role": "Député, coordinateur LFI", "party": "LFI", "kind": "debater" },
    "nunez":     { "name": "Laurent Nuñez", "role": "Ministre de l'Intérieur", "party": null, "kind": "debater" }
  },
  "turns": [ { "segmentId": "s001", "speaker": "moderator" } ],
  "chapters": [
    { "id": "c1", "title": "Racisme dans la police", "start": 18.0, "end": 240.5, "summary": "1 phrase" }
  ]
}
```
- Les ids de locuteurs sont des slugs ASCII minuscules choisis par l'agent de diarisation
  (`moderator` pour l'animation, nom de famille pour les débatteurs). Ils sont réutilisés tels
  quels par les autres fichiers.
- `kind` : `moderator` (distribue la parole, n'est pas évalué) ou `debater` (évalué, fiche
  locuteur dans l'UI). Un monologue = un seul `debater`.
- `color` (optionnel, hex) force la couleur du locuteur dans l'UI.
- `turns` doit contenir **exactement une entrée par segment**, dans l'ordre. Un segment
  appartient à un seul locuteur (le majoritaire si mélange).
- 4 à 8 chapitres contigus couvrant toute la vidéo (temps en secondes).

---

## 2. `fallacies.json` — sophismes et procédés rhétoriques

```json
{ "annotations": [ { ...Annotation } ] }
```

Annotation commune :
```json
{
  "id": "fal-001",
  "kind": "fallacy",
  "type": "straw_man",
  "label": "Homme de paille",
  "segmentId": "s042",
  "quote": "sous-chaîne EXACTE du texte du segment s042 (copie verbatim, 3 à 25 mots)",
  "speaker": "nunez",
  "severity": 65,
  "confidence": 80,
  "title": "Déforme la position adverse (≤ 8 mots)",
  "explanation": "2 à 3 phrases, ton neutre et pédagogique : ce qui est dit, pourquoi c'est fallacieux, ce qu'aurait été une version honnête.",
  "habermas": ["sincerity"]
}
```

- `kind` : `fallacy` (argument fallacieux) ou `rhetoric` (procédé rhétorique notable, pas
  nécessairement malhonnête : cadrage, esquive, anaphore, question rhétorique…).
- `type` (slug) pour `fallacy` : `straw_man`, `ad_hominem`, `false_dilemma`, `slippery_slope`,
  `hasty_generalization`, `appeal_to_emotion`, `appeal_to_authority`, `whataboutism`,
  `red_herring`, `cherry_picking`, `false_cause`, `loaded_question`, `tu_quoque`,
  `begging_the_question`, `no_true_scotsman`, `anecdotal`, `moving_goalposts`, `ambiguity`,
  `burden_of_proof`, `appeal_to_fear`, `other`.
- `type` pour `rhetoric` : `framing`, `hyperbole`, `repetition`, `rhetorical_question`,
  `euphemism`, `dog_whistle`, `concession`, `evasion`, `interruption`, `reframing`,
  `personal_anecdote`, `appeal_to_common_sense`, `other`.
- `label` : libellé français court du type (ex. « Homme de paille », « Esquive »).
- `severity` 0-100 : gravité pour le débat (fallacy) ou intensité (rhetoric).
- `confidence` 0-100 : certitude que l'annotation est juste.
- `habermas` : prétentions à la validité affectées, parmi `truth`, `rightness`, `sincerity`,
  `comprehensibility` (liste éventuellement vide).
- `quote` **doit être une sous-chaîne exacte** de la ligne du segment (même casse, mêmes fautes).
  Si la figure s'étale sur plusieurs segments, choisir le segment le plus représentatif.
  L'UI surligne les mots couverts par `quote` et révèle l'annotation quand le dernier mot est
  prononcé.

---

## 3. `facts.json` — affirmations factuelles vérifiées

```json
{ "annotations": [ {
  "id": "fact-001",
  "kind": "fact",
  "type": "statistic",
  "label": "Statistique",
  "segmentId": "s011",
  "quote": "sous-chaîne EXACTE du segment",
  "speaker": "bompard",
  "claim": "Reformulation neutre de l'affirmation vérifiable",
  "verdict": "mostly_true",
  "fakeness": 15,
  "confidence": 70,
  "title": "Contrôles au faciès : ordre de grandeur correct",
  "explanation": "2 à 4 phrases : ce que disent les sources, l'écart avec l'affirmation.",
  "correction": "Ce qu'on peut affirmer avec les sources (1 phrase), ou null",
  "sources": [ { "title": "Défenseur des droits, enquête 2017", "url": "https://..." } ],
  "habermas": ["truth"]
} ] }
```
- `type` : `statistic`, `event`, `quote_attribution`, `legal`, `historical`, `other`.
- `verdict` : `true`, `mostly_true`, `misleading`, `mostly_false`, `false`, `unverifiable`.
- `fakeness` 0-100 : 0 = exact, 100 = totalement faux (ex. « la Terre est plate » = 100 ;
  « 60 réacteurs » au lieu de 57 ≈ 5). Un `unverifiable` a un `fakeness` autour de 50 et
  une `confidence` basse. L'UI affiche un fake-o-mètre vert → rouge et module l'opacité du
  surlignage avec ce score.
- Sources réelles uniquement (URL retournées par la recherche web). Tout verdict autre que
  `unverifiable` exige au moins une source.
- Dans l'UI, un « agent » est dépêché quand l'affirmation est prononcée, puis rend son verdict
  quelques secondes plus tard (latence simulée).

---

## 4. `habermas.json` — qualité délibérative (situation idéale de parole)

```json
{
  "dimensions": {
    "truth": "Vérité : les faits avancés sont-ils exacts ?",
    "rightness": "Justesse : les normes invoquées sont-elles légitimes et discutées ?",
    "sincerity": "Sincérité : le locuteur croit-il ce qu'il dit, sans manipulation ?",
    "comprehensibility": "Intelligibilité : le propos est-il clair et compréhensible ?"
  },
  "speakers": {
    "bompard": { "truth": 62, "rightness": 70, "sincerity": 65, "comprehensibility": 80,
                 "verdict": "2 phrases." },
    "nunez":   { "truth": 70, "rightness": 60, "sincerity": 55, "comprehensibility": 75,
                 "verdict": "2 phrases." }
  },
  "moments": [
    { "id": "hab-001", "segmentId": "s030", "speaker": "nunez", "dimension": "sincerity",
      "polarity": "negative", "weight": 2, "title": "≤ 8 mots", "note": "1 à 2 phrases." }
  ],
  "ideal_speech": {
    "equal_participation": { "score": 55, "note": "temps de parole, interruptions" },
    "no_coercion": { "score": 70, "note": "" },
    "argument_over_power": { "score": 60, "note": "" },
    "overall": { "score": 62, "verdict": "3 phrases : ce débat est-il un bon débat au sens de Habermas ?" }
  }
}
```
- `speakers` : une entrée par locuteur de kind `debater`.
- `polarity` : `positive` (le locuteur honore la prétention : concède, source, clarifie) ou
  `negative` (il la viole). `weight` 1-3. L'UI fait bouger une jauge « Habermas en direct »
  à chaque moment révélé (± weight × 6 autour de 50).
- 12 à 25 `moments` répartis sur toute la vidéo, tous les débatteurs représentés.
