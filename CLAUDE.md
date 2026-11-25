# Rhetoriq — repères pour Claude Code

POC d'analyse du discours politique : vidéo YouTube (jamais téléchargée, iframe) + transcript
synchronisé + annotations produites par des agents. La qualité de l'UI prime sur l'exactitude
des analyses.

## Outils
- JS : `bun` (`bun install`, `bun run dev`, `bun run build`). Vite + React + TypeScript, CSS maison.
- Python : `uv run scripts/<script>.py` (métadonnées inline, pas de venv à gérer).
- Serveur de dev : configuration `rhetoriq-dev` dans `.claude/launch.json` (port 5173).
- Déploiement : `bun run deploy` → Firebase Hosting, projet `rhetoriq-fe32f` (plan Spark, sans facturation), site https://rhetoriq.web.app. Auth via les identifiants `gcloud` (ADC), pas de `firebase login`.

## Structure
- `scripts/fetch_transcript.py <url>` → `src/data/videos/<id>/transcript.json` + `analysis/<id>/transcript.txt`
- `analysis/<id>/{speakers,fallacies,facts,habermas}.json` → écrits par les agents (contrat : `analysis/SCHEMA.md`)
- `scripts/check_analysis.py <id>` → validation ; `scripts/build_analysis.py <id>` → `src/data/videos/<id>/analysis.json` + index `src/data/videos.json` (stats + miniatures de la bibliothèque)
- `src/App.tsx` : routage par hash (`` = bibliothèque `Gallery.tsx`, `#v=<id>` = analyse) ; `src/Workspace.tsx` : un espace de lecture par vidéo ; `src/lib/analysis.ts` : placement des citations dans les mots datés.

## Ajouter une vidéo
`/analyze-video <url>` (skill dans `.claude/skills/analyze-video`) orchestre tout : sous-titres,
agent diarisation (Sonnet), puis agents sophismes / fact-check / Habermas (Opus) en parallèle,
validation, fusion. Prompts : `analysis/prompts/*.md`.

## Dépôts : GitLab privé, miroir GitHub public
- `origin` = GitLab, source de vérité : on ne pousse que là (CLI `glab`).
- GitHub (`adrienpacifico/rhetoriq`) est un miroir push automatique des branches protégées
  (`main`), configuré côté GitLab. Ne jamais pousser directement sur GitHub.
- **Tout ce qui arrive sur `main` devient public** : ni secrets, ni notes de stratégie ou feuille
  de route privée dans le dépôt. Les branches non protégées restent sur GitLab.
- Issues : stratégie et idées perso sur GitLab (`glab issue`) ; issues officielles (vitrine) sur
  GitHub (`gh issue`).

## Conventions
- Ne pas commiter sans demande explicite.
- Les agents n'écrivent que leur fichier de sortie et valident avec `check_analysis.py`.
- Les ids de locuteurs viennent de `speakers.json` ; `build_analysis.py` fait foi pour l'attribution.
