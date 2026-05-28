if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

if ("caches" in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}

const subtitles = {
  home: "Accueil",
  booking: "Tables & événements",
  social: "Communauté",
  shop: "Collection",
  profile: "Compte",
  challenges: "Challenges",
};

const bookingsByDate = {
  wed: [
    { time: "16:00", label: "3 tables disponibles", info: "T2/T3/T4", tag: "Hors peak" },
    { time: "16:30", label: "3 tables disponibles", info: "T2/T3/T4", tag: "Hors peak" },
    { time: "17:00", label: "4 tables disponibles", info: "T1/T2/T3/T4", tag: "" },
    { time: "17:30", label: "4 tables disponibles", info: "T1/T2/T3/T4", tag: "" },
    { time: "18:30", label: "2 tables disponibles", info: "Happy Hours à côté", tag: "Peak" },
  ],
  thu: [
    { time: "12:00", label: "1 table coach disponible", info: "Coach service court • Table 2", tag: "Coach" },
    { time: "18:00", label: "4 tables disponibles", info: "T1/T2/T3/T4", tag: "" },
    { time: "19:30", label: "2 tables doubles", info: "2 vs 2 recommandé", tag: "Team" },
  ],
  fri: [
    { time: "17:30", label: "2 tables disponibles", info: "T2/T4", tag: "Peak" },
    { time: "20:00", label: "3 tables ladder", info: "Matchs classés PPR", tag: "Ranked" },
  ],
  sat: [
    { time: "10:00", label: "4 tables ouvertes", info: "Open training matin", tag: "Hors peak" },
    { time: "15:00", label: "2 tables famille", info: "Créneau calme", tag: "" },
    { time: "18:00", label: "1 table challenge", info: "Défi local legend", tag: "Legend" },
  ],
};

const bookingEventsByDate = {
  wed: [
    { time: "18:30 - 20:30", label: "Happy Hours", info: "8 places restantes • Paris ladder night", tag: "Event" },
    { time: "19:00", label: "Tournante 2 vs 2", info: "12 inscrits • niveaux mixtes", tag: "Team" },
    { time: "20:00", label: "Coach block service court", info: "6 places • focus remise et 3e balle", tag: "Coach" },
  ],
  thu: [
    { time: "18:00 - 19:30", label: "Training service court", info: "Coach Maya • 5 places restantes", tag: "Coach" },
    { time: "20:00 - 22:00", label: "Double du jeudi", info: "Format 2 vs 2 • 10 inscrits", tag: "Team" },
  ],
  fri: [
    { time: "18:30 - 21:30", label: "Friday ranked ladder", info: "Matchs PPR vérifiés • 16 places", tag: "Ranked" },
    { time: "21:30", label: "Replay vite", info: "Clip du meilleur échange au club", tag: "Replay" },
  ],
  sat: [
    { time: "10:30 - 12:00", label: "Kids Ping Pang", info: "Initiation famille • 8 places", tag: "Kids" },
    { time: "15:00 - 17:00", label: "Open challenge", info: "Défis local legends • entrée libre", tag: "Legend" },
  ],
};

const players = [
  { name: "Lila Martin", level: "1420 pts", style: "Bloqueuse agressive", match: "94%", city: "Paris 13", status: "Dispo 18:30" },
  { name: "Noa Simon", level: "1362 pts", style: "Défenseur moderne", match: "88%", city: "Paris 11", status: "Cherche double" },
  { name: "Sami Diallo", level: "1297 pts", style: "Service variation", match: "82%", city: "Paris 14", status: "Dispo demain" },
  { name: "Alice Bernard", level: "1510 pts", style: "Topspin vitesse", match: "79%", city: "Paris 5", status: "Challenge perso" },
];

const leaderboard = [
  { name: "Emma", points: "1842 PPR", rank: 1 },
  { name: "Lila", points: "1788 PPR", rank: 2 },
  { name: "Noa", points: "1818 PPR", rank: 3 },
  { name: "Sami", points: "1697 PPR", rank: 4 },
];

const ME = "Emma Lehmann";
const chat = {
  threads: [],
  activeThread: null,
  view: "list", // "list" | "chat"
  tab: "threads", // "threads" | "requests"
};

const autoReplyPool = [
  "Ok pour moi !",
  "Je check mon agenda et te dis ça.",
  "On se cale à quelle heure ?",
  "Top, j'arrive avec ma raquette.",
  "Carrément, ça va être propre.",
  "Faut que je trouve une table dispo, je te tiens au courant.",
];

const products = [
  {
    name: "T-shirt IDENTITÉ | Raquette broderie",
    price: 55,
    category: "essential",
    img: "https://pingpang.paris/cdn/shop/products/Identite_Noir_Packshot_PPP3_1024x.jpg?v=1605806804",
  },
  {
    name: "T-shirt I JUSTESSE",
    price: 50,
    category: "essential",
    img: "https://pingpang.paris/cdn/shop/products/Justesse_Noir_Packshot_PPP3_1024x.jpg?v=1734626223",
  },
  {
    name: "Hoodie | AUDACE",
    price: 90,
    category: "essential",
    img: "https://pingpang.paris/cdn/shop/products/IMG_7706_1024x.jpg?v=1605276900",
  },
  {
    name: "T-shirt I INSPIRATION",
    price: 50,
    category: "essential",
    img: "https://pingpang.paris/cdn/shop/products/PingPang220018_1024x.jpg?v=1699385490",
  },
  {
    name: "T-shirt ICONS | JAPAN",
    price: 39,
    category: "icons",
    img: "https://pingpang.paris/cdn/shop/files/Japan_Tshirt_F-1-_-10_1024x.jpg?v=1721345186",
  },
  {
    name: "T-shirt ICONS | FRANCE",
    price: 39,
    category: "icons",
    img: "https://pingpang.paris/cdn/shop/files/FranceTshirtF-1-_-16_1024x.jpg?v=1721376980",
  },
  {
    name: "Polo I ANMTT x PLAY BETTER",
    price: 59,
    category: "effect",
    img: "https://pingpang.paris/cdn/shop/files/AMNTTxPPP-1.1_1024x.jpg?v=1737034305",
  },
  {
    name: "T-shirt I Ping Pang Effect",
    price: 50,
    category: "effect",
    img: "https://pingpang.paris/cdn/shop/files/PPE-1_1024x.jpg?v=1734567406",
  },
  {
    name: "Impulse Tee-Shirt PP.01",
    price: 69,
    category: "effect",
    img: "assets/shop/performance-men.png",
  },
  {
    name: "Fiber Short PP.01",
    price: 79,
    category: "effect",
    img: "assets/shop/performance-shorts.png",
  },
  {
    name: "Spark Polo Crop PP.01",
    price: 69,
    category: "effect",
    img: "assets/shop/performance-women.png",
  },
  {
    name: "Flow Skirt PP.01",
    price: 79,
    category: "effect",
    img: "assets/shop/performance-women.png",
  },
  {
    name: "Kids T-shirt I Choose Your Weapon",
    price: 35,
    category: "icons",
    img: "https://pingpang.paris/cdn/shop/files/CYW-5_e7cd65c1-888b-4c72-90de-cf2aaae354d1_1024x.jpg?v=1734627615",
  },
];

const cart = [];
const API_BASE_URL = window.PINGPANG_API_URL || "http://127.0.0.1:4000";

const registrySignals = [
  { label: "Rating", value: "1842 PPR", detail: "Glicko-2 prêt côté API" },
  { label: "Pending", value: "2 matchs", detail: "confirmation adversaire" },
  { label: "Tables", value: "3 spots", detail: "clubs et local legends" },
  { label: "Gear", value: "183/200 h", detail: "raquette à scanner" },
];

const tableSpots = [
  {
    name: "Table 04",
    area: "Canal Saint-Martin",
    address: "Quai de Valmy, Paris",
    legend: "Noah",
    visits: 14,
    format: "Outdoor concrete",
    crowd: "Busy after 18:30",
    lat: 48.8758,
    lng: 2.3669,
  },
  {
    name: "Spin Lab",
    area: "Belleville Club",
    address: "Rue de Belleville, Paris",
    legend: "Maya",
    visits: 11,
    format: "Indoor club tables",
    crowd: "Ranked ladder tonight",
    lat: 48.8717,
    lng: 2.3812,
  },
  {
    name: "Riverside Pair",
    area: "Bassin de la Villette",
    address: "Bassin de la Villette, Paris",
    legend: "Ari",
    visits: 8,
    format: "Two public tables",
    crowd: "Open challenge queue",
    lat: 48.8859,
    lng: 2.3754,
  },
];

const opponentNotes = [
  { opponent: "Lila Martin", feeling: "Confident", note: "Bloque court, attaquer ligne après service coupé." },
  { opponent: "Noa Simon", feeling: "Nervous", note: "Défenseur spin heavy, rester patient sur 3e balle." },
];

const gearSignals = [
  { label: "Racket hours", value: "183 / 200", tone: "amber" },
  { label: "Rubber wear", value: "Medium", tone: "green" },
  { label: "Next scan", value: "After session", tone: "coral" },
];

const pendingMatches = [
  { player: "Maya Chen", result: "11-8, 9-11, 11-6, 11-7", delta: "+18 PPR" },
  { player: "Noa Simon", result: "2 vs 2 jeudi", delta: "pending" },
];

const activityFeed = [
  { player: "Maya Chen", event: "a gagné un ranked best-of-five", detail: "11-8, 9-11, 11-6, 11-7 au Belleville Spin Lab", signal: "+18 PPR" },
  { player: "Noah Klein", event: "a défendu son titre local legend", detail: "14 check-ins ce mois-ci sur Table 04", signal: "Legend" },
  { player: "Ari Benali", event: "a terminé un bloc coach", detail: "42 min avec focus remise revers", signal: "9 jours" },
];

const drills = [
  { id: "warmup", title: "Warmup rallies", meta: "6 min rythme" },
  { id: "serve", title: "Short serve reads", meta: "10 remises" },
  { id: "backhand", title: "Backhand open-up", meta: "5 chaînes croisées" },
  { id: "ranked", title: "Ranked game to 11", meta: "Score à vérifier" },
];

const rivalRatings = [
  { name: "I. Navarro", rating: 2194, tag: "World class" },
  { name: "Maya Chen", rating: 2148, tag: "Attack first" },
  { name: "You", rating: 1842, tag: "12 ranked matches", highlight: true },
  { name: "Noah Klein", rating: 1818, tag: "Spin heavy" },
  { name: "S. Ito", rating: 2112, tag: "Control wall" },
].sort((a, b) => b.rating - a.rating);

const badges = ["Local Legend", "Serve Reader", "12 Day Streak", "Tournament Host"];
const integrations = ["Garmin", "Apple Health", "Strava import"];
const state = {
  selectedSpot: tableSpots[0].name,
  bookingMode: "tables",
  bookingDate: "wed",
  reservations: [],
  score: { you: 0, them: 0 },
  completedDrills: {},
  rubberScanned: false,
  performance: {
    title: "Topspin coup droit",
    speed: 84,
    hits: 540,
    angle: 38,
    endurance: 78,
    duration: 42,
    note: "",
  },
};

const playerDirectory = {
  "Emma Lehmann": { name: "Emma Lehmann", level: "1842 PPR", style: "Attaquante rotation", city: "Paris", status: "Toi", match: "—", bio: "Attaquante rotation • 12 matchs ranked • streak 18 jours." },
  "Lila Martin": { name: "Lila Martin", level: "1420 pts", style: "Bloqueuse agressive", city: "Paris 13", status: "Dispo 18:30", match: "94%", bio: "Bloque court, attaque sur ligne après service coupé." },
  "Noa Simon": { name: "Noa Simon", level: "1362 pts", style: "Défenseur moderne", city: "Paris 11", status: "Cherche double", match: "88%", bio: "Défenseur spin heavy, patient sur 3e balle." },
  "Sami Diallo": { name: "Sami Diallo", level: "1297 pts", style: "Service variation", city: "Paris 14", status: "Dispo demain", match: "82%", bio: "Mise en jeu surprenante, transitions courtes." },
  "Alice Bernard": { name: "Alice Bernard", level: "1510 pts", style: "Topspin vitesse", city: "Paris 5", status: "Challenge perso", match: "79%", bio: "Topspin coup droit explosif, fragile en revers." },
  "Emma": { name: "Emma Lehmann", level: "1842 PPR", style: "Attaquante rotation", city: "Paris", status: "Toi", match: "—", bio: "Attaquante rotation • 12 matchs ranked • streak 18 jours." },
  "Lila": { name: "Lila Martin", level: "1788 PPR", style: "Bloqueuse agressive", city: "Paris 13", status: "Dispo 18:30", match: "94%", bio: "Bloque court, attaque sur ligne après service coupé." },
  "Noa": { name: "Noa Simon", level: "1818 PPR", style: "Défenseur moderne", city: "Paris 11", status: "Cherche double", match: "88%", bio: "Défenseur spin heavy, patient sur 3e balle." },
  "Sami": { name: "Sami Diallo", level: "1697 PPR", style: "Service variation", city: "Paris 14", status: "Dispo demain", match: "82%", bio: "Mise en jeu surprenante, transitions courtes." },
  "Maya Chen": { name: "Maya Chen", level: "2148 PPR", style: "Attack first", city: "Belleville", status: "Ranked +18", match: "—", bio: "Attaque dès la première balle, lecture service rapide." },
  "Noah Klein": { name: "Noah Klein", level: "1818 PPR", style: "Spin heavy", city: "Canal Saint-Martin", status: "Local legend", match: "76%", bio: "14 check-ins ce mois sur Table 04. Spin lourd côté revers." },
  "Ari Benali": { name: "Ari Benali", level: "1632 PPR", style: "Coach block", city: "Paris 19", status: "9 jours streak", match: "—", bio: "Coach block axé revers, 42 min sessions structurées." },
  "I. Navarro": { name: "I. Navarro", level: "2194 PPR", style: "World class", city: "Madrid", status: "Pro", match: "—", bio: "Niveau mondial, contrôle balle au millimètre." },
  "S. Ito": { name: "S. Ito", level: "2112 PPR", style: "Control wall", city: "Tokyo", status: "Pro", match: "—", bio: "Mur de contrôle, jeu à 0 erreur." },
  "You": { name: "Emma Lehmann (toi)", level: "1842 PPR", style: "12 matchs ranked", city: "Paris", status: "C'est toi", match: "—", bio: "Profil personnel — édite tes infos depuis l'onglet Profil." },
};

function getPlayerProfile(key) {
  if (!key) return null;
  if (playerDirectory[key]) return playerDirectory[key];
  const found = Object.values(playerDirectory).find((p) => p.name === key);
  return found || { name: key, level: "—", style: "Profil non renseigné", city: "—", status: "—", match: "—", bio: "Aucune donnée disponible pour ce joueur." };
}

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

const viewOrder = ["home", "booking", "social", "shop", "profile", "challenges"];
let currentView = "home";

function setView(viewId) {
  const oldIdx = viewOrder.indexOf(currentView);
  const newIdx = viewOrder.indexOf(viewId);
  const direction = newIdx === -1 || oldIdx === -1 || newIdx === oldIdx
    ? "forward"
    : newIdx > oldIdx
    ? "forward"
    : "backward";
  currentView = viewId;

  qsa(".screen").forEach((screen) => {
    const active = screen.id === viewId;
    screen.classList.toggle("is-active", active);
    screen.classList.remove("dir-forward", "dir-backward");
    if (active) screen.classList.add(`dir-${direction}`);
  });
  qsa("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === viewId));
  qs("#viewSubtitle").textContent = subtitles[viewId] || "Ping Pang";
  qsa(`[data-view="${viewId}"]`).forEach((button) => button.classList.remove("has-dot"));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (viewId === "booking") {
    // Defer until the screen transition finishes and the container has its real size
    setTimeout(ensureMapReady, 0);
    setTimeout(ensureMapReady, 220);
    setTimeout(ensureMapReady, 500);
  }
}

function showSuccess(text) {
  const toast = qs("#successToast");
  toast.textContent = text;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function renderBookings() {
  const data = state.bookingMode === "tables" ? bookingsByDate : bookingEventsByDate;
  const items = data[state.bookingDate] || [];
  qs("#bookingList").innerHTML = items
    .map(
      (slot, index) => {
        const id = `${state.bookingMode}-${slot.time}`;
        const reserved = state.reservations.some((reservation) => reservation.id === id);
        return `
        <article class="booking-row ${reserved ? "is-reserved" : ""}">
          <strong>${slot.time}</strong>
          <div>
            ${slot.tag ? `<em>${slot.tag}</em>` : ""}
            <p>${slot.label}</p>
            <span>${slot.info}</span>
          </div>
          <button
            class="${reserved ? "is-reserved" : ""}"
            type="button"
            aria-label="Réserver ${slot.label}"
            data-booking-id="${id}"
            data-booking-kind="${state.bookingMode}"
            data-booking-title="${slot.label}"
            data-booking-meta="${slot.time} • ${slot.info}"
          ></button>
        </article>
      `;
      },
    )
    .join("");
}

function renderReservations() {
  qs("#reservationCount").textContent = String(state.reservations.length);
  qs("#myReservations").innerHTML = state.reservations.length
    ? state.reservations
        .map(
          (reservation) => `
            <article class="reservation-row">
              <div>
                <strong>${reservation.title}</strong>
                <p>${reservation.meta}</p>
              </div>
              <button type="button" data-cancel-reservation="${reservation.id}">Annuler</button>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-reservation">Aucune réservation pour le moment.</p>`;
}

function renderPlayers() {
  qs("#playerList").innerHTML = players
    .map(
      (player) => `
        <article class="player-row is-clickable" data-player="${player.name}">
          <div class="avatar small">${player.name.split(" ").map((part) => part[0]).join("")}</div>
          <div>
            <strong>${player.name}</strong>
            <p>${player.style} • ${player.level}</p>
            <span>${player.city} • ${player.status}</span>
          </div>
          <button type="button" data-challenge-player="${player.name}">${player.match}</button>
        </article>
      `,
    )
    .join("");
}

function renderLeaderboard() {
  qs("#leaderboard").innerHTML = leaderboard
    .map(
      (player) => `
        <article class="leader-row is-clickable" data-player="${player.name}">
          <span>${player.rank}</span>
          <strong>${player.name}</strong>
          <em>${player.points}</em>
        </article>
      `,
    )
    .join("");
}

function findThread(peer) {
  return chat.threads.find((t) => t.peer === peer) || null;
}

function formatTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60000) return "à l'instant";
  if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `il y a ${Math.floor(diff / 3600000)} h`;
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function updateMessageBadge() {
  const requests = chat.threads.filter((t) => t.status === "pending-in").length;
  const unread = chat.threads.filter((t) => t.status === "accepted").reduce((sum, t) => sum + (t.unread || 0), 0);
  const total = requests + unread;
  const badge = qs("#openMessages em");
  badge.textContent = total;
  qs("#openMessages").classList.toggle("has-dot", total > 0);
}

function renderThreadList() {
  const accepted = chat.threads.filter((t) => t.status === "accepted");
  const requests = chat.threads.filter((t) => t.status === "pending-in");
  qs("#threadsCount").textContent = accepted.length;
  qs("#requestsCount").textContent = requests.length;

  const acceptedList = qs("#threadList");
  acceptedList.innerHTML = accepted.length
    ? accepted
        .map((t) => {
          const last = t.messages[t.messages.length - 1];
          const preview = last ? (last.author === ME ? "Toi : " : "") + last.text : "Nouvelle discussion";
          return `
            <button class="thread-row" type="button" data-open-thread="${t.peer}">
              <span class="avatar">${initials(t.peer)}</span>
              <div>
                <strong>${t.peer}</strong>
                <p>${preview}</p>
              </div>
              <div class="thread-meta">
                <span>${last ? formatTime(last.time) : ""}</span>
                ${t.unread ? `<span class="unread-pill">${t.unread}</span>` : ""}
              </div>
            </button>
          `;
        })
        .join("")
    : `<p class="empty-state">Aucune discussion. Va sur un profil et clique sur Message.</p>`;

  const requestsList = qs("#requestList");
  requestsList.innerHTML = requests.length
    ? requests
        .map((t) => {
          const last = t.messages[t.messages.length - 1];
          return `
            <div>
              <button class="thread-row" type="button" data-open-thread="${t.peer}">
                <span class="avatar">${initials(t.peer)}</span>
                <div>
                  <strong>${t.peer}</strong>
                  <p>${last ? last.text : "T'a envoyé une demande."}</p>
                </div>
                <div class="thread-meta">
                  <span>${last ? formatTime(last.time) : ""}</span>
                </div>
              </button>
              <div class="request-actions">
                <button class="accept" type="button" data-accept-request="${t.peer}">Accepter</button>
                <button class="decline" type="button" data-decline-request="${t.peer}">Refuser</button>
              </div>
            </div>
          `;
        })
        .join("")
    : `<p class="empty-state">Aucune demande en attente.</p>`;

  updateMessageBadge();
}

function setDrawerTab(tab) {
  chat.tab = tab;
  qsa(".thread-tabs button").forEach((b) => b.classList.toggle("is-active", b.dataset.threadTab === tab));
  qs("#threadList").hidden = tab !== "threads";
  qs("#requestList").hidden = tab !== "requests";
}

function setDrawerView(view) {
  chat.view = view;
  qs("#threadsView").hidden = view !== "list";
  qs("#chatView").hidden = view !== "chat";
  qs("#backToThreads").hidden = view !== "chat";
  if (view === "list") {
    qs("#drawerTitle").textContent = "Messages";
    chat.activeThread = null;
  }
}

function renderChat() {
  const thread = findThread(chat.activeThread);
  if (!thread) {
    setDrawerView("list");
    return;
  }
  qs("#drawerTitle").textContent = thread.peer;
  const banner = qs("#chatBanner");
  if (thread.status === "pending-out") {
    banner.hidden = false;
    banner.textContent = "Demande envoyée. En attente d'acceptation…";
    qs("#chatInput").disabled = true;
  } else {
    banner.hidden = true;
    qs("#chatInput").disabled = false;
  }
  const list = qs("#chatMessages");
  list.innerHTML = thread.messages.length
    ? thread.messages
        .map(
          (m) => `
            <div class="chat-bubble ${m.author === ME ? "mine" : ""}">
              ${m.text}
              <em>${formatTime(m.time)}</em>
            </div>
          `,
        )
        .join("")
    : `<p class="empty-state">Pas encore de messages.</p>`;
  list.scrollTop = list.scrollHeight;
}

function openThread(peer) {
  const thread = findThread(peer);
  if (!thread) return;
  if (thread.status === "pending-in") {
    setDrawerTab("requests");
    chat.activeThread = peer;
    setDrawerView("chat");
    renderChat();
    return;
  }
  thread.unread = 0;
  chat.activeThread = peer;
  setDrawerView("chat");
  renderChat();
  renderThreadList();
}

function openMessageDrawer() {
  qs("#messageDrawer").classList.add("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "false");
  setDrawerView("list");
  setDrawerTab(chat.tab);
  renderThreadList();
}

function acceptRequest(peer) {
  const thread = findThread(peer);
  if (!thread) return;
  thread.status = "accepted";
  thread.unread = 0;
  thread.messages.push({ author: peer, text: "Merci d'avoir accepté, on peut chater 💬", time: Date.now() });
  setDrawerTab("threads");
  renderThreadList();
  showSuccess(`${peer} ajouté à tes discussions.`);
}

function declineRequest(peer) {
  chat.threads = chat.threads.filter((t) => t.peer !== peer);
  renderThreadList();
  showSuccess(`Demande de ${peer} refusée.`);
}

function appendBubble(message) {
  const list = qs("#chatMessages");
  const empty = list.querySelector(".empty-state");
  if (empty) empty.remove();
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${message.author === ME ? "mine" : ""}`;
  bubble.innerHTML = `${message.text}<em>${formatTime(message.time)}</em>`;
  list.appendChild(bubble);
  list.scrollTop = list.scrollHeight;
}

function removeTypingIndicator() {
  const t = document.getElementById("typingIndicator");
  if (t) t.remove();
}

function sendChatMessage(text) {
  const thread = findThread(chat.activeThread);
  if (!thread || thread.status !== "accepted" || !text) return;
  const msg = { author: ME, text, time: Date.now() };
  thread.messages.push(msg);
  appendBubble(msg);
  renderThreadList();
  const reply = autoReplyPool[Math.floor(Math.random() * autoReplyPool.length)];
  setTimeout(() => {
    if (chat.activeThread !== thread.peer) return;
    const list = qs("#chatMessages");
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.id = "typingIndicator";
    typing.textContent = `${thread.peer} écrit…`;
    list.appendChild(typing);
    list.scrollTop = list.scrollHeight;
  }, 400);
  setTimeout(() => {
    const replyMsg = { author: thread.peer, text: reply, time: Date.now() };
    thread.messages.push(replyMsg);
    if (chat.activeThread !== thread.peer) {
      thread.unread = (thread.unread || 0) + 1;
    } else {
      removeTypingIndicator();
      appendBubble(replyMsg);
    }
    renderThreadList();
  }, 1600);
}

function sendMessageRequest(peer) {
  let thread = findThread(peer);
  if (thread && thread.status === "accepted") {
    openMessageDrawer();
    openThread(peer);
    return;
  }
  if (thread && thread.status === "pending-out") {
    showSuccess(`Demande déjà envoyée à ${peer}.`);
    openMessageDrawer();
    openThread(peer);
    return;
  }
  if (thread && thread.status === "pending-in") {
    showSuccess(`${peer} t'a déjà envoyé une demande — accepte-la.`);
    openMessageDrawer();
    setDrawerTab("requests");
    return;
  }
  thread = {
    peer,
    status: "pending-out",
    unread: 0,
    messages: [],
  };
  chat.threads.push(thread);
  renderThreadList();
  showSuccess(`Demande envoyée à ${peer}.`);
  openMessageDrawer();
  openThread(peer);
  setTimeout(() => {
    const t = findThread(peer);
    if (!t || t.status !== "pending-out") return;
    t.status = "accepted";
    const welcome = { author: peer, text: `Salut Emma ! Demande acceptée, on chate quand tu veux.`, time: Date.now() };
    t.messages.push(welcome);
    if (chat.view === "chat" && chat.activeThread === peer) {
      qs("#chatBanner").hidden = true;
      qs("#chatInput").disabled = false;
      appendBubble(welcome);
    } else {
      t.unread = (t.unread || 0) + 1;
    }
    renderThreadList();
    showSuccess(`${peer} a accepté ta demande.`);
  }, 2200);
}

async function renderApiStatus() {
  const apiStatus = qs("#apiStatus");
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!response.ok) throw new Error("API unavailable");
    apiStatus.textContent = "API connected";
    apiStatus.classList.add("is-online");
  } catch {
    apiStatus.textContent = "Local preview";
    apiStatus.classList.remove("is-online");
  }
}

function renderRegistry() {
  qs("#registryGrid").innerHTML = registrySignals
    .map(
      (signal) => `
        <article>
          <span>${signal.label}</span>
          <strong>${signal.value}</strong>
          <p>${signal.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderTables() {
  qs("#tableNetwork").innerHTML = tableSpots
    .map(
      (spot) => `
        <article class="table-spot">
          <div>
            <strong>${spot.name}</strong>
            <p>${spot.area} • ${spot.crowd}</p>
          </div>
          <span>${spot.legend} · ${spot.visits}</span>
        </article>
      `,
    )
    .join("");
}

let leafletMap = null;
const leafletMarkers = new Map();

function initLeaflet() {
  if (leafletMap || typeof L === "undefined") return;
  const container = qs("#realMap");
  if (!container) return;
  // Wait for the container to have non-zero size (booking screen may be hidden)
  const rect = container.getBoundingClientRect();
  if (rect.width < 50 || rect.height < 50) return;
  container.innerHTML = "";
  // Center on the cluster of spots
  const center = tableSpots.reduce(
    (acc, s) => [acc[0] + s.lat / tableSpots.length, acc[1] + s.lng / tableSpots.length],
    [0, 0],
  );
  leafletMap = L.map(container, {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
    preferCanvas: false,
  }).setView(center, 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(leafletMap);

  tableSpots.forEach((spot) => {
    const marker = L.marker([spot.lat, spot.lng], {
      icon: buildSpotIcon(spot.name === state.selectedSpot),
      title: spot.name,
    }).addTo(leafletMap);
    marker.on("click", () => {
      state.selectedSpot = spot.name;
      renderMap();
    });
    leafletMarkers.set(spot.name, marker);
  });

  // Watch container resizes (when booking screen toggles visible)
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      if (leafletMap) leafletMap.invalidateSize();
    });
    ro.observe(container);
  }
  // Triple-tap invalidate for safety
  requestAnimationFrame(() => {
    requestAnimationFrame(() => leafletMap && leafletMap.invalidateSize());
  });
}

function ensureMapReady() {
  if (!leafletMap) initLeaflet();
  if (leafletMap) {
    leafletMap.invalidateSize();
  }
}

function buildSpotIcon(active) {
  return L.divIcon({
    className: "leaflet-spot",
    html: `<span class="map-pin ${active ? "is-active" : ""}" aria-hidden="true">${active ? "P" : "T"}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function renderMap() {
  const selectedSpot = tableSpots.find((spot) => spot.name === state.selectedSpot) || tableSpots[0];
  if (typeof L !== "undefined" && !leafletMap) initLeaflet();
  if (leafletMap) {
    leafletMarkers.forEach((marker, name) => {
      marker.setIcon(buildSpotIcon(name === selectedSpot.name));
    });
    leafletMap.panTo([selectedSpot.lat, selectedSpot.lng], { animate: true, duration: 0.6 });
  }
  qs("#selectedSpot").innerHTML = `
    <div>
      <p class="eyebrow">Selected table</p>
      <h2>${selectedSpot.name}</h2>
      <p>${selectedSpot.address}</p>
    </div>
    <div class="spot-grid">
      <span><strong>${selectedSpot.visits}</strong> visits</span>
      <span><strong>${selectedSpot.legend}</strong> local legend</span>
      <span><strong>${selectedSpot.format}</strong> format</span>
    </div>
    <button class="primary-action" type="button" data-success="Check-in ajouté sur ${selectedSpot.name}.">Check in</button>
  `;
}

function renderActivityFeed() {
  qs("#activityFeed").innerHTML = activityFeed
    .map(
      (item) => `
        <article class="feed-row is-clickable" data-player="${item.player}">
          <span>${item.player.slice(0, 1)}</span>
          <div>
            <strong>${item.player}</strong> ${item.event}
            <p>${item.detail}</p>
          </div>
          <em>${item.signal}</em>
        </article>
      `,
    )
    .join("");
}

function renderOpponentNotes() {
  qs("#opponentNotes").innerHTML = opponentNotes
    .map(
      (note) => `
        <article class="note-row">
          <strong>${note.opponent}</strong>
          <span>${note.feeling}</span>
          <p>${note.note}</p>
        </article>
      `,
    )
    .join("");
}

function renderGear() {
  qs("#gearSignals").innerHTML = gearSignals
    .map(
      (gear) => `
        <article class="gear-signal ${gear.tone}">
          <span>${gear.label}</span>
          <strong>${gear.value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderPendingMatches() {
  qs("#pendingMatches").innerHTML = pendingMatches
    .map(
      (match) => `
        <article class="pending-row">
          <div>
            <strong>${match.player}</strong>
            <p>${match.result}</p>
          </div>
          <button type="button" data-success="Résultat confirmé pour ${match.player}.">${match.delta}</button>
        </article>
      `,
    )
    .join("");
}

function renderScore() {
  qs("#scoreBoard").innerHTML = `
    <article>
      <span>Toi</span>
      <strong>${state.score.you}</strong>
      <p>Emma</p>
    </article>
    <article>
      <span>Rival</span>
      <strong>${state.score.them}</strong>
      <p>${players[0].name}</p>
    </article>
  `;
}

function renderDrills() {
  qs("#drillCount").textContent = `${Object.keys(state.completedDrills).length}/4`;
  qs("#drillList").innerHTML = drills
    .map((drill, index) => {
      const done = Boolean(state.completedDrills[drill.id]);
      return `
        <button class="drill-row ${done ? "is-done" : ""}" type="button" data-drill="${drill.id}" aria-pressed="${done}" style="order:${done ? 1 : 0}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${drill.title}</strong>
            <p>${drill.meta}</p>
          </div>
          <span class="drill-check" aria-hidden="true"></span>
        </button>
      `;
    })
    .join("");
}

function toggleDrill(id) {
  const list = qs("#drillList");
  const rows = [...list.querySelectorAll("[data-drill]")];

  // FLIP - capture old positions
  const oldTops = new Map();
  rows.forEach((el) => oldTops.set(el.dataset.drill, el.getBoundingClientRect().top));

  // Toggle state
  if (state.completedDrills[id]) {
    delete state.completedDrills[id];
  } else {
    state.completedDrills[id] = true;
  }

  // Update classes + order
  rows.forEach((el) => {
    const done = Boolean(state.completedDrills[el.dataset.drill]);
    el.classList.toggle("is-done", done);
    el.style.order = done ? "1" : "0";
    el.setAttribute("aria-pressed", done);
  });
  qs("#drillCount").textContent = `${Object.keys(state.completedDrills).length}/4`;

  // FLIP - animate from old to new position via Web Animations API
  // (bypasses any CSS animation-fill-mode conflicts)
  rows.forEach((el) => {
    const newTop = el.getBoundingClientRect().top;
    const oldTop = oldTops.get(el.dataset.drill);
    const diff = oldTop - newTop;
    if (!diff) return;
    const isMover = el.dataset.drill === id;
    if (isMover) {
      el.style.zIndex = "20";
      el.style.position = "relative";
      el.style.boxShadow = "0 22px 44px rgba(12, 27, 22, 0.22)";
    }
    const fromTransform = `translateY(${diff}px)${isMover ? " scale(1.04)" : ""}`;
    const toTransform = "translateY(0) scale(1)";
    const anim = el.animate(
      [
        { transform: fromTransform, offset: 0 },
        ...(isMover ? [{ transform: `translateY(${diff * 0.2}px) scale(1.05)`, offset: 0.35 }] : []),
        { transform: toTransform, offset: 1 },
      ],
      {
        duration: isMover ? 720 : 520,
        easing: "cubic-bezier(0.34, 1.4, 0.4, 1)",
        fill: "none",
      },
    );
    if (isMover) {
      anim.onfinish = () => {
        el.style.boxShadow = "";
        el.style.zIndex = "";
        el.style.position = "";
      };
    }
  });
}

function renderRanking() {
  qs("#rankingTable").innerHTML = rivalRatings
    .map(
      (player, index) => `
        <article class="rank-row is-clickable ${player.highlight ? "is-you" : ""}" data-player="${player.name}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${player.name}</strong>
            <p>${player.tag}</p>
          </div>
          <em>${player.rating}</em>
        </article>
      `,
    )
    .join("");
}

function renderBadges() {
  qs("#badgeGrid").innerHTML = badges
    .map((badge) => `<article><span>*</span><strong>${badge}</strong></article>`)
    .join("");
}

function renderIntegrations() {
  qs("#integrationGrid").innerHTML = integrations
    .map((name) => `<article><span>${name.slice(0, 1)}</span><strong>${name}</strong></article>`)
    .join("");
}

function renderRubberScan() {
  qs("#rubberTitle").textContent = state.rubberScanned ? "Grip cohérent, scan sauvegardé" : "Photo après entraînement";
  qs("#rubberText").textContent = state.rubberScanned
    ? "Usure moyenne détectée. Le rappel de remplacement reste dans 17 heures de jeu."
    : "Compare brillance, bords abîmés et perte de grip avec tes anciennes séances.";
  qs("#scanRubber").textContent = state.rubberScanned ? "Scan sauvegardé" : "Scanner le revêtement";
}

function formatPrice(price) {
  return `€${price.toFixed(2).replace(".", ",")}`;
}

function renderShop(filter = "all") {
  const visibleProducts = filter === "all" ? products : products.filter((product) => product.category === filter);
  qs("#shopGrid").innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="shop-card">
          <div class="shop-image">
            <img src="${product.img}" alt="${product.name}" loading="lazy" onerror="this.parentElement.classList.add('image-fallback'); this.remove();" />
          </div>
          <div class="shop-info">
            <p class="eyebrow">${product.category}</p>
            <h2>${product.name}</h2>
            <strong>${formatPrice(product.price)}</strong>
            <button class="primary-action" type="button" data-add-cart="${product.name}">Ajouter</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCart() {
  qs("#cartCount").textContent = cart.length;
  qs("#cartTotal").textContent = formatPrice(cart.reduce((sum, product) => sum + product.price, 0));
  qs("#cartList").innerHTML = cart.length
    ? cart
        .map(
          (product, index) => `
            <article class="cart-row" data-cart-index="${index}">
              <img src="${product.img}" alt="" />
              <div>
                <strong>${product.name}</strong>
                <span>${formatPrice(product.price)}</span>
              </div>
              <button type="button" class="cart-remove" data-remove-cart="${index}" aria-label="Retirer ${product.name}">×</button>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-cart">Ton panier est vide.</p>`;
}

function removeFromCart(index) {
  const row = qs(`.cart-row[data-cart-index="${index}"]`);
  const product = cart[index];
  if (!row || !product) return;
  // Animate out via Web Animations API
  row.animate(
    [
      { opacity: 1, transform: "translateX(0)", maxHeight: row.offsetHeight + "px" },
      { opacity: 0, transform: "translateX(40px)", maxHeight: "0px", marginTop: "0px", marginBottom: "0px", paddingTop: "0px", paddingBottom: "0px" },
    ],
    { duration: 320, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
  ).onfinish = () => {
    cart.splice(index, 1);
    renderCart();
    showSuccess(`${product.name} retiré du panier.`);
    if (!cart.length) qs("#openCart").classList.remove("has-dot");
  };
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function openPlayerProfile(key) {
  const profile = getPlayerProfile(key);
  if (!profile) return;
  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  qs("#playerModalContent").innerHTML = `
    <div class="player-profile-card">
      <div class="player-profile-head">
        <div class="avatar">${initials}</div>
        <div>
          <h2 id="playerModalName">${profile.name}</h2>
          <p>${profile.style} • ${profile.level}</p>
        </div>
      </div>
      <div class="player-profile-stats">
        <article><span>Niveau</span><strong>${profile.level}</strong></article>
        <article><span>Match</span><strong>${profile.match}</strong></article>
        <article><span>Ville</span><strong>${profile.city}</strong></article>
      </div>
      <p class="player-profile-bio">${profile.bio}</p>
      <p class="player-profile-bio"><strong>Statut :</strong> ${profile.status}</p>
      <div class="player-profile-actions">
        <button type="button" class="ghost-action" data-message-player="${profile.name}">Message</button>
        <button type="button" class="primary-action" data-challenge-player="${profile.name}">Défier</button>
      </div>
    </div>
  `;
  openModal("playerModal");
}

function renderPerformance() {
  const p = state.performance;
  qs("#perfTitle").textContent = p.title;
  qs("#perfSpeed").textContent = `${p.speed} km/h`;
  qs("#perfHits").textContent = p.hits;
  qs("#perfAngle").textContent = `${p.angle}°`;
  qs("#perfEndurance").textContent = `${p.endurance}%`;
  qs("#perfDuration").textContent = `${p.duration} min`;
  const noteEl = qs("#perfNote");
  if (p.note) {
    noteEl.textContent = p.note;
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
  }
}

document.addEventListener("click", (event) => {
  const closeBtn = event.target.closest("[data-close-modal]");
  if (closeBtn) {
    closeModal(closeBtn.dataset.closeModal);
    return;
  }

  const challengeBtn = event.target.closest("[data-challenge-player]");
  if (challengeBtn) {
    event.stopPropagation();
    showSuccess(`Match demandé à ${challengeBtn.dataset.challengePlayer}.`);
    closeModal("playerModal");
    return;
  }

  const messageBtn = event.target.closest("[data-message-player]");
  if (messageBtn) {
    event.stopPropagation();
    const peer = messageBtn.dataset.messagePlayer;
    closeModal("playerModal");
    sendMessageRequest(peer);
    return;
  }

  const openThreadBtn = event.target.closest("[data-open-thread]");
  if (openThreadBtn) {
    openThread(openThreadBtn.dataset.openThread);
    return;
  }

  const acceptBtn = event.target.closest("[data-accept-request]");
  if (acceptBtn) {
    event.stopPropagation();
    acceptRequest(acceptBtn.dataset.acceptRequest);
    return;
  }

  const declineBtn = event.target.closest("[data-decline-request]");
  if (declineBtn) {
    event.stopPropagation();
    declineRequest(declineBtn.dataset.declineRequest);
    return;
  }

  const playerRow = event.target.closest("[data-player]");
  if (playerRow) {
    openPlayerProfile(playerRow.dataset.player);
    return;
  }

  const success = event.target.closest("[data-success]");
  if (success) showSuccess(success.dataset.success);

  const bookingButton = event.target.closest(".booking-row button");
  if (bookingButton) {
    const existing = state.reservations.find((reservation) => reservation.id === bookingButton.dataset.bookingId);
    if (existing) {
      // Un-reserve immediately (no confirmation for cancel)
      state.reservations = state.reservations.filter((reservation) => reservation.id !== bookingButton.dataset.bookingId);
      showSuccess(`${existing.title} retiré de tes réservations.`);
      renderBookings();
      renderReservations();
    } else {
      openBookingConfirm({
        id: bookingButton.dataset.bookingId,
        title: bookingButton.dataset.bookingTitle,
        meta: bookingButton.dataset.bookingMeta,
      });
    }
  }

  const featuredReservation = event.target.closest("[data-featured-reservation]");
  if (featuredReservation) {
    const exists = state.reservations.some((reservation) => reservation.id === featuredReservation.dataset.featuredReservation);
    if (exists) {
      showSuccess(`${featuredReservation.dataset.bookingTitle} est déjà dans tes réservations.`);
    } else {
      openBookingConfirm({
        id: featuredReservation.dataset.featuredReservation,
        title: featuredReservation.dataset.bookingTitle,
        meta: featuredReservation.dataset.bookingMeta,
      });
    }
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    setView(viewButton.dataset.view);
  }

  const mapSpot = event.target.closest("[data-map-spot]");
  if (mapSpot) {
    state.selectedSpot = mapSpot.dataset.mapSpot;
    renderMap();
    showSuccess(`${mapSpot.dataset.mapSpot} sélectionnée.`);
  }

  const scoreButton = event.target.closest("[data-score]");
  if (scoreButton) {
    state.score[scoreButton.dataset.score] += 1;
    renderScore();
    showSuccess(scoreButton.dataset.score === "you" ? "Point ajouté pour toi." : "Point ajouté au rival.");
  }

  if (event.target.closest("[data-reset-score]")) {
    state.score = { you: 0, them: 0 };
    renderScore();
    showSuccess("Score remis à zéro.");
  }

  const saveMatch = event.target.closest("[data-save-match]");
  if (saveMatch) {
    state.score = { you: 0, them: 0 };
    renderScore();
    showSuccess("Match enregistré. Le ranking sera mis à jour après confirmation.");
  }

  const drill = event.target.closest("[data-drill]");
  if (drill) {
    toggleDrill(drill.dataset.drill);
  }

  const addCart = event.target.closest("[data-add-cart]");
  if (addCart) {
    const product = products.find((item) => item.name === addCart.dataset.addCart);
    if (!product) return;
    cart.push(product);
    renderCart();
    qs("#openCart").classList.add("has-dot");
    showSuccess(`${product.name} ajouté au panier.`);
  }

  const removeCart = event.target.closest("[data-remove-cart]");
  if (removeCart) {
    event.stopPropagation();
    removeFromCart(Number(removeCart.dataset.removeCart));
  }

  const bookingTab = event.target.closest("[data-booking-tab]");
  if (bookingTab) {
    qsa(".tabs button").forEach((button) => button.classList.remove("is-active"));
    bookingTab.classList.add("is-active");
    state.bookingMode = bookingTab.dataset.bookingTab;
    renderBookings();
  }

  const cancelReservation = event.target.closest("[data-cancel-reservation]");
  if (cancelReservation) {
    const reservation = state.reservations.find((item) => item.id === cancelReservation.dataset.cancelReservation);
    state.reservations = state.reservations.filter((item) => item.id !== cancelReservation.dataset.cancelReservation);
    renderBookings();
    renderReservations();
    showSuccess(`${reservation?.title || "Réservation"} annulé.`);
  }

  const dateButton = event.target.closest(".date-row button");
  if (dateButton) {
    qsa(".date-row button").forEach((button) => button.classList.remove("is-active"));
    dateButton.classList.add("is-active");
    state.bookingDate = dateButton.dataset.bookingDate;
    renderBookings();
  }

  const filterButton = event.target.closest(".filter-row button");
  if (filterButton) {
    qsa(".filter-row button").forEach((button) => button.classList.remove("is-active"));
    filterButton.classList.add("is-active");
  }

  const socialFilter = event.target.closest("#social .section-title .icon-button");
  if (socialFilter) {
    socialFilter.classList.toggle("is-active");
    showSuccess("Filtres de matching mis à jour.");
  }
});

qs("#scanRubber").addEventListener("click", () => {
  state.rubberScanned = true;
  renderRubberScan();
  showSuccess("Scan revêtement sauvegardé.");
});

qs("#openMessages").addEventListener("click", () => {
  openMessageDrawer();
});

qs("#closeMessages").addEventListener("click", () => {
  qs("#messageDrawer").classList.remove("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "true");
});

qs("#backToThreads").addEventListener("click", () => {
  setDrawerView("list");
  renderThreadList();
});

qsa("[data-thread-tab]").forEach((btn) => {
  btn.addEventListener("click", () => setDrawerTab(btn.dataset.threadTab));
});

qs("#openCart").addEventListener("click", () => {
  qs("#cartDrawer").classList.add("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "false");
  qs("#openCart").classList.remove("has-dot");
  showSuccess("Panier ouvert.");
});

qs("#closeCart").addEventListener("click", () => {
  qs("#cartDrawer").classList.remove("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "true");
  showSuccess("Panier fermé.");
});

qs("#shopCheckout").addEventListener("click", () => {
  qs("#cartDrawer").classList.add("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "false");
  showSuccess("Panier ouvert.");
});

qsa("[data-shop-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    qsa("[data-shop-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderShop(button.dataset.shopFilter);
    const grid = qs("#shopGrid");
    if (grid) {
      const top = grid.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

qs(".back-button").addEventListener("click", () => {
  setView("home");
});

qs("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.message;
  const text = input.value.trim();
  if (!text) return;
  sendChatMessage(text);
  input.value = "";
});

let pendingBooking = null;

function openBookingConfirm(booking) {
  pendingBooking = booking;
  qs("#bookingSummaryTitle").textContent = booking.title;
  qs("#bookingSummaryMeta").textContent = booking.meta;
  const checkbox = qs("#bookingConfirmCheck");
  const submit = qs("#bookingConfirmSubmit");
  checkbox.checked = false;
  submit.disabled = true;
  openModal("bookingModal");
}

qs("#bookingConfirmCheck").addEventListener("change", (event) => {
  qs("#bookingConfirmSubmit").disabled = !event.currentTarget.checked;
});

qs("#bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pendingBooking || !qs("#bookingConfirmCheck").checked) return;
  const exists = state.reservations.some((r) => r.id === pendingBooking.id);
  if (!exists) state.reservations.push({ ...pendingBooking });
  const title = pendingBooking.title;
  pendingBooking = null;
  closeModal("bookingModal");
  renderBookings();
  renderReservations();
  showSuccess(`${title} confirmé.`);
});

qs("#openPerfModal").addEventListener("click", () => {
  const form = qs("#perfForm");
  form.elements.title.value = state.performance.title;
  form.elements.speed.value = state.performance.speed;
  form.elements.hits.value = state.performance.hits;
  form.elements.angle.value = state.performance.angle;
  form.elements.endurance.value = state.performance.endurance;
  form.elements.duration.value = state.performance.duration;
  form.elements.note.value = state.performance.note;
  openModal("perfModal");
});

qs("#perfForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  state.performance = {
    title: form.elements.title.value.trim() || "Performance",
    speed: Number(form.elements.speed.value) || 0,
    hits: Number(form.elements.hits.value) || 0,
    angle: Number(form.elements.angle.value) || 0,
    endurance: Number(form.elements.endurance.value) || 0,
    duration: Number(form.elements.duration.value) || 0,
    note: form.elements.note.value.trim(),
  };
  renderPerformance();
  closeModal("perfModal");
  showSuccess("Performance publiée sur ton profil.");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  qsa(".modal.is-open").forEach((modal) => closeModal(modal.id));
});

renderBookings();
renderReservations();
renderPlayers();
renderLeaderboard();
renderThreadList();
renderShop();
renderCart();
renderRegistry();
renderTables();
renderMap();
renderActivityFeed();
renderOpponentNotes();
renderGear();
renderPendingMatches();
renderScore();
renderDrills();
renderRanking();
renderBadges();
renderIntegrations();
renderRubberScan();
renderPerformance();
renderApiStatus();

// Scroll-triggered reveal animations
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let observeReveals = () => {};
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.08 },
  );

  observeReveals = () => {
    document
      .querySelectorAll(
        ".streak-card, .home-grid > *, .main-registry-card, .activity-card, .coach-card, " +
          ".map-card, .selected-spot-card, .booking-controls, .event-card, .table-network-card, " +
          ".my-reservations-card, .scorer-card, .drill-card, .opponent-notes-card, " +
          ".profile-card, .performance-post, .improvement-card, .rubber-card, .gear-card, .integration-card, " +
          ".leaderboard-card, .ranking-card, .pending-card, .challenge-grid > *, .challenge-focus, .badge-card, " +
          ".shop-highlight, .performance-editorial > *",
      )
      .forEach((el) => {
        if (el.dataset.reveal) return;
        el.dataset.reveal = "1";
        const rect = el.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;
        if (visible) {
          el.classList.add("in-view");
        } else {
          revealObserver.observe(el);
        }
      });
  };
  observeReveals();
}

// Re-scan when switching views (deferred so the screen's children are visible)
document.addEventListener("click", (event) => {
  const viewBtn = event.target.closest("[data-view]");
  if (viewBtn) requestAnimationFrame(() => requestAnimationFrame(observeReveals));
});

// Spring-easing count-up animation (Remotion-inspired interpolation)
function animateNumber(el, options = {}) {
  const target = Number(el.dataset.countTo);
  if (Number.isNaN(target)) return;
  const duration = options.duration || 1200;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const start = 0;
  const startTime = performance.now();
  // Cubic-bezier-out approximation matched to --ease-out
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function tick(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const value = Math.round(start + (target - start) * ease(t));
    el.textContent = `${prefix}${value.toLocaleString("fr-FR")}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 },
  );
  setTimeout(() => {
    document.querySelectorAll("[data-count-to]").forEach((el) => counterObserver.observe(el));
  }, 200);
}
