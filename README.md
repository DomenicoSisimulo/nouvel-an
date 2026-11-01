# Nouvel An Chișinău–Bucarest : l'app

Ce dossier est l'app du voyage, prête pour GitHub Pages. Une fois en ligne, chacun l'installe sur son téléphone, et elle marche sans réseau : la carte avec les rues, les photos, les horaires et les billets.

## Mettre l'app en ligne (une seule fois)

1. Sur [github.com](https://github.com), connectez-vous puis créez un dépôt avec **New repository**. Nom : `nouvel-an`. Visibilité : **Public**, car GitHub Pages est gratuit pour les dépôts publics. Ne cochez rien d'autre, puis **Create repository**.
2. Dans le dépôt vide, cliquez sur **uploading an existing file**. Glissez **le contenu** de ce dossier : les fichiers et les dossiers `img`, `fonts` et `icons`, pas le dossier lui-même. Attendez la fin de l'envoi, puis **Commit changes**.
3. Ouvrez **Settings**, puis **Pages**. Sous *Build and deployment* : Source **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
4. Une à deux minutes plus tard, l'adresse s'affiche en haut de la page Pages, de la forme `https://votre-pseudo.github.io/nouvel-an/`. Envoyez-la au groupe.

## Installer l'app sur le téléphone

- **iPhone** : ouvrez l'adresse dans **Safari**, touchez **Partager**, puis **Sur l'écran d'accueil**, puis **Ajouter**.
- **Android** : l'app Android se télécharge sur la page [`android/`](android/) du site (l'adresse du site suivie de `android/`), à envoyer telle quelle au groupe. Elle se met ensuite à jour toute seule : à chaque nouvelle version publiée ici, elle propose **Mettre à jour**, vérifie le fichier, et Android l'installe par-dessus en gardant billets, cases et groupe. La première fois, Android demande d'autoriser l'app à installer sa mise à jour. À défaut, Chrome installe aussi l'app web : menu **⋮**, puis **Installer l'application**.

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
- **Quoi de neuf** : dans le cadre du groupe, les défis cochés par les autres, leurs photos et leurs vidéos. Une pastille sur l'onglet Défis compte ce que vous n'avez pas encore vu ; toucher une ligne ouvre le défi ou les photos.
- **Où sont les autres** : « Partager ma position 30 min », dans le cadre du groupe ou avec le bouton aux deux silhouettes sous le zoom de la carte. Les autres vous voient sur la carte, avec votre initiale et l'heure ; touchez leur point pour l'itinéraire à pied jusqu'à eux. La position s'efface dès qu'on arrête, et d'elle-même au bout de 30 minutes. L'app doit rester ouverte pour la mettre à jour.
- **Album** : l'onglet à l'image. Toutes les photos et vidéos du groupe, jour par jour, à trier par personne ou par jour. Dans la visionneuse, on passe de l'une à l'autre d'un glissement du doigt, on réagit d'un emoji (❤️ 😂 😮 🔥 👏, un par personne) ; « Voir l'original » et « Lire la vidéo » les chargent en taille réelle, et « Enregistrer » les met dans la galerie du téléphone (sur iPhone : deux touches, puis « Enregistrer l'image » ou « Enregistrer la vidéo »).
- **Tout enregistrer** : en haut de l'album, les originaux de tout l'album, ou du jour et de la personne choisis, partent l'un après l'autre dans la galerie (app Android, dossier « Nouvel An ») ou dans les téléchargements. Sur iPhone, par paquets de dix : une touche sur **Enregistrer** par paquet, puis « Enregistrer » dans le menu de partage. Ce qui est déjà enregistré n'est pas refait ; mieux vaut le wifi.
- **Preuves en photo** : un défi coché propose d'ajouter une photo comme preuve ; elle s'affiche sous le défi pour tout le monde, et dans l'album avec une étoile.
- **Convertisseur** : dans Infos, euros, lei moldaves, roubles de Transnistrie, lei roumains et dinars serbes, sans réseau, avec les derniers taux enregistrés (mis à jour dès qu'il y a du réseau). Le rouble de Transnistrie suit le dollar à son taux officiel.
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

Photos et vidéos partent **en taille originale**, jusqu'à 1 Go par photo et 5 Go par vidéo, en morceaux de 4 Mo : une coupure de réseau reprend là où l'envoi s'était arrêté. Hors réseau, elles attendent sur le téléphone avec les cases cochées, puis partent d'elles-mêmes. Pendant un gros envoi, l'écran reste allumé ; gardez l'app ouverte jusqu'à la fin. Dans **Réglages**, sous le groupe, « Envoi des photos et vidéos » : **Tout de suite**, **En wifi** (l'app Android attend le wifi toute seule) ou **En pause** (sur iPhone, qui ne dit pas à l'app s'il est en wifi : mettez en pause hors wifi, puis « Reprendre les envois »). Les cases cochées partent toujours.

Personne n'a besoin d'un compte Google : l'app montre un aperçu de chaque photo et la première image de chaque vidéo, puis charge l'original ou la vidéo par le script, sur demande. Seule la personne qui a installé le script ouvre le dossier dans Google Drive.

La liste des photos, vidéos et réactions est rangée dans le dossier « données de l'app (ne pas modifier) », à l'intérieur du dossier du groupe : elle tient des milliers de photos, et chaque téléphone ne recharge que ce qui a changé depuis sa dernière visite, quelques centaines d'octets quand rien n'a bougé.

Le Drive gratuit fait 15 Go en tout, Gmail compris : quelques vidéos en 4K le remplissent vite. L'app affiche la place utilisée dans **Réglages**, sous le groupe.

- Le lien d'invitation ouvre le groupe à qui l'a : gardez-le entre vous. Il n'est écrit nulle part dans ce dépôt.
- Le dossier des photos est dans le Drive de la personne qui a installé le script. Le script ne sert que les fichiers de l'album, à qui a le lien d'invitation. Une photo supprimée dans l'app part dans la corbeille du Drive ; seule la personne qui l'a ajoutée peut la supprimer.
- Les positions passent par le même script, arrondies à une dizaine de mètres, et ne sont gardées que le temps du partage.
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
