# Nouvel An Chișinău–Bucarest : l'app

Ce dossier est l'app du voyage, prête pour GitHub Pages. Une fois en ligne, chacun l'installe sur son téléphone, et elle marche sans réseau : la carte avec les rues, les photos, les horaires et les billets.

## Mettre l'app en ligne (une seule fois)

1. Sur [github.com](https://github.com), connectez-vous puis créez un dépôt avec **New repository**. Nom : `nouvel-an`. Visibilité : **Public**, car GitHub Pages est gratuit pour les dépôts publics. Ne cochez rien d'autre, puis **Create repository**.
2. Dans le dépôt vide, cliquez sur **uploading an existing file**. Glissez **le contenu** de ce dossier : les fichiers et les dossiers `img`, `fonts` et `icons`, pas le dossier lui-même. Attendez la fin de l'envoi, puis **Commit changes**.
3. Ouvrez **Settings**, puis **Pages**. Sous *Build and deployment* : Source **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
4. Une à deux minutes plus tard, l'adresse s'affiche en haut de la page Pages, de la forme `https://votre-pseudo.github.io/nouvel-an/`. Envoyez-la au groupe.

## Installer l'app sur le téléphone

- **iPhone** : ouvrez l'adresse dans **Safari**, touchez **Partager**, puis **Sur l'écran d'accueil**, puis **Ajouter**.
- **Android** : ouvrez l'adresse dans **Chrome**, menu **⋮**, puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**).

Ouvrez l'app une première fois avec du wifi : elle enregistre tout sur le téléphone, environ 11 Mo. Ensuite, elle s'ouvre même en mode avion.

Utilisez l'app installée plutôt que l'onglet Safari : sur iPhone, Safari peut effacer les données d'un site qu'on n'a pas ouvert depuis une semaine, dont les billets. Il ne le fait pas pour une app installée sur l'écran d'accueil.

## Ce que fait l'app

- **La carte** du trajet, avec les rues des villes, les lieux à voir et leurs photos, sans réseau.
- **Ma position** : le bouton cible sous le zoom affiche le point bleu sur la carte, une fois la localisation autorisée.
- **Itinéraire à pied** : depuis la fiche d'un lieu à voir, d'une gare ou de l'auberge, l'app trace le trajet à pied depuis votre position sur sa propre carte, sans réseau, avec la distance et le temps de marche. Il suit vos pas. Le bouton Google Maps reste à côté pour un guidage complet quand le réseau passe.
- **Sortir** : dans la fiche de chaque ville, et sur les jours concernés, les bars, boîtes de nuit, fast-food locaux et toilettes publiques les mieux notés, avec une ligne sur chacun et une photo libre de droits du lieu ou de sa rue quand il en existe une, sinon un lien vers les photos de Google Maps. Ils sont sur la carte, avec l'itinéraire à pied sans réseau, et un lien Google Maps qui tombe pile sur l'adresse. Les symboles de la légende servent d'interrupteurs pour les masquer.
- **Urbex** : dans la fiche de Chișinău et de Bucarest, les bâtiments abandonnés à voir depuis la rue (Casa Radio, Moara lui Assan, Hanul Solacolu…), avec photo, état actuel et itinéraire.
- **Défis** : l'onglet à l'étoile. Les plats typiques à goûter, région par région, et les objets les plus improbables à rapporter, ville par ville, avec leurs photos. Chacun coche les siens ; une fois les téléphones reliés au groupe, chacun voit aussi ceux des autres.
- **Le groupe** : dans Défis, le cadre « À plusieurs » relie vos téléphones. Chaque défi montre une pastille de couleur par personne, pleine quand c'est fait, avec un classement en haut. Dans la fiche de chaque lieu, « + Photos et vidéos » les envoie en taille originale dans un dossier Google Drive, rangées par lieu, et tout le monde les voit dans l'app. Voir « Créer le groupe » plus bas.
- **Aujourd'hui** : pendant le voyage, l'app s'ouvre sur la journée en cours. Les étapes passées s'estompent et la prochaine affiche le temps restant.
- **Mes billets** : chacun ajoute ses cartes d'embarquement et ses billets de train, en capture d'écran du QR code ou en PDF. Ils restent sur son téléphone et ne sont envoyés nulle part.
- **Avant de partir** : la liste à cocher reste sur chaque téléphone.
- Les boutons **Itinéraire** ouvrent Google Maps, qui a besoin de réseau, sauf si vous y avez téléchargé les villes en cartes hors connexion.

## Créer le groupe (une fois, sur ordinateur, 5 minutes)

Le groupe passe par un petit script installé dans le Google Drive d'un membre. Le script ne touche qu'au dossier qu'il crée lui-même, « Nouvel An 2026 – photos du groupe ».

1. Ouvrez [`groupe/Code.gs`](groupe/Code.gs) dans ce dépôt et copiez tout son texte (bouton **Copy raw file**).
2. Sur [script.google.com](https://script.google.com), connecté au compte Gmail personnel qui gardera les photos (un compte d'école ou d'entreprise ferme souvent l'accès « Tout le monde ») : **Nouveau projet**. Remplacez tout le texte par celui copié, renommez le projet « Nouvel An – groupe », puis enregistrez.
3. **Déployer**, puis **Nouveau déploiement**. Avec la roue dentée, choisissez **Application Web**. *Exécuter en tant que* : **Moi**. *Qui a accès* : **Tout le monde**. Puis **Déployer**.
4. **Autoriser l'accès** avec votre compte. Google affiche « Google n'a pas validé cette application », comme pour tout script personnel : **Paramètres avancés**, **Accéder à Nouvel An – groupe (non sécurisé)**, puis cochez **les deux autorisations**, Google Drive et « Se connecter à un service externe », et **Continuer**. Si Google ne demande rien au déploiement, choisissez la fonction `autoriser` dans la barre du haut et cliquez sur **Exécuter**.
5. Copiez l'**URL de l'application Web**, qui finit par `/exec`.
6. Dans l'app : **Défis**, **Créer le groupe**, collez l'URL, puis votre prénom. Touchez **Inviter** et envoyez le lien sur votre groupe.

Les autres ouvrent le lien, ou le collent dans l'app (**Défis**, **Rejoindre avec un lien**), puis choisissent leur prénom. Sur iPhone, collez-le dans l'app installée sur l'écran d'accueil : elle ne partage pas ses données avec Safari.

Photos et vidéos partent **en taille originale**, jusqu'à 1 Go par photo et 5 Go par vidéo, en morceaux de 4 Mo : une coupure de réseau reprend là où l'envoi s'était arrêté. Hors réseau, elles attendent sur le téléphone avec les cases cochées, puis partent d'elles-mêmes ; au-delà de 500 Mo, gardez l'app ouverte jusqu'à la fin de l'envoi. Les vidéos partent mieux en wifi. L'app montre un aperçu de chaque photo et la première image de chaque vidéo ; l'original s'ouvre dans Google Drive.

Le Drive gratuit fait 15 Go en tout, Gmail compris : quelques vidéos en 4K le remplissent vite. L'app affiche la place utilisée dans **Réglages**, sous le groupe. Pour que les autres ouvrent les originaux et les vidéos, partagez-leur le dossier « Nouvel An 2026 – photos du groupe » depuis Google Drive.

- Le lien d'invitation ouvre le groupe à qui l'a : gardez-le entre vous. Il n'est écrit nulle part dans ce dépôt.
- Le dossier des photos est dans le Drive de la personne qui a installé le script, qui peut le partager aux autres depuis Google Drive. Une photo supprimée dans l'app part dans la corbeille du Drive ; seule la personne qui l'a ajoutée peut la supprimer.
- **Mettre à jour le script** sans changer d'adresse : remplacez son texte par la nouvelle version de [`groupe/Code.gs`](groupe/Code.gs) et enregistrez. Choisissez la fonction `autoriser` dans la barre du haut, cliquez sur **Exécuter** et acceptez si Google demande une nouvelle autorisation. Puis **Déployer**, **Gérer les déploiements**, le crayon, *Version* : **Nouvelle version**, **Déployer**. Un nouveau déploiement donnerait une autre adresse, et il faudrait recréer le groupe ; le groupe, lui, reste tel quel.
- Google demande l'accès au Drive parce que le script y crée son dossier et y range les photos, et l'accès à un service externe parce qu'il passe les gros fichiers à Google Drive par morceaux. Pour tout couper : [myaccount.google.com/permissions](https://myaccount.google.com/permissions), « Nouvel An – groupe », **Supprimer l'accès**.

## Modifier les réglages : `config.json`

Sur GitHub, ouvrez `config.json`, cliquez sur le crayon, modifiez, puis **Commit changes**. Les téléphones prennent les changements à la prochaine ouverture avec du réseau.

- `tricount` : le lien d'invitation de votre groupe Tricount, entre guillemets. Il ajoute un bouton **Dépenses du groupe** sur l'accueil et dans le budget.
- `auberges` : pour chaque auberge réservée, son `nom` et son `adresse`. Ajoutez `coords` pour la voir sur la carte : dans Google Maps, faites un appui long sur l'auberge et copiez les coordonnées, par exemple `47.0245, 28.8323`. `nuits` donne les jours où vous y dormez. Une auberge sans nom n'apparaît pas.

Jours : `j1` sam. 26 déc., `j2` dim. 27, `j3` lun. 28, `j4` mar. 29, `j5` mer. 30, `j6` jeu. 31, `j7` ven. 1er janv., `j8` sam. 2, `j9` dim. 3.

Exemple d'auberge remplie :

```json
{ "nuits": ["j2", "j3"], "ville": "Chișinău", "nom": "Auberge du Centre", "adresse": "Strada Exemplu 1, Chișinău", "coords": "47.0245, 28.8323", "site": "" }
```

Gardez les virgules entre les auberges et les guillemets autour des textes : si le fichier devient invalide, l'app garde les réglages précédents.

## À savoir

- Le dépôt et le site sont **publics** : quiconque a l'adresse voit l'itinéraire. N'y mettez jamais de billet, de numéro de réservation ni de pièce d'identité. Les billets se rangent dans **Mes billets**, sur chaque téléphone.
- Les idées et les photos partagées de la version claude.ai ne sont pas dans cette app : ici, les photos passent par le groupe.
- Pour mettre l'app à jour, envoyez sur GitHub les fichiers d'une nouvelle version du dossier. À la prochaine ouverture avec du réseau, l'app affiche « Une nouvelle version de l'app est prête » : touchez **Recharger**.
- Sources : fond de carte Natural Earth ; rues, rivières, parcs et positions des adresses de sortie © les contributeurs d'OpenStreetMap (licence ODbL) ; photos de Wikimedia Commons et Flickr, créditées en bas de l'app ; polices Sofia Sans, Sofia Sans Extra Condensed et Doto sous SIL Open Font License (dossier `fonts`).
