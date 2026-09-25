Tu travailles dans le dépôt /Users/adrienpacifico/Projects/weekend_projects/rhetoriq (ne modifie rien d'autre que le fichier de sortie indiqué, ne fais aucun commit git).

TÂCHE : produire `analysis/{{VIDEO_ID}}/fallacies.json` en respectant EXACTEMENT la section 2 de `analysis/SCHEMA.md` (arguments fallacieux + procédés rhétoriques).

Vidéo : « {{TITLE}} » (id {{VIDEO_ID}}).
Contexte : {{CONTEXT}}
Locuteurs (utilise exactement ces ids dans le champ `speaker`) :
{{SPEAKERS}}
L'attribution segment → locuteur est dans `analysis/{{VIDEO_ID}}/speakers.json` (`turns`) : consulte-la plutôt que de deviner.

Étapes :
1. Lis `analysis/SCHEMA.md`, `analysis/{{VIDEO_ID}}/speakers.json`, puis `analysis/{{VIDEO_ID}}/transcript.txt` en entier (segments s001 → {{LAST_SEGMENT}}). Le texte vient des sous-titres automatiques et contient des fautes : cite-le tel quel.
2. Identifie 25 à 45 passages à annoter (proportionnellement moins si la vidéo est courte, plus si elle dépasse 30 min), répartis sur TOUTE la durée et entre TOUS les locuteurs principaux (le modérateur aussi si pertinent : question orientée, cadrage) :
   - `kind: "fallacy"` : arguments fallacieux (homme de paille, faux dilemme, généralisation hâtive, whataboutisme, appel à l'émotion, cherry picking, diversion, renversement de la charge de la preuve, etc.). Sois rigoureux et équitable : n'invente pas de sophisme là où il n'y a qu'un désaccord légitime ; module `confidence`.
   - `kind: "rhetoric"` : procédés rhétoriques notables (cadrage, esquive/non-réponse, anaphore, hyperbole, concession stratégique, question rhétorique, interruption, recadrage, anecdote personnelle…).
   Vise une bonne diversité de types. `severity` = gravité pour la qualité du débat (fallacy) ou intensité (rhetoric).
3. Pour chaque annotation : `quote` = sous-chaîne EXACTE (copiée verbatim, 3 à 25 mots) de la ligne du segment `segmentId`. `title` ≤ 8 mots. `explanation` 2-3 phrases neutres et pédagogiques (ce qui est dit, pourquoi c'est problématique/notable, ce qu'aurait été une version honnête). `habermas` : liste (éventuellement vide) parmi truth, rightness, sincerity, comprehensibility. Ids `fal-001`, `fal-002`… dans l'ordre chronologique.
4. Écris `analysis/{{VIDEO_ID}}/fallacies.json` (JSON valide, UTF-8), puis VALIDE avec :

```
uv run scripts/check_analysis.py {{VIDEO_ID}} --file fallacies
```

Corrige jusqu'à ce que la ligne `fallacies  OK` apparaisse (citations exactes, ids de locuteurs valides, champs dans les bornes).

Rapport final (≤ 12 lignes) : nombre d'annotations par kind, par type et par locuteur, plus les 3 annotations les plus marquantes.
