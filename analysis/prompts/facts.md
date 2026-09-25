Tu travailles dans le dépôt /Users/adrienpacifico/Projects/weekend_projects/rhetoriq (ne modifie rien d'autre que le fichier de sortie indiqué, ne fais aucun commit git).

TÂCHE : produire `analysis/{{VIDEO_ID}}/facts.json` en respectant EXACTEMENT la section 3 de `analysis/SCHEMA.md` (fact-checking des affirmations vérifiables).

Vidéo : « {{TITLE}} » (id {{VIDEO_ID}}).
Contexte : {{CONTEXT}}
Locuteurs (utilise exactement ces ids dans le champ `speaker`) :
{{SPEAKERS}}
L'attribution segment → locuteur est dans `analysis/{{VIDEO_ID}}/speakers.json` (`turns`).

Étapes :
1. Lis `analysis/SCHEMA.md`, `analysis/{{VIDEO_ID}}/speakers.json`, puis `analysis/{{VIDEO_ID}}/transcript.txt` en entier (segments s001 → {{LAST_SEGMENT}}). Le texte vient des sous-titres automatiques et contient des fautes : cite-le tel quel.
2. Repère 12 à 20 affirmations factuelles VÉRIFIABLES (statistiques, chiffres, événements, textes de loi, rapports cités, citations attribuées, faits historiques), réparties sur toute la vidéo et entre les locuteurs. Ignore les opinions pures.
3. Pour CHAQUE affirmation, fais une recherche web réelle. Charge d'abord les outils avec ToolSearch (query « select:WebSearch,WebFetch »), puis utilise WebSearch (et WebFetch pour lire une page si besoin). Privilégie les sources institutionnelles (INSEE, Légifrance, rapports officiels, organisations internationales), la presse de référence et les fact-checkers (Les Décodeurs, CheckNews, AFP Factuel, Vrai ou Fake). Établis un `verdict` (true / mostly_true / misleading / mostly_false / false / unverifiable) et un score `fakeness` 0-100 (0 = exact ; 100 = totalement faux ; chiffre légèrement arrondi ≈ 5-10 ; statistique sortie de son contexte ≈ 30-50). Si aucune source fiable n'est trouvée : `verdict: "unverifiable"`, `fakeness` ≈ 50, `confidence` basse, `sources: []`. NE FABRIQUE JAMAIS d'URL : n'inclus que des URL réellement retournées par tes recherches.
4. Pour chaque annotation : `quote` = sous-chaîne EXACTE (copiée verbatim, 3 à 25 mots) du segment. `claim` = reformulation neutre. `title` ≤ 8 mots. `explanation` 2-4 phrases (ce que disent les sources, l'écart avec l'affirmation). `correction` = ce que l'on peut affirmer (1 phrase) ou null. `habermas`: ["truth"] en général. Ids `fact-001`, `fact-002`… dans l'ordre chronologique.
5. Écris `analysis/{{VIDEO_ID}}/facts.json` (JSON valide, UTF-8), puis VALIDE avec :

```
uv run scripts/check_analysis.py {{VIDEO_ID}} --file facts
```

Corrige jusqu'à ce que la ligne `facts      OK` apparaisse.

Rapport final (≤ 15 lignes) : tableau claim → verdict → fakeness → nombre de sources, et les affirmations non vérifiables.
