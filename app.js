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

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function setView(viewId) {
  qsa(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === viewId));
  qsa("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === viewId));
  qs("#viewSubtitle").textContent = subtitles[viewId] || "Ping Pang";
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

qsa("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.addEventListener("click", (event) => {
  const success = event.target.closest("[data-success]");
  if (success) showSuccess(success.dataset.success);
});

qs("#openMessages").addEventListener("click", () => {
  qs("#messageDrawer").classList.add("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "false");
});

qs("#closeMessages").addEventListener("click", () => {
  qs("#messageDrawer").classList.remove("is-open");
  qs("#messageDrawer").setAttribute("aria-hidden", "true");
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
