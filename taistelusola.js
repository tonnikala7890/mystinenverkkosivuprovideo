(() => {
  const game = document.querySelector("[data-combat-canvas]");
  const overlay = document.querySelector("[data-combat-overlay]");
  if (!game || !overlay) {
    return;
  }

  const context = game.getContext("2d");
  const healthDisplay = document.querySelector("[data-combat-health]");
  const waveDisplay = document.querySelector("[data-combat-wave]");
  const weaponDisplay = document.querySelector("[data-combat-weapon]");
  const coinsDisplay = document.querySelector("[data-combat-coins]");
  const status = document.querySelector("[data-combat-status]");
  const coinPurse = document.querySelector(".coin-purse");
  const overlayEyebrow = document.querySelector("[data-combat-overlay-eyebrow]");
  const overlayTitle = document.querySelector("[data-combat-overlay-title]");
  const overlayCopy = document.querySelector("[data-combat-overlay-copy]");
  const overlayAction = document.querySelector("[data-combat-overlay-action]");
  const coinsKey = "secret-site-coins";
  const player = { x: 480, y: 510, health: 100, maxHealth: 100, facing: { x: 0, y: -1 }, invulnerable: 0 };
  const movement = {
    w: [0, -1], arrowup: [0, -1],
    a: [-1, 0], arrowleft: [-1, 0],
    s: [0, 1], arrowdown: [0, 1],
    d: [1, 0], arrowright: [1, 0]
  };
  const keysDown = new Set();
  const enemies = [];
  let wave = 0;
  let coins = readCoins();
  let weapon = readWeapon();
  let active = false;
  let gameEnded = false;
  let lastFrameTime = 0;
  let attackCooldown = 0;
  let slashTime = 0;
  let pointerAim = null;
  let enemySerial = 0;

  function readCoins() {
    const saved = Number(localStorage.getItem(coinsKey) || 0);
    return Number.isSafeInteger(saved) && saved >= 0 ? saved : 0;
  }

  function readWeapon() {
    try {
      const saved = JSON.parse(localStorage.getItem("secret-site-minos-weapons") || "[]");
      const equipped = localStorage.getItem("secret-site-minos-equipped");
      if (Array.isArray(saved)) {
        const found = saved.find((item) => item && item.id === equipped && typeof item.name === "string" && Number.isFinite(item.damage));
        if (found) {
          return { name: found.name, damage: Math.max(20, Math.min(5000, found.damage)) };
        }
      }
    } catch (error) {
      console.error("Taistelusolan aseen lukeminen epäonnistui.", error);
    }
    return { name: "Harjoitusmiekka", damage: 28 };
  }

  function renderHud() {
    healthDisplay.textContent = `❤️ ${Math.ceil(player.health)} / ${player.maxHealth}`;
    waveDisplay.textContent = `Aalto ${Math.max(1, wave)} / 5`;
    weaponDisplay.textContent = `⚔️ ${weapon.name}`;
    coinsDisplay.textContent = `🪙 ${coins}`;
    if (coinPurse) {
      coinPurse.textContent = `🪙 ${coins} kolikkoa`;
    }
  }

  function spawnEnemy(isBoss, index) {
    const spawnPoints = [
      [100, 105], [480, 80], [860, 105], [130, 300],
      [830, 300], [240, 170], [720, 170], [480, 240]
    ];
    const [x, y] = spawnPoints[index % spawnPoints.length];
    const scale = Math.max(0, wave - 1);
    const health = isBoss ? 900 + wave * 180 : 48 + scale * 16;
    enemies.push({
      id: enemySerial++,
      x,
      y,
      health,
      maxHealth: health,
      speed: isBoss ? 38 + wave * 2 : 32 + Math.min(scale * 2, 14),
      isBoss,
      icon: isBoss ? (wave === 5 ? "🐙" : "🦈") : ["🦀", "🐍", "🐡", "🦑"][index % 4],
      attackCooldown: 0,
      hitFlash: 0,
      waiting: false,
      dead: false
    });
  }

  function startWave() {
    if (wave >= 5) {
      finishRun(true);
      return;
    }
    wave += 1;
    enemies.length = 0;
    const enemyCount = 3 + wave;
    for (let index = 0; index < enemyCount; index += 1) {
      spawnEnemy(false, index);
    }
    const bossWave = wave === 3 || wave === 5;
    if (bossWave) {
      spawnEnemy(true, enemyCount);
      enemies[enemies.length - 1].waiting = true;
    }
    active = true;
    gameEnded = false;
    player.health = Math.min(player.maxHealth, player.health + 20);
    player.invulnerable = 1.1;
    lastFrameTime = 0;
    overlay.hidden = true;
    status.textContent = bossWave
      ? `Aalto ${wave}: kukista ${enemyCount} vihollista, niin ${wave === 5 ? "syvyyden kuningas" : "solan vartija"} herää.`
      : `Aalto ${wave}: ${enemyCount} vihollista lähestyy!`;
    renderHud();
    game.focus();
    requestAnimationFrame(gameLoop);
  }

  function showOverlay(eyebrow, title, copy, actionText, action) {
    active = false;
    overlayEyebrow.textContent = eyebrow;
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlayAction.textContent = actionText;
    overlay.hidden = false;
    overlayAction.onclick = action;
    renderArena();
  }

  function finishRun(victory) {
    if (gameEnded) {
      return;
    }
    gameEnded = true;
    active = false;
    keysDown.clear();
    if (victory) {
      const reward = 250 + wave * 50;
      coins += reward;
      localStorage.setItem(coinsKey, String(coins));
      status.textContent = `Taistelusola valloitettu! Sait ${reward} kolikkoa.`;
      showOverlay("VOITTO", "Taistelusola on vapaa!", `Voitit kaikki viisi aaltoa ja sait ${reward} kolikkoa. Voit palata kartalle tai pelata uudelleen.`, "Pelaa uudelleen", () => {
        wave = 0;
        player.health = player.maxHealth;
        startWave();
      });
    } else {
      status.textContent = `Kaaduit aallossa ${wave}. Kolikot ja ase säilyivät.`;
      showOverlay("YRITÄ UUDELLEEN", "Virta vei mukanaan", `Pääsit aaltoon ${wave} / 5. Paranna varusteitasi ja palaa haastamaan solan viholliset.`, "Yritä uudelleen", () => {
        wave = 0;
        player.health = player.maxHealth;
        startWave();
      });
    }
    renderHud();
  }

  function defeatEnemy(enemy) {
    if (enemy.dead) {
      return;
    }
    enemy.dead = true;
    const reward = enemy.isBoss ? 100 + wave * 20 : 10 + wave * 3;
    coins += reward;
    localStorage.setItem(coinsKey, String(coins));
    status.textContent = enemy.isBoss
      ? `${enemy.icon} Pomo kaatui! Sait ${reward} kolikkoa.`
      : `${enemy.icon} Vihollinen kaatui. Sait ${reward} kolikkoa.`;
    renderHud();
  }

  function attack() {
    if (!active || attackCooldown > 0) {
      return;
    }
    attackCooldown = 0.32;
    slashTime = 0.2;
    if (pointerAim) {
      const dx = pointerAim.x - player.x;
      const dy = pointerAim.y - player.y;
      const distance = Math.hypot(dx, dy) || 1;
      player.facing = { x: dx / distance, y: dy / distance };
    }
    let target = null;
    let nearest = 105;
    enemies.forEach((enemy) => {
      if (enemy.dead) {
        return;
      }
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const facing = (dx * player.facing.x + dy * player.facing.y) / Math.max(distance, 1);
      if (!enemy.waiting && distance < nearest && (distance < 45 || facing > 0.25)) {
        target = enemy;
        nearest = distance;
      }
    });
    if (target) {
      target.health -= weapon.damage;
      target.hitFlash = 0.18;
      if (target.health <= 0) {
        defeatEnemy(target);
      } else {
        status.textContent = `${target.icon} Osuma! ${Math.ceil(target.health)} / ${target.maxHealth} HP jäljellä.`;
      }
    } else {
      status.textContent = "Hyökkäys osui tyhjään. Lähesty vihollista ja suuntaa sitä kohti.";
    }
  }

  function hurtPlayer(amount) {
    if (player.invulnerable > 0) {
      return;
    }
    player.health = Math.max(0, player.health - amount);
    player.invulnerable = 0.8;
    if (player.health === 0) {
      finishRun(false);
    }
    renderHud();
  }

  function updateEnemies(delta) {
    enemies.forEach((enemy) => {
      if (enemy.dead || enemy.waiting) {
        return;
      }
      enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - delta);
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > 25) {
        enemy.x += (dx / distance) * enemy.speed * delta;
        enemy.y += (dy / distance) * enemy.speed * delta;
      }
      if (distance < (enemy.isBoss ? 35 : 25) && enemy.attackCooldown === 0) {
        enemy.attackCooldown = enemy.isBoss ? 0.85 : 1.1;
        hurtPlayer(enemy.isBoss ? 14 : 6);
      }
    });
  }

  function drawEnemy(enemy) {
    if (enemy.dead || enemy.waiting) {
      return;
    }
    const radius = enemy.isBoss ? 22 : 14;
    context.save();
    context.shadowColor = enemy.isBoss ? "#ff6389" : "#62e9ff";
    context.shadowBlur = enemy.isBoss ? 22 : 12;
    context.fillStyle = enemy.hitFlash > 0 ? "#fff6cb" : enemy.isBoss ? "#9e3758" : "#175c79";
    context.beginPath();
    context.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
    context.fill();
    context.font = enemy.isBoss ? "30px Arial" : "21px Arial";
    context.textAlign = "center";
    context.fillText(enemy.icon, enemy.x, enemy.y + 7);
    context.fillStyle = "#071728";
    context.fillRect(enemy.x - (enemy.isBoss ? 28 : 19), enemy.y - radius - 9, enemy.isBoss ? 56 : 38, 5);
    context.fillStyle = enemy.isBoss ? "#ff718e" : "#9af4ff";
    context.fillRect(enemy.x - (enemy.isBoss ? 28 : 19), enemy.y - radius - 9, (enemy.isBoss ? 56 : 38) * Math.max(0, enemy.health / enemy.maxHealth), 5);
    context.restore();
  }

  function renderArena() {
    const floor = context.createLinearGradient(0, 0, 960, 600);
    floor.addColorStop(0, "#0b5972");
    floor.addColorStop(0.5, "#08344f");
    floor.addColorStop(1, "#07192f");
    context.fillStyle = floor;
    context.fillRect(0, 0, 960, 600);
    context.save();
    for (let index = 0; index < 14; index += 1) {
      const x = 70 + (index * 173) % 830;
      const y = 65 + (index * 97) % 470;
      context.fillStyle = index % 2 ? "rgba(80, 196, 209, 0.08)" : "rgba(3, 14, 29, 0.35)";
      context.beginPath();
      context.ellipse(x, y, 35 + (index % 4) * 10, 18 + (index % 3) * 8, index * 0.3, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "rgba(154, 235, 248, 0.42)";
    context.lineWidth = 3;
    context.strokeRect(28, 28, 904, 544);
    context.restore();
    enemies.forEach(drawEnemy);
    context.save();
    context.shadowColor = player.invulnerable > 0 ? "#fff" : "#7ff4ff";
    context.shadowBlur = 18;
    context.fillStyle = player.invulnerable > 0 ? "#fff2cc" : "#77eaff";
    context.beginPath();
    context.arc(player.x, player.y, 12, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#f4ffff";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(player.x, player.y);
    context.lineTo(player.x + player.facing.x * 21, player.y + player.facing.y * 21);
    context.stroke();
    if (slashTime > 0) {
      context.strokeStyle = "#d5fbff";
      context.shadowBlur = 20;
      context.beginPath();
      context.arc(player.x + player.facing.x * 18, player.y + player.facing.y * 18, 30, -0.8, 0.8);
      context.stroke();
    }
    context.restore();
  }

  function gameLoop(timestamp) {
    if (!active) {
      renderArena();
      return;
    }
    const delta = Math.min((timestamp - (lastFrameTime || timestamp)) / 1000, 0.05);
    lastFrameTime = timestamp;
    const horizontal = Number(keysDown.has("d") || keysDown.has("arrowright")) - Number(keysDown.has("a") || keysDown.has("arrowleft"));
    const vertical = Number(keysDown.has("s") || keysDown.has("arrowdown")) - Number(keysDown.has("w") || keysDown.has("arrowup"));
    const length = Math.hypot(horizontal, vertical);
    if (length) {
      const dx = horizontal / length;
      const dy = vertical / length;
      player.facing = { x: dx, y: dy };
      player.x = Math.max(42, Math.min(918, player.x + dx * 175 * delta));
      player.y = Math.max(42, Math.min(558, player.y + dy * 175 * delta));
    }
    attackCooldown = Math.max(0, attackCooldown - delta);
    slashTime = Math.max(0, slashTime - delta);
    player.invulnerable = Math.max(0, player.invulnerable - delta);
    updateEnemies(delta);
    if (!active) {
      return;
    }
    const minionsCleared = enemies.filter((enemy) => !enemy.isBoss).every((enemy) => enemy.dead);
    const waitingBoss = enemies.find((enemy) => enemy.isBoss && enemy.waiting);
    if (minionsCleared && waitingBoss) {
      waitingBoss.waiting = false;
      status.textContent = wave === 5 ? "Syvyyden kuningas nousi esiin!" : "Solan vartija heräsi!";
    } else if (enemies.every((enemy) => enemy.dead)) {
      if (wave < 5) {
        showOverlay("AALTO SELVITETTY", `Aalto ${wave} voitettu`, "Keräsit vihollisten pudottamat kolikot. Seuraava aalto on vaarallisempi.", "Jatka seuraavaan aaltoon", startWave);
      } else {
        finishRun(true);
      }
    }
    renderArena();
    renderHud();
    if (active) {
      requestAnimationFrame(gameLoop);
    }
  }

  document.querySelectorAll("[data-combat-move]").forEach((button) => {
    const keyByDirection = { up: "w", left: "a", down: "s", right: "d" };
    const key = keyByDirection[button.dataset.combatMove];
    const press = (event) => {
      event.preventDefault();
      keysDown.add(key);
    };
    const release = () => keysDown.delete(key);
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });
  document.querySelector("[data-combat-attack]").addEventListener("click", attack);
  game.addEventListener("contextmenu", (event) => event.preventDefault());
  game.addEventListener("pointermove", (event) => {
    const bounds = game.getBoundingClientRect();
    pointerAim = {
      x: (event.clientX - bounds.left) * game.width / bounds.width,
      y: (event.clientY - bounds.top) * game.height / bounds.height
    };
  });
  game.addEventListener("pointerdown", (event) => {
    if (event.button === 0 || event.button === 2) {
      attack();
    }
  });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (!active) {
      return;
    }
    if (key === " " || key === "spacebar") {
      event.preventDefault();
      attack();
      return;
    }
    if (movement[key]) {
      event.preventDefault();
      keysDown.add(key);
    }
  });
  window.addEventListener("keyup", (event) => keysDown.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => keysDown.clear());
  overlayAction.onclick = startWave;
  renderHud();
  renderArena();
})();
