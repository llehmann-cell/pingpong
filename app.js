const activities = [
  {
    initials: "EL",
    title: "Séance topspin coup droit",
    body: "540 balles, 42 minutes, régularité à 83%. Nouveau record sur le segment Topspin 50 balles.",
    meta: "Paris Ping 11 • il y a 24 min",
    kudos: 18,
  },
  {
    initials: "LM",
    title: "Match 2 vs 2 gagné",
    body: "Lila & Emma battent Noa & Sami 3-1. Point fort: retours courts et prise d'initiative revers.",
    meta: "Mode double • hier",
    kudos: 31,
  },
  {
    initials: "NS",
    title: "Local legend conservée",
    body: "Noa reste légende locale sur Service court revers avec 11 sessions ce mois-ci.",
    meta: "Segment technique • lundi",
    kudos: 12,
  },
];

const badges = ["Streak 18j", "Topspin", "Double", "Legend", "Service", "Volume"];

const mapItems = [
  { type: "club", title: "Paris Ping 11", detail: "Club favori • 26 joueurs suivis • 4 événements à venir" },
  { type: "segment", title: "Topspin 50 balles", detail: "Record: 47 réussites • leader: Emma • 132 tentatives" },
  { type: "club", title: "Levallo Ping Arena", detail: "Club partenaire • 18 tables • tournoi vendredi" },
  { type: "segment", title: "Service court revers", detail: "Local legend: Noa • 11 séances ce mois-ci" },
  { type: "club", title: "Montreuil TT", detail: "Open play samedi • niveau moyen 1300-1700" },
];

const training = [
  {
    title: "Séance intensité",
    volume: "1 h 25 • 820 balles",
    exercises: ["panier topspin", "bloc actif", "schéma service"],
    score: "Charge 78",
  },
  {
    title: "Régularité revers",
    volume: "52 min • 460 balles",
    exercises: ["revers ligne", "pivot", "contre-top"],
    score: "Précision 81%",
  },
  {
    title: "Tournante club",
    volume: "38 min • 7 matchs",
    exercises: ["points courts", "rotation", "mental"],
    score: "Rang 2/9",
  },
];

const friends = [
  { name: "Lila Martin", style: "Bloqueuse agressive", change: "+86 pts" },
  { name: "Noa Simon", style: "Défenseur moderne", change: "+54 pts" },
  { name: "Sami Diallo", style: "Serveur variation", change: "+41 pts" },
];

const challenges = [
  { title: "10 h de panier", detail: "6 h 30 complétées", progress: 65 },
  { title: "Double du mois", detail: "8 victoires sur 12", progress: 72 },
  { title: "Event: tournoi amical", detail: "Paris 11 • 16 mai", progress: 40 },
];

const messages = [
  { text: "Qui est dispo pour une tournante jeudi soir ?", mine: false },
  { text: "Je viens, et je peux amener des balles neuves.", mine: true },
  { text: "Parfait. On ajoute un défi services courts ?", mine: false },
];

const compare = [
  { name: "Emma", progress: 82, detail: "+118 points" },
  { name: "Lila", progress: 74, detail: "+86 points" },
  { name: "Noa", progress: 67, detail: "+54 points" },
  { name: "Sami", progress: 61, detail: "+41 points" },
];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function renderActivities() {
  qs("#activityFeed").innerHTML = activities
    .map(
      (activity) => `
        <article class="activity-card">
          <div class="activity-avatar">${activity.initials}</div>
          <div>
            <h3>${activity.title}</h3>
            <p>${activity.body}</p>
            <p class="activity-meta">${activity.meta}</p>
          </div>
          <button class="kudos" type="button" aria-label="Ajouter un kudos">${activity.kudos}</button>
        </article>
      `,
    )
    .join("");
}

function renderBadges() {
  qs("#badges").innerHTML = badges.map((badge) => `<div class="badge">${badge}</div>`).join("");
}

function renderMap(filter = "all") {
  const visible = filter === "all" ? mapItems : mapItems.filter((item) => item.type === filter);
  qs("#mapList").innerHTML = visible
    .map(
      (item, index) => `
        <article class="map-card ${index === 0 ? "is-featured" : ""}">
          <p class="eyebrow">${item.type === "club" ? "Club" : "Segment"}</p>
          <h3>${item.title}</h3>
          <p>${item.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderTraining() {
  qs("#trainingGrid").innerHTML = training
    .map(
      (session) => `
        <article class="training-card">
          <div>
            <p class="eyebrow">${session.volume}</p>
            <h3>${session.title}</h3>
            <div class="exercise-list">${session.exercises.map((item) => `<span>${item}</span>`).join("")}</div>
          </div>
          <strong>${session.score}</strong>
        </article>
      `,
    )
    .join("");
}

function renderSocial() {
  qs("#friendsList").innerHTML = friends
    .map(
      (friend) => `
        <article class="friend-row">
          <div>
            <strong>${friend.name}</strong>
            <p>${friend.style}</p>
          </div>
          <span class="count-pill">${friend.change}</span>
        </article>
      `,
    )
    .join("");

  qs("#challengeList").innerHTML = challenges
    .map(
      (challenge) => `
        <article class="challenge-row">
          <div>
            <strong>${challenge.title}</strong>
            <p>${challenge.detail}</p>
            <div class="progress-line"><span style="width: ${challenge.progress}%"></span></div>
          </div>
        </article>
      `,
    )
    .join("");

  renderMessages();
}

function renderMessages() {
  qs("#messages").innerHTML = messages
    .map((message) => `<div class="message ${message.mine ? "mine" : ""}">${message.text}</div>`)
    .join("");
}

function renderCompare() {
  qs("#compareRows").innerHTML = compare
    .map(
      (player) => `
        <article class="compare-row">
          <div>
            <strong>${player.name}</strong>
            <div class="progress-line"><span style="width: ${player.progress}%"></span></div>
          </div>
          <span>${player.detail}</span>
        </article>
      `,
    )
    .join("");
}

function setView(viewId) {
  qsa(".view").forEach((view) => view.classList.toggle("is-visible", view.id === viewId));
  qsa("[data-view]").forEach((button) => button.classList.toggle("is-active", button.dataset.view === viewId));
}

function showToast(text) {
  const toast = qs("#toast");
  toast.textContent = text;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

qsa("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

qsa("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    qsa("[data-filter]").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    renderMap(button.dataset.filter);
  });
});

qsa(".map-pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    qs("#mapHint").textContent = `${pin.dataset.name} sélectionné. Ouvre la fiche pour voir records, joueurs et événements.`;
  });
});

qs("#startSession").addEventListener("click", () => showToast("Séance prête: panier topspin, bloc actif, match libre."));

qs("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.message;
  const text = input.value.trim();
  if (!text) return;
  messages.push({ text, mine: true });
  input.value = "";
  renderMessages();
});

renderActivities();
renderBadges();
renderMap();
renderTraining();
renderSocial();
renderCompare();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
