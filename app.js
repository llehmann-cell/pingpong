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
  { name: "Emma", points: "4 820 XP", rank: 1 },
  { name: "Lila", points: "4 610 XP", rank: 2 },
  { name: "Noa", points: "4 180 XP", rank: 3 },
  { name: "Sami", points: "3 970 XP", rank: 4 },
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
