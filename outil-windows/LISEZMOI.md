# Outil Windows : ouvrir SoWeSign dans le bon profil de navigateur

Chaque compte SoWeSign reste connecté dans son propre profil de Chrome, Edge ou Brave (avec ses propres cookies). Cet outil permet au Lecteur QR d'ouvrir SoWeSign **directement dans le profil du compte**, sans passer par ton navigateur du moment.

Il ne lit ni cookies, ni mots de passe, ni PIN : il lance seulement le navigateur sur le bon profil, qui est déjà connecté.

## Installation (une seule fois)

1. Garde ce dossier `outil-windows` quelque part où il ne bouge plus.
2. Double-clique sur **installer.cmd**. Aucun droit administrateur n'est demandé : le lien `lqr://` est ajouté pour ton utilisateur Windows seulement.
3. L'installeur affiche les profils trouvés. Tu peux les revoir quand tu veux avec **profils.cmd**.

Pour tout retirer : `installer.cmd desinstaller`.

## Réglage de chaque compte

1. Dans chaque profil du navigateur, connecte-toi une fois à SoWeSign et installe l'extension du dossier `extension` (voir son LISEZMOI).
2. Dans le Lecteur QR : **Gérer** › icône 🔗 du compte › choisis le **navigateur** et écris le **dossier du profil** (colonne « Dossier » de `profils.cmd`, par exemple `Default` ou `Profile 1`).

Ensuite, chaque bouton **Signer avec…** ou **Envoyer** ouvre SoWeSign dans ce profil, et l'extension remplit le code.

La première fois, le navigateur demande s'il peut ouvrir « lqr » : coche « toujours autoriser ». Une fenêtre noire apparaît une fraction de seconde à chaque ouverture.

## Ce qu'il accepte, et rien d'autre

- Un seul argument, de la forme `lqr://open?b=…&p=…&u=…`.
- Les navigateurs Chrome, Edge et Brave (Firefox n'est pas géré).
- Un profil qui **existe déjà** : un nom inconnu est refusé, pour ne pas créer de profil vide.
- Une adresse `https://app.sowesign.com/…` : tout autre site est refusé.
