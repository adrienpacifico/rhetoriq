Tu travailles dans le dépôt /Users/adrienpacifico/Projects/weekend_projects/rhetoriq (ne modifie rien d'autre que le fichier de sortie indiqué, ne fais aucun commit git).

TÂCHE : produire `analysis/{{VIDEO_ID}}/habermas.json` en respectant EXACTEMENT la section 4 de `analysis/SCHEMA.md` (qualité délibérative au sens de Jürgen Habermas).

Vidéo : « {{TITLE}} » (id {{VIDEO_ID}}).
Contexte : {{CONTEXT}}
Locuteurs (utilise exactement ces ids ; évalue chaque locuteur de kind `debater`) :
{{SPEAKERS}}
L'attribution segment → locuteur est dans `analysis/{{VIDEO_ID}}/speakers.json` (`turns`).

Cadre théorique à appliquer (éthique de la discussion / agir communicationnel) :
- Les quatre prétentions à la validité : vérité (truth : exactitude des faits), justesse normative (rightness : légitimité des normes invoquées, ouverture à leur discussion), sincérité (sincerity : absence de manipulation, cohérence entre ce qui est dit et ce qui est cru), intelligibilité (comprehensibility : clarté).
- La situation idéale de parole : participation égale (temps de parole, interruptions, respect des tours), absence de coercition (intimidation, argument d'autorité, disqualification), primauté de la force du meilleur argument (répond-on aux arguments ou les contourne-t-on ? concède-t-on quand l'autre a raison ?). Pour un monologue, évalue ces critères vis-à-vis des positions adverses évoquées et du public.

Étapes :
1. Lis `analysis/SCHEMA.md`, `analysis/{{VIDEO_ID}}/speakers.json`, puis `analysis/{{VIDEO_ID}}/transcript.txt` en entier (segments s001 → {{LAST_SEGMENT}}).
2. Attribue à chaque débatteur un score 0-100 par dimension (truth, rightness, sincerity, comprehensibility) et un `verdict` de 2 phrases. Sois équitable et argumenté ; les scores doivent refléter des différences réelles observées dans le texte.
3. Liste 12 à 25 `moments` datés (segmentId) répartis sur toute la vidéo, pour tous les débatteurs, avec `polarity` positive (concession, source citée, clarification, réponse directe à l'argument) ou negative (esquive, interruption, disqualification, affirmation invérifiable présentée comme certaine, argument d'autorité), `weight` 1-3, `title` ≤ 8 mots, `note` 1-2 phrases. Ids `hab-001`, `hab-002`… dans l'ordre chronologique.
4. Remplis `ideal_speech` (equal_participation, no_coercion, argument_over_power, overall avec un verdict de 3 phrases : est-ce un bon débat au sens de Habermas ?).
5. Écris `analysis/{{VIDEO_ID}}/habermas.json` (JSON valide, UTF-8, français), puis VALIDE avec :

```
uv run scripts/check_analysis.py {{VIDEO_ID}} --file habermas
```

Corrige jusqu'à ce que la ligne `habermas   OK` apparaisse.

Rapport final (≤ 12 lignes) : scores par locuteur et dimension, score global, et les 3 moments les plus significatifs.
