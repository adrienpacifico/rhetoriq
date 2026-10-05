# Cadres théoriques : rhétorique, argumentation et éthique de la discussion

Labels : `méthodologie`

## Pourquoi

Fonder la grille d'annotation sur des **cadres établis** plutôt que sur les intuitions de l'auteur :

- **limiter le biais personnel** : la grille ne reflète pas « mes idées » mais des théories publiées, discutées et critiquées depuis des décennies ;
- **rendre chaque note traçable** : « cette réplique viole la règle 3 de la pragma-dialectique » est vérifiable et contestable, contrairement à « c'est fallacieux » ;
- **donner au LLM un cadre explicite** pour produire des notes sensées et comparables d'un modèle à l'autre.

Chaque cadre est présenté avec son idée clé, ce qu'il apporte à Rhetoriq et le niveau d'analyse concerné : **micro** (phrase ou proposition), **méso** (tour de parole et tours voisins, y compris ceux de l'adversaire) ou **macro** (débat entier).

---

## 1. Habermas : agir communicationnel et éthique de la discussion

*Théorie de l'agir communicationnel* (1981), *De l'éthique de la discussion* (1991).

- **Agir communicationnel ou stratégique.** Dans l'agir communicationnel, on cherche l'**entente** avec l'autre. Dans l'agir stratégique, on cherche le **succès** et l'autre devient un moyen. Un débat télévisé est largement stratégique ; la question est *jusqu'où*.
- **Quatre prétentions à la validité.** Tout énoncé en soulève implicitement quatre, et chacune peut être contestée :
  - **intelligibilité** : ce que je dis est compréhensible ;
  - **vérité** : ce que j'affirme sur le monde est vrai ;
  - **justesse normative** : ce que je dis est légitime au regard des normes partagées ;
  - **sincérité** : je pense ce que je dis.

  Ces quatre prétentions sont déjà dans le schéma actuel : champ `habermas` → `comprehensibility`, `truth`, `rightness`, `sincerity`.
- **Situation idéale de parole.** Tous les concernés peuvent participer, ont des chances égales de prendre la parole et de questionner, sans contrainte. Seule compte « la force sans contrainte du meilleur argument ».

**Apport pour Rhetoriq.** C'est le **cadre normatif global** : l'idéal par rapport auquel on mesure le débat.
- *Macro* : qualité délibérative (répartition du temps de parole, interruptions, qui répond vraiment à qui).
- *Micro* : prétentions à la validité affectées par chaque annotation.

**Limite.** C'est un idéal contrefactuel, aucun débat réel ne l'atteint. On ne pénalise pas l'écart en soi, on mesure des **degrés**.

---

## 2. Grice : principe de coopération et implicatures

*Logic and Conversation* (1975).

On suppose que chaque locuteur **coopère**. Cette coopération suit 4 maximes :

| Maxime | Contenu | Critère Rhetoriq |
|---|---|---|
| **Quantité** | aussi informatif que nécessaire, pas plus | la phrase apporte-t-elle quelque chose ? remplissage, noyade d'information |
| **Qualité** | ne pas dire ce qu'on croit faux ou qu'on ne peut étayer | véracité, sources |
| **Relation** | être pertinent | pertinence par rapport à la question ou à l'échange précédent |
| **Manière** | clair, sans ambiguïté, bref, ordonné | précision, flou volontaire |

**Les implicatures.** Violer une maxime de façon ostensible fait passer un sens implicite. Exemple : « Je ne dirai pas que mon adversaire ment » (prétérition). En politique, une grande part de la manipulation passe par l'implicite : des propos **littéralement vrais mais trompeurs**, ce qu'on appelle le *paltering* (Rogers et al., 2017). Le fact-checking classique rate ce cas ; une grille gricéenne l'attrape.

**Apport** : *micro/méso*. C'est la base naturelle des critères de notation par phrase (pertinence, précision, apport, véracité).

---

## 3. Van Eemeren et Grootendorst : la pragma-dialectique (école d'Amsterdam)

*Speech Acts in Argumentative Discussions* (1984), *A Systematic Theory of Argumentation* (2004).

Un débat est modélisé comme une **discussion critique** qui vise à résoudre une divergence d'opinion, en 4 étapes : confrontation, ouverture, argumentation, conclusion. Dix règles la gouvernent, et **un sophisme est défini comme la violation d'une de ces règles** :

| # | Règle | Violations typiques | Slugs actuels (piste de mapping) |
|---|---|---|---|
| 1 | **Liberté** : ne pas empêcher l'autre d'avancer ou de mettre en doute un point de vue | ad hominem, intimidation | `ad_hominem`, `tu_quoque` |
| 2 | **Charge de la preuve** : qui avance un point de vue doit le défendre | esquive, renversement de la charge | `burden_of_proof`, `evasion` |
| 3 | **Point de vue** : attaquer la position réellement défendue | homme de paille | `straw_man` |
| 4 | **Pertinence** : défendre son point de vue avec une argumentation qui s'y rapporte | hors-sujet, pathos à la place d'arguments | `red_herring`, `appeal_to_emotion`, `appeal_to_fear`, `whataboutism` |
| 5 | **Prémisse implicite** : ne pas nier ses propres présupposés, ni en prêter de faux à l'autre | | |
| 6 | **Point de départ** : ne pas présenter comme acquis ce qui ne l'est pas | pétition de principe, question piège | `begging_the_question`, `loaded_question` |
| 7 | **Schéma argumentatif** : employer correctement les schémas (autorité, analogie, causalité…) | | `appeal_to_authority`, `slippery_slope`, `false_cause`, `hasty_generalization`, `anecdotal` |
| 8 | **Validité** : raisonnement logiquement valide | faux dilemme | `false_dilemma` |
| 9 | **Clôture** : accepter l'issue de la discussion | « je n'ai pas été réfuté donc j'ai raison », déplacer les buts | `moving_goalposts` |
| 10 | **Usage** : pas de formulation vague ou ambiguë exploitée | équivoque | `ambiguity` |

**Strategic maneuvering** (van Eemeren et Houtlosser). Un débatteur poursuit à la fois la **raisonnabilité** et l'**efficacité**. La rhétorique est donc **légitime par défaut**, et un sophisme est un *déraillement* de cette manœuvre. C'est la clé de la distinction entre figure rhétorique (`kind: rhetoric`) et sophisme (`kind: fallacy`).

**Apport** : *méso/macro*. On a une définition opérationnelle et non arbitraire du sophisme, et les étapes du débat peuvent servir de lecture macro.

---

## 4. Walton : schémas argumentatifs, engagements, types de dialogue

*Argumentation Schemes* (Walton, Reed et Macagno, 2008), *Commitment in Dialogue* (Walton et Krabbe, 1995).

- **Schémas argumentatifs.** Une soixantaine de schémas sont catalogués (autorité experte, conséquences, analogie, signe, cause à effet, engagement, précédent…). Chacun a ses **questions critiques**. Pour l'argument d'autorité : la personne est-elle vraiment experte ? dans ce domaine ? les autres experts sont-ils d'accord ? la citation est-elle fidèle ?
  → Le LLM ne décide plus « fallacieux ou non » au jugé. Il **identifie le schéma**, puis **pose les questions critiques**. Un argument d'autorité n'est pas fallacieux en soi ; il le devient quand certaines questions critiques échouent.
- **Registre d'engagements** (*commitment store*). Chaque participant accumule des engagements au fil du débat. On peut détecter :
  - les revirements non assumés ;
  - les **contradictions** ;
  - les **tensions non assumées** : des engagements non conjointement tenables sans un arbitrage jamais explicité. Exemple : réduire la dette + baisser les impôts + investir massivement dans les services publics.
- **Types de dialogue** : persuasion, négociation, enquête, délibération, recherche d'information, **éristique** (querelle). Un **glissement illicite** d'un type à l'autre, par exemple d'une délibération à une querelle, est lui-même un sophisme.

**Apport** : *micro* (schémas), *macro* (engagements, types de dialogue). C'est le cadre le plus directement utilisable pour structurer les prompts.

---

## 5. Austin et Searle : les actes de langage

*How to Do Things with Words* (Austin, 1962), *Speech Acts* (Searle, 1969).

Parler, c'est **agir**. On distingue ce qui est dit (locutoire), ce qu'on fait en le disant (illocutoire : affirmer, réfuter, promettre, accuser, concéder) et l'effet produit (perlocutoire). Searle classe les actes en assertifs, directifs, promissifs, expressifs et déclaratifs.

**Apport** : *micro/méso*. **La note doit porter sur l'acte, pas seulement sur le contenu.** Exemple :

> « Vous vous trompez, le chômage des jeunes est de 17 % en Normandie » (valeur réelle : 16 %).
> - Si l'adversaire avait dit « le chômage des 18-25 ans est de 16 % » : l'**exactitude factuelle** est bonne (~95), mais la **réfutation** est fausse, puisqu'elle change de périmètre pour « corriger » un chiffre juste. Score de l'acte : ~1.
> - Si l'adversaire avait dit « 30 % en Normandie » : la réfutation est juste à un point près. Score de l'acte : ~97.

→ Ajouter un champ `speech_act` au schéma, et séparer le score de l'acte de l'exactitude factuelle.

---

## 6. Toulmin : l'anatomie d'un argument

*The Uses of Argument* (1958).

Un argument se décompose en **thèse** (claim), **données** (data), **garantie** (warrant, le lien souvent implicite entre données et thèse), **fondement** (backing), **qualificateur** (« probablement », « toujours ») et **réfutation** (conditions d'exception).

**Apport** : *micro/méso*. Utile pour faire expliciter au LLM la **garantie implicite**, là où se cachent souvent les problèmes (lien avec la règle 5 de van Eemeren). Les **qualificateurs** absents ou abusifs (« toujours », « jamais », « tout le monde sait ») servent directement le critère de précision.

**Surtout, Toulmin impose la bonne unité d'analyse : l'argument, pas la phrase.** Exemple tiré du corpus, l'ouverture de Bompard (s008 → s017) :

| Élément | Passage |
|---|---|
| **Thèse** | « J'étais assez estomaqué finalement du dénire sur la question du racisme dans la police » (s008) |
| **Données** | le cas de Carcassonne, le policier resté en poste jusqu'à la publication de la vidéo (s009) ; l'ONU (s010) ; le Défenseur des droits, 20 fois plus de contrôles (s011-s012) |
| **Garantie** (implicite) | si des institutions indépendantes documentent un problème et que le ministre ne le reconnaît pas comme tel, c'est un déni |
| **Qualificateur** | « une forme de dénire », « à mon avis » (s012) |
| **Réfutation anticipée** | « Il s'agit pas de dire que l'ensemble des policiers sont racistes » (s014) |
| **Conclusion pratique** | récépissé de contrôle, réforme de l'IGPN (s016-s017) |

L'argument complet s'étale sur **dix segments**. En annotant s008 seul, le LLM a jugé une thèse privée de ses données et a conclu, à tort, que Bompard qualifiait avant d'argumenter (voir le cas d'étude n° 1). Le schéma de Toulmin montre aussi **où porte le vrai désaccord** : Nuñez conteste surtout la *garantie* (« comportements […] très minoritaires », « qui sont sanctionnés », contrôles « toujours dans un cadre légal ») plutôt que les *données*.

---

## 7. Perelman et Olbrechts-Tyteca : la nouvelle rhétorique

*Traité de l'argumentation* (1958).

L'argumentation est toujours relative à un **auditoire**. Les auteurs distinguent l'**auditoire particulier** (sa base électorale, l'audience de la station) de l'**auditoire universel** (l'ensemble des êtres raisonnables, idée proche de Habermas). Ils décrivent aussi les **techniques de dissociation des notions** : « la vraie démocratie » contre « la démocratie apparente », « la vraie laïcité »…

**Apport** : *méso/macro*. Distinguer un argument qui ne vaut que pour son camp d'un argument qui vise tout le monde. La dissociation est un procédé rhétorique très fréquent en politique, et il manque au schéma actuel.

---

## 8. Aristote : ethos, pathos, logos

*Rhétorique* (IVᵉ s. av. J.-C.).

- Trois **modes de preuve** : l'**ethos** (crédibilité de l'orateur), le **pathos** (émotions de l'auditoire), le **logos** (le raisonnement).
- L'**enthymème** : un syllogisme dont une prémisse, jugée partagée par l'auditoire, reste implicite.
- Les **topoi** : les lieux communs argumentatifs.
- Trois genres : délibératif (l'avenir, le politique), judiciaire, épidictique (éloge ou blâme).

**Apport** : *micro*. C'est un vocabulaire de base, parlant pour l'UI (répartition ethos/pathos/logos par locuteur). Il rappelle aussi que **le pathos n'est pas fallacieux en soi** ; il le devient quand il remplace l'argument (règle 4).

---

## 9. Hamblin : la critique du « traitement standard »

*Fallacies* (1970).

Hamblin montre que les manuels se contentent de **listes de sophismes sans théorie**, avec des définitions incohérentes. Sa critique est à l'origine du tournant dialectique (Walton, van Eemeren).

**Apport** : une mise en garde. La liste de slugs actuelle (`straw_man`, `red_herring`…) est exactement ce « traitement standard ». Il faut la **rattacher à une théorie** (règles pragma-dialectiques, questions critiques de Walton) pour qu'elle soit défendable.

---

## 10. Schopenhauer : la dialectique éristique

*L'Art d'avoir toujours raison* (écrit vers 1830, publié en 1864).

Il décrit **38 stratagèmes** pour gagner une dispute *indépendamment de la vérité* : l'extension (pousser la thèse adverse au-delà de ce qu'elle dit), l'homonymie, les questions en désordre, faire enrager l'adversaire, l'appel à l'autorité, et en dernier recours l'attaque personnelle.

**Apport** : *méso*. C'est un catalogue très concret des tactiques de débat télévisé, qui correspond au type de dialogue « éristique » de Walton. Il peut servir de source d'exemples pour les ancres de la grille.

---

## 11. Anscombre et Ducrot : l'argumentation dans la langue

*L'Argumentation dans la langue* (1983).

Les mots eux-mêmes **orientent** vers une conclusion. « **Presque** 10 % de chômeurs » et « **à peine** 10 % de chômeurs » décrivent le même fait mais tirent vers des conclusions opposées. Les connecteurs (*mais*, *même*, *pourtant*, *seulement*) et la **polyphonie** (faire parler d'autres voix dans son énoncé) sont des outils argumentatifs.

**Apport** : *micro*. **Un chiffre exact peut être argumentativement orienté.** Le cadrage devient détectable au niveau lexical, ce qui complète le fact-checking : vrai ne veut pas dire neutre.

---

## 12. Lakoff et Entman : le cadrage

*Don't Think of an Elephant!* (Lakoff, 2004), *Framing: Toward Clarification of a Fractured Paradigm* (Entman, 1993).

- **Lakoff** : les mots activent des **cadres** conceptuels. « Allègement fiscal » présuppose que l'impôt est un fardeau, et nier un cadre le renforce.
- **Entman** : cadrer, c'est **sélectionner et rendre saillant** pour définir un problème, en désigner la cause, porter un jugement moral et proposer un remède.

**Apport** : *micro/méso*. Cela précise les types `framing` et `reframing` du schéma. Les 4 fonctions d'Entman peuvent structurer l'annotation d'un cadrage.

---

## 13. Frankfurt : le *bullshit*

*On Bullshit* (1986, livre en 2005).

Le menteur connaît la vérité et la cache. Le *bullshitteur* y est **indifférent** : il dit ce qui sert son propos, que ce soit vrai ou non.

**Apport** : une dimension distincte de la véracité. Un chiffre lancé sans source peut être **vrai par hasard** tout en relevant du bullshit. Avec le *paltering*, cela montre que **score de véracité ≠ honnêteté** et plaide pour un critère « étayage » séparé.

---

## 14. Johnson et Blair : la logique informelle et le critère ARS

*Logical Self-Defense* (1977).

Un bon argument satisfait trois critères, et chaque sophisme correspond à l'échec identifiable de l'un d'eux :
- **Acceptabilité** : le public peut raisonnablement accepter les prémisses (sources fiables, faits établis, ou prémisses partagées) ;
- **Pertinence** (*relevance*) : les prémisses ont un rapport avec la conclusion ;
- **Suffisance** : elles apportent assez de soutien pour la conclusion tirée.

**Apport** : *micro/méso*. C'est la **grille de notation d'un argument** la plus simple et la plus opérationnelle pour un LLM : trois sous-scores ancrés, plus faciles à appliquer que les dix règles de van Eemeren. Les cadres se complètent :
- **Grice** note la *phrase* ;
- **ARS** note l'*argument* (reconstruit avec Toulmin) ;
- **van Eemeren** note l'*échange*.

Exemple, l'ouverture de Bompard (s008-s017) :
- **acceptabilité** élevée : des sources institutionnelles, vérifiables ;
- **pertinence** élevée ;
- **suffisance** à discuter : les données sur les contrôles au faciès sont solides, mais la conclusion d'une « impunité » repose surtout sur un cas unique, celui de Carcassonne.

---

## 15. Le principe de charité et les règles de Rapoport

N. L. Wilson (1959), Quine, Davidson ; en argumentation, Trudy Govier (*A Practical Study of Argument*, 1985) ; règles de Rapoport popularisées par Dennett (*Intuition Pumps*, 2013).

- **Principe de charité** : interpréter les propos d'autrui de la manière qui les rend **les plus rationnels et les plus défendables possible** avant de les critiquer. Critiquer une version affaiblie, c'est un homme de paille.
- **Règles de Rapoport** : avant de critiquer, (1) reformuler la position de l'autre si fidèlement qu'il dirait « merci, c'est exactement ça » ; (2) lister les points d'accord ; (3) dire ce qu'on a appris de lui ; (4) seulement alors, critiquer.

**Apport** : c'est **d'abord une règle pour le juge**, pas pour les débatteurs. Avant d'annoter une réplique, le LLM doit reconstruire l'argument sous sa forme la plus forte, ce qu'on appelle le *steelmanning*. Le cas d'étude n° 1 est typiquement une lecture **non charitable** : « négationniste », « avant d'argumenter ». La règle vaut symétriquement pour les deux camps.

C'est aussi un **critère pour les débatteurs** : l'orateur représente-t-il fidèlement la position adverse avant de la critiquer ? C'est le pendant positif de la règle 3 de van Eemeren, et il peut être crédité dans l'UI.

---

## À explorer

- **Ruth Amossy**, *L'Argumentation dans le discours* (2000) : ethos préalable et ethos discursif, analyse du discours politique en français.
- **Christian Plantin** : argumentation et émotions, *Dictionnaire de l'argumentation* (2016).
- **Mercier et Sperber**, *The Enigma of Reason* (2017) : la raison aurait évolué pour **argumenter et convaincre**, pas pour chercher le vrai. Cela explique le biais de confirmation, et pourquoi on évalue mieux les arguments des autres que les siens. C'est un argument pour qu'un juge extérieur (LLM) arbitre les désaccords humains, à condition d'en contrôler les propres biais (voir `02-tests-neutralite.md`).

---

## Synthèse

| Cadre | Niveau | Usage concret dans Rhetoriq |
|---|---|---|
| Habermas | macro + micro | idéal normatif, prétentions à la validité (`habermas`), qualité délibérative |
| Grice | micro / méso | critères de notation par phrase, implicatures, paltering |
| Van Eemeren | méso / macro | définition des sophismes = règles violées, rhétorique légitime par défaut |
| Walton | micro + macro | schémas et questions critiques, registre d'engagements, types de dialogue |
| Austin / Searle | micro / méso | `speech_act`, score de l'acte ≠ exactitude |
| Toulmin | micro / méso | unité d'analyse = l'argument ; garantie implicite, qualificateurs |
| Perelman | méso / macro | auditoire particulier ou universel, dissociation |
| Aristote | micro | ethos / pathos / logos |
| Hamblin | — | garde-fou contre la liste de sophismes sans théorie |
| Schopenhauer | méso | catalogue de stratagèmes éristiques |
| Ducrot | micro | orientation argumentative des mots |
| Lakoff / Entman | micro / méso | cadrage |
| Frankfurt | micro | étayage ≠ véracité |
| Johnson et Blair | micro / méso | note d'un argument : acceptabilité, pertinence, suffisance |
| Charité / Rapoport | toutes | règle pour le juge (steelmanning) ; critère de fidélité à la position adverse |

---

## Trous dans la raquette de l'analyse actuelle

État au 26/09/2026 : prompts `analysis/prompts/*.md`, schéma `analysis/SCHEMA.md`, un seul passage d'Opus par agent. Les constats s'appuient sur la vidéo Bompard / Nuñez (`RtS0Aap_hts`). Pour chaque trou : **le constat**, **le cadre** qui l'éclaire, **la piste** de correction.

### A. Des incitations biaisées dans les prompts

1. **Quotas d'annotations.** Les prompts exigent « 25 à 45 passages », « 12 à 20 affirmations » et « 12 à 25 moments ». Le modèle est ainsi **obligé de trouver des problèmes**, même dans un échange honnête.
   *Cadres* : charité, Hamblin. *Piste* : supprimer les quotas, en faire des plafonds indicatifs, et admettre « rien à signaler » comme réponse valide. Le rappel se mesure autrement, par les tests d'injection (`02-tests-neutralite.md`).
2. **Équilibre forcé entre locuteurs.** La consigne « répartis […] entre TOUS les locuteurs principaux » pousse à un **faux équilibre**. La neutralité, c'est la symétrie du **traitement**, pas celle des **résultats** : si un débatteur commet deux fois plus de sophismes, l'analyse doit le montrer.
   *Piste* : retirer la consigne, puis vérifier la neutralité par les tests miroir et d'étiquette échangée.
3. **« Vise une bonne diversité de types ».** La consigne pousse à coller des étiquettes rares là où elles ne s'appliquent pas.
   *Piste* : la supprimer ; la diversité doit refléter le débat, pas la consigne.
4. **Une posture de correcteur.** Le gabarit d'explication, « ce qu'aurait été une version honnête », **présuppose la malhonnêteté** et pénalise tout écart à l'idéal. Le juge note un débat comme une dissertation.
   *Cadres* : strategic maneuvering (la rhétorique est légitime par défaut), limite de l'idéal habermassien. *Piste* : demander « en quoi le procédé reste légitime ou en quoi il dérape, et pourquoi ».
5. **Aucun crédit positif côté rhétorique.** L'agent sophismes ne produit que du négatif. Seul l'agent Habermas note des moments positifs. Un argument bien étayé, une concession ou une reformulation fidèle de l'adversaire n'apparaissent jamais dans le transcript.
   *Cadres* : ARS, Rapoport. *Piste* : des annotations positives (`kind: "strength"`).

### B. L'unité et le contexte d'analyse

6. **L'unité d'analyse est le segment de sous-titre** (3 à 25 mots), pas l'argument. Un argument de dix segments est jugé en morceaux.
   *Cadre* : Toulmin. *Piste* : reconstruire les arguments (thèse, données, garantie, qualificateur, réfutation) sur plusieurs segments, et annoter l'argument entier.
7. **Aucune règle méso.** Rien n'oblige le juge à lire le tour de parole entier ni la réponse adverse avant de conclure. C'est ce qui a produit « avant d'argumenter » (cas d'étude n° 1).
   *Piste* : consigne explicite, puis test d'ablation de contexte.
8. **Le contexte hors corpus n'est pas signalé.** Bompard réagit à une émission précédente (« Je vous ai écouté dans l'émission avec monsieur Duamel », s007) que personne n'a vue. Le juge tranche comme s'il savait.
   *Piste* : un champ `external_context`, une confiance plafonnée, et une mention explicite dans l'explication.
9. **Pas de vrai niveau macro.** Il n'existe ni registre d'engagements, ni détection des contradictions et tensions non assumées, ni **suivi question → réponse**. Bompard pose deux questions précises (récépissé, IGPN, s016-s017). Nuñez y répond en s036 et s062, mais rien ne permet aujourd'hui de mesurer si une question a obtenu une réponse, une esquive ou rien du tout.
   *Cadre* : Walton (engagements, types de dialogue). *Piste* : un agent macro qui produit un registre d'engagements et une table questions/réponses.

### C. La définition des scores

10. **`severity`, `confidence` et les scores Habermas n'ont pas d'ancres.** Un « 40 » ne veut rien dire de précis, et deux modèles ne peuvent pas être comparés.
    *Piste* : des échelles ancrées (0/25/50/75/100) avec un exemple du corpus par palier, enrichies au fil des cas d'étude.
11. **Un invérifiable vaut `fakeness` 50.** On **confond incertitude et fausseté** : l'UI affiche à moitié rouge une affirmation qu'on n'a simplement pas pu vérifier.
    *Piste* : sortir l'invérifiable de l'échelle (état gris, distinct) et séparer `fakeness` et `confidence` dans l'affichage.
12. **Le fact-check porte sur l'affirmation isolée, pas sur l'acte.** Une réfutation exacte en chiffres mais qui change de périmètre reçoit une bonne note (l'exemple du chômage à 16/17 %). Il n'y a pas non plus de **coupure temporelle** : les sources postérieures au débat sont admises.
    *Cadres* : Austin et Searle. *Piste* : un `speech_act` et un score de l'acte distinct de l'exactitude ; des sources datées.
13. **La sincérité est notée alors qu'elle n'est pas observable.** Le score `sincerity` de Habermas est une spéculation sur l'intériorité des locuteurs.
    *Piste* : ne la noter que par des **indices observables** (cohérence du registre d'engagements, concessions, réponses directes aux questions) et le dire dans l'UI.

### D. La taxonomie

14. **Une liste de sophismes sans théorie** (`straw_man`, `red_herring`… et `other` pour le reste) : c'est le « traitement standard » critiqué par Hamblin.
    *Piste* : rattacher chaque slug à une règle pragma-dialectique et à un échec ARS (tableau § 3, à valider).
15. **Des catégories manquantes** : présupposition (Ducrot), implicature et prétérition (Grice), dissociation (Perelman), *paltering*, **fausse réfutation par changement de périmètre**, omission.
16. **Les actes de langage ne sont pas distingués.** Un acte expressif (« j'étais estomaqué ») est jugé comme une assertion.
    *Piste* : un champ `speech_act` ; un expressif ne se juge pas sur sa vérité, seulement éventuellement sur sa sincérité.
17. **Le juge n'est soumis à aucune règle de fidélité.** Rien n'empêche un titre d'être plus chargé que la citation : « Qualifie l'adversaire de négationniste » pour le mot « déni ». Le juge commet alors lui-même un homme de paille.
    *Piste* : consigne « le titre ne doit pas être plus chargé que la citation », puis un second modèle qui vérifie la fidélité titre/citation.

### E. La chaîne de traitement

18. **Les agents ne se parlent pas.** L'agent sophismes reproche à Bompard de ne pas « exposer d'abord les faits » alors que l'agent fact-check valide ces mêmes faits (ONU, s010 ; contrôles au faciès, s011 : `mostly_true`). Rien ne réconcilie les deux.
    *Piste* : une étape de consolidation qui lit toutes les sorties et signale les incohérences.
19. **Le transcript et la diarisation ne sont pas corrigés** (« dénire », « Lunaise », « Montpard »). Les erreurs de reconnaissance ou d'attribution se propagent dans l'analyse.
    *Piste* : correction humaine versionnée (objectif principal, § 4) et confiance réduite sur les segments douteux.
20. **Un modèle, un passage, pas de provenance.** On ne peut mesurer ni la variance ni les différences entre modèles.
    *Piste* : voir `00-objectif-principal.md` (§ 3 et 6) et `02-tests-neutralite.md`.
21. **Un biais de sélection du corpus.** La vidéo analysée est **un extrait publié par l'un des débatteurs** (chaîne de Manuel Bompard, titre « 💥 Racisme, « permis de tuer » : je demande des comptes au ministre de l'Intérieur »). Le montage et le cadrage du titre appartiennent à une des parties.
    *Piste* : une métadonnée de provenance (diffuseur d'origine ou partie prenante), l'émission intégrale quand elle existe, et un avertissement dans l'UI.

---

## Cas d'étude n° 1 : « estomaqué du déni » (Bompard, s008)

> « J'étais assez estomaqué finalement du dénire sur la question du racisme dans la police. »

**Annotation actuelle** (`fal-002`) : `rhetoric` / `framing`, sévérité 40, titre « Qualifie l'adversaire de négationniste ». L'explication dit que Bompard requalifie la position du ministre en déni « avant d'argumenter », et qu'une « version plus honnête » aurait exposé les faits d'abord. Prétention Habermas : `rightness`.

**Ce qui est faux :**
- **« Avant d'argumenter »** : les données suivent immédiatement (s009-s017) et le fact-check les juge `mostly_true`. L'ordre thèse → données est normal (Toulmin). Ce sont les trous n° 6, 7 et 18.
- **« Négationniste »** : c'est une déformation par le juge, plus chargée que la citation. Trou n° 17, principe de charité.
- **`rightness`** : « estomaqué » est un acte expressif qui engage la **sincérité** de Bompard ; « déni » conteste la **vérité** et la **sincérité** de Nuñez. Trou n° 16.
- **« Une version plus honnête »** : la posture de correcteur. Trou n° 4.

**Ce qui est juste :** le repérage d'un **cadrage**.
- « Déni » **présuppose** (Ducrot) que la réalité est établie et que l'adversaire refuse de la voir. On passe de « vous avez tort » à un diagnostic sur l'adversaire.
- Le mot force aussi un peu la position de Nuñez, qui concède l'existence de comportements racistes (s026). Le désaccord porte sur l'ampleur, le caractère systémique et l'impunité.
- Enfin, l'échange visé (l'émission avec Duhamel) est **hors corpus** : on ne peut pas savoir si « déni » le décrit fidèlement. Trou n° 8.

**Annotation corrigée proposée** :
- `rhetoric` / `framing`, sévérité environ 15, confiance réduite (contexte externe) ;
- titre : « Qualifie la position adverse de déni » ;
- prétentions : `truth`, `sincerity` ;
- explication : le mot présuppose que la réalité est établie et que le ministre refuse de la reconnaître. La thèse est aussitôt étayée par des sources vérifiées (ONU, Défenseur des droits). Elle vise un échange antérieur hors corpus. **Manœuvre stratégique légitime** au sens de van Eemeren.

**Règles tirées pour la grille :**
1. Ne jamais conclure à une absence d'argument sans avoir lu le tour de parole entier.
2. Le titre ne doit jamais être plus chargé que la citation.
3. Un renvoi à un contexte hors corpus est signalé et plafonne la confiance.
4. Un acte expressif ne se juge pas sur sa vérité.
5. Reconstruire l'argument sous sa forme la plus forte avant de l'annoter.

---

## Prochaines étapes, pas à pas

**Itération 1 : les prompts, sans toucher au code**
- [ ] Retirer les quotas, l'équilibre forcé entre locuteurs et la consigne de diversité des types (trous 1 à 3)
- [ ] Remplacer « ce qu'aurait été une version honnête » par « légitime ou dérape, et pourquoi » (trou 4)
- [ ] Ajouter les règles du cas d'étude n° 1 : lecture méso, charité, fidélité du titre, contexte hors corpus, actes expressifs (trous 7, 8, 16, 17)
- [ ] Relancer sur `RtS0Aap_hts` et comparer avec l'annotation actuelle

**Itération 2 : le schéma**
- [ ] `speech_act` (Searle), arguments Toulmin sur plusieurs segments, sous-scores ARS
- [ ] Annotations positives (`kind: "strength"`)
- [ ] Rattacher chaque slug de `fallacy` à une règle pragma-dialectique (tableau § 3 à valider)
- [ ] Nouveaux types : présupposition, prétérition, dissociation, fausse réfutation, paltering, orientation lexicale
- [ ] Invérifiable hors de l'échelle `fakeness`, champ `external_context`, provenance de la vidéo

**Itération 3 : les ancres**
- [ ] Échelles ancrées pour `severity`, `confidence`, `fakeness` et les dimensions Habermas, avec un exemple du corpus par palier
- [ ] Un cas d'étude par désaccord marquant (dans `docs/wiki/cas-limites/`)

**Itération 4 : le niveau macro**
- [ ] Registre d'engagements par locuteur, contradictions et tensions non assumées (Walton et Krabbe)
- [ ] Suivi question → réponse, esquive ou silence
- [ ] Sincérité notée uniquement par des indices observables

**Itération 5 : la chaîne**
- [ ] Étape de consolidation entre agents (trou 18)
- [ ] Plusieurs modèles, variance et provenance (`00-objectif-principal.md`, `02-tests-neutralite.md`)
- [ ] Rédiger `docs/wiki/cadres-theoriques.md` (une page par cadre, avec exemples tirés du corpus)
