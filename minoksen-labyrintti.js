(() => {
  const game = document.querySelector("[data-minos-game]");
  const castleWelcome = document.querySelector(".minotaur-castle-welcome");
  const castleInterior = document.querySelector("[data-minotaur-castle-interior]");
  if (!game || !castleWelcome || !castleInterior) {
    return;
  }

  const canvas = game.querySelector("[data-minos-canvas]");
  const canvas3d = game.querySelector("[data-minos-3d-canvas]");
  const fullscreenButton = game.querySelector("[data-minos-4k-fullscreen]");
  const context = canvas.getContext("2d");
  const overlay = game.querySelector("[data-minos-overlay]");
  const overlayEyebrow = game.querySelector("[data-minos-overlay-eyebrow]");
  const overlayTitle = game.querySelector("[data-minos-overlay-title]");
  const overlayCopy = game.querySelector("[data-minos-overlay-copy]");
  const overlayAction = game.querySelector("[data-minos-overlay-action]");
  const status = game.querySelector("[data-minos-status]");
  const healthDisplay = game.querySelector("[data-minos-health]");
  const weaponDisplay = game.querySelector("[data-minos-weapon]");
  const coinsDisplay = game.querySelector("[data-minos-coins]");
  const roomDisplay = game.querySelector("[data-minos-room]");
  const levelDisplay = game.querySelector("[data-minos-level]");
  const manaDisplay = game.querySelector("[data-minos-mana]");
  const potionDisplay = game.querySelector("[data-minos-potions]");
  const xpText = game.querySelector("[data-minos-xp-text]");
  const xpProgress = game.querySelector("[data-minos-xp-progress]");
  const xpBar = game.querySelector("[data-minos-xp-bar]");
  const questDisplay = game.querySelector("[data-minos-quest]");
  const mapElement = document.querySelector("[data-minos-map]");
  const mapStatus = document.querySelector("[data-minos-map-status]");
  const ownerForm = document.querySelector("[data-minos-owner-form]");
  const ownerFeedback = document.querySelector("[data-minos-owner-feedback]");
  const ownerShop = document.querySelector("[data-minos-owner-shop]");
  const checkpointStorageKey = "secret-site-minos-checkpoint";
  const bossCountStorageKey = "secret-site-minos-bosses-defeated";
  const firstBossStorageKey = "secret-site-minos-first-boss-defeated";
  const hiddenRouteStorageKey = "secret-site-minos-hidden-route";
  const weaponsStorageKey = "secret-site-minos-weapons";
  const equippedWeaponStorageKey = "secret-site-minos-equipped";
  const coinsStorageKey = "secret-site-coins";
  const rpgStorageKey = "secret-site-minos-rpg";
  const mapStorageKey = "secret-site-minos-map-progress";
  const minotaurPageStorageKey = "secret-site-minotaur-castle-opened";
  const minos4kStorageKey = "secret-site-minos-4k-3d";
  const minos4kForm = document.querySelector("[data-minos-4k-form]");
  const minos4kStatus = document.querySelector("[data-minos-4k-status]");
  const crownGate = document.querySelector("[data-minos-crown-gate]");
  const crownArt = document.querySelector("[data-minos-crown-art]");
  const crownForm = document.querySelector("[data-minos-crown-form]");
  const crownFeedback = document.querySelector("[data-minos-crown-feedback]");
  const hiddenRoute = document.querySelector("[data-minos-hidden-route]");
  const bossTrialButton = document.querySelector("[data-minos-boss-trial]");
  const bossStatus = document.querySelector("[data-minos-boss-status]");
  const checkpointStatus = document.querySelector("[data-minos-checkpoint-status]");
  const shop = document.querySelector("[data-minos-weapon-shop]");
  const suppliesShop = document.querySelector("[data-minos-supplies-shop]");
  const soulButton = game.querySelector("[data-minos-souls]");
  const forgeBalance = document.querySelector("[data-minos-forge-balance]");
  const forgeStatus = document.querySelector("[data-minos-forge-status]");
  const weaponInventory = document.querySelector("[data-minos-inventory]");
  const arenaWidth = canvas.width;
  const arenaHeight = canvas.height;
  const movementKeys = {
    w: [0, -1],
    arrowup: [0, -1],
    a: [-1, 0],
    arrowleft: [-1, 0],
    s: [0, 1],
    arrowdown: [0, 1],
    d: [1, 0],
    arrowright: [1, 0]
  };
  const fields = [
    { name: "Tuhkainen eteishalli", icon: "🏛️", terrain: "hall" },
    { name: "Juurtunut puutarha", icon: "🌿", terrain: "garden" },
    { name: "Kaikujen silta", icon: "🌉", terrain: "bridge" },
    { name: "Tuhkakaaren taistelukenttä", icon: "🔥", terrain: "cinder" },
    { name: "Tuhkakaaren etupiha", icon: "🏚️", terrain: "hall" },
    { name: "Unohtunut asevarasto", icon: "⚒️", terrain: "cinder" },
    { name: "Sielujen rotko", icon: "👻", terrain: "bridge" },
    { name: "Varjokruunun pyhäkkö", icon: "👑", terrain: "throne" },
    { name: "Myrskyportti", icon: "🌩️", terrain: "cinder" },
    { name: "Minotauruksen valtaistuin", icon: "🐂", terrain: "throne", boss: true, bossName: "Minotaurus" },
    { name: "Mustan graniitin käytävä", icon: "🪨", terrain: "hall" },
    { name: "Hehkuvan tuhkan ranta", icon: "🌋", terrain: "cinder" },
    { name: "Kuiskausten hauta", icon: "🪦", terrain: "throne" },
    { name: "Lasinsirpaleiden sola", icon: "💎", terrain: "bridge" },
    { name: "Tuhkavartijan linnake", icon: "🛡️", terrain: "hall", boss: true, bossName: "Tuhkavartija", bossIcon: "🛡️" },
    { name: "Kuun pimeä puutarha", icon: "🌘", terrain: "garden" },
    { name: "Kirottujen aseiden hauta", icon: "⚔️", terrain: "cinder" },
    { name: "Luiden kaikukuilu", icon: "🦴", terrain: "bridge" },
    { name: "Sielunkutojan sali", icon: "🧵", terrain: "throne" },
    { name: "Sielunkutojan valtaistuin", icon: "🕸️", terrain: "throne", boss: true, bossName: "Sielunkutoja", bossIcon: "🕷️" },
    { name: "Ukkosrintaman reuna", icon: "🌩️", terrain: "cinder" },
    { name: "Salamakaaren silta", icon: "⚡", terrain: "bridge" },
    { name: "Myrskynsilmä", icon: "🌪️", terrain: "hall" },
    { name: "Kuningattaren varjo", icon: "👑", terrain: "garden" },
    { name: "Myrskytyrannin valtaistuin", icon: "🌩️", terrain: "throne", boss: true, bossName: "Myrskytyranni", bossIcon: "⚡" },
    { name: "Ajan särö", icon: "⌛", terrain: "bridge" },
    { name: "Käänteisten portaiden sali", icon: "🌀", terrain: "hall" },
    { name: "Tyhjyyden kirjasto", icon: "📚", terrain: "throne" },
    { name: "Kadonneiden kuninkaiden piha", icon: "🏰", terrain: "cinder" },
    { name: "Varjokeisarin valtaistuin", icon: "👁️", terrain: "throne", boss: true, bossName: "Varjokeisari", bossIcon: "👁️" },
    { name: "Kimmeltävän malmin kuilu", icon: "💠", terrain: "bridge" },
    { name: "Savunpeittämä kappeli", icon: "🕯️", terrain: "hall" },
    { name: "Käärmekuninkaan puutarha", icon: "🐍", terrain: "garden" },
    { name: "Kuparinen taistelusola", icon: "🟠", terrain: "cinder" },
    { name: "Malminvartijan valtaistuin", icon: "⛏️", terrain: "throne", boss: true, bossName: "Malminvartija", bossIcon: "⛏️" },
    { name: "Jäätyneen kellon käytävä", icon: "🧊", terrain: "bridge" },
    { name: "Hiljaisuuden asevarasto", icon: "⚔️", terrain: "hall" },
    { name: "Varjokuningattaren lehto", icon: "🌑", terrain: "garden" },
    { name: "Mustan lasin rotko", icon: "🪞", terrain: "cinder" },
    { name: "Lasimyrskyn valtaistuin", icon: "💎", terrain: "throne", boss: true, bossName: "Lasimyrskyn valtias", bossIcon: "💎" },
    { name: "Tähtipölyn observatorio", icon: "✨", terrain: "hall" },
    { name: "Kuunputouksen silta", icon: "🌙", terrain: "bridge" },
    { name: "Kivettynyt jättiläismetsä", icon: "🌳", terrain: "garden" },
    { name: "Tuhkavirran sydän", icon: "🌋", terrain: "cinder" },
    { name: "Tuhkafenixin pesä", icon: "🔥", terrain: "throne", boss: true, bossName: "Tuhkafenix", bossIcon: "🔥" },
    { name: "Syvänteen juuristo", icon: "🌿", terrain: "garden" },
    { name: "Kruunuttomien kuninkaiden hauta", icon: "⚰️", terrain: "hall" },
    { name: "Ajan viimeinen silta", icon: "⌛", terrain: "bridge" },
    { name: "Maailmojen välipiha", icon: "🌀", terrain: "cinder" },
    { name: "Ikuisuuden portinvartijan valtaistuin", icon: "🔱", terrain: "throne", boss: true, bossName: "Ikuisuuden portinvartija", bossIcon: "🔱" }
  ];
  const supplies = [
    { id: "health-potion", name: "Parannusjuoma", icon: "🧪", description: "Palauttaa 45 elämäpistettä.", price: 25 },
    { id: "mana-potion", name: "Manajuoma", icon: "🔷", description: "Palauttaa 45 manaa.", price: 20 }
  ];
  let rpgProgress = readRpgProgress();
  let mapProgress = readMapProgress();
  let mana = 100;
  let spellCooldown = 0;
  let soulCooldown = 0;
  let soulEffects = [];
  let roomQuestAwarded = false;
  let selectedMapField = null;
  let minos3dRenderer = null;
  let is4kModeEnabled = localStorage.getItem(minos4kStorageKey) === "1";
  document.body.classList.toggle("minos-4k-enabled", is4kModeEnabled);
  if (fullscreenButton) {
    fullscreenButton.hidden = !is4kModeEnabled;
  }
  const rarities = {
    common: { label: "Common", damage: 30, price: 35, color: "#d9d4c8" },
    uncommon: { label: "Uncommon", damage: 38, price: 75, color: "#8ce0a4" },
    rare: { label: "Rare", damage: 47, price: 140, color: "#76c7ff" },
    epic: { label: "Epic", damage: 58, price: 240, color: "#c89aff" },
    legendary: { label: "Legendary", damage: 72, price: 420, color: "#ffd36f" },
    mythic: { label: "Mythic", damage: 88, price: 680, color: "#ff9ed8" },
    godly: { label: "Godly", damage: 108, price: 1050, color: "#fff1a3" },
    cursed: { label: "Cursed", damage: 130, price: null, color: "#f27889" }
  };
  const shopWeapons = [
    { id: "bronze-sword", name: "Pronssimiekka", rarity: "common", icon: "🗡️" },
    { id: "thorn-spear", name: "Orjantappurakeihäs", rarity: "uncommon", icon: "🔱" },
    { id: "moon-axe", name: "Kuunkirves", rarity: "rare", icon: "🪓" },
    { id: "storm-blade", name: "Myrskyterä", rarity: "epic", icon: "⚔️" },
    { id: "sun-forged-greatsword", name: "Auringontakojan suurmiekka", rarity: "legendary", icon: "🌟" },
    { id: "void-scythe", name: "Tyhjyyden viikate", rarity: "mythic", icon: "🌙" },
    { id: "worldbreaker", name: "Maailmanmurtaja", rarity: "godly", icon: "💫" },
    { id: "soulstorm-halberd", name: "Sielumyrskyn halbardi", rarity: "godly", icon: "🌪️", damage: 350, price: 1250 },
    { id: "eclipse-greatsword", name: "Pimennysten suurmiekka", rarity: "godly", icon: "🌑", damage: 700, price: 3200 },
    { id: "worlds-end-edge", name: "Maailmanlopun terä", rarity: "godly", icon: "🌠", damage: 1200, price: 7000 }
  ].map((weapon) => ({
    ...weapon,
    damage: weapon.damage ?? rarities[weapon.rarity].damage,
    price: weapon.price ?? rarities[weapon.rarity].price
  }));
  const cursedWeapons = [
    { id: "owner-cursed-silence", name: "Äänetön kirous", icon: "🩸", damage: 300 },
    { id: "owner-minos-shadow", name: "Minoksen varjo", icon: "🌑", damage: 650 },
    { id: "owner-last-blade", name: "Kielletty viimeinen terä", icon: "☠️", damage: 1000 },
    { id: "owner-ashbreaker", name: "Tuhkakuninkaan murskaaja", icon: "🔥", damage: 1800 },
    { id: "owner-soul-eater", name: "Sielunsyöjä", icon: "👻", damage: 3200 },
    { id: "owner-void-crown", name: "Tyhjyyden kruunuterä", icon: "👁️", damage: 5000 }
  ].map((weapon) => ({ ...weapon, rarity: "cursed", price: null }));
  const bossWeaponNames = {
    legendary: ["Auringontakojan miekka", "Minoksen sarvikeihäs", "Tuhkakruunun kirves"],
    mythic: ["Luolaston sydän", "Aikojen halki kulkeva terä", "Tähtisumun viikate"],
    godly: ["Maailmanmurtaja", "Kahdeksan taivaan miekka", "Jumalten viimeinen valo"]
  };
  let coins = readCoins();
  let ownedWeapons = readWeaponCollection();
  let equippedWeapon = readEquippedWeapon();
  let bossCount = readInteger(bossCountStorageKey, 0);
  let firstBossDefeated = localStorage.getItem(firstBossStorageKey) === "1";
  let hiddenRouteUnlocked = localStorage.getItem(hiddenRouteStorageKey) === "1";
  const savedCheckpoint = localStorage.getItem(checkpointStorageKey);
  let roomNumber = 1;
  let checkpointRoom = savedCheckpoint === "1"
    ? 2
    : Math.max(1, Math.min(2, readInteger(checkpointStorageKey, 1)));
  let checkpointActive = savedCheckpoint !== null && checkpointRoom >= 2;
  let active = false;
  let trialMode = false;
  let lastFrameTime = 0;
  let attackCooldown = 0;
  let slashTimer = 0;
  let spellFlash = 0;
  let exitOpen = false;
  let roomDecor = [];
  let player = null;
  let enemies = [];
  let boss = null;
  let lootDrops = [];
  let keysDown = new Set();
  let gameFinished = false;

  function readInteger(key, fallback) {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return fallback;
    }
    const value = Number(stored);
    if (Number.isSafeInteger(value) && value >= 0) {
      return value;
    }
    console.error(`Minoksen edistymisavaimen ${key} lukeminen epäonnistui.`);
    localStorage.setItem(key, String(fallback));
    return fallback;
  }

  function readCoins() {
    const stored = localStorage.getItem(coinsStorageKey);
    if (stored === null) {
      return 0;
    }
    const value = Number(stored);
    if (Number.isSafeInteger(value) && value >= 0) {
      return value;
    }
    console.error("Minoksen kolikkosaldon lukeminen epäonnistui.");
    localStorage.setItem(coinsStorageKey, "0");
    return 0;
  }

  function readRpgProgress() {
    const defaults = { level: 1, xp: 0, healthPotions: 2, manaPotions: 1 };
    const stored = localStorage.getItem(rpgStorageKey);
    if (stored === null) {
      return defaults;
    }
    try {
      const saved = JSON.parse(stored);
      if (
        saved
        && Number.isSafeInteger(saved.level) && saved.level >= 1
        && Number.isSafeInteger(saved.xp) && saved.xp >= 0
        && Number.isSafeInteger(saved.healthPotions) && saved.healthPotions >= 0
        && Number.isSafeInteger(saved.manaPotions) && saved.manaPotions >= 0
      ) {
        return {
          level: Math.min(saved.level, 100),
          xp: saved.xp,
          healthPotions: Math.min(saved.healthPotions, 99),
          manaPotions: Math.min(saved.manaPotions, 99)
        };
      }
    } catch (error) {
      console.error("Minoksen roolipeliedistymän lukeminen epäonnistui.", error);
    }
    console.error("Minoksen roolipeliedistymän tiedot eivät kelpaa; käytetään aloitustietoja.");
    return defaults;
  }

  function saveRpgProgress() {
    localStorage.setItem(rpgStorageKey, JSON.stringify(rpgProgress));
  }

  function readMapProgress() {
    const stored = localStorage.getItem(mapStorageKey);
    if (stored === null) {
      return { unlocked: 1, cleared: [] };
    }
    try {
      const saved = JSON.parse(stored);
      if (
        saved
        && Number.isSafeInteger(saved.unlocked)
        && Array.isArray(saved.cleared)
        && saved.cleared.every((field) => Number.isSafeInteger(field) && field >= 1 && field <= fields.length)
      ) {
        return {
          unlocked: Math.max(
            1,
            Math.min(
              fields.length,
              saved.cleared.includes(10)
                ? Math.max(saved.unlocked, 11)
                : saved.cleared.includes(5)
                  ? Math.max(saved.unlocked, 6)
                  : saved.unlocked
            )
          ),
          cleared: [...new Set(saved.cleared)]
        };
      }
    } catch (error) {
      console.error("Minoksen karttaedistymän lukeminen epäonnistui.", error);
    }
    console.error("Minoksen karttaedistymän tiedot eivät kelpaa; käytetään aloitusreittiä.");
    return { unlocked: 1, cleared: [] };
  }

  function saveMapProgress() {
    localStorage.setItem(mapStorageKey, JSON.stringify(mapProgress));
  }

  function renderMap() {
    if (!mapElement) {
      return;
    }
    mapElement.replaceChildren();
    fields.forEach((field, index) => {
      const fieldNumber = index + 1;
      const node = document.createElement("button");
      const isUnlocked = fieldNumber <= mapProgress.unlocked;
      const isCleared = mapProgress.cleared.includes(fieldNumber);
      node.type = "button";
      node.className = `minos-map-node${isCleared ? " is-cleared" : ""}${isUnlocked ? " is-unlocked" : " is-locked"}`;
      node.disabled = !isUnlocked;
      node.setAttribute("aria-label", `${fieldNumber}. kenttä: ${field.name}${isCleared ? ", suoritettu" : isUnlocked ? ", avoinna" : ", lukittu"}`);
      const marker = document.createElement("span");
      marker.className = "minos-map-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = isCleared ? "✓" : isUnlocked ? field.icon : "🔒";
      const title = document.createElement("strong");
      title.textContent = `${fieldNumber}. ${field.name}`;
      const state = document.createElement("small");
      state.textContent = isCleared
        ? "Kenttä suoritettu"
        : isUnlocked
          ? field.boss
            ? `Pomo: ${field.bossName}`
            : "Astu kenttään"
          : "Etene edelliseen kenttään";
      node.append(marker, title, state);
      node.addEventListener("click", () => {
        if (fieldNumber > mapProgress.unlocked) {
          return;
        }
        hiddenRoute.scrollIntoView({ behavior: "smooth", block: "start" });
        game.hidden = false;
        game.scrollIntoView({ behavior: "smooth", block: "center" });
        prepareRun(true, fieldNumber);
      });
      mapElement.append(node);
      if (fieldNumber < fields.length) {
        const path = document.createElement("span");
        path.className = `minos-map-connector${isCleared ? " is-cleared" : ""}`;
        path.setAttribute("aria-hidden", "true");
        mapElement.append(path);
      }
    });
  }

  function completeMapField(fieldNumber) {
    if (!mapProgress.cleared.includes(fieldNumber)) {
      mapProgress.cleared.push(fieldNumber);
    }
    mapProgress.unlocked = Math.max(mapProgress.unlocked, Math.min(fields.length, fieldNumber + 1));
    saveMapProgress();
    renderMap();
    if (mapStatus) {
      mapStatus.textContent = fieldNumber === fields.length
        ? `Kartta suoritettu! ${fields[fieldNumber - 1].bossName} on kukistettu.`
        : `${fields[fieldNumber - 1].name} suoritettu! Seuraava kenttä avautui kartalla.`;
    }
  }

  function xpToNextLevel() {
    return rpgProgress.level * 100;
  }

  function awardExperience(amount) {
    rpgProgress.xp += amount;
    let levelsGained = 0;
    while (rpgProgress.level < 100 && rpgProgress.xp >= xpToNextLevel()) {
      rpgProgress.xp -= xpToNextLevel();
      rpgProgress.level += 1;
      levelsGained += 1;
    }
    if (levelsGained && player) {
      player.maxHealth += levelsGained * 15;
      player.health = player.maxHealth;
      status.textContent = `Taso nousi tasolle ${rpgProgress.level}! Maksimielämä kasvoi ja elämä palautui.`;
      awardCoins(levelsGained * 15);
    }
    if (rpgProgress.level === 100) {
      rpgProgress.xp = Math.min(rpgProgress.xp, xpToNextLevel() - 1);
    }
    saveRpgProgress();
    renderStats();
  }

  function readWeaponCollection() {
    try {
      const saved = JSON.parse(localStorage.getItem(weaponsStorageKey) || "[]");
      if (Array.isArray(saved)) {
        const validWeapons = saved.filter((weapon) =>
          weapon
          && typeof weapon.id === "string"
          && typeof weapon.name === "string"
          && Object.prototype.hasOwnProperty.call(rarities, weapon.rarity)
          && Number.isFinite(weapon.damage)
          && (weapon.rarity !== "cursed" || cursedWeapons.some(({ id }) => id === weapon.id))
        );
        if (validWeapons.length) {
          return validWeapons.map((weapon) => {
            const ownerWeapon = weapon.rarity === "cursed"
              ? cursedWeapons.find(({ id }) => id === weapon.id)
              : null;
            return ownerWeapon ? { ...ownerWeapon } : weapon;
          });
        }
      }
    } catch (error) {
      console.error("Asekokoelman lukeminen epäonnistui.", error);
    }
    return [{ id: "training-sword", name: "Harjoitusmiekka", rarity: "common", icon: "🗡️", damage: 28, price: null }];
  }

  function readEquippedWeapon() {
    const savedId = localStorage.getItem(equippedWeaponStorageKey);
    return ownedWeapons.find((weapon) => weapon.id === savedId) || ownedWeapons[0];
  }

  function saveWeapons() {
    localStorage.setItem(weaponsStorageKey, JSON.stringify(ownedWeapons));
    localStorage.setItem(equippedWeaponStorageKey, equippedWeapon.id);
  }

  function updateCoinDisplays() {
    coins = readCoins();
    coinsDisplay.textContent = `🪙 ${coins}`;
    if (forgeBalance) {
      forgeBalance.textContent = `🪙 ${coins} kolikkoa`;
    }
    const purse = document.querySelector(".coin-purse");
    if (purse) {
      purse.textContent = `🪙 ${coins} kolikkoa`;
    }
    document.querySelectorAll("[data-anglerfish-balance]").forEach((label) => {
      label.textContent = String(coins);
    });
  }

  function awardCoins(amount) {
    coins = readCoins() + amount;
    localStorage.setItem(coinsStorageKey, String(coins));
    updateCoinDisplays();
  }

  function renderWeapons() {
    if (shop) {
      shop.replaceChildren();
      shopWeapons.forEach((weapon) => {
        const card = document.createElement("article");
        card.className = "minos-weapon-card";
        card.style.setProperty("--weapon-rarity-color", rarities[weapon.rarity].color);
        const title = document.createElement("h4");
        title.textContent = `${weapon.icon} ${weapon.name}`;
        const rarity = document.createElement("p");
        rarity.className = `minos-rarity minos-rarity--${weapon.rarity}`;
        rarity.textContent = `${rarities[weapon.rarity].label} · vahinko ${weapon.damage}`;
        const buy = document.createElement("button");
        buy.type = "button";
        buy.className = "minos-weapon-buy";
        buy.textContent = ownedWeapons.some(({ id }) => id === weapon.id)
          ? equippedWeapon.id === weapon.id ? "Käytössä" : "Omistat jo"
          : `Osta · ${weapon.price} kolikkoa`;
        buy.disabled = ownedWeapons.some(({ id }) => id === weapon.id);
        buy.addEventListener("click", () => {
          if (coins < weapon.price) {
            if (forgeStatus) {
              forgeStatus.textContent = `Kolikot eivät riitä. Tarvitset vielä ${weapon.price - coins} kolikkoa.`;
            }
            return;
          }
          coins -= weapon.price;
          localStorage.setItem(coinsStorageKey, String(coins));
          ownedWeapons.push(weapon);
          equippedWeapon = weapon;
          saveWeapons();
          if (forgeStatus) {
            forgeStatus.textContent = `${weapon.name} ostettu ja varustettu.`;
          }
          updateCoinDisplays();
          renderWeapons();
          renderInventory();
          renderStats();
        });
        card.append(title, rarity, buy);
        shop.append(card);
      });
    }
    if (suppliesShop) {
      suppliesShop.replaceChildren();
      supplies.forEach((supply) => {
        const card = document.createElement("article");
        card.className = "minos-weapon-card";
        const title = document.createElement("h4");
        title.textContent = `${supply.icon} ${supply.name}`;
        const description = document.createElement("p");
        description.className = "minos-supply-description";
        description.textContent = supply.description;
        const buy = document.createElement("button");
        buy.type = "button";
        buy.className = "minos-weapon-buy";
        buy.textContent = `Osta · ${supply.price} kolikkoa`;
        buy.addEventListener("click", () => {
          if (coins < supply.price) {
            if (forgeStatus) {
              forgeStatus.textContent = `Kolikot eivät riitä. Tarvitset vielä ${supply.price - coins} kolikkoa.`;
            }
            return;
          }
          const stockKey = supply.id === "health-potion" ? "healthPotions" : "manaPotions";
          if (rpgProgress[stockKey] >= 99) {
            if (forgeStatus) {
              forgeStatus.textContent = "Juomapullot eivät mahdu enempää reppuun.";
            }
            return;
          }
          coins -= supply.price;
          rpgProgress[stockKey] += 1;
          localStorage.setItem(coinsStorageKey, String(coins));
          saveRpgProgress();
          updateCoinDisplays();
          renderStats();
          if (forgeStatus) {
            forgeStatus.textContent = `${supply.name} lisättiin reppuun.`;
          }
        });
        card.append(title, description, buy);
        suppliesShop.append(card);
      });
    }
    renderOwnerWeapons();
    renderInventory();
  }

  function renderOwnerWeapons() {
    if (!ownerShop || ownerShop.hidden) {
      return;
    }
    ownerShop.replaceChildren();
    cursedWeapons.forEach((weapon) => {
      const card = document.createElement("article");
      card.className = "minos-weapon-card";
      card.style.setProperty("--weapon-rarity-color", rarities.cursed.color);
      const title = document.createElement("h4");
      title.textContent = `${weapon.icon} ${weapon.name}`;
      const rarity = document.createElement("p");
      rarity.className = "minos-rarity minos-rarity--cursed";
      rarity.textContent = `Cursed · vahinko ${weapon.damage} · vain omistajalle`;
      const alreadyOwned = ownedWeapons.some(({ id }) => id === weapon.id);
      const claim = document.createElement("button");
      claim.type = "button";
      claim.className = "minos-weapon-buy";
      claim.textContent = alreadyOwned ? "Omistat jo" : "Ota omistajan ase";
      claim.disabled = alreadyOwned;
      claim.addEventListener("click", () => {
        if (ownedWeapons.some(({ id }) => id === weapon.id)) {
          return;
        }
        ownedWeapons.push(weapon);
        equippedWeapon = weapon;
        saveWeapons();
        renderWeapons();
        renderStats();
        if (ownerFeedback) {
          ownerFeedback.textContent = `${weapon.name} lisättiin omistajan asevarastoon ja varustettiin.`;
        }
      });
      card.append(title, rarity, claim);
      ownerShop.append(card);
    });
  }

  function renderInventory() {
    if (!weaponInventory) {
      return;
    }
    weaponInventory.replaceChildren();
    ownedWeapons.forEach((weapon) => {
      const item = document.createElement("li");
      item.className = `minos-owned-weapon minos-rarity--${weapon.rarity}`;
      const name = document.createElement("span");
      name.textContent = `${weapon.icon} ${weapon.name} · ${rarities[weapon.rarity].label} · ${weapon.damage} vahinko`;
      item.append(name);
      if (equippedWeapon.id === weapon.id) {
        const equipped = document.createElement("strong");
        equipped.textContent = "Käytössä";
        item.append(equipped);
      } else {
        const equip = document.createElement("button");
        equip.type = "button";
        equip.textContent = "Varusta";
        equip.addEventListener("click", () => {
          equippedWeapon = weapon;
          saveWeapons();
          renderWeapons();
          renderStats();
        });
        item.append(equip);
      }
      weaponInventory.append(item);
    });
  }

  function renderStats() {
    healthDisplay.textContent = `❤️ ${Math.ceil(player?.health ?? 100)} / ${player?.maxHealth ?? 100}`;
    weaponDisplay.textContent = `⚔️ ${equippedWeapon.name}`;
    roomDisplay.textContent = `${roomNumber} / ${fields.length} · ${fields[roomNumber - 1].name}`;
    levelDisplay.textContent = `Taso ${rpgProgress.level}`;
    manaDisplay.textContent = `🔷 ${Math.ceil(mana)} / 100`;
    potionDisplay.textContent = `🧪 H${rpgProgress.healthPotions} · M${rpgProgress.manaPotions}`;
    xpText.textContent = `${rpgProgress.xp} / ${xpToNextLevel()} XP`;
    xpBar.style.width = `${Math.min(100, (rpgProgress.xp / xpToNextLevel()) * 100)}%`;
    xpProgress.setAttribute("aria-valuemax", String(xpToNextLevel()));
    xpProgress.setAttribute("aria-valuenow", String(Math.min(rpgProgress.xp, xpToNextLevel())));
    updateCoinDisplays();
  }

  function makeEnemy(x, y, isBoss, index) {
    const stage = roomNumber;
    const isChampion = !isBoss && stage >= 7 && index % 3 === 0;
    const championHealth = 1250 + Math.max(0, stage - 7) * 260;
    const regularHealth = 38 + Math.floor(Math.random() * 16) + Math.max(0, stage - 5) * 55;
    const bossHealth = 10000 + Math.max(0, stage - 10) * 2000 + Math.max(0, bossCount - 1) * 500 + (rpgProgress.level - 1) * 80;
    const field = fields[stage - 1];
    return {
      x,
      y,
      health: isBoss ? bossHealth : isChampion ? championHealth : regularHealth,
      maxHealth: isBoss ? bossHealth : isChampion ? championHealth : regularHealth,
      speed: isBoss ? 50 : isChampion ? 26 : 34 + Math.random() * 12,
      isBoss,
      isChampion,
      icon: isBoss ? field.bossIcon || field.icon : isChampion ? "👺" : ["💀", "🦴", "👹"][index % 3],
      name: isBoss ? field.bossName : null,
      attackTimer: 0,
      hitFlash: 0,
      dead: false
    };
  }

  function createRoomDecor(seed) {
    let value = seed;
    const random = () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
    const decor = [];
    for (let index = 0; index < 19; index += 1) {
      decor.push({
        x: 54 + random() * (arenaWidth - 108),
        y: 54 + random() * (arenaHeight - 108),
        size: 2 + random() * 4,
        glow: random()
      });
    }
    return decor;
  }

  function loadRoom(nextRoom) {
    roomNumber = Math.max(1, Math.min(fields.length, nextRoom));
    exitOpen = false;
    roomQuestAwarded = false;
    roomDecor = createRoomDecor(26471 + roomNumber * 137 + bossCount);
    player.x = arenaWidth / 2;
    player.y = arenaHeight - 76;
    player.health = Math.min(player.maxHealth, player.health + (roomNumber > 1 ? 18 : 0));
    mana = Math.min(100, mana + (roomNumber > 1 ? 25 : 0));
    enemies = [];
    lootDrops = [];
    const counts = [4, 5, 5, 6, 3, 5, 6, 6, 7, 8];
    const count = counts[roomNumber - 1] ?? Math.min(8, 5 + Math.floor((roomNumber - 10) / 4));
    const spawnPoints = [
      [arenaWidth * 0.2, arenaHeight * 0.22],
      [arenaWidth * 0.5, arenaHeight * 0.2],
      [arenaWidth * 0.8, arenaHeight * 0.22],
      [arenaWidth * 0.22, arenaHeight * 0.5],
      [arenaWidth * 0.78, arenaHeight * 0.5],
      [arenaWidth * 0.35, arenaHeight * 0.4],
      [arenaWidth * 0.65, arenaHeight * 0.4],
      [arenaWidth * 0.5, arenaHeight * 0.56]
    ];
    for (let index = 0; index < count; index += 1) {
      const [x, y] = spawnPoints[index];
      enemies.push(makeEnemy(x, y, false, index));
    }
    const field = fields[roomNumber - 1];
    boss = field.boss ? makeEnemy(arenaWidth / 2, arenaHeight * 0.39, true, 0) : null;
    if (roomNumber === 2 && !checkpointActive) {
      checkpointActive = true;
      checkpointRoom = 2;
      localStorage.setItem(checkpointStorageKey, "2");
      if (checkpointStatus) {
        checkpointStatus.textContent = `Checkpoint huoneessa ${roomNumber} tallennettu.`;
      }
    }
    if (boss) {
      boss.waiting = true;
    }
    roomDisplay.textContent = `${roomNumber} / ${fields.length} · ${fields[roomNumber - 1].name}`;
    status.textContent = boss
      ? `Kukista vartijat herättääksesi ${field.bossName}.`
      : `${fields[roomNumber - 1].name}: kukista kaikki ${count} vihollista avataksesi reitin.`;
    questDisplay.textContent = roomNumber === 1
      ? "Päätehtävä · Tyhjennä eteishalli ja etsi tie syvemmälle."
      : field.boss
        ? `Päätehtävä · Päihitä ${field.bossName} ja avaa tie eteenpäin.`
      : roomNumber === 2
        ? "Päätehtävä · Sytytä Tuhkakaaren checkpoint ja raivaa vartijat."
        : `Päätehtävä · Raivaa ${fields[roomNumber - 1].name} ja etene.`;
  }

  function prepareRun(isTrial, mapFieldNumber = null) {
    trialMode = isTrial;
    if (mapFieldNumber !== null) {
      selectedMapField = mapFieldNumber;
    } else if (!isTrial) {
      selectedMapField = null;
    }
    gameFinished = false;
    attackCooldown = 0;
    slashTimer = 0;
    keysDown.clear();
    mana = 100;
    spellCooldown = 0;
    soulCooldown = 0;
    spellFlash = 0;
    soulEffects = [];
    player = {
      x: arenaWidth / 2,
      y: arenaHeight - 76,
      health: 100 + (rpgProgress.level - 1) * 15,
      maxHealth: 100 + (rpgProgress.level - 1) * 15,
      facing: { x: 0, y: -1 },
      invulnerability: 2.5
    };
    active = true;
    lastFrameTime = 0;
    overlay.hidden = true;
    game.classList.add("is-playing");
    document.querySelector(".minotaur-world").classList.add("minos-game-active");
    const resumeRoom = selectedMapField ?? (isTrial ? fields.length : checkpointActive ? checkpointRoom : 1);
    loadRoom(resumeRoom);
    renderStats();
    canvas.focus();
    requestAnimationFrame(gameLoop);
  }

  function collidesAt(x, y, radius = 11) {
    return x - radius < 34
      || x + radius > arenaWidth - 34
      || y - radius < 34
      || y + radius > arenaHeight - 34;
  }

  function tryMove(entity, dx, dy, radius = 11) {
    if (!collidesAt(entity.x + dx, entity.y, radius)) {
      entity.x += dx;
    }
    if (!collidesAt(entity.x, entity.y + dy, radius)) {
      entity.y += dy;
    }
  }

  function performAttack() {
    if (!active || gameFinished || attackCooldown > 0) {
      return;
    }
    attackCooldown = 0.42;
    slashTimer = 0.22;
    let target = null;
    let nearest = 88;
    [...enemies, boss].forEach((enemy) => {
      if (!enemy || enemy.dead || enemy.waiting) {
        return;
      }
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const facingDot = (dx * player.facing.x + dy * player.facing.y) / Math.max(distance, 1);
      if (distance < nearest && (distance < 38 || facingDot > -0.15)) {
        target = enemy;
        nearest = distance;
      }
    });
    if (!target) {
      status.textContent = "Ase viuhuu ilmassa. Lähesty vihollista ja yritä uudelleen.";
      return;
    }
    target.health -= equippedWeapon.damage + (rpgProgress.level - 1) * 2;
    target.hitFlash = 0.18;
    status.textContent = target.isBoss
      ? `Osuma! ${target.name}n voima ${Math.max(0, Math.ceil(target.health))} / ${target.maxHealth}.`
      : `Osuma! Vihollisen voima ${Math.max(0, Math.ceil(target.health))} / ${target.maxHealth}.`;
    if (target.health <= 0) {
      if (target.isBoss) {
        defeatBoss();
      } else {
        defeatEnemy(target);
      }
    }
    renderStats();
  }

  function defeatEnemy(enemy) {
    if (enemy.dead) {
      return;
    }
    enemy.dead = true;
    const drop = 8 + Math.floor(Math.random() * 13) + Math.max(0, roomNumber - 5) * 12;
    lootDrops.push({ x: enemy.x, y: enemy.y, value: drop, collected: false });
    awardExperience(24);
    status.textContent = `Vihollinen kaatui: +24 XP. Se pudotti ${drop} kolikkoa.`;
  }

  function castSpell() {
    if (!active || gameFinished || spellCooldown > 0) {
      return;
    }
    if (mana < 25) {
      status.textContent = "Mana ei riitä loitsuun. Odota sen palautumista tai käytä manajuoma.";
      return;
    }
    mana -= 25;
    spellCooldown = 0.8;
    spellFlash = 0.45;
    const targets = [...enemies, boss].filter((enemy) => {
      if (!enemy || enemy.dead || enemy.waiting) {
        return false;
      }
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const facingDot = (dx * player.facing.x + dy * player.facing.y) / Math.max(distance, 1);
      return distance < 205 && (distance < 45 || facingDot > 0.15);
    });
    if (!targets.length) {
      status.textContent = "Loitsu osui tyhjään. Suuntaa kohti vihollisia ja yritä uudelleen.";
    } else {
      targets.forEach((target) => {
        target.health -= Math.round(equippedWeapon.damage * 1.65 + rpgProgress.level * 4);
        target.hitFlash = 0.3;
        if (target.health <= 0) {
          if (target.isBoss) {
            defeatBoss();
          } else {
            defeatEnemy(target);
          }
        }
      });
      status.textContent = `Loitsu osui ${targets.length} viholliseen!`;
    }
    renderStats();
  }

  function summonSouls() {
    if (!active || gameFinished) {
      return;
    }
    if (equippedWeapon.id !== "owner-last-blade") {
      status.textContent = "Sielut vastaavat vain Kielletyn viimeisen terän kutsuun.";
      return;
    }
    if (soulCooldown > 0) {
      status.textContent = `Sielut palaavat ${Math.ceil(soulCooldown)} sekunnin kuluttua.`;
      return;
    }
    const targets = [...enemies.filter((enemy) => !enemy.dead), boss]
      .filter((enemy) => enemy && !enemy.dead && !enemy.waiting);
    if (!targets.length) {
      status.textContent = "Tällä kentällä ei ole vihollisia, joihin sielut voisivat käydä.";
      return;
    }

    soulCooldown = 12;
    soulEffects.push(...targets.map((enemy) => ({ x: enemy.x, y: enemy.y, age: 0, seed: Math.random() * Math.PI * 2 })));
    let defeated = 0;
    let bossesHit = 0;
    targets.forEach((target) => {
      target.hitFlash = 0.55;
      if (target.isBoss) {
        const damage = Math.min(1000, Math.max(0, target.health - 1));
        target.health -= damage;
        bossesHit += 1;
      } else {
        target.health -= 1000;
        if (target.health <= 0) {
          defeatEnemy(target);
          defeated += 1;
        }
      }
    });
    status.textContent = bossesHit
      ? `Sielut nousivat maasta: 1 000 vahinkoa per kohde. ${defeated} vihollista kaatui; pomo heikkeni mutta jäi pystyyn.`
      : `Sielut nousivat maasta: 1 000 vahinkoa per vihollinen. ${defeated} vihollista kaatui.`;
    renderStats();
  }

  function usePotion(type) {
    if (!active || gameFinished) {
      return;
    }
    const stockKey = type === "mana" ? "manaPotions" : "healthPotions";
    if (rpgProgress[stockKey] < 1) {
      status.textContent = type === "mana"
        ? "Manajuoma on loppu. Osta lisää aseseppäliikkeestä."
        : "Parannusjuoma on loppu. Osta lisää aseseppäliikkeestä.";
      return;
    }
    if ((type === "mana" && mana >= 100) || (type === "health" && player.health >= player.maxHealth)) {
      status.textContent = type === "mana" ? "Manasi on jo täynnä." : "Elämäsi on jo täynnä.";
      return;
    }
    rpgProgress[stockKey] -= 1;
    if (type === "mana") {
      mana = Math.min(100, mana + 45);
      status.textContent = "Manajuoma palautti 45 manaa.";
    } else {
      player.health = Math.min(player.maxHealth, player.health + 45);
      status.textContent = "Parannusjuoma palautti 45 elämäpistettä.";
    }
    saveRpgProgress();
    renderStats();
  }

  function chooseBossWeapon() {
    const roll = Math.random();
    const rarity = roll < 0.12 ? "godly"
      : roll < 0.38 ? "mythic"
        : "legendary";
    const choices = bossWeaponNames[rarity];
    const name = choices[Math.floor(Math.random() * choices.length)];
    return {
      id: `boss-weapon-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name,
      rarity,
      icon: rarity === "godly" ? "☀️" : rarity === "mythic" ? "🌌" : "⚔️",
      damage: rarities[rarity].damage + 5,
      price: null
    };
  }

  function defeatBoss() {
    gameFinished = true;
    active = false;
    const defeatedField = fields[roomNumber - 1];
    const finalBoss = roomNumber === fields.length;
    const reward = trialMode ? 150 + Math.min(bossCount, 10) * 15 : 100;
    awardCoins(reward);
    awardExperience(150);
    const droppedWeapon = chooseBossWeapon();
    ownedWeapons.push(droppedWeapon);
    equippedWeapon = droppedWeapon;
    saveWeapons();
    renderWeapons();
    localStorage.setItem(bossCountStorageKey, String(bossCount + 1));
    bossCount += 1;
    if (selectedMapField !== null) {
      completeMapField(selectedMapField);
      if (bossStatus) {
        bossStatus.textContent = `${defeatedField.bossName} kaatui! Sait ${reward} kolikkoa ja ${rarities[droppedWeapon.rarity].label}-aseen: ${droppedWeapon.name}.`;
      }
      showOverlay(
        finalBoss ? "SEIKKAILU VOITETTU" : "POMO VOITETTU",
        `${defeatedField.bossName} on kukistettu`,
        `${droppedWeapon.name} (${rarities[droppedWeapon.rarity].label}) liittyi asevarastoosi. ${finalBoss ? "Kartan kaikki kentät ovat nyt suoritettu." : "Seuraava kenttä avautui kartalla."}`,
        "Palaa seikkailukartalle",
        () => returnToMap()
      );
      renderStats();
      return;
    }
    if (trialMode) {
      if (bossStatus) {
        bossStatus.textContent = `Pomo kaatui! Sait ${reward} kolikkoa ja ${rarities[droppedWeapon.rarity].label}-aseen: ${droppedWeapon.name}.`;
      }
      if (checkpointStatus) {
        checkpointStatus.textContent = "Checkpoint pitää sinut turvassa pomokokeiden välissä.";
      }
      showOverlay("POMOKOE VOITETTU", "Uusi ase putosi pomolta!", `${droppedWeapon.name} · ${rarities[droppedWeapon.rarity].label} · ${droppedWeapon.damage} vahinkoa. Sait ${reward} kolikkoa.`, "Haasta seuraava pomo", () => prepareRun(true));
      renderStats();
      return;
    }
    if (!finalBoss) {
      boss.dead = true;
      gameFinished = false;
      active = true;
      status.textContent = `${defeatedField.bossName} kaatui! Sait ${reward} kolikkoa ja aseen: ${droppedWeapon.name}. Tie eteenpäin on auki.`;
      renderStats();
      return;
    }
    firstBossDefeated = true;
    localStorage.setItem(firstBossStorageKey, "1");
    questDisplay.textContent = `Päätehtävä valmis · ${defeatedField.bossName} on voitettu. Kruunu kätkee vielä yhden salaisuuden.`;
    status.textContent = `${defeatedField.bossName} pakeni! ${droppedWeapon.name} (${rarities[droppedWeapon.rarity].label}) putosi maahan.`;
    boss.retreating = true;
    boss.retreatStarted = performance.now();
    const retreat = () => {
      renderArena();
      if (performance.now() - boss.retreatStarted < 1250) {
        requestAnimationFrame(retreat);
        return;
      }
      boss.dead = true;
      renderArena();
      document.querySelector(".minotaur-world").classList.remove("minos-game-active");
      crownGate.hidden = false;
      crownArt.classList.add("is-appearing");
      crownGate.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    requestAnimationFrame(retreat);
    renderStats();
  }

  function returnToMap() {
    selectedMapField = null;
    gameFinished = false;
    active = false;
    document.querySelector(".minotaur-world").classList.remove("minos-game-active");
    renderMap();
    hiddenRoute.scrollIntoView({ behavior: "smooth", block: "start" });
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function showOverlay(eyebrow, title, copy, actionLabel, action) {
    active = false;
    gameFinished = true;
    overlayEyebrow.textContent = eyebrow;
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlayAction.textContent = actionLabel;
    overlay.hidden = false;
    overlayAction.onclick = () => {
      overlay.hidden = true;
      action();
    };
  }

  function hurtPlayer(amount) {
    if (player.invulnerability > 0 || !active) {
      return;
    }
    player.health = Math.max(0, player.health - amount);
    player.invulnerability = 1.05;
    renderStats();
    if (player.health === 0) {
      showOverlay(
        "CHECKPOINT",
        "Taistelukammio kaataa sinut",
        checkpointActive
          ? "Heräät Tuhkakaaren checkpointilla. Aseesi ja kolikkosi säilyvät."
          : "Heräät ensimmäisen taisteluhuoneen alusta. Aseesi ja kolikkosi säilyvät.",
        "Nouse ja jatka",
        () => prepareRun(trialMode)
      );
    } else {
      status.textContent = `Osuma! Elämäpisteitä jäljellä ${Math.ceil(player.health)}.`;
    }
  }

  function updateEnemies(delta) {
    [...enemies, boss].forEach((enemy) => {
      if (!enemy || enemy.dead || enemy.waiting) {
        return;
      }
      enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
      enemy.attackTimer = Math.max(0, enemy.attackTimer - delta);
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 420 && distance > 20) {
        const step = enemy.speed * delta;
        tryMove(enemy, (dx / distance) * step, (dy / distance) * step, enemy.isBoss ? 12 : 8);
      }
      if (distance < (enemy.isBoss ? 32 : 22) && enemy.attackTimer === 0) {
        enemy.attackTimer = enemy.isBoss ? 1 : 1.25;
        hurtPlayer(enemy.isBoss ? 13 : 5);
      }
    });
  }

  function renderArena() {
    if (minos3dRenderer) {
      minos3dRenderer.render({
        player,
        enemies,
        boss,
        roomNumber,
        field: fields[roomNumber - 1],
        equippedWeapon,
        lootDrops,
        exitOpen,
        slashTimer,
        spellFlash,
        soulEffects
      });
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    const floor = context.createLinearGradient(0, 0, arenaWidth, arenaHeight);
    const palette = {
      hall: ["#34303a", "#272630", "#1c1c27", "rgba(255, 180, 95, 0.05)"],
      garden: ["#293b36", "#20312e", "#172321", "rgba(143, 228, 163, 0.07)"],
      bridge: ["#2b3b4b", "#202b3a", "#151d2b", "rgba(126, 201, 255, 0.08)"],
      cinder: ["#49312c", "#352522", "#21191d", "rgba(255, 125, 71, 0.08)"],
      throne: ["#463b30", "#30252a", "#191720", "rgba(255, 210, 115, 0.09)"]
    }[fields[roomNumber - 1].terrain];
    floor.addColorStop(0, palette[0]);
    floor.addColorStop(0.52, palette[1]);
    floor.addColorStop(1, palette[2]);
    context.fillStyle = floor;
    context.fillRect(0, 0, arenaWidth, arenaHeight);

    context.save();
    context.beginPath();
    context.rect(34, 34, arenaWidth - 68, arenaHeight - 68);
    context.clip();
    for (let y = 38; y < arenaHeight; y += 48) {
      for (let x = 38 + (Math.floor(y / 48) % 2) * 24; x < arenaWidth; x += 48) {
        context.fillStyle = "rgba(255, 231, 190, 0.018)";
        context.beginPath();
        context.arc(x, y, 1.4, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.strokeStyle = "rgba(9, 8, 15, 0.34)";
    context.lineWidth = 1;
    for (let x = 88; x < arenaWidth; x += 96) {
      context.beginPath();
      context.moveTo(x, 34);
      context.lineTo(x, arenaHeight - 34);
      context.stroke();
    }
    for (let y = 82; y < arenaHeight; y += 96) {
      context.beginPath();
      context.moveTo(34, y);
      context.lineTo(arenaWidth - 34, y);
      context.stroke();
    }
    roomDecor.forEach((stone) => {
      context.fillStyle = palette[3];
      context.beginPath();
      context.arc(stone.x, stone.y, stone.size, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();

    context.strokeStyle = "rgba(255, 218, 155, 0.42)";
    context.lineWidth = 3;
    context.strokeRect(34, 34, arenaWidth - 68, arenaHeight - 68);
    context.strokeStyle = "rgba(4, 4, 9, 0.78)";
    context.lineWidth = 15;
    context.strokeRect(17, 17, arenaWidth - 34, arenaHeight - 34);

    const torches = [[70, 72], [arenaWidth - 70, 72], [70, arenaHeight - 72], [arenaWidth - 70, arenaHeight - 72]];
    torches.forEach(([x, y], index) => {
      const pulse = 0.72 + Math.sin(performance.now() / 190 + index * 1.7) * 0.18;
      context.fillStyle = `rgba(255, 153, 66, ${0.08 * pulse})`;
      context.beginPath();
      context.arc(x, y, 31 * pulse, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#ffb05b";
      context.shadowColor = "#ff8e42";
      context.shadowBlur = 17;
      context.beginPath();
      context.arc(x, y, 4.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    if (roomNumber >= 2 && checkpointRoom === roomNumber) {
      context.fillStyle = "rgba(255, 143, 63, 0.12)";
      context.beginPath();
      context.arc(arenaWidth / 2, arenaHeight - 75, 38, 0, Math.PI * 2);
      context.fill();
      context.font = "22px Arial";
      context.textAlign = "center";
      context.fillText("🔥", arenaWidth / 2, arenaHeight - 69);
    }

    if (exitOpen && roomNumber < fields.length) {
      const portal = context.createRadialGradient(arenaWidth / 2, 41, 5, arenaWidth / 2, 41, 44);
      portal.addColorStop(0, "rgba(224, 255, 235, 0.95)");
      portal.addColorStop(0.22, "rgba(102, 255, 174, 0.72)");
      portal.addColorStop(1, "rgba(70, 255, 161, 0)");
      context.fillStyle = portal;
      context.beginPath();
      context.ellipse(arenaWidth / 2, 43, 40, 35, 0, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#a8ffd0";
      context.lineWidth = 3;
      context.beginPath();
      context.ellipse(arenaWidth / 2, 42, 18, 30, 0, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#eafff2";
      context.font = "bold 12px Arial";
      context.fillText("SEURAAVA HUONE", arenaWidth / 2, 91);
    }

    lootDrops.forEach((drop) => {
      if (drop.collected) {
        return;
      }
      const shimmer = 0.82 + Math.sin(performance.now() / 145 + drop.x) * 0.18;
      context.save();
      context.translate(drop.x, drop.y);
      context.rotate(Math.PI / 4);
      context.fillStyle = `rgba(255, 218, 101, ${shimmer})`;
      context.shadowColor = "#ffc947";
      context.shadowBlur = 12;
      context.fillRect(-6, -6, 12, 12);
      context.restore();
      context.fillStyle = "#fff1bd";
      context.font = "bold 11px Arial";
      context.textAlign = "center";
      context.fillText(`+${drop.value}`, drop.x, drop.y - 14);
    });
    enemies.forEach(drawEnemy);
    if (boss && !boss.dead) {
      drawEnemy(boss);
    }
    drawSoulEffects();
    if (player) {
      if (spellFlash > 0) {
        const flashProgress = spellFlash / 0.45;
        const spellGlow = context.createRadialGradient(player.x, player.y, 6, player.x, player.y, 205 * (1.1 - flashProgress * 0.25));
        spellGlow.addColorStop(0, `rgba(157, 231, 255, ${0.38 * flashProgress})`);
        spellGlow.addColorStop(0.5, `rgba(118, 126, 255, ${0.2 * flashProgress})`);
        spellGlow.addColorStop(1, "rgba(118, 126, 255, 0)");
        context.fillStyle = spellGlow;
        context.fillRect(0, 0, arenaWidth, arenaHeight);
      }
      context.save();
      context.shadowColor = player.invulnerability > 0 ? "#fff" : "#89f5ff";
      context.shadowBlur = 14;
      context.fillStyle = player.invulnerability > 0 ? "#fff0c2" : "#78dff0";
      context.beginPath();
      context.arc(player.x, player.y, 9, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#fff4d7";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(player.x, player.y);
      context.lineTo(player.x + player.facing.x * 13, player.y + player.facing.y * 13);
      context.stroke();
      context.restore();
      if (slashTimer > 0) {
        const progress = slashTimer / 0.22;
        context.save();
        context.translate(player.x + player.facing.x * 13, player.y + player.facing.y * 13);
        context.rotate(Math.atan2(player.facing.y, player.facing.x));
        context.globalAlpha = progress;
        context.strokeStyle = rarities[equippedWeapon.rarity].color;
        context.shadowColor = rarities[equippedWeapon.rarity].color;
        context.shadowBlur = 18;
        context.lineWidth = 5 * progress + 1;
        context.beginPath();
        context.arc(0, 0, 23 + (1 - progress) * 9, -0.95, 0.95);
        context.stroke();
        context.restore();
      }
    }
  }

  function checkRoomProgress() {
    if (!active) {
      return;
    }
    lootDrops.forEach((drop) => {
      if (!drop.collected && Math.hypot(player.x - drop.x, player.y - drop.y) < 25) {
        drop.collected = true;
        awardCoins(drop.value);
        status.textContent = `Keräsit ${drop.value} kolikon vihollisen pudotuksen.`;
      }
    });
    const enemiesCleared = enemies.every((enemy) => enemy.dead);
    if (enemiesCleared && boss?.waiting) {
      boss.waiting = false;
      status.textContent = `${fields[roomNumber - 1].bossName} astuu esiin!`;
    }
    const bossCleared = !boss || boss.dead;
    if (roomNumber < fields.length && enemiesCleared && bossCleared && !exitOpen) {
      exitOpen = true;
      if (!roomQuestAwarded) {
        roomQuestAwarded = true;
        awardExperience(50);
        if (selectedMapField !== null) {
          completeMapField(roomNumber);
          questDisplay.textContent = `Tehtävä valmis · ${fields[roomNumber - 1].name} raivattu.`;
          showOverlay(
            "KENTTÄ SUORITETTU",
            fields[roomNumber - 1].name,
            "Sait kentän kokemuspalkinnon. Seuraava reittipiste avautui seikkailukartalla.",
            "Palaa seikkailukartalle",
            () => returnToMap()
          );
          return;
        }
        questDisplay.textContent = `Tehtävä valmis · ${fields[roomNumber - 1].name} puhdistettu. Mene hohtavalle portille.`;
      }
      status.textContent = "Huone tyhjennetty! Mene pohjoisen hohtavalle portille jatkaaksesi.";
    }
    if (selectedMapField === null && exitOpen && player.y < 76 && Math.abs(player.x - arenaWidth / 2) < 70) {
      loadRoom(roomNumber + 1);
    }
  }

  function drawEnemy(enemy) {
    if (enemy.dead) {
      return;
    }
    const radius = enemy.isBoss ? 17 : enemy.isChampion ? 13 : 10;
    context.save();
    if (enemy.retreating) {
      const progress = Math.min((performance.now() - enemy.retreatStarted) / 1250, 1);
      context.globalAlpha = 1 - progress;
      context.translate(enemy.x, enemy.y - progress * 54);
      context.scale(1 - progress * 0.35, 1 - progress * 0.35);
      context.translate(-enemy.x, -enemy.y);
    }
    context.shadowColor = enemy.isBoss ? "#ff8b6a" : enemy.isChampion ? "#c58cff" : "#d8686d";
    context.shadowBlur = enemy.isBoss || enemy.isChampion ? 18 : 8;
    context.fillStyle = enemy.hitFlash > 0 ? "#fff3c8" : enemy.isBoss ? "#a94343" : enemy.isChampion ? "#704a8b" : "#665260";
    context.beginPath();
    context.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
    context.fill();
    context.font = enemy.isBoss ? "27px Arial" : "17px Arial";
    context.textAlign = "center";
    context.fillText(enemy.icon, enemy.x, enemy.y + 6);
    if (enemy.isBoss || enemy.isChampion) {
      const barWidth = enemy.isBoss ? 48 : 34;
      const barY = enemy.isBoss ? -28 : -19;
      context.fillStyle = "#21151c";
      context.fillRect(enemy.x - barWidth / 2, enemy.y + barY, barWidth, 5);
      context.fillStyle = enemy.isBoss ? "#ff7979" : "#c58cff";
      context.fillRect(enemy.x - barWidth / 2, enemy.y + barY, barWidth * Math.max(0, enemy.health / enemy.maxHealth), 5);
    }
    context.restore();
  }

  function drawSoulEffects() {
    soulEffects.forEach((effect) => {
      const progress = effect.age / 1.55;
      const alpha = Math.sin(progress * Math.PI);
      const rise = progress * 112;
      const ringRadius = 12 + progress * 40;
      context.save();
      context.globalAlpha = alpha * 0.55;
      context.strokeStyle = "#b5f8ff";
      context.shadowColor = "#8b8bff";
      context.shadowBlur = 20;
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(effect.x, effect.y + 3, ringRadius, ringRadius * 0.36, 0, 0, Math.PI * 2);
      context.stroke();
      for (let index = 0; index < 3; index += 1) {
        const phase = effect.seed + index * (Math.PI * 2 / 3);
        const sway = Math.sin(effect.age * 5 + phase) * (8 + index * 3);
        const x = effect.x + sway;
        const y = effect.y - rise - index * 13;
        const size = 8 - index * 1.4;
        context.globalAlpha = alpha * (0.85 - index * 0.16);
        context.fillStyle = index === 1 ? "#c9c4ff" : "#b5f8ff";
        context.shadowColor = index === 1 ? "#a994ff" : "#74eaff";
        context.shadowBlur = 18;
        context.beginPath();
        context.moveTo(x, y - size);
        context.bezierCurveTo(x + size * 1.1, y - size, x + size * 1.1, y + size * 0.45, x, y + size);
        context.bezierCurveTo(x - size * 0.3, y + size * 0.35, x - size * 0.55, y + size * 0.7, x - size, y + size);
        context.bezierCurveTo(x - size * 1.15, y + size * 0.2, x - size * 1.1, y - size, x, y - size);
        context.fill();
        context.fillStyle = "#fff";
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(x - 2.5, y - 1, 1.15, 0, Math.PI * 2);
        context.arc(x + 2.5, y - 1, 1.15, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    });
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
      tryMove(player, dx * 145 * delta, dy * 145 * delta);
    }
    attackCooldown = Math.max(0, attackCooldown - delta);
    spellCooldown = Math.max(0, spellCooldown - delta);
    soulCooldown = Math.max(0, soulCooldown - delta);
    soulEffects.forEach((effect) => { effect.age += delta; });
    soulEffects = soulEffects.filter((effect) => effect.age < 1.55);
    spellFlash = Math.max(0, spellFlash - delta);
    slashTimer = Math.max(0, slashTimer - delta);
    mana = Math.min(100, mana + 4 * delta);
    player.invulnerability = Math.max(0, player.invulnerability - delta);
    updateEnemies(delta);
    checkRoomProgress();
    renderArena();
    renderStats();
    if (active) {
      requestAnimationFrame(gameLoop);
    }
  }

  function revealSecretPath() {
    hiddenRouteUnlocked = true;
    localStorage.setItem(hiddenRouteStorageKey, "1");
    mapProgress.unlocked = Math.max(1, mapProgress.unlocked);
    saveMapProgress();
    checkpointActive = true;
    localStorage.setItem(checkpointStorageKey, "2");
    crownGate.hidden = true;
    hiddenRoute.hidden = false;
    hiddenRoute.scrollIntoView({ behavior: "smooth", block: "start" });
    if (checkpointStatus) {
      checkpointStatus.textContent = "Checkpoint aktivo · kaikki pomokokeet alkavat tästä.";
    }
    if (bossStatus) {
      bossStatus.textContent = "Pomo pudottaa aina aseen. Kokeile onneasi kirouksen kanssa.";
    }
    renderWeapons();
    renderMap();
  }

  let minos3dLoading = null;
  async function activate4kRendering() {
    if (minos3dRenderer) {
      return true;
    }
    if (!minos3dLoading) {
      minos3dLoading = import("./minos-3d.js")
        .then(({ createMinos3DRenderer }) => {
          minos3dRenderer = createMinos3DRenderer(canvas3d);
          canvas.hidden = true;
          canvas3d.hidden = false;
          fullscreenButton.hidden = false;
          document.body.classList.add("minos-4k-enabled");
          if (minos4kStatus) {
            minos4kStatus.textContent = "4K 3D -tila avattu. Luolasto ja hahmot käyttävät nyt kolmiulotteisia malleja.";
          }
          if (active) {
            renderArena();
          }
          return true;
        })
        .catch((error) => {
          minos3dLoading = null;
          console.error("Minoksen 3D-tilan käynnistäminen epäonnistui.", error);
          if (minos4kStatus) {
            minos4kStatus.textContent = "3D-tilaa ei voitu käynnistää. Tarkista selaimen WebGL-tuki ja verkkoyhteys; peruspeli toimii yhä.";
          }
          return false;
        });
    }
    return minos3dLoading;
  }

  const restoreProgress = () => {
    if (hiddenRouteUnlocked) {
      crownGate.hidden = true;
      hiddenRoute.hidden = false;
    }
    if (firstBossDefeated) {
      castleWelcome.hidden = true;
      game.hidden = true;
      crownGate.hidden = hiddenRouteUnlocked;
      hiddenRoute.hidden = !hiddenRouteUnlocked;
      if (!hiddenRouteUnlocked) {
        crownGate.scrollIntoView({ block: "center" });
      }
      return;
    }
    if (game.dataset.entering === "true" || localStorage.getItem(minotaurPageStorageKey) !== "1") {
      return;
    }
    game.dataset.entering = "true";
    castleWelcome.classList.add("is-dropping");
    window.setTimeout(() => {
      castleWelcome.hidden = true;
      game.hidden = false;
      game.scrollIntoView({ behavior: "smooth", block: "center" });
      prepareRun(false);
    }, 850);
  };

  const castleObserver = new MutationObserver(restoreProgress);
  castleObserver.observe(castleInterior, { attributes: true, attributeFilter: ["hidden"] });
  if (!castleInterior.hidden) {
    restoreProgress();
  }

  game.querySelectorAll("[data-minos-move]").forEach((button) => {
    const direction = button.dataset.minosMove;
    const directionKeys = {
      up: "w",
      left: "a",
      down: "s",
      right: "d"
    };
    const press = (event) => {
      event.preventDefault();
      keysDown.add(directionKeys[direction]);
    };
    const release = () => keysDown.delete(directionKeys[direction]);
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  });
  game.querySelector("[data-minos-attack]").addEventListener("click", performAttack);
  game.querySelector("[data-minos-spell]").addEventListener("click", castSpell);
  soulButton.addEventListener("click", summonSouls);
  game.querySelector("[data-minos-potion]").addEventListener("click", () => usePotion("health"));
  game.querySelector("[data-minos-mana-potion]").addEventListener("click", () => usePotion("mana"));
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 2 || !active) {
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const pointerX = (event.clientX - bounds.left) * scaleX;
    const pointerY = (event.clientY - bounds.top) * scaleY;
    const dx = pointerX - player.x;
    const dy = pointerY - player.y;
    const length = Math.hypot(dx, dy);
    if (length) {
      player.facing = { x: dx / length, y: dy / length };
    }
    performAttack();
  });
  canvas3d.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas3d.addEventListener("pointerdown", (event) => {
    if (event.button !== 2 || !active) {
      return;
    }
    const bounds = canvas3d.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * arenaWidth;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * arenaHeight;
    const dx = pointerX - player.x;
    const dy = pointerY - player.y;
    const length = Math.hypot(dx, dy);
    if (length) {
      player.facing = { x: dx / length, y: dy / length };
    }
    performAttack();
  });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (!active) {
      return;
    }
    if (key === "e") {
      event.preventDefault();
      castSpell();
      return;
    }
    if (key === "g") {
      event.preventDefault();
      summonSouls();
      return;
    }
    if (key === "q" || key === "1") {
      event.preventDefault();
      usePotion("health");
      return;
    }
    if (key === "2") {
      event.preventDefault();
      usePotion("mana");
      return;
    }
    if (!movementKeys[key]) {
      return;
    }
    event.preventDefault();
    keysDown.add(key);
    if (movementKeys[key][0]) {
      player.facing = { x: movementKeys[key][0], y: 0 };
    } else {
      player.facing = { x: 0, y: movementKeys[key][1] };
    }
  });
  window.addEventListener("keyup", (event) => keysDown.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => keysDown.clear());
  crownForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = crownForm.querySelector("input");
    if (input.value.trim().toLocaleLowerCase("fi") !== "älätuletänne") {
      crownFeedback.textContent = "Kruunu ei tunnista salasanaa. Sinetti pysyy kiinni.";
      input.select();
      return;
    }
    input.disabled = true;
    crownForm.querySelector("button").disabled = true;
    crownFeedback.textContent = "Salasana hyväksytty. Kruunu purkautuu valoksi...";
    crownArt.classList.add("is-exploding");
    window.setTimeout(revealSecretPath, 1900);
  });
  bossTrialButton?.addEventListener("click", () => {
    hiddenRoute.scrollIntoView({ behavior: "smooth", block: "start" });
    mapElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (mapProgress.unlocked < fields.length) {
      if (mapStatus) {
        mapStatus.textContent = `Loppupomo on lukittu. Suorita kartan ${fields.length - 1} aiempaa kenttää avataksesi sen.`;
      }
      return;
    }
    game.hidden = false;
    game.scrollIntoView({ behavior: "smooth", block: "center" });
    prepareRun(true, fields.length);
  });
  ownerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = ownerForm.querySelector("input");
    if (input.value.trim().toLocaleLowerCase("fi") !== "owner") {
      ownerFeedback.textContent = "Koodi väärin. Holvi pysyy suljettuna.";
      input.select();
      return;
    }
    ownerShop.hidden = false;
    input.disabled = true;
    ownerForm.querySelector("button").disabled = true;
    ownerFeedback.textContent = "Omistajan koodi hyväksytty. Kirotut aseet ovat nyt saatavilla.";
    renderOwnerWeapons();
    ownerShop.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  if (!localStorage.getItem(weaponsStorageKey)) {
    saveWeapons();
  }
  if (!localStorage.getItem(equippedWeaponStorageKey)) {
    localStorage.setItem(equippedWeaponStorageKey, equippedWeapon.id);
  }
  const savedWeaponCollection = localStorage.getItem(weaponsStorageKey);
  if (savedWeaponCollection !== JSON.stringify(ownedWeapons)) {
    localStorage.setItem(weaponsStorageKey, JSON.stringify(ownedWeapons));
  }
  if (localStorage.getItem(equippedWeaponStorageKey) !== equippedWeapon.id) {
    localStorage.setItem(equippedWeaponStorageKey, equippedWeapon.id);
  }
  if (checkpointStatus && checkpointActive) {
    checkpointStatus.textContent = "Checkpoint aktivo · jatkat tästä kaatuessasi.";
  }
  if (is4kModeEnabled) {
    const input = minos4kForm?.querySelector("input");
    const submit = minos4kForm?.querySelector("button");
    if (input) {
      input.disabled = true;
    }
    if (submit) {
      submit.disabled = true;
      submit.textContent = "4K 3D -tila avattu";
    }
    if (minos4kStatus) {
      minos4kStatus.textContent = "4K 3D -tila on avattu tällä laitteella.";
    }
    activate4kRendering();
  }
  minos4kForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = minos4kForm.querySelector("input");
    const submit = minos4kForm.querySelector("button");
    if (input.value.trim().toLocaleLowerCase("fi") !== "4k") {
      minos4kStatus.textContent = "Koodi ei kelpaa. 4K-tila pysyy lukittuna.";
      input.select();
      return;
    }
    submit.disabled = true;
    const enabled = await activate4kRendering();
    if (!enabled) {
      submit.disabled = false;
      return;
    }
    is4kModeEnabled = true;
    localStorage.setItem(minos4kStorageKey, "1");
    input.disabled = true;
    submit.textContent = "4K 3D -tila avattu";
  });
  fullscreenButton?.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await game.requestFullscreen();
      }
    } catch (error) {
      console.error("Minoksen koko näytön tilan avaaminen epäonnistui.", error);
      if (minos4kStatus) {
        minos4kStatus.textContent = "Koko näytön tilaa ei voitu avata tässä selaimessa.";
      }
    }
  });
  renderWeapons();
  renderMap();
  renderStats();
})();
