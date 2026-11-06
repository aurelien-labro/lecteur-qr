# Extension « Lecteur QR → SoWeSign »

Remplit dans SoWeSign le code scanné par le Lecteur QR, et **prévient quand la session d'un compte tombe**. Elle ne valide jamais et ne se connecte jamais : tu envoies toi-même le formulaire et tu tapes toi-même tes codes de connexion.

Une extension s'installe par navigateur (ou par profil de navigateur) : un navigateur = un compte SoWeSign, qui reste connecté avec ses propres cookies.

## Installation

- **Chrome, Edge, Brave (ordinateur)** : ouvre `chrome://extensions` (ou `edge://extensions`), active le *Mode développeur*, clique sur *Charger l'extension non empaquetée* et choisis ce dossier `extension`.
- **Firefox (ordinateur)** : ouvre `about:debugging#/runtime/this-firefox`, clique sur *Charger un module complémentaire temporaire* et choisis `manifest.json`. Il disparaît au redémarrage de Firefox ; pour le garder, il faut le faire signer sur addons.mozilla.org.
- **Android** : Chrome n'accepte pas les extensions. Firefox pour Android les accepte, mais seulement signées.

## Réglage, une seule fois par navigateur

1. Ouvre SoWeSign, sur la page où tu saisis le code de présence.
2. Ouvre le bandeau **Lecteur QR** en bas à droite, puis clique sur **Choisir le champ** et sur le champ du code.
3. Le champ est retenu : tu n'as plus à le refaire.

## Utilisation

- Scanne le QR dans le Lecteur QR : si c'est un simple code, le bouton **Signer avec…** ouvre SoWeSign avec le bon compte et le code arrive dans l'extension, qui le remplit dans le champ choisi.
- Sans le Lecteur QR, copie le code puis colle-le dans la case du bandeau.
- Un code en attente expire après 10 minutes.

## Alerte de session expirée

SoWeSign se connecte avec un clavier numérique affiché à l'écran, conçu pour qu'aucun programme ne saisisse les codes à ta place. Cette extension ne le contourne donc pas : elle te **prévient** quand la session tombe.

- **Principe :** quand l'onglet SoWeSign d'un profil passe de « connecté » à la page de connexion, l'icône de l'extension affiche un **« ! » rouge** et une notification apparaît, par exemple « Organisme Alpha : session à reconnecter ». Un clic sur la notification ramène sur cet onglet, et tu tapes toi-même tes codes. Le bandeau passe au rouge tant que la session n'est pas rétablie.
- **Nom du compte :** dans le bandeau **Lecteur QR**, écris le nom du compte dans la case « Nom de ce compte », pour savoir lequel est concerné.
- **Garde un onglet SoWeSign épinglé** dans chaque profil. L'alerte vient de cet onglet : onglet fermé, pas d'alerte, et une session expirée n'est découverte qu'à la prochaine ouverture de SoWeSign.
- **Pas de notification à la première visite :** arriver directement sur la page de connexion ne déclenche rien, car tu es sans doute en train de te connecter. L'alerte n'existe que si l'extension avait vu la session connectée avant.
- **Ce qu'elle ne fait pas :** elle ne prolonge pas la session et ne simule aucune activité. La durée de la session reste celle de SoWeSign.
- **Autorisation :** l'extension demande « Afficher des notifications » à l'installation.

## Ce qu'elle fait et ne fait pas

- Elle ne tourne que sur `app.sowesign.com`.
- Elle ne lit ni les cookies, ni les mots de passe, ni le PIN. Elle ne remplit que le champ que tu as choisi, jamais les champs de connexion au hasard.
- Rien n'est envoyé ailleurs : le champ choisi, le nom du compte, le dernier état de la session et le code en attente restent dans le stockage du navigateur.
