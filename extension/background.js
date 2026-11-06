// Lecteur QR → SoWeSign : alerte quand la session d'un compte tombe.
// Le script de la page signale « in » (connecté) ou « out » (page de connexion affichée) ; ici on affiche le badge « ! »
// sur l'icône et une notification, dont un clic ramène sur l'onglet SoWeSign. Il ne se connecte jamais.
const ext = typeof browser !== "undefined" ? browser : chrome;
const NOTIF = "lqr-session", TAB = "lqrTab", APP = "https://app.sowesign.com/", TITLE = "Lecteur QR → SoWeSign";

ext.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "session" && (msg.state === "in" || msg.state === "out")) return handle(msg, sender.tab);
});

async function handle({ state, notify, label }, tab) {
  const name = typeof label === "string" ? label.slice(0, 40) : "";
  if (state === "out") {
    await ext.storage.local.set({ [TAB]: tab ? { id: tab.id } : null });
    await ext.action.setBadgeBackgroundColor({ color: "#c0392b" });
    await ext.action.setBadgeText({ text: "!" });
    await ext.action.setTitle({ title: "SoWeSign : session à reconnecter" + (name ? " (" + name + ")" : "") });
    if (notify) {
      await ext.notifications.create(NOTIF, {
        type: "basic", iconUrl: "icon.png", title: "SoWeSign : session à reconnecter",
        message: (name ? name + " — " : "") + "La session a expiré. Clique ici pour ouvrir la page de connexion.",
      });
    }
  } else {
    await ext.action.setBadgeText({ text: "" });
    await ext.action.setTitle({ title: TITLE });
    await ext.notifications.clear(NOTIF);
  }
}

// Un clic sur la notification ramène sur l'onglet SoWeSign concerné, sinon en ouvre un
ext.notifications.onClicked.addListener(async id => {
  if (id !== NOTIF) return;
  await ext.notifications.clear(NOTIF);
  const saved = (await ext.storage.local.get(TAB))[TAB];
  try {
    const tab = await ext.tabs.update(saved.id, { active: true });
    await ext.windows.update(tab.windowId, { focused: true });
  } catch { await ext.tabs.create({ url: APP }); }
});
