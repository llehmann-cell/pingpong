import os

base = r"C:\Users\abire\Downloads\pingpong\pingpong-1"

# Remove old files
for f in ["match-dna-card.jsx"]:
    p = os.path.join(base, f)
    if os.path.exists(p):
        os.remove(p)
        print(f"removed {f}")

html = r"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Match DNA — Ping Pang Paris</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand:       #0b2318;
    --brand-mid:   #143322;
    --brand-light: #1e4a30;
    --green:       #3ed87a;
    --green-dim:   #2a9955;
    --green-muted: #1b6638;
    --white:       #ffffff;
    --white-dim:   rgba(255,255,255,0.55);
    --white-muted: rgba(255,255,255,0.18);
    --text:        #ffffff;
    --text-dim:    rgba(255,255,255,0.5);
    --text-muted:  rgba(255,255,255,0.28);
    --red:         #e25555;
    --red-bg:      #3a1a1a;
    --gold:        #e2b955;
  }

  body {
    background: #0a1a10;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 2rem 1rem;
  }

  .card {
    width: 360px;
    background: var(--brand);
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 0 0 1px rgba(62,216,122,0.15);
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    border-radius: 24px;
  }

  .card > * { position: relative; z-index: 1; }

  .card-header {
    padding: 1.25rem 1.25rem 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .brand-tag {
    font-size: 9px;
    font-weight: 600;
    color: var(--white-dim);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .player-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 38px;
    color: var(--white);
    line-height: 0.95;
    letter-spacing: 0.02em;
  }

  .player-meta {
    font-size: 11px;
    color: var(--white-dim);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .player-meta span { opacity: 0.35; }

  .rank-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
    position: relative;
    background: rgba(255,255,255,0.05);
  }

  .rank-badge::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(62,216,122,0.1) 0%, transparent 70%);
  }

  .rank-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    color: var(--white);
    line-height: 1;
    position: relative;
    z-index: 1;
  }

  .rank-label {
    font-size: 8px;
    color: var(--white-dim);
    letter-spacing: 0.1em;
    position: relative;
    z-index: 1;
  }

  .style-tag {
    margin: 0.85rem 1.25rem 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--green-muted);
    border-radius: 20px;
    padding: 4px 10px 4px 6px;
  }

  .style-dot {
    width: 18px; height: 18px;
    background: var(--green);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }

  .style-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--green);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent);
    margin: 1rem 0;
  }

  .dna-section { padding: 0 1.25rem; }

  .section-title {
    font-size: 9px;
    font-weight: 600;
    color: var(--white-dim);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .dna-bars { display: flex; flex-direction: column; gap: 9px; }

  .dna-row {
    display: grid;
    grid-template-columns: 58px 1fr 28px;
    align-items: center;
    gap: 8px;
  }

  .dna-label { font-size: 11px; color: var(--white-dim); }

  .dna-track {
    height: 5px;
    background: rgba(255,255,255,0.06);
    border-radius: 3px;
    overflow: hidden;
  }

  .dna-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--green);
    width: 0;
    transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dna-val { font-size: 11px; color: var(--white); text-align: right; font-weight: 600; }

  .stats-section { padding: 0 1.25rem; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-box {
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 10px 8px;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.1);
    transition: border-color 0.2s;
  }

  .stat-box:hover { border-color: rgba(255,255,255,0.25); }

  .stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--white);
    line-height: 1;
  }

  .stat-val.green { color: var(--green); }
  .stat-val.red   { color: var(--red); }

  .stat-lbl {
    font-size: 9px;
    color: var(--white-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .heatmap-section { padding: 0 1.25rem; }

  .heatmap-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .hm-day {
    aspect-ratio: 1;
    border-radius: 4px;
    background: #0f2a1a;
    transition: transform 0.15s;
    cursor: default;
  }

  .hm-day:hover { transform: scale(1.15); }
  .hm-day.win   { background: var(--green); }
  .hm-day.loss  { background: var(--red-bg); border: 1px solid #5a2a2a; }
  .hm-day.empty { background: #0d2018; opacity: 0.4; }

  .hm-week-labels {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 4px;
  }

  .hm-week-label {
    font-size: 8px;
    color: rgba(255,255,255,0.3);
    text-align: center;
    letter-spacing: 0.05em;
  }

  .rivals-section { padding: 0 1.25rem; }

  .rival-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 6px;
    transition: border-color 0.2s, background 0.2s;
    cursor: default;
  }

  .rival-item:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.18);
  }

  .rival-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    color: var(--white);
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.15);
  }

  .rival-info { flex: 1; min-width: 0; }
  .rival-name { font-size: 12px; font-weight: 600; color: var(--white); }
  .rival-rec  { font-size: 10px; color: var(--white-dim); margin-top: 1px; }

  .rival-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .badge-nemesis   { background: var(--red-bg); color: var(--red); border: 1px solid #5a2a2a; }
  .badge-dominated { background: #0f2a1a; color: var(--green); border: 1px solid var(--green-muted); }
  .badge-even      { background: #2a2a10; color: var(--gold); border: 1px solid #4a4a20; }

  .outfit-section { padding: 0 1.25rem; }

  .outfit-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(255,255,255,0.12);
    position: relative;
    overflow: hidden;
  }

  .outfit-card::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px;
    background: radial-gradient(circle, rgba(62,216,122,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .outfit-icon {
    width: 38px; height: 38px;
    background: var(--green);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px;
    flex-shrink: 0;
  }

  .outfit-text { flex: 1; min-width: 0; }
  .outfit-name { font-size: 12px; font-weight: 600; color: var(--white); }
  .outfit-sub  { font-size: 10px; color: var(--white-dim); margin-top: 2px; }

  .outfit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: var(--white);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 20px;
    padding: 5px 12px;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .outfit-btn:hover {
    background: var(--white);
    color: var(--brand);
    border-color: var(--white);
  }

  .momentum-section { padding: 0 1.25rem; }

  .momentum-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    padding: 8px 12px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .momentum-arrow { font-size: 18px; font-weight: 700; line-height: 1; }
  .momentum-arrow.up   { color: var(--green); }
  .momentum-arrow.down { color: var(--red); }

  .momentum-text { font-size: 11px; color: var(--white-dim); flex: 1; }

  .momentum-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    color: var(--white);
  }

  .card-footer {
    padding: 1rem 1.25rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .share-btn {
    flex: 1;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    background: var(--green);
    color: var(--brand);
    border: none;
    border-radius: 12px;
    padding: 11px 20px;
    cursor: pointer;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: opacity 0.2s, transform 0.1s;
  }

  .share-btn:hover   { opacity: 0.9; }
  .share-btn:active  { transform: scale(0.98); }
  .share-btn.copied  { background: var(--green-dim); }

  .copy-link-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--white-dim);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 11px 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    white-space: nowrap;
  }

  .copy-link-btn:hover { border-color: rgba(255,255,255,0.3); color: var(--white); }

  .gap    { height: 1rem; }
  .gap-sm { height: 0.75rem; }
</style>
</head>
<body>

<div class="card" id="dna-card">

  <div class="card-header">
    <div>
      <div class="brand-tag">Ping Pang Paris · Match DNA</div>
      <div class="player-name" id="player-name">Lucas<br>Martin</div>
      <div class="player-meta">
        <span>📍</span> Paris <span>·</span> Club République
      </div>
    </div>
    <div class="rank-badge">
      <div class="rank-num" id="rank-num">#47</div>
      <div class="rank-label">WORLD</div>
    </div>
  </div>

  <div style="padding: 0 1.25rem; margin-top: 0.85rem;">
    <div class="style-tag">
      <div class="style-dot">⚡</div>
      <div class="style-label" id="style-label">Attaquant agressif</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="dna-section">
    <div class="section-title">Profil ADN</div>
    <div class="dna-bars" id="dna-bars"></div>
  </div>

  <div class="gap"></div>

  <div class="stats-section">
    <div class="section-title">Stats — 30 derniers jours</div>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val green" id="stat-wins">38</div>
        <div class="stat-lbl">Victoires</div>
      </div>
      <div class="stat-box">
        <div class="stat-val red" id="stat-losses">14</div>
        <div class="stat-lbl">Défaites</div>
      </div>
      <div class="stat-box">
        <div class="stat-val green" id="stat-winrate">73%</div>
        <div class="stat-lbl">Win rate</div>
      </div>
    </div>
  </div>

  <div class="gap"></div>

  <div class="heatmap-section">
    <div class="section-title">Activité — 28 derniers jours</div>
    <div class="hm-week-labels">
      <div class="hm-week-label">L</div>
      <div class="hm-week-label">M</div>
      <div class="hm-week-label">M</div>
      <div class="hm-week-label">J</div>
      <div class="hm-week-label">V</div>
      <div class="hm-week-label">S</div>
      <div class="hm-week-label">D</div>
    </div>
    <div class="heatmap-grid" id="heatmap"></div>
  </div>

  <div class="gap"></div>

  <div class="rivals-section">
    <div class="section-title">Rivalités</div>
    <div id="rivals"></div>
  </div>

  <div class="gap-sm"></div>

  <div class="momentum-section">
    <div class="momentum-bar">
      <div class="momentum-arrow up" id="momentum-arrow">↑</div>
      <div class="momentum-text" id="momentum-text">+12 places ce mois</div>
      <div class="momentum-val" id="momentum-val">#47</div>
    </div>
  </div>

  <div class="gap-sm"></div>

  <div class="outfit-section">
    <div class="section-title">Recommandation équipement</div>
    <div class="outfit-card">
      <div class="outfit-icon">👕</div>
      <div class="outfit-text">
        <div class="outfit-name" id="outfit-name">PPP Impulse Collection</div>
        <div class="outfit-sub" id="outfit-sub">Parfait pour ton style agressif</div>
      </div>
      <button class="outfit-btn" id="outfit-btn" onclick="openShop()">Shop →</button>
    </div>
  </div>

  <div class="card-footer">
    <button class="share-btn" id="share-btn" onclick="shareCard()">Partager ma carte</button>
    <button class="copy-link-btn" onclick="copyLink()">🔗 Lien</button>
  </div>

</div>

<script>
  const playerData = {
    player: { id: "player_123", name: "Lucas\nMartin", city: "Paris", club: "Club République" },
    rank: { current: 47, momentum: 12 },
    stats: { wins: 38, losses: 14 },
    styleLabel: "Attaquant agressif",
    dna: [
      { label: "Attaque",   value: 82 },
      { label: "Spin",      value: 67 },
      { label: "Défense",   value: 44 },
      { label: "Endurance", value: 91 },
    ],
    heatmap: [
      null, null, true,  true,  true,  false, true,
      true, false,null,  true,  true,  true,  false,
      true, true, null,  true,  true,  true,  true,
      false,true, true,  true,  true,  false, true,
    ],
    rivals: [
      { id:"r1", name:"Kim Taehyun", initials:"KT", wins:3, losses:7, type:"nemesis" },
      { id:"r2", name:"Ahmed Reza",  initials:"AR", wins:6, losses:3, type:"dominated" },
      { id:"r3", name:"Marco Rossi", initials:"MR", wins:4, losses:4, type:"even" },
    ],
    outfit: {
      name: "PPP Impulse Collection",
      sub:  "Parfait pour ton style agressif",
      url:  "https://pingpangparis.com/shop?style=impulse",
    },
  };

  function render(d) {
    document.getElementById("player-name").innerHTML = d.player.name.replace("\n", "<br>");
    document.getElementById("rank-num").textContent = "#" + d.rank.current;
    document.getElementById("style-label").textContent = d.styleLabel;

    const wr = Math.round((d.stats.wins / (d.stats.wins + d.stats.losses)) * 100);
    document.getElementById("stat-wins").textContent    = d.stats.wins;
    document.getElementById("stat-losses").textContent  = d.stats.losses;
    document.getElementById("stat-winrate").textContent = wr + "%";

    const up = d.rank.momentum > 0;
    document.getElementById("momentum-arrow").textContent = up ? "↑" : "↓";
    document.getElementById("momentum-arrow").className   = "momentum-arrow " + (up ? "up" : "down");
    document.getElementById("momentum-text").textContent  = (up ? "+" : "") + d.rank.momentum + " places ce mois";
    document.getElementById("momentum-val").textContent   = "#" + d.rank.current;

    document.getElementById("outfit-name").textContent = d.outfit.name;
    document.getElementById("outfit-sub").textContent  = d.outfit.sub;

    const barsEl = document.getElementById("dna-bars");
    barsEl.innerHTML = "";
    d.dna.forEach(attr => {
      const row = document.createElement("div");
      row.className = "dna-row";
      row.innerHTML = `
        <div class="dna-label">${attr.label}</div>
        <div class="dna-track"><div class="dna-fill" data-value="${attr.value}"></div></div>
        <div class="dna-val">${attr.value}</div>
      `;
      barsEl.appendChild(row);
    });

    const hmEl = document.getElementById("heatmap");
    hmEl.innerHTML = "";
    d.heatmap.forEach(val => {
      const cell = document.createElement("div");
      cell.className = "hm-day " + (val === null ? "empty" : val ? "win" : "loss");
      hmEl.appendChild(cell);
    });

    const badgeMap = {
      nemesis:   ["badge-nemesis",   "Nemesis"],
      dominated: ["badge-dominated", "Dominé"],
      even:      ["badge-even",      "Égaux"],
    };
    const rivalsEl = document.getElementById("rivals");
    rivalsEl.innerHTML = "";
    d.rivals.forEach(r => {
      const [cls, lbl] = badgeMap[r.type] || badgeMap.even;
      const item = document.createElement("div");
      item.className = "rival-item";
      item.innerHTML = `
        <div class="rival-avatar">${r.initials}</div>
        <div class="rival-info">
          <div class="rival-name">${r.name}</div>
          <div class="rival-rec">${r.wins}V – ${r.losses}D</div>
        </div>
        <div class="rival-badge ${cls}">${lbl}</div>
      `;
      rivalsEl.appendChild(item);
    });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll(".dna-fill").forEach(el => {
        el.style.width = el.dataset.value + "%";
        el.style.opacity = 0.4 + (parseInt(el.dataset.value) / 100) * 0.6;
      });
    }));
  }

  function openShop() { window.open(playerData.outfit.url, "_blank"); }

  function shareCard() {
    const btn = document.getElementById("share-btn");
    const url = window.location.href + "?player=" + playerData.player.id;
    if (navigator.share) {
      navigator.share({
        title: "Mon Match DNA — Ping Pang Paris",
        text: `Je suis #${playerData.rank.current} mondial !`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = "✓ Lien copié !";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Partager ma carte"; btn.classList.remove("copied"); }, 2500);
      });
    }
  }

  function copyLink() {
    const url = window.location.href + "?player=" + playerData.player.id;
    navigator.clipboard.writeText(url).then(() => {
      const btn = event.target;
      btn.textContent = "✓ Copié";
      setTimeout(() => btn.textContent = "🔗 Lien", 2000);
    });
  }

  render(playerData);
</script>
</body>
</html>"""

with open(os.path.join(base, "index.html"), "w", encoding="utf-8") as f:
    f.write(html)

print("OK - index.html written, match-dna-card.jsx removed")
