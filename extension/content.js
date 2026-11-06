// Lecteur QR → SoWeSign
// Reçoit le code scanné (adresse « #lqr=CODE » ou « ?lqr=CODE », ou collé à la main) et le met dans le champ
// que tu as choisi. Il ne clique sur aucun bouton, mais SoWeSign valide la présence dès que le code est correct :
// remplir le code revient donc à signer. Il ne remplit que sur ordre de l'utilisateur (le code vient du Lecteur QR ou
// est collé à la main), jamais de lui-même.
// Il surveille aussi la session : quand SoWeSign affiche sa page de connexion, il prévient (badge + notification).
// Il ne se connecte jamais et ne garde pas la session en vie : il te prévient, tu te reconnectes toi-même.
(() => {
  const ext = typeof browser !== "undefined" ? browser : chrome;
  const store = ext.storage.local;
  const FIELD = "lqrField", PENDING = "lqrPending", SESSION = "lqrSession", LABEL = "lqrLabel", TTL = 10 * 60 * 1000;
  const CODE = /^[\w.-]{1,64}$/;   // un code simple : jamais de lien ni de texte libre
  const FILLABLE = "input:not([type]), input[type=text], input[type=tel], input[type=number], input[type=search], textarea";

  let pending = null, field = null, choosing = false, open = false, message = "";
  let session = null, label = "", reported = false, seenState = null, seenSince = 0;   // session : "in" | "out" | null
  let host, root;
  const q = s => { try { return document.querySelector(s); } catch { return null; } };
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };

  // Le code arrive dans l'adresse : on le garde, puis on le retire de la barre d'adresse
  function takeFromUrl() {
    const u = new URL(location.href), h = new URLSearchParams(u.hash.slice(1));
    const code = h.get("lqr") ?? u.searchParams.get("lqr");
    if (code === null) return null;
    h.delete("lqr"); u.searchParams.delete("lqr"); u.hash = h.toString();
    history.replaceState(history.state, "", u.href);
    return CODE.test(code) ? code : null;
  }

  function selectorOf(node) {
    if (node.id && document.querySelectorAll("#" + CSS.escape(node.id)).length === 1) return "#" + CSS.escape(node.id);
    if (node.name) {
      const s = node.tagName.toLowerCase() + '[name="' + CSS.escape(node.name) + '"]';
      if (document.querySelectorAll(s).length === 1) return s;
    }
    const path = [];
    for (let n = node; n && n !== document.body; n = n.parentElement) {
      const same = [...n.parentElement.children].filter(c => c.tagName === n.tagName);
      path.unshift(n.tagName.toLowerCase() + (same.length > 1 ? ":nth-of-type(" + (same.indexOf(n) + 1) + ")" : ""));
    }
    return "body > " + path.join(" > ");
  }

  // Passe par le setter natif : sinon React ou Vue ne voient pas la valeur
  function fill(input, value) {
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Ne remplit que le champ choisi, sur la page où il a été choisi : jamais les champs de connexion au hasard
  async function autofill() {
    if (!pending || !field || field.path !== location.pathname) return false;
    const input = q(field.selector);
    if (!input || input.disabled || input.readOnly) return false;
    const code = pending.code;
    fill(input, code);
    pending = null; open = true;
    message = "Code « " + code + " » rempli. SoWeSign valide la présence dès que le code est correct.";
    await store.remove(PENDING);
    render();
    return true;
  }

  async function setPending(code) {
    if (!CODE.test(code)) { message = "Ce n'est pas un code simple (lettres, chiffres, - _ .)."; open = true; return render(); }
    pending = { code, at: Date.now() };
    message = ""; open = true;
    await store.set({ [PENDING]: pending });
    if (!(await autofill())) render();
  }

  async function paste() {
    try { await setPending((await navigator.clipboard.readText()).trim()); }
    catch { message = "Le navigateur refuse l'accès au presse-papiers : colle le code dans la case."; render(); }
  }

  // Veille de session : quand la session tombe, SoWeSign affiche sa page de connexion (/login, clavier numérique).
  // Pas de notification à la première observation sur /login (on est sans doute en train de se connecter) : seulement
  // quand on passait de « connecté » à « déconnecté ». « Connecté » demande 4 s de stabilité, car l'adresse passe un
  // instant par « / » avant /login.
  // Le texte de l'écran de connexion n'est lu que s'il est visible (innerText ignore les scripts et les éléments cachés),
  // et seulement un tour sur trois, car cela demande un calcul de mise en page.
  const LOGIN_TEXT = /Entrez votre code (établissement|identifiant)|Entrez votre PIN/i;
  let ticks = 0, textLogin = false;
  const isLogin = () => location.pathname.startsWith("/login")
    || (ticks++ % 3 === 0 ? (textLogin = LOGIN_TEXT.test((document.body?.innerText || "").slice(0, 4000))) : textLogin);
  async function watch() {
    const seen = isLogin() ? "out" : "in";
    if (seen !== seenState) { seenState = seen; seenSince = Date.now(); }
    if (seen === "in" && Date.now() - seenSince < 4000) return;
    if (seen === session && reported) return;
    const before = session;
    session = seen; reported = true;
    await store.set({ [SESSION]: { state: seen, at: Date.now() } });
    try { await ext.runtime.sendMessage({ type: "session", state: seen, notify: seen === "out" && before === "in", label }); } catch {}
    render();
  }

  function render() {
    if (!root) return;
    const down = session === "out";
    const kids = [el("button", { className: "head" + (down ? " alert" : ""), textContent: "Lecteur QR" + (down ? " · session à reconnecter" : pending ? " · code reçu" : ""),
      onclick: () => { open = !open; render(); } })];
    if (open) {
      const body = el("div", { className: "body" });
      body.append(
        el("p", { className: "muted", textContent: "Session SoWeSign : " + (down ? "à reconnecter ⚠" : session === "in" ? "connectée ✓" : "inconnue") }),
        el("p", { textContent: pending ? "Code reçu : " + pending.code : "Aucun code en attente." }),
        el("p", { className: "muted", textContent: message || (field
          ? "Champ choisi : le code s'y remplit tout seul."
          : "Aucun champ choisi : rien n'est rempli tant que tu n'as pas cliqué sur « Choisir le champ ».") }));
      if (pending && field) body.append(el("button", { className: "b main", textContent: "Remplir maintenant", onclick: autofill }));
      body.append(el("button", { className: "b" + (choosing ? " main" : ""), textContent: choosing ? "Clique sur le champ du code…" : "Choisir le champ",
        onclick: () => { choosing = !choosing; message = ""; render(); } }));
      if (field) body.append(el("button", { className: "b", textContent: "Oublier le champ",
        onclick: async () => { field = null; message = "Champ oublié."; await store.remove(FIELD); render(); } }));
      body.append(
        el("input", { placeholder: "Colle le code ici", onchange: e => { setPending(e.target.value.trim()); e.target.value = ""; } }),
        el("button", { className: "b", textContent: "Lire le presse-papiers", onclick: paste }),
        el("input", { placeholder: "Nom de ce compte (pour l'alerte)", value: label, maxLength: 40,
          onchange: e => { label = e.target.value.trim().slice(0, 40); store.set({ [LABEL]: label }); render(); } }));
      kids.push(body);
    }
    root.replaceChildren(STYLE, el("div", { className: "box" }, ...kids));
  }

  const STYLE = el("style", { textContent: `
    :host { all: initial }
    .box { position: fixed; right: 12px; bottom: 12px; z-index: 2147483647; width: 270px; overflow: hidden; background: #fff; color: #121a17;
      font: 14px/1.4 system-ui, sans-serif; border: 1px solid #0b7a5a; border-radius: 14px; box-shadow: 0 6px 24px rgba(0,0,0,.25) }
    .head { display: block; width: 100%; padding: 9px 12px; border: 0; background: #0b7a5a; color: #fff; font: inherit; font-weight: 700; text-align: left; cursor: pointer }
    .body { display: grid; gap: 8px; padding: 12px }
    p { margin: 0; word-break: break-all } .muted { color: #5f6d68; font-size: 12px; word-break: normal }
    .b { padding: 7px 10px; border: 1px solid #0b7a5a; border-radius: 9px; background: #fff; color: #0b7a5a; font: inherit; font-weight: 700; cursor: pointer }
    .b.main { background: #0b7a5a; color: #fff }
    .head.alert { background: #c0392b }
    input { padding: 7px 10px; border: 1px solid #cfd8d4; border-radius: 9px; font: inherit; color: #121a17; background: #fff }` });

  function mount() {
    host = el("div", { id: "lqr-host" });
    root = host.attachShadow({ mode: "open" });
    document.documentElement.append(host);
    render();
  }

  // Choisir le champ : le prochain clic sur un champ texte de la page est retenu
  document.addEventListener("click", async e => {
    if (!choosing || (host && e.composedPath().includes(host))) return;
    const target = e.target.closest?.(FILLABLE);
    choosing = false;
    if (!target) { message = "Ce n'est pas un champ texte. Réessaie."; return render(); }
    field = { path: location.pathname, selector: selectorOf(target) };
    message = "Champ enregistré.";
    await store.set({ [FIELD]: field });
    if (!(await autofill())) render();
  }, true);

  // Les pages SoWeSign se construisent après coup : on réessaie à chaque changement, tant qu'un code attend
  let timer;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!pending) return;
      if (Date.now() - pending.at > TTL) { pending = null; store.remove(PENDING); return render(); }
      autofill();
    }, 250);
  }).observe(document, { childList: true, subtree: true });

  (async () => {
    const fromUrl = takeFromUrl();
    const saved = await store.get([FIELD, PENDING, SESSION, LABEL]);
    field = saved[FIELD] || null;
    session = saved[SESSION]?.state ?? null;
    label = saved[LABEL] || "";
    if (fromUrl) { pending = { code: fromUrl, at: Date.now() }; await store.set({ [PENDING]: pending }); }
    else if (saved[PENDING] && Date.now() - saved[PENDING].at < TTL) pending = saved[PENDING];
    else if (saved[PENDING]) store.remove(PENDING);
    open = !!pending;
    mount();
    autofill();
    setInterval(watch, 1000);
  })();
})();
