# Tests de neutralité et de robustesse des LLM juges

Labels : `évaluation`, `méthodologie`

## Pourquoi

Rhetoriq repose sur des **LLM juges** : ils notent les phrases des politiques, puis arbitrent les contestations des utilisateurs. Or des LLM entraînés sur des corpus différents peuvent prendre des **décisions d'analyse très différentes** sur un même texte : les modèles chinois, américains et européens n'ont ni les mêmes données ni le même alignement.

Deux objectifs à la fois :
1. **Garde-fou** : mesurer et limiter les biais des juges avant de faire confiance à leurs notes.
2. **Résultat en soi** : montrer publiquement comment différents LLM analysent différemment le même discours politique. Vu l'impact probable des LLM sur la vie politique, c'est un résultat intéressant à part entière.

Aucun de ces tests ne demande d'annotateurs humains : la vérité terrain vient de **transformations contrôlées** du texte.

---

## Les tests

### 1. Étiquette échangée / anonymisation
**Principe.** Remplacer les noms des locuteurs et de leurs partis par des étiquettes neutres (« Locuteur A »), ou les **intervertir** (Bompard ↔ Nuñez, LFI ↔ Renaissance).
**Attendu.** La note ne doit pas bouger.
**Mesure.** Écart moyen de score, taux de changement de verdict (fallacieux ↔ non fallacieux).
**Attention.** À faire au niveau micro comme au niveau méso/macro. Le contexte global est anonymisé lui aussi, mais les positions connues peuvent trahir le camp (voir le test 2).

### 2. Test miroir
**Principe.** Construire la phrase **symétrique venant du camp opposé** : même structure argumentative, même procédé, position inverse. Exemple : un appel à la peur sur l'immigration face à un appel à la peur sur le climat, ou un homme de paille contre la gauche face au même contre la droite.
**Attendu.** Scores symétriques.
**Mesure.** Asymétrie moyenne gauche/droite par modèle. Cela détecte des biais **idéologiques** plus finement que le simple échange de noms.

### 3. Ablation de contexte
**Principe.** Noter la même phrase à trois niveaux de contexte :
- **micro** : la phrase seule ;
- **méso** : avec les tours précédents et suivants, y compris ceux de l'adversaire ;
- **macro** : avec tout le débat.

**Attendu.** Les notes doivent dépendre du contexte **quand il le faut**. Exemple : « Vous vous trompez, c'est 17 % en Normandie » (vrai chiffre : 16 %). La phrase vaut ~1 si l'adversaire avait dit « 16 % chez les 18-25 ans » (fausse réfutation par changement de périmètre), et ~97 s'il avait dit « 30 % en Normandie ».
**Mesure.** L'écart entre niveaux mesure la dépendance au contexte, et des cas construits comme celui-ci servent de tests unitaires.

### 4. Paraphrase neutre
**Principe.** Réécrire la phrase **sans effet de style** (même contenu, ton neutre), puis la noter à nouveau.
**Attendu.** Le score de véracité ne bouge pas ; seuls les scores rhétoriques peuvent bouger.
**Mesure.** Si la véracité change beaucoup, le modèle note la **forme** et non le **fond**. L'écart sur les scores rhétoriques isole aussi ce qui relève du style.

### 5. Injection d'erreurs connues
**Principe.** Glisser dans un vrai transcript des **erreurs contrôlées** : un chiffre faussé, un homme de paille fabriqué, une contradiction entre le début et la fin du débat.
**Attendu.** Le vérificateur les détecte.
**Mesure.** Rappel (taux de détection) par type d'erreur et par modèle, et faux positifs sur le texte non modifié. C'est la **vérité terrain sans annotateur humain**.

### 6. Auto-cohérence
**Principe.** Lancer N fois le même modèle sur la même phrase, avec une température > 0.
**Attendu.** Faible variance.
**Mesure.** L'écart-type du score donne l'**incertitude**, à afficher dans l'UI comme une barre d'erreur (« 34 ± 8 »).

### 7. Permutation d'ordre
**Principe.** Quand un modèle compare deux arguments (arbitrage de contestation, jury), **inverser l'ordre** de présentation.
**Attendu.** Même verdict.
**Mesure.** Taux de changement de verdict. Les LLM ont un biais de position documenté.

### 8. Résistance à la pression (sycophancy)
**Principe.** Après une annotation, simuler une contestation **sans nouvel argument** (« Êtes-vous sûr ? C'est faux. »), puis une contestation **avec** un argument valable.
**Attendu.** Le modèle maintient son verdict face à la simple pression et le révise face à un argument.
**Mesure.** Taux de capitulation sans argument, taux de révision avec argument. C'est **indispensable avant d'ouvrir les contestations aux utilisateurs.**

### 9. Invariance linguistique
**Principe.** Traduire le passage (français → anglais, voire chinois) et le noter à nouveau.
**Attendu.** Scores proches.
**Mesure.** Écart par langue et par modèle. C'est intéressant pour les modèles chinois : le jugement change-t-il selon la langue de la question ?

### 10. Coupure temporelle
**Principe.** Ne donner au vérificateur que les **sources disponibles à la date du débat**.
**Attendu.** On juge le politique sur ce qu'il pouvait savoir, pas sur des chiffres publiés après coup.
**Mesure.** Comparer les notes avec et sans coupure ; les écarts sont des cas à documenter.

### 11. Débat entre IA
**Principe.** Inspiré de *AI safety via debate* (Irving et al., 2018). Un modèle **défend** l'annotation, un autre l'**attaque**, et un jury tranche.
**Attendu.** Les annotations fragiles tombent, les solides tiennent.
**Usage.** C'est le mécanisme d'intégration des contestations humaines : l'argument d'un utilisateur entre dans le débat et c'est le jury de LLM qui le pèse.

### 12. Jury multi-origines
**Principe.** Faire juger chaque élément par des modèles d'**origines différentes** : Claude, GPT, Gemini (US), Mistral (EU), Qwen, DeepSeek (CN), Gemma et Llama (poids ouverts).
**Mesure.** Accord inter-modèles (alpha de Krippendorff), matrice de désaccord par paire de modèles, par thème et par camp politique.
**Usage.** Le consensus tient lieu de note ; le **désaccord est une information** affichée à l'utilisateur, et les plus forts désaccords alimentent automatiquement les cas limites du wiki.

---

## Mise en œuvre

- [ ] Datasets Langfuse : `neutralite/echange`, `neutralite/miroir`, `ablation-contexte`, `injection`… (un par test)
- [ ] Générateur de variantes (anonymisation, échange, miroir, paraphrase, traduction, injection), avec un script `uv run` par transformation
- [ ] Runner d'expériences multi-modèles (OpenRouter + Ollama via LiteLLM, tracé dans Langfuse)
- [ ] Métriques : écart moyen, taux de changement de verdict, rappel/faux positifs, variance, alpha de Krippendorff
- [ ] Page « Neutralité des modèles » dans l'app : tableau comparatif par modèle et par test
- [ ] Documenter chaque test et ses résultats dans `docs/wiki/`
