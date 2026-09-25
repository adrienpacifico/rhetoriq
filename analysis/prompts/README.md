# Prompts des agents d'analyse

Un template par agent. Les placeholders `{{...}}` sont remplis par l'orchestrateur (le skill
`/analyze-video`, ou toi à la main) avant de lancer l'agent :

| Placeholder | Contenu |
|---|---|
| `{{VIDEO_ID}}` | id YouTube (11 caractères) |
| `{{TITLE}}` | titre de la vidéo |
| `{{CONTEXT}}` | 2 à 4 phrases : nature de la vidéo (débat, interview, discours…), participants, thèmes, date, erreurs de transcription connues (noms mal orthographiés…) |
| `{{LAST_SEGMENT}}` | id du dernier segment (ex. `s179`) |
| `{{SPEAKERS}}` | liste des locuteurs issue de `speakers.json` : `- id : Nom (rôle, kind)` — uniquement pour fallacies / facts / habermas |

Ordre : `diarization` (Sonnet) d'abord, puis `fallacies`, `facts`, `habermas` (Opus) en parallèle.
Chaque agent valide sa sortie avec `uv run scripts/check_analysis.py {{VIDEO_ID}} --file <nom>`.
