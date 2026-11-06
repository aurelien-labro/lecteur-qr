# Extension « Lecteur QR → SoWeSign »

Remplit dans SoWeSign le code scanné par le Lecteur QR. **Elle ne valide jamais** : tu envoies toi-même le formulaire.

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

## Ce qu'elle fait et ne fait pas

- Elle ne tourne que sur `app.sowesign.com`.
- Elle ne lit ni les cookies, ni les mots de passe, ni le PIN. Elle ne remplit que le champ que tu as choisi, jamais les champs de connexion au hasard.
- Rien n'est envoyé ailleurs : le champ choisi et le code en attente restent dans le stockage du navigateur.
