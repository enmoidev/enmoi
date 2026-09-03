# enMOI — Application web

> Anciennement **inYou**. La marque est désormais **enMOI**. Le code, les assets et la
> nomenclature portent encore l'ancien nom à de nombreux endroits : voir « Renommage » plus bas.

## Le produit

enMOI est une solution de développement personnel fondée sur l'**inné** et l'**acquis**.

Le principe métier :

1. On part de la **date de naissance** d'une personne.
2. **7 formules mathématiques** (paramétrables en base) calculent 7 nombres compris entre 0 et 99.
3. Chacun de ces nombres désigne une **Force** (anciennement « aptitude ») parmi les 100, numérotées **de 0 à 99**.
4. On génère un **PDF livrable**, composé de pages d'introduction personnalisées, de
   **2 pages par force** développée, puis de pages de méthode.

Chaque force correspond à un **rôle symbolique** fixe, déterminé par sa position dans les 7.
Les libellés sont ceux gravés par le client sur sa fiche explicative (page 6 des livrables) ;
la source unique côté code est `lib/forces/roles.ts` :

| Position | Rôle symbolique | Ce qu'il désigne |
|---|---|---|
| 1 | Ma déterminante | Exprime mon caractère et ma détermination profonde |
| 2 | Ma conseillère | Rappelle chaque jour ce qui est prioritaire pour moi |
| 3 | Ma destination | Ma mission à accomplir |
| 4 | Ma stimulante | Ma ressource quotidienne |
| 5 | Ma relationnelle | Ma vitrine sociale, ma manière de m'adresser aux autres |
| 6 | Ma générationnelle | Le partage commun à toute une génération |
| 7 | Mon inspiratrice | La bonne étoile, ma boussole non-consciente |

### Les trois versions du Miroir enMOI

Le document remis à la personne s'appelle le **Miroir enMOI**. Il se décline en trois versions,
qui partagent leurs six premières pages et se distinguent par le nombre de forces développées et
par ce qui suit :

| Version | Identifiant | Pages | Forces développées | Après les fiches |
|---|---|---|---|---|
| **Version offerte** | `freemium` | 14 | 1 (position 1) | Introduction à la méthode des 3 étapes (p. 9-14) |
| **Version découverte** | `livrable1` | 21 | 7 | « Mon évolution » (p. 21) |
| **Version complète** | `livrable2` | 35 | 7 | Méthode complète et tableaux de travail (p. 21-35) |

⚠️ **Vocabulaire.** « Miroir enMOI » et « version offerte / découverte / complète » sont les termes
du client, arrêtés le 02/09/2026 ; ils remplacent « livrable », « freemium », « Formule Découverte »
et « Formule Complète ». Ce sont les seuls mots à employer partout où quelqu'un les lit : interface,
e-mails, noms de fichiers produits, documentation destinée au client.

Les **identifiants techniques gardent leur nom** — `DeliverableId`, `freemium` / `livrable1` /
`livrable2`, les dossiers `public/pdf-design/livrable1|2/`, le champ `deliverable` des API. Ils ne
s'affichent nulle part, et les renommer casserait les chemins d'assets pour un gain nul : même
arbitrage que pour le renommage inYou → enMOI. Ce document continue donc de dire « livrable » quand
il parle de code, « version » quand il parle du produit.

Les 7 forces sont **toujours** calculées et nommées, même dans la version offerte : la roue de la
page 3 les liste toutes. Seul le nombre de fiches développées change — d'où un seul appel S3 pour
la version offerte au lieu de sept.

La composition de chaque version est déclarée dans **`lib/generate-pdf/deliverables.ts`**, et
nulle part ailleurs. Le générateur ne fait que dérouler ce manifeste. C'est aussi là que vivent
le libellé affiché (`label`) et le segment de nom de fichier (`fileSlug`) : le document téléchargé
s'appelle `miroir-enmoi-version-complete_Prenom_Nom.pdf`, via `pdfFileName()`.

Structure commune (pagination du client) :

| Page | Contenu | Surimpression |
|---|---|---|
| 1 | Couverture, propre au livrable | prénom, puis date et heure de naissance |
| 2 | Page blanche (folio dans le livrable 2) | — |
| 3 | Roue « Ma personnalité innée » (4 versions) | prénom au centre, les 7 titres dans les pastilles |
| 4 | « Je découvre ma Personnalité Innée » | — |
| 5 | Citation | prénom dans le bandeau ocre |
| 6 | Fiche explicative — le rôle de chaque force | — |
| 7… | 2 pages par force développée | A : prénom + position ; B : position + rôle |
| 9 / 21 | Guide / auto-bilan (p. 9 en freemium, 21 en livrable 2) | prénom dans le bandeau ocre |
| 21 | « Mon évolution » (livrable 1) | prénom dans le bandeau ocre, à gauche du titre |

La couverture ne porte plus que les libellés « Je suis : » et « Né(e) le : », suivis
d'un espace libre : le client a retiré de son gabarit le « à ______ (heure de naissance, si
connue)* » qui suivait la date. La ligne se compose donc à l'exécution — `04.07.1993`, ou
`04.07.1993 à 14h25*` quand l'heure est connue. Sans heure, la ligne s'arrête après la date,
sans « à » orphelin ; l'astérisque, qui renvoie à la note de bas de page toujours imprimée sur
le gabarit, n'est posé qu'avec l'heure.

Le « (prénom) » qui suivait « Je suis » a disparu du gabarit le 03/09/2026 — la valeur posée à sa
suite le dit déjà. Le libellé s'en trouve raccourci de 275 px : les `xPx` de `COVER_LAYOUTS` ont
été relevés à nouveau, ceux de la ligne de naissance sont inchangés.

Vérifier les deux cas d'un coup :

```bash
npx tsx scripts/preview-livrable.ts freemium apercu.pdf            # avec heure
HEURE="" npx tsx scripts/preview-livrable.ts freemium apercu.pdf   # sans heure
```

Dans le livrable 2, trois tableaux de travail reçoivent aussi le **prénom** et les 7 titres de
force : `30-tableaux-familles` (tableaux 1 & 2), `34-tableau3` et `35-tableau4`. Le prénom se pose
sur le filet qui suit le libellé « Mon Prénom : », en **Gabriola 19 noir** — la même écriture que
dans les bandeaux ocre : une seule typographie pour le prénom, quel que soit l'endroit du document
où il apparaît. Il est relevé d'un millimètre au-dessus de la ligne de base du libellé : le client
grave ses libellés à même le filet, et s'aligner dessus collait la valeur au trait.

Le champ « **Date** » de ces mêmes pages reste **volontairement vide** : il date la séance de
travail, pas le document. La personne imprime sa feuille quand elle veut et peut la remplir en
plusieurs fois — une date de génération y serait fausse.

### Les quatre versions de la page 3

La roue existe en quatre gabarits, qui commentent une particularité du tirage sous le schéma :

| Variante | Gabarit | Déclencheur |
|---|---|---|
| `base` | `commun/03-roue.png` | aucune particularité |
| `forcesIdentiques` | `commun/03-roue-forces-identiques.png` | deux des 7 positions désignent la même force |
| `septembre` | `commun/03-roue-septembre.png` | naissance en septembre |
| `forcesIdentiquesEtSeptembre` | `commun/03-roue-forces-identiques-et-septembre.png` | les deux |

Les deux critères se calculent **entièrement à partir des données déjà présentes** — les 7 numéros
de force et la date de naissance. Rien à saisir dans le back-office, rien à stocker en base. La
règle vit dans `lib/generate-pdf/wheelVariant.ts`, sans dépendance à Prisma : elle se teste avec
des objets littéraux.

Le doublon se juge sur le **numéro** de la force (0 à 99), jamais sur son titre : deux forces
distinctes peuvent partager un titre provisoire tant que le client n'a pas livré ses 100 visuels.

La roue est au même endroit au pixel près dans les quatre gabarits (vérifié par superposition) :
une seule table de coordonnées sert aux quatre, et les quatre versions valent pour les trois
livrables, la page 3 venant de `introPages()`.

C'est la **seule page dont le gabarit dépend de la personne**. Pour la porter, le champ `asset` de
`DeliverablePage` accepte, en plus d'une chaîne, une fonction de `PdfData` ; `pageAsset()` la
résout au moment de dérouler le manifeste. Tout le reste reste déclaré en dur.

Les quatre cas se vérifient d'un coup :

```bash
npx tsx scripts/preview-livrable.ts freemium                             # base
DOUBLON=1 npx tsx scripts/preview-livrable.ts freemium                   # forces identiques
NAISSANCE=1993-09-04 npx tsx scripts/preview-livrable.ts freemium        # septembre
NAISSANCE=1993-09-04 DOUBLON=1 npx tsx scripts/preview-livrable.ts freemium   # les deux
```

Le script annonce la variante retenue avant d'écrire le document.

### Changement majeur sur le PDF

Le contenu rédactionnel des forces **n'est plus saisi ni stocké en base**. Le client fournit
directement **2 pages PNG par force** (soit 200 fichiers). Le rôle du générateur PDF se réduit à
poser l'image PNG en fond de page et à **surimprimer deux valeurs**.

Toute la logique de mise en page textuelle des fiches (définition vivante, texte emblématique,
forces associées, zones de vigilance, mots-clés) est **obsolète** et doit disparaître.

#### Ce qui est déjà dans l'image (ne jamais le redessiner)

Constaté sur l'échantillon de 10 forces livré : les PNG sont **A4 exact à 300 DPI**
(2480 × 3508 px, ~350 Ko), déjà à la charte **enMOI**, et contiennent déjà le logo, le titre de
la force, tout le texte rédactionnel, la mention « Étape 1 » et le « (tsvp) ».

#### Ce qu'il faut surimprimer

Quatre valeurs seulement, sur les zones laissées vides à dessein dans les gabarits :

| Page | Emplacement dans l'image | Valeur |
|---|---|---|
| A | bandeau turquoise, **en haut à gauche** (le logo est centré, « Étape 1 » à droite) | le **prénom** de la personne |
| A | **bas de page, centré**, ligne de base à 25 mm du bord | la **position 1 à 7**, en très grand |
| B | `Force ___ /7 :` — blanc entre « Force » et « /7 » | la **position 1 à 7** |
| B | `Son rôle :` — blanc à droite du libellé | le **rôle symbolique** de la position |

⚠️ Le chiffre imprimé est la **position dans les 7**, jamais le numéro de la force (0-99). Ce
numéro n'apparaît nulle part sur les pages livrées ; il ne sert qu'à choisir le bon PNG. Le
fichier d'exemple du client montre bien la même fiche déclinée avec les 7 chiffres possibles.

Le prénom en page A est sur fond turquoise : texte **blanc**, comme les autres éléments du bandeau.
Il ne figure **que sur la page A** : la page B reprend le même bandeau, mais le répéter à une page
d'intervalle est redondant.

#### Typographie imposée (note client du 05/08/2026)

| Où | Police | Taille | Couleur |
|---|---|---|---|
| Fiche, recto — prénom | Gabriola Regular | 23 | blanc |
| Fiche, recto — grand chiffre | Book Antiqua Regular | 105 | gris `CCCCCC` |
| Fiche, verso — chiffre | Segoe UI SemiBold | 13 | blanc |
| Fiche, verso — rôle | Georgia Bold | 10,5 | blanc |
| Couverture — prénom | Cabin SemiBold | 20 | blanc |
| Couverture — naissance | Cabin Medium | 14 | blanc |
| Page 3 — prénom | Gabriola Regular | 19 | noir |
| Page 3 — titres de force | Cabin Bold | 10 | noir |
| Pages 5 et 9/21 — prénom | Gabriola Regular | 19 | noir |
| Livrable 1, page 21 — prénom | Gabriola Regular | 19 | noir |
| Tableaux de travail — prénom | Gabriola Regular | 19 | noir |

Toutes les coordonnées vivent dans **`lib/generate-pdf/overlayLayout.ts`**, et nulle part ailleurs.
Elles sont exprimées en **pixels du visuel source** (2480 × 3508), donc relevables directement dans
un éditeur d'image ; `pxToPt()` fait la conversion vers les points PDF. Quand le client réédite un
gabarit, on ajuste une constante de ce fichier et rien d'autre.

Chaque zone porte un `minFontSizePt` : la police est réduite automatiquement pour les prénoms longs
et les rôles qui déborderaient de l'espace prévu.

Un `TextBox` porte aussi un `anchor` : `top` (bord haut de la ligne, défaut de pdfkit) ou
`baseline` (ligne de base). Les deux coexistent volontairement — les fiches de forces ont été
calées en `top` et validées ainsi, les pages d'introduction ont été relevées dans les PDF du
client, qui donnent des lignes de base.

Méthode de calage : générer un aperçu, le rastériser, et comparer au PDF de référence du client
au même cadrage :

```bash
npx tsx scripts/preview-livrable.ts freemium apercu.pdf
```

Le script fabrique un document complet avec des données factices, sans base ni S3 — les fiches de
forces y sont des pages blanches, leur calage étant déjà validé. Deviner des coordonnées à
l'aveugle ne marche pas ; les relever puis vérifier à l'œil, si.

## Périmètre et priorités

L'application finale regroupe trois parties. Ordre de travail décidé avec le client :

| Partie | Route | Priorité |
|---|---|---|
| **Back-office admin** | `/admin/*` | **Actuelle** — tout est à retravailler, fonctionnel et UI/UX |
| Accueil minimal | `/` | **Actuelle** — page simple + bouton « Se connecter / Créer un compte » en haut à droite, uniquement pour accéder au back-office |
| Site vitrine (présentation enMOI…) | `/` et pages publiques | Plus tard |
| Espace utilisateur | `/account/*` | Plus tard |

L'accueil n'est **pas** le site vitrine pour l'instant : c'est une porte d'entrée sobre vers
l'authentification. Ne pas y investir de temps de design produit.

## Stack

- **Next.js 15.5** (App Router, Turbopack) — React 19
- **TypeScript**, alias `@/*` vers la racine
- **Tailwind CSS v4** (config CSS-first dans `app/globals.css`, pas de `tailwind.config`)
- **shadcn/ui** (`components.json`, style « new-york » — composants dans `components/ui/`)
- **Prisma 6** + **PostgreSQL sur Neon** (région `eu-central-1`, connexion pooler)
- **better-auth 1.3** (email/mot de passe, sessions en base, plugin `customSession` pour le rôle)
- **Resend** + `@react-email/components` pour les emails transactionnels
- **pdfkit** pour la génération du PMI
- **expr-eval** pour l'évaluation des formules mathématiques
- `react-hot-toast`, `lucide-react`

## Architecture

```
app/
  (web)/page.tsx              accueil public
  (admin)/admin/              back-office — layout garde le rôle ADMIN
    page.tsx                  tableau de bord (cartes de navigation)
    forces/                   médiathèque : dépôt des 2 visuels par force
    formules/                 édition des 7 formules
    pmi/                      génération du PDF
    settings/                 paramètres globaux
  (auth)/auth/                sign-in, forget-password, reset-password
  (customer)/account/         espace utilisateur (vide, plus tard)
  api/
    auth/[...all]/            handler better-auth
    forces/                   liste, upload, suppression, prévisualisation
    mathFunctions/, settings/, pdf/
lib/
  auth.ts, auth-client.ts     instances better-auth serveur / client
  auth-utils/                 getAuthSession, requireRole, errors
  api/apiError.ts             traduction centralisée erreur → statut HTTP
  computeFunctions/           évaluateur d'expressions + variables de naissance
  forces/forceAssets.ts       clés de stockage et validation des PNG
  storage/                    interface ObjectStorage + adaptateurs S3 / local
  generate-pdf/               assemblage des livrables
    deliverables.ts           ⭐ composition des 3 livrables, page par page
    wheelVariant.ts           les 4 versions de la page 3, et laquelle s'applique
    overlayLayout.ts          ⭐ toutes les coordonnées de surimpression
    generatePdf.ts            déroule le manifeste
    renderOverlays.ts         surimpressions des pages d'introduction et des tableaux
    renderForcePages.ts       les 2 pages d'une fiche de force
    drawText.ts               primitives partagées (texte ajusté, image, masque)
    designAssets.ts           lecture et cache des gabarits
    fonts.ts                  enregistrement des polices
  prisma.ts                   singleton PrismaClient
components/
  dataManipulation/           écrans CRUD du back-office
  navbar/                     NavbarDesktopAdmin, NavbarMobileAdmin
  ui/                         shadcn
prisma/
  schema.prisma, migrations/, seed.ts, seed-forces.ts, seed-mathfunctions.ts
scripts/
  preview-livrable.ts         aperçu d'un livrable, sans base ni S3
public/
  fonts/                      Gabriola, Georgia, Book Antiqua, Segoe UI SemiBold, Cabin ×4
  pdf-design/                 gabarits PNG des livrables
    commun/                   pages 3 à 6, identiques aux trois documents
    freemium/, livrable1/, livrable2/   couverture + pages propres au livrable
    hors-livrable/            visuels du client rattachés à aucune page (3 schémas)
```

Les gabarits de `pdf-design/` sont **versionnés** — contrairement aux visuels de forces, déposés
par le client et stockés sur S3. Ils pèsent ~11 Mo au total.

### Gestion des erreurs d'API

Toute route API enveloppe son corps dans un `try/catch` qui délègue à
`apiError(err, contexte)` (`lib/api/apiError.ts`). Cette fonction traduit :

| Erreur | Statut |
|---|---|
| `UnauthorizedError` (pas de session) | 401 |
| `ForbiddenError` (rôle insuffisant) | 403 |
| `ObjectNotFoundError` (clé absente du stockage) | 404 |
| `BusinessError` (message destiné à l'administrateur) | 400 par défaut |
| `ZodError` (entrée invalide) | 400 |
| tout le reste | 500, message générique, détail dans les logs serveur |

Ne jamais renvoyer un message d'erreur brut au client pour une exception
inattendue : il peut révéler des détails d'implémentation.

### Authentification et autorisation

Trois niveaux, à respecter systématiquement :

1. **`middleware.ts`** — vérifie uniquement la *présence* du cookie de session sur `/api/:path*`
   (hors `/api/auth`). Contrôle rapide, ne vérifie **pas** le rôle.
2. **Layouts serveur** — `app/(admin)/admin/layout.tsx` appelle `getAuthSession()` et redirige
   si `role !== "ADMIN"`.
3. **Routes API** — chaque handler appelle `getAuthSession()` puis `requireRole(session, ["ADMIN"])`.
   `getAuthSession()` **throw** si pas de session ; `requireRole` **throw** si le rôle ne colle pas.
   Toujours envelopper dans un `try/catch` qui renvoie un statut HTTP propre.

Rôles : `ADMIN` | `CUSTOMER` (enum Prisma, par défaut `CUSTOMER`).

### Formules mathématiques

Les expressions sont stockées en base et éditables depuis `/admin/formules`.

### Jeux de formules par tranche d'années

Les 7 formules ne sont pas universelles : le client applique des expressions différentes aux
naissances des années 2000, et **l'an 2000 lui-même se distingue** des années 2001 à 2009. Un
`FormulaSet` regroupe les 7 `MathFunction` d'une tranche.

Il y a exactement **trois jeux**, tous posés par migration :

| Jeu | Tranche | S'applique à |
|---|---|---|
| `formulaset_defaut` | `yearFrom`/`yearTo` à `null` | toutes les années non couvertes |
| `formulaset_annee_2000_seule` | 2000-2000 | l'an 2000, qui a ses propres formules |
| `formulaset_annees_2000` | 2001-2009, **bornes incluses** | le reste de la décennie |

⚠️ L'identifiant `formulaset_annees_2000` couvre **2001-2009** depuis
`20260902160000_jeu_annee_2000` : il a été conservé pour ne pas déplacer les 7 `math_function` qui
s'y rattachent — et avec elles les expressions déjà saisies. Son libellé, lui, dit la bonne
tranche ; c'est le seul texte que l'administrateur lit.

Un jeu est toujours **complet** : ses 7 positions existent. Le jeu 2001-2009 a été initialisé avec
les expressions du jeu par défaut, et celui de l'an 2000 avec celles du jeu 2001-2009 dont il se
détache — les naissances de 2000 gardent donc exactement le comportement qu'elles avaient avant,
jusqu'à ce que l'administrateur saisisse ce qui diffère. Pas de repli formule par formule, ce qui
évite d'avoir à deviner d'où vient une expression.

⚠️ Les jeux **ne se créent ni ne se suppriment depuis l'application** : `/admin/formules` ne
permet que d'éditer les expressions. Un futur cas particulier se traite par une migration
(voir `20260821130000_jeu_annees_2000` puis `20260902160000_jeu_annee_2000`), pas en confiant à
l'administrateur une gestion de tranches qu'il n'utiliserait qu'une fois tous les deux ans.

Ni la règle de sélection, ni l'API, ni l'écran d'édition ne supposent un nombre de jeux : une
tranche de plus est une ligne de migration, l'onglet correspondant apparaît tout seul.

La règle de sélection vit dans `lib/computeFunctions/formulaSets.ts`, sans dépendance à Prisma :
elle se teste avec des objets littéraux. Une tranche l'emporte toujours sur le jeu par défaut, et
la **plus étroite** l'emporte entre deux tranches qui se recouvriraient — ce qui rend le cas de
l'an 2000 correct même si quelqu'un rouvrait la tranche voisine à 2000.

Le banc d'essai de `/admin/formules` applique le jeu correspondant à **l'année saisie**, pas celui
en cours d'édition, et l'affiche : c'est le seul moyen de vérifier qu'une tranche prend le relais.

L'évaluation passe par un **évaluateur maison** (`lib/computeFunctions/evaluateExpression.ts`) :
tokenizer puis descente récursive sur une grammaire volontairement minimale (arithmétique,
parenthèses, `abs`, `round`, `floor`, `ceil`, `sqrt`, `min`, `max`). Il remplace `expr-eval`,
vulnérable à une prototype pollution sans correctif publié. Aucune propriété n'est lue
dynamiquement et aucun code n'est généré : `constructor` et `__proto__` sont rejetés comme des
variables inconnues.

Variables disponibles à partir de la date de naissance :

| Variable | Sens |
|---|---|
| `j3` / `m3` / `a5` | jour, mois, année complets |
| `j1`, `j2` | chiffres du jour (sur 2 positions) |
| `m1`, `m2` | chiffres du mois (sur 2 positions) |
| `a1`…`a4` | chiffres de l'année (sur 4 positions) |

Les variables sont passées dans une **portée explicite**, pas substituées textuellement. La
contrainte d'ordre de l'ancienne implémentation (remplacer `a5` avant `a1`) n'existe plus : on
peut ajouter une variable dont le nom préfixe une autre sans rien casser.

Les variables d'un seul chiffre peuvent être **accolées** pour former un nombre : pour une
naissance le 04/07/1993, `a3a4` vaut 93 et `j2m1` vaut 40. La liste des variables juxtaposables
est déclarée dans `CONCATENABLE_VARIABLES` (`lib/computeFunctions/computeFunctions.ts`) et se
limite à `j1 j2 m1 m2 a1 a2 a3 a4`.

⚠️ `j3`, `m3` et `a5` en sont **exclus à dessein** : ils portent des valeurs complètes dont la
longueur varie d'une date à l'autre. `m3m3` vaudrait 77 en juillet et 1010 en octobre — une
formule dont le sens dépendrait de la personne. La liste est statique, jamais déduite des valeurs,
pour cette raison précise.

`evaluateForceNumber()` vérifie en plus que le résultat est un **entier de 0 à 99**. Hors de ces
bornes, la génération échoue avec un message nommant la formule fautive — jamais d'arrondi ou de
repli silencieux qui produirait un PMI faux.

⚠️ Les formules installées par `seed-mathfunctions.ts` sont des **placeholders techniques**, pas
les formules métier. Elles garantissent seulement un entier dans les bornes — vérifié
exhaustivement sur les 73 414 dates valides de 1900 à 2100, les 100 numéros étant atteints — ce qui
permet de faire tourner la chaîne complète sans attendre le client. Les forces qu'elles désignent
n'ont aucune signification : **un livrable produit avec ces expressions est un document de test**
et ne doit jamais être remis à une personne réelle.

## État actuel et dettes connues

La refonte est en cours sur la branche `refonte-enmoi`. Phases 0 à 4 terminées
(assainissement, modèle `Force`, stockage S3 + médiathèque, générateur v2, puis les trois
livrables).

Dettes restantes :

- ⚠️ **Le gabarit `livrable2/34-tableau-3.png` n'est pas vierge.** L'export du client — y compris
  son PDF « Vierge » — contient encore l'exemple de sa maquette : « LA CRÉATIVE AUDACIEUSE » en
  première ligne, et un « 10 » pré-rempli dans les **sept cases de la colonne Étape 1**. Le titre
  de la première ligne est neutralisé par un masque déclaré dans `WORKSHEET_EVALUATION.masks`,
  mais **les sept « 10 » restent imprimés** : ce sont des réponses d'exemple qui n'ont rien à
  faire dans le document d'une cliente. Les effacer supposerait de redessiner les cases —
  **redemander un export propre au client**, puis supprimer le masque.
- ⚠️ **Licence des polices.** Gabriola, Georgia, Book Antiqua et Segoe UI sont des polices
  Microsoft / Monotype. Leur licence ne couvre ni la redistribution dans une application web ni
  l'incorporation dans un PDF diffusé commercialement — or pdfkit les incorpore dans chaque
  document. Le client les a imposées et trois d'entre elles étaient déjà en place avant cette
  passe. À régler avant la mise en production : acquérir les licences, ou passer à des substituts
  libres visuellement proches. Cabin est sous OFL, aucune restriction.
- **3 schémas sans page d'accueil** : `hors-livrable/schema-*.png` (l'épanouissement, les 7 forces
  version turquoise, les 100 forces) ont été livrés mais ne correspondent à aucune page des trois
  documents. À rattacher, ou destinés au site vitrine — question à poser au client.
- **Poids des documents** : le livrable 2 fait ~5 Mo sans les fiches de forces, ~10 Mo avec.
  Les gabarits sont des PNG plein format ; une conversion en palette réduirait fortement le poids
  sur les pages en aplats, à condition de vérifier les pages illustrées.
- **Next 15.5.3 → 16.x** : une RCE critique est corrigée en 16. Migration majeure à traiter dans
  une passe dédiée avant la mise en production.
- **Prisma 6 → 7** : l'extension VS Code signale déjà que `url` dans `datasource` disparaît en v7
  au profit d'un `prisma.config.ts`. Le CLI v6 installé fonctionne : le message est un faux positif
  aujourd'hui, une vraie migration demain.
- Le modèle `BirthProfile` prévoit paiement, tokens, ambassadeurs, quiz — fonctionnalités de la
  phase utilisateur, pas encore branchées. Ne pas s'appuyer dessus pour le back-office.
- **`app/(customer)/account/`** n'est qu'une coquille exigeant une session. À construire avec la
  phase « espace utilisateur ».
- **Aucun test automatisé.** L'évaluateur de formules et le mapping position → force sont les
  premiers candidats.
- **`PASSWORD_ADMIN`** est un mot de passe réel en clair dans `.env` : à faire tourner avant la
  production.

⚠️ **Le temps de génération est à mesurer en production.** Le livrable 2 est le cas le plus lourd :
35 pages et 14 lectures S3. `maxDuration` est fixé à 60 s dans `app/api/pdf/route.ts`. Si la marge
se révèle trop courte, basculer sur une génération asynchrone.

## Modèle Force (migration faite)

Le modèle `Aptitude` a été remplacé par un modèle `Force` minimal, sur une base repartie de zéro.

> Les données de l'ancienne base sont archivées dans
> `02 - travaux/document/archive-db-avant-refonte-enmoi.json` (7 fiches réellement rédigées ;
> au-delà du n° 7 la table ne contenait que des placeholders de test). ⚠️ Les titres qui y figurent
> sont **l'ancienne nomenclature inYou** : le client a entièrement renommé ses 100 forces. Les
> titres de référence sont ceux des visuels livrés.

```prisma
model Force {
  id        String   @id @default(cuid())
  number    Int      @unique   // 0 à 99
  title     String
  pageAKey  String?            // clé de l'objet stocké (page A)
  pageBKey  String?            // clé de l'objet stocké (page B)
  updatedAt DateTime @updatedAt
}
```

Les clés sont **nullable** : une force peut exister sans ses visuels tant que le client ne les a
pas déposés. Le back-office doit rendre cet état visible (100 forces, N complètes).

Conséquences :

Le champ `title` ne sert **qu'au back-office et à la page de synthèse** : le titre de la force est
déjà gravé dans les visuels. `seed-forces.ts` crée les 100 lignes et connaît les 10 titres
confirmés par les visuels livrés ; les 90 autres portent un titre provisoire, à corriger au fur
et à mesure des livraisons du client.

Les bornes de la numérotation sont déclarées une seule fois, dans `lib/forces/forceAssets.ts`
(`FIRST_FORCE_NUMBER`, `LAST_FORCE_NUMBER`, `FORCE_NUMBER_RANGE`) : validation d'API, seed,
évaluateur de formules et back-office s'y réfèrent, jamais à des littéraux. ⚠️ Le client numérote
**de 0 à 99** alors que ses dossiers de livraison numérotent 1 à 20 **par lot** : la numérotation
globale est produite à l'import, elle ne figure nulle part chez lui.

Le back-office propose une **médiathèque des forces** (`/admin/forces`) en remplacement de
l'ancien « Gestion des aptitudes ».

### Assets des forces — upload par le back-office

Le client doit pouvoir **remplacer les visuels lui-même** ; ils sont amenés à changer. Les PNG ne
sont donc **pas versionnés dans le repo** : `public/forces/` ne contient qu'un échantillon de
travail (10 forces livrées par le client, dossiers `N-Nom/`, fichiers `Nom.png` / `Nom2.png`).

Contrainte d'hébergement : la production tourne sur **Vercel**, filesystem read-only. Écrire dans
`public/` à l'exécution est impossible — d'où un **stockage objet externe**. Volume attendu :
200 fichiers × ~350 Ko ≈ **70 Mo**, ce qui tient dans les paliers gratuits.

#### Stockage retenu : AWS S3

Décision : **AWS S3**, bucket dédié sur le **compte AWS de Sébastien** (et non celui du client —
prévoir la réversibilité en fin de contrat : le client devra récupérer ses assets).

Le coût n'a pas été le critère (à 70 Mo : ~0,01 $/mois sur S3, 0 $ sur R2, les deux négligeables).
Le SDK `@aws-sdk/client-s3` parle aussi bien à S3 qu'à tout service S3-compatible : la bascule vers
Cloudflare R2 ou autre ne demanderait que de changer l'endpoint et les credentials.

Configuration du bucket :

- Région **eu-west-3 (Paris)** — latence et RGPD.
- **Block Public Access activé** : les visuels ne sont pas publics. La prévisualisation dans le
  back-office passe par des **URLs présignées** à durée courte.
- **Versioning activé** : le client remplacera des visuels, un rollback sera utile un jour.
- IAM **dédié au seul bucket** (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`,
  `s3:ListBucket`) — jamais de clés admin dans l'application.

Le nommage d'origine du client est irrégulier (accents, espaces, casse, `2` en suffixe de page B,
au moins une coquille : `L'Intuituve optimiste`). **Ne jamais dériver la clé de stockage d'une
donnée que quelqu'un peut changer** — ni le nom du fichier uploadé, ni le numéro de force. La clé
est construite à partir de l'`id` (cuid immuable) et de la page : `forces/{id}/{a|b}.png`. Le nom
d'origine n'est conservé que pour l'affichage.

Le numéro est entré dans cette catégorie quand la médiathèque a permis de le réattribuer : s'il
figurait dans la clé, chaque renumérotation obligerait à déplacer des objets dans le stockage, une
opération qui ne peut pas être atomique avec l'écriture en base. Avec l'`id`, renuméroter n'est
qu'un `UPDATE`.

Les routes de lecture (prévisualisation, générateur PDF) lisent **la clé enregistrée en base**, sans
jamais la reconstruire : c'est la seule qui désigne à coup sûr l'objet déposé.

Accès derrière `lib/storage/` (interface + adaptateur), pour que le métier ne dépende pas du
fournisseur et que les tests puissent utiliser un adaptateur local.

En cas de PNG manquant, échouer explicitement avec un message nommant la force et la page — ne
jamais produire un PMI silencieusement incomplet.

### Assets du PDF lus sur disque

Les **polices** (`public/fonts/`) et les **gabarits des pages d'introduction**
(`public/pdf-design/`) sont lus avec `fs`, y compris en production. Les chemins étant construits
dynamiquement, l'analyse statique de Next ne les détecte pas : ils sont déclarés explicitement dans
`outputFileTracingIncludes` (`next.config.ts`) pour être inclus dans le bundle de la fonction.

C'est ce qui manquait à l'implémentation d'origine, laquelle contournait le problème en
**téléchargeant ses propres images en HTTP** depuis le site déployé — un aller-retour réseau par
image, et une génération de PDF dépendante de la disponibilité du site.

Seuls les **visuels de forces** viennent de S3, puisqu'ils sont déposés par le client.

## Renommage inYou → enMOI

Périmètre retenu pour l'instant : **UI, metadata et assets uniquement**. On **ne renomme pas**
le dossier `inyou-app`, le champ `name` de `package.json`, le dépôt git ni la base Neon — ce sont
des chantiers annexes qui cassent les chemins locaux, à faire plus tard en une passe dédiée.

À traiter : textes visibles, `metadata` de `app/layout.tsx`, `app/robots.ts`, le logo
(`public/logo/logo-inyou.png`), `public/pictures/main-inyou.png`, et les libellés du back-office.

## Conventions de code

- Le produit s'appelle le **Miroir enMOI**, en trois **versions** : offerte, découverte, complète.
  Jamais « livrable » ni « freemium » dans un texte lu par quelqu'un — voir « Vocabulaire » plus
  haut. Les identifiants techniques, eux, ne changent pas.
- La marque s'écrit **`enMOI`** — « en » en minuscules, « MOI » en capitales — partout où elle est
  lue par quelqu'un : textes d'interface, `metadata`, e-mails, `alt` d'images. Jamais « EnMoi »
  ni « Enmoi ». Les identifiants techniques déjà en place gardent leur casse (`--enmoi-ink`,
  `font-sans-enmoi`, branche `refonte-enmoi`) : ils ne s'affichent nulle part.
- Commentaires et libellés d'interface **en français** ; identifiants en anglais.
- Un commentaire d'en-tête d'une ligne en tête de fichier décrivant son rôle (convention déjà
  en place dans le projet).
- Server Components par défaut ; `"use client"` seulement pour les écrans interactifs
  (`components/dataManipulation/*`).
- Les composants `components/ui/` viennent de shadcn — les régénérer via le CLI plutôt que les
  écrire à la main.
- Couleur de marque actuelle : `#28939f` (variables `--primary`, `--foreground` dans `globals.css`).
  À revalider lors de la refonte UI/UX enMOI.

## Commandes

```bash
npm run dev                  # dev server (Turbopack)
npm run build
npm run lint

npx prisma studio            # inspecter la base
npx prisma generate
npx prisma migrate dev --name <description>   # migration en dev
npm run migrate:postgres                      # applique les migrations en prod (.env.production)

npx tsx prisma/seed-mathfunctions.ts          # seed des 7 formules (idempotent)
npx tsx prisma/seed.ts                        # seed du compte admin

# renumérotation 1-100 → 0-99 des forces déjà en base (une seule fois, --dry-run pour voir)
npx tsx prisma/renumber-forces-zero-based.ts --dry-run

# jeux de formules par tranche d'années : migration à appliquer avant tout
npx prisma migrate deploy                     # dev
npm run migrate:postgres                      # prod (.env.production)

# aperçu d'un livrable avec des données factices, sans base ni S3 — sert au calage
npx tsx scripts/preview-livrable.ts freemium|livrable1|livrable2 [sortie.pdf]
```

## Environnement

`.env` (dev) et `.env.production` (prod) — **non versionnés**, et à garder ainsi.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL (pooler) |
| `BETTER_AUTH_SECRET` | secret de signature des sessions |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL` | URL de base de l'auth |
| `EMAIL_ADMIN`, `PASSWORD_ADMIN`, `FIRSTNAME_ADMIN`, `LASTNAME_ADMIN`, `ROLE_ADMIN`, `NEXT_PUBLIC_NAME_ADMIN` | compte admin créé par le seed |
| `RESEND_API_KEY`, `RESEND_MAIL_FROM` | envoi des emails |
| `S3_REGION`, `S3_BUCKET` | bucket des visuels de forces (`eu-west-3`) |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | IAM dédié, restreint au seul bucket |
| `S3_ENDPOINT` | optionnel — vide pour AWS, renseigné pour un service S3-compatible |

⚠️ `PASSWORD_ADMIN` est un mot de passe réel en clair dans `.env`. Ne jamais le recopier dans du
code, un commentaire, un log ou un message. Prévoir sa rotation avant la mise en production.

Une **CSP stricte** est définie dans `next.config.ts` (plus `Referrer-Policy`, `X-Frame-Options`,
`nosniff`). Toute nouvelle origine externe (police, image, API) doit y être ajoutée explicitement,
sinon elle sera bloquée silencieusement en production.
