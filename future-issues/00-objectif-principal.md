# Objectif principal : une analyse rigoureuse, comparable et contestable

Labels : `roadmap`

## Vision

Rhetoriq doit passer d'un POC centré sur l'UI, aux analyses « un peu à l'arrache », à un outil dont **chaque note est définie, traçable, comparable entre modèles et contestable**.

Quatre piliers :
1. une **méthode de notation** explicite, fondée sur des cadres théoriques établis ;
2. une analyse à **trois niveaux** : micro, méso, macro ;
3. la **comparaison entre LLM**, résultat intéressant en soi ;
4. une **contribution humaine** (corrections, contestations) arbitrée par des LLM juges.

Issues liées :
- `01-cadres-theoriques.md` : Grice, van Eemeren, Walton, Habermas, etc.
- `02-tests-neutralite.md` : tests de neutralité et de robustesse des LLM juges

---

## 1. Un score 0-100 défini et défendable

On **garde** le score de véracité 0-100, mais on le définit rigoureusement.

- **Grille par critères**, inspirée des maximes de Grice :
  - véracité et étayage (qualité) ;
  - pertinence par rapport à la question ou à l'échange précédent (relation) ;
  - apport réel, pas de remplissage (quantité) ;
  - précision et clarté (manière) ;
  - « est-ce que ça va quelque part ».
- **Échelles ancrées** : pour chaque critère, on définit ce que valent 0, 25, 50, 75 et 100, avec un **exemple réel du corpus** à chaque palier. « 34 % » veut alors dire « entre tel ancrage et tel autre », et le LLM se positionne par rapport à des exemples plutôt qu'à une intuition.
- **Le score de l'acte ≠ l'exactitude factuelle** (actes de langage, Austin/Searle). Exemple :

  > « Vous vous trompez, le chômage des jeunes est de 17 % en Normandie » (valeur réelle : 16 %).
  > - Si l'adversaire avait dit « le chômage des 18-25 ans est de 16 % », la phrase est **factuellement quasi exacte** (~95), mais c'est une **fausse réfutation** par changement de périmètre. Score de l'acte : ~1.
  > - Si l'adversaire avait dit « le chômage des 18-25 ans en Normandie est de 30 % », la réfutation est juste à un point près. Score : ~97.

- **Étayage ≠ véracité** (Frankfurt, *paltering*). Un chiffre vrai lancé sans source, ou un énoncé littéralement vrai mais trompeur, doit être capturé par un critère séparé.
- **Incertitude affichée** : N passages du même modèle donnent un écart-type, affiché dans l'UI (« 34 ± 8 »).
- **Contre le biais personnel** : la grille n'est pas inventée, elle est dérivée de cadres publiés (voir `01-cadres-theoriques.md`). Elle est versionnée et n'évolue que par des décisions tracées (voir § 5).

## 2. Trois niveaux d'analyse

| Niveau | Unité | Ce qu'on évalue | Cadres |
|---|---|---|---|
| **Micro** | phrase, voire proposition | exactitude, précision, clarté, schéma argumentatif utilisé, orientation lexicale | Grice (qualité, manière), Walton (schémas), Toulmin, Ducrot |
| **Méso** | tour de parole + tours voisins (y compris ceux de l'adversaire) | pertinence par rapport à la question ou à l'adversaire, validité d'une réfutation, homme de paille, esquive | Grice (relation), van Eemeren (règles 2, 3, 4), actes de langage |
| **Macro** | débat entier | tenue globale, revirements sournois, contradictions, **tensions non assumées** | Walton et Krabbe (registre d'engagements, types de dialogue), Habermas |

Au niveau macro, il faut distinguer une **contradiction** (A puis non-A) d'une **tension non assumée** : des engagements qui ne sont pas conjointement tenables sans un arbitrage jamais explicité. Exemple : « réduire la dette » + « baisser les impôts » + « améliorer les services publics et investir massivement ».

## 3. Comparer les LLM

**Thèse** : les LLM vont peser fortement sur la vie politique. Sur un même corpus, des modèles entraînés différemment (américains, européens, chinois ; propriétaires ou à poids ouverts) peuvent prendre des **directions d'analyse très différentes**. Le montrer est un résultat à part entière.

- Chaque élément est jugé par un **jury multi-origines** : Claude, GPT, Gemini, Mistral, Qwen, DeepSeek, Gemma, Llama…
- Le **consensus** donne la note, et le **désaccord est une information** affichée à l'utilisateur.
- Il faut une vue de comparaison dans l'UI : même phrase, N annotations, une par modèle.
- La neutralité des juges se mesure avec des tests contrôlés : étiquette échangée, miroir, ablation de contexte… (voir `02-tests-neutralite.md`).

## 4. Des LLM juges, des humains contributeurs

Principe : **ce ne sont pas les humains qui jugent les humains**. Les humains sont souvent de mauvaise foi, surtout sur du politique, et un vote donne la majorité, pas le vrai. Ce sont les **LLM qui jugent la pertinence des arguments**, y compris ceux des utilisateurs quand ils ne sont pas d'accord entre eux.

- **Correction de transcript** : c'est peu conflictuel et très utile, donc le bon point d'entrée. Chaque correction crée une nouvelle version du transcript, et seules les annotations touchées sont recalculées.
- **Contestation d'une annotation** : l'utilisateur soumet un argument structuré (objection, preuve), pas un simple commentaire. L'argument entre dans un **débat entre IA** (un modèle défend l'annotation, un autre l'attaque) et le **jury** tranche.
- **Échanges entre utilisateurs** : plusieurs tours d'argumentation, évalués par le jury, jusqu'à un consensus sur un fait, une note, ou une figure jugée fallacieuse qui s'avère acceptable.
- **Prérequis** : le test de résistance à la pression (voir `02-tests-neutralite.md`, § 8). Le juge doit tenir face à « êtes-vous sûr ? » et ne céder qu'à un vrai argument.

## 5. Wiki méthodologique : une jurisprudence

Sur le modèle du « LLM wiki » de Karpathy : un wiki markdown dans `docs/wiki/` que les LLM aident à maintenir. Il trace toutes les décisions méthodologiques.

- Pages de fond : objectifs, grille de notation (versionnée), taxonomie des figures fallacieuses ou non, cadres théoriques, protocole de tests.
- **Pages de cas limites**, comme une jurisprudence : extrait, ce qu'en disent les différents modèles, décision, justification, version de grille qui en découle.
- **La boucle** : les plus forts désaccords entre modèles génèrent automatiquement les cas limites à discuter, et les contestations acceptées y entrent aussi.

La méthode évolue ainsi par décisions **tracées et contestables**, plutôt que selon les préférences de l'auteur du moment.

## 6. Infra

- **Langfuse** pour tout ce qui relève des expériences :
  - traces de chaque appel ;
  - **gestion des prompts** : la grille *est* le prompt, versionnée avec des labels ;
  - **datasets** : corpus, cas limites, variantes de tests ;
  - **expériences** : un dataset lancé sur N modèles, comparé côte à côte ;
  - scores.
- **Firestore et Firebase Auth** pour les données produit : corrections, contestations, échanges entre utilisateurs. Les deux sont gratuits dans le plan Spark actuel.
- **Passerelle multi-modèles** : OpenRouter (une clé pour Qwen, Gemma, DeepSeek, Mistral, Claude, Gemini…) et Ollama pour le local, derrière **LiteLLM**, qui s'intègre nativement à Langfuse.
- **Sortir la comparaison des sous-agents Claude Code** : pour une comparaison équitable, tous les modèles doivent passer par le même pipeline, avec le même prompt, via l'API. Le skill `/analyze-video` peut rester comme orchestrateur, mais en lançant des scripts `uv run`.
- **Clé unique par annotation** : `(vidéo, phrase, niveau, critère, modèle, version de grille, version de transcript)`, avec un cache par clé. À cette échelle, pas besoin d'Airflow ou de Prefect.
- Chaque annotation garde son **`trace_id` Langfuse** : un clic sur une note dans l'UI ouvre le raisonnement complet du modèle.

```
transcript (v1 → corrections humaines → v2)
   └─ segmentation / locuteurs
        ├─ micro  : phrase × critère × modèle   ┐
        ├─ méso   : tour + voisins × modèle     ├─→ jury → annotation publiée ─→ app (Firestore)
        └─ macro  : registre d'engagements      ┘              ↑                  │
                                                    contestation ←────────────────┘
tout est tracé dans Langfuse (prompts = grilles versionnées, datasets = cas limites)
```

## Étapes proposées

- [ ] **Wiki v0** (`docs/wiki/`) : objectifs, grille v0 (critères + échelles ancrées), taxonomie des figures
- [ ] **Schéma v2** (`analysis/SCHEMA.md`) : niveaux micro/méso/macro, `speech_act`, `scheme` (Walton), score de l'acte + exactitude + étayage, provenance (modèle, version de grille, version de transcript, `trace_id`), plusieurs annotations par élément
- [ ] **Pipeline multi-modèles** : LiteLLM + OpenRouter + Ollama, tracé dans Langfuse
- [ ] **Première comparaison** : 2-3 modèles sur la vidéo Bompard / Nuñez avec la grille v0
- [ ] **Premiers cas limites** : les 5 phrases où les modèles divergent le plus deviennent les 5 premières pages de jurisprudence
- [ ] **Tests de neutralité** : étiquette échangée, miroir, ablation de contexte (voir `02-tests-neutralite.md`)
- [ ] **UI de comparaison** : même phrase, N modèles, désaccord et incertitude visibles
- [ ] **Registre d'engagements** : niveau macro, contradictions et tensions non assumées
- [ ] **Correction de transcript** par les utilisateurs (Firestore + Auth, transcript versionné)
- [ ] **Contestations** arbitrées par le jury (après le test de résistance à la pression)
