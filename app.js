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

const bookings = [
  { time: "16:00", label: "3 tables disponibles", info: "T2/T3/T4", tag: "Hors peak" },
  { time: "16:30", label: "3 tables disponibles", info: "T2/T3/T4", tag: "Hors peak" },
  { time: "17:00", label: "4 tables disponibles", info: "T1/T2/T3/T4", tag: "" },
  { time: "17:30", label: "4 tables disponibles", info: "T1/T2/T3/T4", tag: "" },
  { time: "18:30", label: "2 tables disponibles", info: "Happy Hours à côté", tag: "Peak" },
];

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

const messages = [
  { author: "Lila", text: "Dispo pour une tournante ce soir ?" },
  { author: "Noa", text: "Je cherche un partenaire 2 vs 2 jeudi." },
  { author: "Emma", text: "Je peux jouer à 18:30.", mine: true },
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
    x: 34,
    y: 38,
  },
  {
    name: "Spin Lab",
    area: "Belleville Club",
    address: "Rue de Belleville, Paris",
    legend: "Maya",
    visits: 11,
    format: "Indoor club tables",
    crowd: "Ranked ladder tonight",
    x: 66,
    y: 28,
  },
  {
    name: "Riverside Pair",
    area: "Bassin de la Villette",
    address: "Bassin de la Villette, Paris",
    legend: "Ari",
    visits: 8,
    format: "Two public tables",
    crowd: "Open challenge queue",
    x: 48,
    y: 68,
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

const mapTiles = [
  "https://tile.openstreetmap.org/14/8299/5635.png",
  "https://tile.openstreetmap.org/14/8300/5635.png",
  "https://tile.openstreetmap.org/14/8299/5636.png",
  "https://tile.openstreetmap.org/14/8300/5636.png",
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
  score: { you: 0, them: 0 },
  completedDrills: {},
  rubberScanned: false,
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function setView(viewId) {
  qsa(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === viewId));
  qsa("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === viewId));
  qs("#viewSubtitle").textContent = subtitles[viewId] || "Ping Pang";
  qsa(`[data-view="${viewId}"]`).forEach((button) => button.classList.remove("has-dot"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSuccess(text) {
  const toast = qs("#successToast");
  toast.textContent = text;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function renderBookings() {
  qs("#bookingList").innerHTML = bookings
    .map(
      (slot) => `
        <article class="booking-row">
          <strong>${slot.time}</strong>
          <div>
            ${slot.tag ? `<em>${slot.tag}</em>` : ""}
            <p>${slot.label}</p>
            <span>${slot.info}</span>
          </div>
          <button type="button" aria-label="Réserver ${slot.time}" data-success="Table réservée à ${slot.time}."></button>
        </article>
      `,
    )
    .join("");
}

function renderPlayers() {
  qs("#playerList").innerHTML = players
    .map(
      (player) => `
        <article class="player-row">
          <div class="avatar small">${player.name.split(" ").map((part) => part[0]).join("")}</div>
          <div>
            <strong>${player.name}</strong>
            <p>${player.style} • ${player.level}</p>
            <span>${player.city} • ${player.status}</span>
          </div>
          <button type="button" data-success="Match demandé à ${player.name}.">${player.match}</button>
        </article>
      `,
    )
    .join("");
}

function renderLeaderboard() {
  qs("#leaderboard").innerHTML = leaderboard
    .map(
      (player) => `
        <article class="leader-row">
          <span>${player.rank}</span>
          <strong>${player.name}</strong>
          <em>${player.points}</em>
        </article>
      `,
    )
    .join("");
}

function renderMessages() {
  qs("#messageList").innerHTML = messages
    .map(
      (message) => `
        <div class="message ${message.mine ? "mine" : ""}">
          <strong>${message.author}</strong>
          <p>${message.text}</p>
        </div>
      `,
    )
    .join("");
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

function renderMap() {
  const selectedSpot = tableSpots.find((spot) => spot.name === state.selectedSpot) || tableSpots[0];
  qs("#realMap").innerHTML = `
    <div class="tile-grid">
      ${mapTiles.map((tile) => `<img src="${tile}" alt="" loading="lazy" onerror="this.style.display='none';" />`).join("")}
    </div>
    <div class="map-wash"></div>
    ${tableSpots
      .map(
        (spot) => `
          <button
            class="map-pin ${spot.name === selectedSpot.name ? "is-active" : ""}"
            type="button"
            style="left:${spot.x}%;top:${spot.y}%"
            data-map-spot="${spot.name}"
            aria-label="Sélectionner ${spot.name}"
          >${spot.name === selectedSpot.name ? "P" : "T"}</button>
        `,
      )
      .join("")}
    <span class="map-attribution">Map data OpenStreetMap contributors</span>
  `;
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
        <article class="feed-row">
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
        <button class="drill-row ${done ? "is-done" : ""}" type="button" data-drill="${drill.id}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${drill.title}</strong>
            <p>${drill.meta}</p>
          </div>
          <em>${done ? "Done" : "Tap"}</em>
        </button>
      `;
    })
    .join("");
}

function renderRanking() {
  qs("#rankingTable").innerHTML = rivalRatings
    .map(
      (player, index) => `
        <article class="rank-row ${player.highlight ? "is-you" : ""}">
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
          (product) => `
            <article class="cart-row">
              <img src="${product.img}" alt="" />
              <div>
                <strong>${product.name}</strong>
                <span>${formatPrice(product.price)}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p class="empty-cart">Ton panier est vide.</p>`;
}

qsa("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.addEventListener("click", (event) => {
  const success = event.target.closest("[data-success]");
  if (success) showSuccess(success.dataset.success);

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) setView(viewButton.dataset.view);

  const mapSpot = event.target.closest("[data-map-spot]");
  if (mapSpot) {
    state.selectedSpot = mapSpot.dataset.mapSpot;
    renderMap();
  }

  const scoreButton = event.target.closest("[data-score]");
  if (scoreButton) {
    state.score[scoreButton.dataset.score] += 1;
    renderScore();
  }

  if (event.target.closest("[data-reset-score]")) {
    state.score = { you: 0, them: 0 };
    renderScore();
  }

  const saveMatch = event.target.closest("[data-save-match]");
  if (saveMatch) {
    state.score = { you: 0, them: 0 };
    renderScore();
    showSuccess("Match enregistré. Le ranking sera mis à jour après confirmation.");
  }

  const drill = event.target.closest("[data-drill]");
  if (drill) {
    state.completedDrills[drill.dataset.drill] = !state.completedDrills[drill.dataset.drill];
    if (!state.completedDrills[drill.dataset.drill]) delete state.completedDrills[drill.dataset.drill];
    renderDrills();
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
});

qs("#scanRubber").addEventListener("click", () => {
  state.rubberScanned = true;
  renderRubberScan();
  showSuccess("Scan revêtement sauvegardé.");
});

qs("#openMessages").addEventListener("click", () => {
  qs("#messageDrawer").classList.add("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "false");
});

qs("#closeMessages").addEventListener("click", () => {
  qs("#messageDrawer").classList.remove("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "true");
});

qs("#openCart").addEventListener("click", () => {
  qs("#cartDrawer").classList.add("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "false");
  qs("#openCart").classList.remove("has-dot");
});

qs("#closeCart").addEventListener("click", () => {
  qs("#cartDrawer").classList.remove("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "true");
});

qs("#shopCheckout").addEventListener("click", () => {
  qs("#cartDrawer").classList.add("is-open");
  qs("#cartDrawer").setAttribute("aria-hidden", "false");
});

qsa("[data-shop-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    qsa("[data-shop-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderShop(button.dataset.shopFilter);
  });
});

qs("#messageForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.message;
  const text = input.value.trim();
  if (!text) return;
  messages.push({ author: "Emma", text, mine: true });
  input.value = "";
  renderMessages();
  showSuccess("Message envoyé.");
});

renderBookings();
renderPlayers();
renderLeaderboard();
renderMessages();
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
renderApiStatus();
