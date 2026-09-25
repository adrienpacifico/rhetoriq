Tu travailles dans le dépôt /Users/adrienpacifico/Projects/weekend_projects/rhetoriq (ne modifie rien d'autre que le fichier de sortie indiqué, ne fais aucun commit git).

TÂCHE : produire `analysis/{{VIDEO_ID}}/speakers.json` en respectant EXACTEMENT la section 1 de `analysis/SCHEMA.md` (diarisation + chapitres).

Vidéo : « {{TITLE}} » (id {{VIDEO_ID}}).
Contexte : {{CONTEXT}}

Étapes :
1. Lis `analysis/SCHEMA.md` (contrat) puis `analysis/{{VIDEO_ID}}/transcript.txt` en entier (segments s001 → {{LAST_SEGMENT}}). Le texte vient des sous-titres automatiques : noms propres souvent déformés, ponctuation approximative.
2. Identifie les locuteurs. Ids : slugs ASCII minuscules ; `moderator` pour le/la journaliste ou animateur·rice (un seul id même s'il y a plusieurs journalistes, sauf s'ils ont des rôles très distincts) ; nom de famille pour les débatteurs (ex. `bompard`). Chaque locuteur a `name`, `role`, `party` (ou null) et `kind` (`moderator` ou `debater`). Un monologue = un seul `debater`.
3. Attribue CHAQUE segment à un locuteur. Suis la logique des tours de parole : un tour dure généralement plusieurs segments consécutifs ; ne change de locuteur que sur un vrai indice (adresse directe « monsieur le ministre », relance du modérateur, changement de position argumentative, pronoms « vous » / « nous »). Si un segment mélange deux voix, attribue-le au locuteur majoritaire.
4. Découpe la vidéo en 4 à 8 chapitres thématiques contigus couvrant toute la durée (start/end en secondes, alignés sur les bornes des segments), avec un titre court (≤ 6 mots) et un résumé d'une phrase.
5. Écris `analysis/{{VIDEO_ID}}/speakers.json` (JSON valide, UTF-8, français), puis VALIDE avec :

```
uv run scripts/check_analysis.py {{VIDEO_ID}} --file speakers
```

Corrige jusqu'à ce que la ligne `speakers   OK` apparaisse.

Rapport final (≤ 10 lignes) : liste des locuteurs (id, nom, rôle, kind), nombre de segments par locuteur, liste des chapitres (titre + bornes), et les segments dont l'attribution est incertaine.
