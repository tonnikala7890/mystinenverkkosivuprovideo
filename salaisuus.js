(() => {
  const siteAccess = {
    password: "salainenkettuhirvi",
    secretPhrase: "salainen sinivalas",
    sessionKey: "secret-site-access-v2",
    secretPageKey: "secret-site-blue-whale-access-v1",
    secretPage: "salainen-sinivalas.html",
    treasurePageKey: "secret-site-treasure-room-access-v1",
    treasureClicksKey: "secret-site-treasure-door-clicks",
    treasurePage: "aarrehuone.html",
    secretShopUnlockedKey: "secret-site-whale-shop-unlocked",
    secretShopPage: "sinivalaan-kauppa.html",
    massiPageKey: "secret-site-massi-page-access-v1",
    massiPage: "massi-aarre.html",
    anglerfishPage: "krottikala-dlc.html",
    anglerfishTrenchPage: "syvanne.html",
    anglerfishCombatPage: "taistelusola.html",
    minotaurPage: "minotauruksen-linna.html"
  };
  const isSecretPage = window.location.pathname.endsWith(siteAccess.secretPage);
  const isTreasurePage = window.location.pathname.endsWith(siteAccess.treasurePage);
  const isWhaleShopPage = window.location.pathname.endsWith(siteAccess.secretShopPage);
  const isMassiPage = window.location.pathname.endsWith(siteAccess.massiPage);
  const isAnglerfishPage = window.location.pathname.endsWith(siteAccess.anglerfishPage);
  const isAnglerfishTrenchPage = window.location.pathname.endsWith(siteAccess.anglerfishTrenchPage);
  const isAnglerfishCombatPage = window.location.pathname.endsWith(siteAccess.anglerfishCombatPage);
  const isMinotaurPage = window.location.pathname.endsWith(siteAccess.minotaurPage);
  const groundDoorCode = "pienikissa";
  const anglerfishDlcKey = "secret-site-anglerfish-dlc-owned";
  const anglerfishQuestKey = "secret-site-anglerfish-quest-state";
  const anglerfishRelicQuestKey = "secret-site-anglerfish-relic-quest-state";
  const anglerfishEternityQuestKey = "secret-site-anglerfish-eternity-quest-state";
  const anglerfishTrenchFoundKey = "secret-site-anglerfish-trench-treasures";
  const anglerfishGlimmersFoundKey = "secret-site-anglerfish-glimmers-found";
  const anglerfishMoneyDoorClaimedKey = "secret-site-anglerfish-money-door-claimed";
  const minotaurCastleOpenedKey = "secret-site-minotaur-castle-opened";
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const audioPreferenceKey = "secret-site-audio-enabled";
  let audioContext = null;
  let ambience = null;
  let soundEnabled = localStorage.getItem(audioPreferenceKey) !== "0";
  const audioToggle = document.createElement("button");
  audioToggle.className = "site-audio-toggle";
  audioToggle.type = "button";
  audioToggle.setAttribute("aria-pressed", String(soundEnabled));
  const updateAudioToggle = () => {
    audioToggle.textContent = soundEnabled ? "🔊 Äänet päällä" : "🔇 Äänet pois";
    audioToggle.setAttribute("aria-label", soundEnabled ? "Mykistä sivuston äänet" : "Ota sivuston äänet käyttöön");
    audioToggle.setAttribute("aria-pressed", String(soundEnabled));
  };
  const getAudioContext = () => {
    if (!AudioContextConstructor) {
      audioToggle.disabled = true;
      audioToggle.textContent = "Äänet eivät ole käytettävissä";
      return null;
    }

    if (!audioContext) {
      try {
        audioContext = new AudioContextConstructor();
      } catch (error) {
        console.error("Sivuston äänilaitetta ei voitu käynnistää.", error);
        audioToggle.disabled = true;
        audioToggle.textContent = "Äänet eivät käynnisty";
        return null;
      }
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch((error) => {
        console.warn("Sivuston äänen käynnistäminen epäonnistui.", error);
      });
    }
    return audioContext;
  };
  const playNote = (context, frequency, startAt, duration, volume, type = "sine") => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  };
  const playUnlockSound = () => {
    if (!soundEnabled) {
      return;
    }
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const now = context.currentTime;
    playNote(context, 261.63, now, 1.1, 0.055, "triangle");
    playNote(context, 329.63, now + 0.08, 1.25, 0.045);
    playNote(context, 392, now + 0.16, 1.45, 0.04);
    playNote(context, 523.25, now + 0.32, 1.7, 0.028);
    playNote(context, 783.99, now + 0.52, 1.9, 0.012);
  };
  const playDoorSound = () => {
    if (!soundEnabled) {
      return;
    }
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const now = context.currentTime;
    const creak = context.createOscillator();
    const creakGain = context.createGain();
    const filter = context.createBiquadFilter();
    creak.type = "triangle";
    creak.frequency.setValueAtTime(125, now);
    creak.frequency.exponentialRampToValueAtTime(73, now + 0.65);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(190, now + 0.7);
    creakGain.gain.setValueAtTime(0.0001, now);
    creakGain.gain.exponentialRampToValueAtTime(0.035, now + 0.08);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    creak.connect(filter);
    filter.connect(creakGain);
    creakGain.connect(context.destination);
    creak.start(now);
    creak.stop(now + 0.75);
    playNote(context, 146.83, now, 0.3, 0.035, "sine");
    playUnlockSound();
  };
  const playKnockSound = () => {
    if (!soundEnabled) {
      return;
    }
    const context = getAudioContext();
    if (context) {
      const now = context.currentTime;
      playNote(context, 110, now, 0.16, 0.035, "triangle");
      playNote(context, 82.41, now + 0.02, 0.2, 0.025, "sine");
    }
  };
  const startAmbience = () => {
    if (!soundEnabled || ambience) {
      return;
    }
    const context = getAudioContext();
    if (!context) {
      return;
    }
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 3);
    filter.connect(master);
    master.connect(context.destination);
    const voices = [130.81, 196, 261.63, 329.63].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (index - 1.5) * 1.2;
      voiceGain.gain.value = index === 3 ? 0.1 : 0.16;
      oscillator.connect(voiceGain);
      voiceGain.connect(filter);
      oscillator.start();
      return oscillator;
    });
    ambience = { master, voices };
  };
  const stopAmbience = () => {
    if (!ambience || !audioContext) {
      return;
    }
    const activeAmbience = ambience;
    ambience = null;
    const now = audioContext.currentTime;
    activeAmbience.master.gain.cancelScheduledValues(now);
    activeAmbience.master.gain.setValueAtTime(Math.max(activeAmbience.master.gain.value, 0.0001), now);
    activeAmbience.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    window.setTimeout(() => {
      activeAmbience.voices.forEach((voice) => voice.stop());
    }, 400);
  };
  document.body.append(audioToggle);
  updateAudioToggle();
  audioToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(audioPreferenceKey, soundEnabled ? "1" : "0");
    updateAudioToggle();
    if (soundEnabled) {
      if (sessionStorage.getItem(siteAccess.sessionKey) === "1") {
        startAmbience();
      }
    } else {
      stopAmbience();
    }
  });
  if (
    (isSecretPage && sessionStorage.getItem(siteAccess.secretPageKey) !== "1")
    || (isTreasurePage && sessionStorage.getItem(siteAccess.treasurePageKey) !== "1")
  ) {
    window.location.replace("index.html");
    return;
  }
  if (
    isWhaleShopPage
    && (
      sessionStorage.getItem(siteAccess.secretPageKey) !== "1"
      || localStorage.getItem(siteAccess.secretShopUnlockedKey) !== "1"
    )
  ) {
    window.location.replace(
      sessionStorage.getItem(siteAccess.secretPageKey) === "1"
        ? siteAccess.secretPage
        : "index.html"
    );
    return;
  }
  if (
    isMassiPage
    && (
      sessionStorage.getItem(siteAccess.massiPageKey) !== "1"
      || localStorage.getItem("secret-site-secret-room-unlocked") !== "1"
    )
  ) {
    window.location.replace("index.html");
    return;
  }
  if (
    (isAnglerfishPage || isAnglerfishTrenchPage || isAnglerfishCombatPage)
    && sessionStorage.getItem(siteAccess.sessionKey) !== "1"
  ) {
    window.location.replace("index.html");
    return;
  }
  if (isAnglerfishCombatPage && localStorage.getItem(anglerfishDlcKey) !== "1") {
    window.location.replace("krottikala-dlc.html");
    return;
  }
  if (
    isMinotaurPage
    && (
      sessionStorage.getItem(siteAccess.sessionKey) !== "1"
      || localStorage.getItem(anglerfishEternityQuestKey) !== "complete"
    )
  ) {
    window.location.replace("syvanne.html#eternity-door");
    return;
  }

  const siteAccessGranted = sessionStorage.getItem(siteAccess.sessionKey) === "1";
  if (siteAccessGranted) {
    document.addEventListener("pointerdown", () => startAmbience(), { once: true });
  }
  const treasureDoor = document.querySelector("[data-treasure-door]");
  const treasureProgress = document.querySelector("[data-treasure-progress]");
  if (treasureDoor && treasureProgress) {
    const requiredClicks = 10;
    const savedClicks = Number(sessionStorage.getItem(siteAccess.treasureClicksKey) || 0);
    let doorClicks = Number.isSafeInteger(savedClicks) && savedClicks >= 0
      ? Math.min(savedClicks, requiredClicks)
      : 0;
    const renderTreasureProgress = () => {
      treasureProgress.textContent = `Koputa oveen 10 kertaa · ${doorClicks}/${requiredClicks}`;
    };
    renderTreasureProgress();
    treasureDoor.addEventListener("click", () => {
      if (doorClicks >= requiredClicks) {
        return;
      }

      playKnockSound();
      doorClicks += 1;
      sessionStorage.setItem(siteAccess.treasureClicksKey, String(doorClicks));
      renderTreasureProgress();
      treasureDoor.classList.remove("is-knocking");
      window.requestAnimationFrame(() => treasureDoor.classList.add("is-knocking"));
      window.setTimeout(() => treasureDoor.classList.remove("is-knocking"), 500);

      if (doorClicks === requiredClicks) {
        treasureDoor.disabled = true;
        playDoorSound();
        treasureDoor.classList.add("is-unlocking");
        treasureProgress.textContent = "Lukko välähtää... Aarrekammio avautuu!";
        sessionStorage.setItem(siteAccess.treasurePageKey, "1");
        window.setTimeout(() => {
          window.location.href = siteAccess.treasurePage;
        }, 1700);
      }
    });
  }

  if (siteAccessGranted) {
    document.documentElement.classList.add("site-access-granted");
    const secretRouteTrigger = document.querySelector("[data-secret-route-trigger]");
    secretRouteTrigger?.addEventListener("click", () => {
      if (document.querySelector(".site-password-gate")) {
        return;
      }

      const gate = document.createElement("section");
      gate.className = "site-password-gate";
      gate.setAttribute("role", "dialog");
      gate.setAttribute("aria-modal", "true");
      gate.setAttribute("aria-labelledby", "site-password-title");
      gate.innerHTML = `
        <div class="site-password-card">
          <div class="site-password-emblem" aria-hidden="true"><span></span></div>
          <p class="site-password-eyebrow">SALAINEN MERIREITTI</p>
          <h1 id="site-password-title">Kuuntele aaltoja</h1>
          <p class="site-password-prompt">Kirjoita salainen koodi avataksesi reitin.</p>
          <form class="site-password-form">
            <label for="site-password-input">Salainen koodi</label>
            <input id="site-password-input" name="password" type="password" autocomplete="off" required>
            <button type="submit">Avaa salainen reitti <span aria-hidden="true">✦</span></button>
            <button class="secret-route-cancel" data-secret-route-cancel type="button">Palaa takaisin</button>
          </form>
        </div>
      `;
      document.body.append(gate);
      const form = gate.querySelector(".site-password-form");
      const input = gate.querySelector("#site-password-input");
      gate.querySelector("[data-secret-route-cancel]").addEventListener("click", () => gate.remove());
      input.focus();
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const enteredPhrase = input.value.trim().toLocaleLowerCase("fi");
        if (enteredPhrase !== siteAccess.secretPhrase) {
          return;
        }

        input.disabled = true;
        form.querySelector('button[type="submit"]').disabled = true;
        playUnlockSound();
        gate.classList.add("is-opening", "is-opening-to-secret");
        gate.querySelector(".site-password-prompt").textContent = "Salainen meri kutsuu. Ovi avautuu...";
        window.setTimeout(() => {
          sessionStorage.setItem(siteAccess.secretPageKey, "1");
          window.location.href = siteAccess.secretPage;
        }, 1800);
      });
    });
  } else {
    const gate = document.createElement("section");
    gate.className = "site-password-gate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "site-password-title");
    gate.innerHTML = `
      <div class="site-password-card">
        <div class="site-password-emblem" aria-hidden="true"><span></span></div>
        <p class="site-password-eyebrow">SALAINEN VERKKOSIVU</p>
        <h1 id="site-password-title">Tervetuloa sisään</h1>
        <p class="site-password-prompt">Kirjoita salasana avataksesi oven. Erityinen koodi avaa salaisen reitin.</p>
        <form class="site-password-form">
          <label for="site-password-input">Salasana tai salainen koodi</label>
          <input id="site-password-input" name="password" type="password" autocomplete="current-password" required>
          <button type="submit">Avaa ovi <span aria-hidden="true">✦</span></button>
        </form>
      </div>
    `;
    document.body.append(gate);
    const form = gate.querySelector(".site-password-form");
    const input = gate.querySelector("#site-password-input");
    input.focus();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const enteredPhrase = input.value.trim().toLocaleLowerCase("fi");
      const opensSecretPage = enteredPhrase === siteAccess.secretPhrase;
      if (!opensSecretPage && input.value !== siteAccess.password) {
        return;
      }

      input.disabled = true;
      form.querySelector("button").disabled = true;
      playDoorSound();
      startAmbience();
      gate.classList.add("is-opening");
      if (opensSecretPage) {
        gate.classList.add("is-opening-to-secret");
        gate.querySelector(".site-password-prompt").textContent = "Salainen meri kutsuu. Ovi avautuu...";
      }
      window.setTimeout(() => {
        sessionStorage.setItem(siteAccess.sessionKey, "1");
        if (opensSecretPage) {
          sessionStorage.setItem(siteAccess.secretPageKey, "1");
          window.location.href = siteAccess.secretPage;
          return;
        }
        document.documentElement.classList.add("site-access-granted");
        gate.remove();
      }, 1800);
    });
  }

  const keys = {
    mode: "secret-site-secret-mode",
    found: "secret-site-found-secrets",
    reindeer: "secret-site-mystic-reindeer",
    reindeerRevealed: "secret-site-mystic-reindeer-revealed",
    inventory: "secret-site-inventory",
    coins: "secret-site-coins",
    keyDropped: "secret-site-key-dropped",
    secretRoomUnlocked: "secret-site-secret-room-unlocked",
    complete: "secret-site-secret-complete",
    treasureRewardClaimed: "secret-site-treasure-reward-claimed",
    secretShopUnlocked: siteAccess.secretShopUnlockedKey,
    massiFound: "secret-site-massi-treasures-found"
  };
  const startingCoins = 20;
  const secretRewardCoins = 5;
  const shopItems = [
    { id: "star-stone", name: "Tähtikivi", icon: "💎", price: 10, description: "Pieni kivi, joka hohtaa salaisella valolla." },
    { id: "lucky-charm", name: "Onnenamuletti", icon: "🍀", price: 15, description: "Taskuun sopiva amuletti onnenetsijälle." },
    { id: "mystery-gift", name: "Salainen yllätys", icon: "🎁", price: 20, description: "Mysteerinen lahja kokoelmaasi." }
  ];
  const secretShopItems = [
    { id: "whale-pearl", name: "Sinivalaan helmi", icon: "🫧", price: 35, description: "Meren syvyyksissä hohtava harvinainen helmi." },
    { id: "moon-shell", name: "Kuunsimpukka", icon: "🐚", price: 60, description: "Simpukka säilöö sisäänsä kuun hopeista valoa." },
    { id: "ocean-crown", name: "Valtameren kruunu", icon: "👑", price: 100, description: "Aarrekammion arvokkain salainen aarre." }
  ];
  const massiTreasures = [
    { id: "massi-treasure-1", name: "Kultakolikko", icon: "🪙" },
    { id: "massi-treasure-2", name: "Safiiri", icon: "🔷" },
    { id: "massi-treasure-3", name: "Aarrekartta", icon: "🗺️" },
    { id: "massi-treasure-4", name: "Meripihka", icon: "🟠" },
    { id: "massi-treasure-5", name: "Kruununjalokivi", icon: "💎" },
    { id: "massi-treasure-6", name: "Salainen simpukka", icon: "🐚" },
    { id: "massi-treasure-7", name: "Vanha avain", icon: "🗝️" },
    { id: "massi-treasure-8", name: "Aarrearkku", icon: "🧰" },
    { id: "massi-treasure-9", name: "Kuun kivi", icon: "🌙" },
    { id: "massi-treasure-10", name: "Smaragdi", icon: "🟢" },
    { id: "massi-treasure-11", name: "Kultainen pokaali", icon: "🏆" },
    { id: "massi-treasure-12", name: "Massin kruunu", icon: "👑" }
  ];
  const anglerfishDlcItem = {
    id: "anglerfish-dlc",
    name: "Secrets of Combat and Secrets",
    icon: "🐟"
  };
  const anglerfishTrenchTreasures = [
    { id: "anglerfish-treasure-shell", name: "Rantakuun simpukka", icon: "🐚", zone: "shore" },
    { id: "anglerfish-treasure-pearl", name: "Valon helmi", icon: "🫧", zone: "shallows" },
    { id: "anglerfish-treasure-coral", name: "Sydänkoralli", icon: "🪸", zone: "coral" },
    { id: "anglerfish-treasure-compass", name: "Uponnut kompassi", icon: "🧭", zone: "wreck" },
    { id: "anglerfish-treasure-map", name: "Syvänteen kartanpala", icon: "🗺️", zone: "caves" },
    { id: "anglerfish-treasure-crystal", name: "Abyssin kristalli", icon: "💎", zone: "abyss" },
    { id: "anglerfish-treasure-key", name: "Ikuisuuden avain", icon: "🗝️", zone: "floor" },
    { id: "anglerfish-treasure-crown", name: "Krottikalan kruunu", icon: "👑", zone: "eternity" }
  ];
  const anglerfishFollowupQuests = [
    {
      id: "echoes",
      stateKey: "secret-site-anglerfish-echo-quest-state",
      progressKey: "secret-site-anglerfish-echoes-found",
      title: "Kaikujen kutsu",
      description: "Etsi kolme ikivanhaa kaikukiveä hylkypaikasta, luolasta ja syvänteen pohjalta.",
      prerequisite: anglerfishEternityQuestKey,
      finds: [
        { id: "echo-wreck", zone: "wreck", name: "Hylkykaiku", icon: "🔹", left: 20, top: 72 },
        { id: "echo-caves", zone: "caves", name: "Luolakaiku", icon: "🔹", left: 80, top: 70 },
        { id: "echo-floor", zone: "floor", name: "Pohjakaiku", icon: "🔹", left: 20, top: 72 }
      ]
    },
    {
      id: "wardens",
      stateKey: "secret-site-anglerfish-warden-quest-state",
      progressKey: "secret-site-anglerfish-wardens-found",
      title: "Valonvartijan sinetit",
      description: "Kerää neljä sinettiä korallipuutarhasta, hylystä, Abyssista ja Ikuisuuden oven edustalta.",
      prerequisite: "secret-site-anglerfish-echo-quest-state",
      finds: [
        { id: "seal-coral", zone: "coral-garden", name: "Korallisinettä", icon: "✧", left: 20, top: 70 },
        { id: "seal-wreck", zone: "wreck", name: "Hylysinetti", icon: "✧", left: 80, top: 72 },
        { id: "seal-abyss", zone: "abyss", name: "Abyssinsinetti", icon: "✧", left: 20, top: 72 },
        { id: "seal-eternity", zone: "eternity-door", name: "Ikuisuussinetti", icon: "✧", left: 80, top: 78 }
      ]
    },
    {
      id: "heart",
      stateKey: "secret-site-anglerfish-heart-quest-state",
      progressKey: "secret-site-anglerfish-heart-fragments-found",
      title: "Syvänteen sydän",
      description: "Kokoa viisi sydänsirpaletta kaikista syvyyksistä ja palauta Krottikalan valo.",
      prerequisite: "secret-site-anglerfish-warden-quest-state",
      finds: [
        { id: "heart-shallows", zone: "shallows", name: "Matalikon sirpale", icon: "💠", left: 20, top: 72 },
        { id: "heart-coral", zone: "coral-garden", name: "Korallisirpale", icon: "💠", left: 80, top: 72 },
        { id: "heart-caves", zone: "caves", name: "Luolasirpale", icon: "💠", left: 20, top: 72 },
        { id: "heart-abyss", zone: "abyss", name: "Abyssinsirpale", icon: "💠", left: 80, top: 72 },
        { id: "heart-floor", zone: "floor", name: "Pohjasirpale", icon: "💠", left: 80, top: 72 }
      ]
    }
  ];
  const allShopItems = [...shopItems, ...secretShopItems, ...massiTreasures, ...anglerfishTrenchTreasures, anglerfishDlcItem];
  const currentShopItems = isWhaleShopPage ? secretShopItems : shopItems;
  const legacyKeys = {
    "o-jarjesto-secret-mode": keys.mode,
    "o-jarjesto-found-secrets": keys.found,
    "o-jarjesto-mystic-reindeer": keys.reindeer,
    "o-jarjesto-mystic-reindeer-revealed": keys.reindeerRevealed,
    "o-jarjesto-inventory": keys.inventory,
    "o-jarjesto-key-dropped": keys.keyDropped,
    "o-jarjesto-secret-room-unlocked": keys.secretRoomUnlocked,
    "o-jarjesto-secret-complete": keys.complete,
    "o-jarjesto-coins": keys.coins,
    "o-jarjesto-treasure-reward-claimed": keys.treasureRewardClaimed
  };
  Object.entries(legacyKeys).forEach(([oldKey, newKey]) => {
    const previousValue = localStorage.getItem(oldKey);
    if (previousValue !== null) {
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, previousValue);
      }
      localStorage.removeItem(oldKey);
    }
  });
  const secretLocations = {
    "index.html": [
      { id: "1", x: 4, y: 25 },
      { id: "2", x: 96, y: 25 },
      { id: "3", x: 4, y: 48 },
      { id: "4", x: 96, y: 48 },
      { id: "5", x: 5, y: 91 },
      { id: "6", x: 95, y: 91 },
      { id: "7", x: 25, y: 82 },
      { id: "8", x: 75, y: 82 },
      { id: "9", x: 18, y: 34 },
      { id: "10", x: 82, y: 34 }
    ]
  };
  const pageName = decodeURIComponent(window.location.pathname.split("/").pop() || "index.html");
  let allSecretsDoor = null;
  if (pageName === "index.html") {
    const groundDoor = document.createElement("section");
    groundDoor.className = "ground-door";
    groundDoor.innerHTML = `
      <button class="ground-door-trigger" type="button" aria-expanded="false" aria-controls="ground-door-panel">
        <span class="ground-door-art" aria-hidden="true"></span>
        <span class="ground-door-label">Pieni ovi maan pinnassa</span>
      </button>
      <div class="ground-door-panel" id="ground-door-panel" hidden>
        <p class="ground-door-title">Mitä haluat tehdä?</p>
        <div class="ground-door-options">
          <button class="ground-door-wait" type="button">Odotan julkaisua</button>
          <button class="ground-door-enter" type="button">Syötä koodi – näe nyt</button>
        </div>
        <form class="ground-door-form" hidden>
          <label for="ground-door-code">Sivuston koodi</label>
          <input id="ground-door-code" type="password" autocomplete="current-password" required>
          <button type="submit">Avaa sivu nyt</button>
        </form>
        <p class="ground-door-feedback" aria-live="polite"></p>
      </div>
    `;
    document.body.append(groundDoor);

    allSecretsDoor = document.createElement("section");
    allSecretsDoor.className = "ground-door ground-door--secrets";
    allSecretsDoor.innerHTML = `
      <button class="ground-door-trigger" type="button" aria-expanded="false" aria-controls="all-secrets-door-panel">
        <span class="ground-door-art" aria-hidden="true"></span>
        <span class="ground-door-label">Salaisuuksien pikatie</span>
      </button>
      <div class="ground-door-panel" id="all-secrets-door-panel" hidden>
        <p class="ground-door-title">Avaa palkintoreitti koodilla</p>
        <form class="ground-door-form">
          <label for="all-secrets-door-code">Salainen koodi</label>
          <input id="all-secrets-door-code" type="password" autocomplete="off" required>
          <button type="submit">Löydä kaikki salaisuudet</button>
        </form>
        <p class="ground-door-feedback" aria-live="polite"></p>
      </div>
    `;
    document.body.append(allSecretsDoor);

    const doorTrigger = groundDoor.querySelector(".ground-door-trigger");
    const doorPanel = groundDoor.querySelector(".ground-door-panel");
    const waitButton = groundDoor.querySelector(".ground-door-wait");
    const enterButton = groundDoor.querySelector(".ground-door-enter");
    const doorForm = groundDoor.querySelector(".ground-door-form");
    const doorCode = groundDoor.querySelector("#ground-door-code");
    const doorFeedback = groundDoor.querySelector(".ground-door-feedback");

    doorTrigger.addEventListener("click", () => {
      doorPanel.hidden = !doorPanel.hidden;
      doorTrigger.setAttribute("aria-expanded", String(!doorPanel.hidden));
      if (!doorPanel.hidden) {
        doorFeedback.textContent = "";
      }
    });
    waitButton.addEventListener("click", () => {
      doorForm.hidden = true;
      doorFeedback.textContent = "Sivua ei ole vielä julkaistu verkkoon. Voit palata myöhemmin!";
    });
    enterButton.addEventListener("click", () => {
      doorForm.hidden = false;
      doorFeedback.textContent = "";
      doorCode.focus();
    });
    doorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (doorCode.value.trim().toLocaleLowerCase("fi") !== groundDoorCode) {
        doorFeedback.textContent = "Koodi ei avaa ovea. Tarkista koodi ja yritä uudelleen.";
        doorCode.focus();
        return;
      }

      doorCode.disabled = true;
      doorForm.querySelector("button").disabled = true;
      playDoorSound();
      startAmbience();
      doorFeedback.textContent = "Koodi hyväksytty. Sivusto avautuu...";
      sessionStorage.setItem(siteAccess.sessionKey, "1");
      document.documentElement.classList.add("site-access-granted");
      const passwordGate = document.querySelector(".site-password-gate");
      if (passwordGate) {
        passwordGate.classList.add("is-opening");
        window.setTimeout(() => passwordGate.remove(), 1800);
      }
      window.setTimeout(() => groundDoor.remove(), 1800);
    });

    const allSecretsTrigger = allSecretsDoor.querySelector(".ground-door-trigger");
    const allSecretsPanel = allSecretsDoor.querySelector(".ground-door-panel");
    allSecretsTrigger.addEventListener("click", () => {
      allSecretsPanel.hidden = !allSecretsPanel.hidden;
      allSecretsTrigger.setAttribute("aria-expanded", String(!allSecretsPanel.hidden));
      if (!allSecretsPanel.hidden) {
        allSecretsDoor.querySelector(".ground-door-feedback").textContent = "";
      }
    });
  }
  const gamePage = document.querySelector("[data-secret-page='game']");
  const rewardPage = document.querySelector("[data-secret-page='reward']");
  const mysticReindeerPage = document.querySelector("[data-secret-page='mystic-reindeer']");
  const inventoryPage = document.querySelector("[data-secret-page='inventory']");
  const secretRoomPage = document.querySelector("[data-secret-page='secret-room']");
  const getFound = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(keys.found) || "[]"));
    } catch (error) {
      console.error("Salaisuuksien edistymisen lukeminen epäonnistui.", error);
      return new Set();
    }
  };
  const saveFound = (found) => localStorage.setItem(keys.found, JSON.stringify([...found]));
  const allFound = getFound();
  const progress = document.querySelector("[data-progress]");
  const secretCount = Object.values(secretLocations).reduce((count, items) => count + items.length, 0);

  const getInventory = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(keys.inventory) || "[]"));
    } catch (error) {
      console.error("Tavaraluettelon lukeminen epäonnistui.", error);
      return new Set();
    }
  };
  const inventory = getInventory();
  const anglerfishDlcOwned = localStorage.getItem(anglerfishDlcKey) === "1";
  if (anglerfishDlcOwned && !inventory.has(anglerfishDlcItem.id)) {
    inventory.add(anglerfishDlcItem.id);
    localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
  }
  const getCoinBalance = () => {
    const storedBalance = localStorage.getItem(keys.coins);
    if (storedBalance === null) {
      localStorage.setItem(keys.coins, String(startingCoins));
      return startingCoins;
    }

    const balance = Number(storedBalance);
    if (Number.isSafeInteger(balance) && balance >= 0) {
      return balance;
    }

    console.error("Kolikkosaldon lukeminen epäonnistui. Aloitussaldo palautettiin.");
    localStorage.setItem(keys.coins, String(startingCoins));
    return startingCoins;
  };
  let coinBalance = getCoinBalance();
  const inventoryLink = document.createElement("a");
  inventoryLink.className = "inventory-link";
  inventoryLink.href = "tavaraluettelo.html";
  inventoryLink.textContent = "🎒 Tavaraluettelo";
  inventoryLink.setAttribute("aria-label", "Avaa tavaraluettelo");
  document.body.append(inventoryLink);
  const coinPurse = document.createElement("p");
  coinPurse.className = "coin-purse";
  coinPurse.setAttribute("aria-live", "polite");
  document.body.append(coinPurse);
  const shopBalance = document.querySelector("[data-shop-balance]");
  const updateCoinDisplays = () => {
    const balanceText = `${coinBalance} kolikkoa`;
    coinPurse.textContent = `🪙 ${balanceText}`;
    if (shopBalance) {
      shopBalance.textContent = `Lompakossa: ${balanceText}`;
    }
  };
  const saveCoinBalance = () => {
    localStorage.setItem(keys.coins, String(coinBalance));
    updateCoinDisplays();
  };
  updateCoinDisplays();
  if (isAnglerfishPage) {
    const worldMap = document.querySelector("[data-anglerfish-world-map]");
    const renderAnglerfishDlc = () => {
      document.querySelector(".anglerfish-dlc-offer")?.remove();
      document.querySelector(".anglerfish-dlc-fish")?.remove();
      document.querySelector(".anglerfish-dlc-quest")?.remove();
      document.querySelectorAll(".anglerfish-dlc-glimmer").forEach((glimmer) => glimmer.remove());
      if (worldMap) {
        worldMap.classList.add("is-unlocked");
        worldMap.querySelector(".anglerfish-map-legend").textContent = "Krottikalan DLC avattu – koko kartta on käytössäsi.";
        worldMap.querySelectorAll("[data-map-locked]").forEach((node) => {
          node.removeAttribute("aria-disabled");
          node.classList.remove("is-locked");
        });
      }

      const createQuestDialog = () => {
        const dialog = document.createElement("dialog");
        dialog.className = "anglerfish-dlc-quest";
        dialog.setAttribute("aria-labelledby", "anglerfish-dlc-title");
        const foundRelics = (() => {
          try {
            return new Set(JSON.parse(localStorage.getItem(anglerfishTrenchFoundKey) || "[]"));
          } catch (error) {
            console.error("Syvänteen aarteiden lukeminen epäonnistui.", error);
            return new Set();
          }
        })();
        const questCards = [
          {
            id: "light",
            state: localStorage.getItem(anglerfishQuestKey) || "available",
            title: "Valo syvyydessä",
            description: "Etsi kolme krottikalan kadonnutta valonkipinää Abyssin pimeydestä.",
            progress: `${Math.min(Number(localStorage.getItem(anglerfishGlimmersFoundKey) || 0), 3)} / 3 valonkipinää`,
            unlock: true
          },
          {
            id: "relics",
            state: localStorage.getItem(anglerfishRelicQuestKey) || "available",
            title: "Hylättyjen aarteiden jälki",
            description: "Löydä viisi aarretta matkalla rannalta syvänteen pohjalle.",
            progress: `${Math.min(foundRelics.size, anglerfishTrenchTreasures.length)} / 5 aarretta`,
            unlock: localStorage.getItem(anglerfishQuestKey) === "complete"
          },
          {
            id: "eternity",
            state: localStorage.getItem(anglerfishEternityQuestKey) || "available",
            title: "Ikuisuuden ovi",
            description: "Etsi kaikki kahdeksan aarretta ja avaa syvyyden tärkein ovi.",
            progress: `${foundRelics.size} / ${anglerfishTrenchTreasures.length} aarretta`,
            unlock: localStorage.getItem(anglerfishRelicQuestKey) === "complete"
          },
          ...anglerfishFollowupQuests.map((quest) => {
            const storedProgress = Number(localStorage.getItem(quest.progressKey) || 0);
            const progress = Number.isSafeInteger(storedProgress) && storedProgress >= 0
              ? Math.min(storedProgress, quest.finds.length)
              : 0;
            return {
              id: quest.id,
              state: localStorage.getItem(quest.stateKey) || "available",
              title: quest.title,
              description: quest.description,
              progress: `${progress} / ${quest.finds.length} löytöä`,
              unlock: localStorage.getItem(quest.prerequisite) === "complete"
            };
          })
        ];
        const cardMarkup = questCards.map((quest, index) => {
          const complete = quest.state === "complete";
          const active = quest.state === "active";
          const locked = !quest.unlock;
          const action = complete
            ? '<span class="anglerfish-quest-complete">✦ TEHTÄVÄ SUORITETTU ✦</span>'
            : `<a class="anglerfish-quest-action${locked ? " is-locked" : ""}" href="syvanne.html${quest.id === "eternity" ? "#eternity-door" : ""}" data-quest-start="${quest.id}"${locked ? ' aria-disabled="true"' : ""}>${locked ? "Avaa edellinen tehtävä ensin" : active ? "Jatka Syvänteeseen" : "Aloita tehtävä"}</a>`;
          return `
            <section class="anglerfish-quest-card${locked ? " is-locked" : ""}" aria-labelledby="anglerfish-quest-${quest.id}">
              <p class="anglerfish-quest-number">TEHTÄVÄLINJA · OSA ${index + 1}</p>
              <h3 id="anglerfish-quest-${quest.id}">${quest.title}</h3>
              <p class="anglerfish-quest-objective">${quest.description}</p>
              <p class="anglerfish-quest-progress">${complete ? "VALMIS" : locked ? "Lukittu · suorita edellinen tehtävä" : active ? `Käynnissä · ${quest.progress}` : quest.progress}</p>
              ${action}
            </section>
          `;
        }).join("");
        dialog.innerHTML = `
          <button class="anglerfish-quest-close" type="button" aria-label="Sulje tehtävänäkymä">×</button>
          <p class="anglerfish-dlc-eyebrow">KROTTIKALAN PÄIVÄKIRJA</p>
          <h2 id="anglerfish-dlc-title">Salaiset tehtävät</h2>
          <div class="anglerfish-dlc-dialog-art" aria-hidden="true">🐟</div>
          <p class="anglerfish-dlc-lore">Krottikala pyytää apuasi. Laskeudu rannasta syvyyden pohjalle ja selvitä, mikä odottaa Ikuisuuden oven takana.</p>
          <div class="anglerfish-quest-list">${cardMarkup}</div>
        `;
        document.body.append(dialog);
        dialog.querySelector(".anglerfish-quest-close").addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (event) => {
          if (event.target === dialog) {
            dialog.close();
          }
        });
        dialog.querySelectorAll("[data-quest-start]").forEach((link) => {
          link.addEventListener("click", (event) => {
            if (link.getAttribute("aria-disabled") === "true") {
              event.preventDefault();
              return;
            }
            const questKeys = {
              light: anglerfishQuestKey,
              relics: anglerfishRelicQuestKey,
              eternity: anglerfishEternityQuestKey
            };
            const questKey = questKeys[link.dataset.questStart]
              || anglerfishFollowupQuests.find((quest) => quest.id === link.dataset.questStart)?.stateKey;
            if (questKey && localStorage.getItem(questKey) !== "complete") {
              localStorage.setItem(questKey, "active");
            }
          });
        });
        dialog.addEventListener("cancel", () => dialog.close());
        return dialog;
      };

      const fish = document.createElement("button");
      fish.className = "anglerfish-dlc-fish";
      fish.type = "button";
      fish.setAttribute("aria-label", "Avaa Krottikalan salaiset tehtävät");
      fish.innerHTML = `
        <span class="anglerfish-dlc-halo" aria-hidden="true"></span>
        <span class="anglerfish-dlc-lure" aria-hidden="true">✦</span>
        <span class="anglerfish-dlc-creature" aria-hidden="true">🐟</span>
        <span class="anglerfish-dlc-caption">Avaa salaiset tehtävät</span>
      `;
      let dialog = createQuestDialog();
      fish.addEventListener("click", () => {
        if (!dialog.open) {
          dialog.remove();
          dialog = createQuestDialog();
          dialog.showModal();
        }
      });
      const questTriggerContainer = document.querySelector("[data-anglerfish-quest-trigger]");
      if (questTriggerContainer) {
        questTriggerContainer.querySelector("[data-quest-hub-locked]")?.remove();
        questTriggerContainer.replaceChildren(fish);
      } else {
        document.body.append(fish);
      }
    };

    if (localStorage.getItem(anglerfishDlcKey) === "1") {
      renderAnglerfishDlc();
    } else {
      const offer = document.createElement("section");
      offer.className = "anglerfish-dlc-offer";
      offer.innerHTML = `
        <p class="anglerfish-dlc-eyebrow">UUSI SEIKKAILU ODOTTAA</p>
        <h2>Krottikalan DLC</h2>
        <p class="anglerfish-dlc-description">Secrets of Combat and Secrets</p>
        <p class="anglerfish-dlc-price">🪙 <span data-anglerfish-balance></span> / 1 000 kolikkoa</p>
        <button class="anglerfish-dlc-buy" type="button">Maksa · 1 000 kolikkoa</button>
        <p class="anglerfish-dlc-feedback" aria-live="polite"></p>
      `;
      if (worldMap) {
        worldMap.before(offer);
      } else {
        document.body.append(offer);
      }
      const buyButton = offer.querySelector(".anglerfish-dlc-buy");
      const feedback = offer.querySelector(".anglerfish-dlc-feedback");
      const balanceLabel = offer.querySelector("[data-anglerfish-balance]");
      balanceLabel.textContent = String(coinBalance);
      if (worldMap) {
        worldMap.querySelectorAll("[data-map-locked]").forEach((node) => {
          node.setAttribute("aria-disabled", "true");
          node.classList.add("is-locked");
        });
      }
      buyButton.addEventListener("click", () => {
        if (localStorage.getItem(anglerfishDlcKey) === "1") {
          renderAnglerfishDlc();
          return;
        }
        if (coinBalance < 1000) {
          feedback.textContent = `Kolikot eivät riitä vielä. Tarvitset ${1000 - coinBalance} kolikkoa lisää.`;
          return;
        }

        buyButton.disabled = true;
        offer.classList.add("is-buying");
        feedback.textContent = "Maksu hyväksytty. Krottikalan syvänne avautuu...";
        playDoorSound();
        window.setTimeout(() => {
          coinBalance -= 1000;
          inventory.add(anglerfishDlcItem.id);
          localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
          localStorage.setItem(anglerfishDlcKey, "1");
          saveCoinBalance();
          offer.classList.add("is-purchased");
          window.setTimeout(() => renderAnglerfishDlc(), 1000);
        }, 1900);
      });
    }

    const moneyDoorForm = document.querySelector("[data-anglerfish-money-form]");
    if (moneyDoorForm) {
      const moneyDoorInput = moneyDoorForm.querySelector("input");
      const moneyDoorFeedback = document.querySelector("[data-anglerfish-money-feedback]");
      const moneyDoorButton = moneyDoorForm.querySelector("button");
      if (localStorage.getItem(anglerfishMoneyDoorClaimedKey) === "1") {
        moneyDoorInput.disabled = true;
        moneyDoorButton.disabled = true;
        moneyDoorFeedback.textContent = "Rahan ovi on jo avattu. Lunastit 1 000 kolikkoa.";
      }
      moneyDoorForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (moneyDoorInput.value.trim() !== "1000") {
          moneyDoorFeedback.textContent = "Koodi ei avaa Rahan ovea. Tarkista koodi ja yritä uudelleen.";
          moneyDoorInput.focus();
          return;
        }
        if (localStorage.getItem(anglerfishMoneyDoorClaimedKey) === "1") {
          moneyDoorFeedback.textContent = "Rahan oven palkinto on jo lunastettu.";
          moneyDoorInput.disabled = true;
          moneyDoorButton.disabled = true;
          return;
        }

        localStorage.setItem(anglerfishMoneyDoorClaimedKey, "1");
        coinBalance += 1000;
        saveCoinBalance();
        const dlcBalanceLabel = document.querySelector("[data-anglerfish-balance]");
        if (dlcBalanceLabel) {
          dlcBalanceLabel.textContent = String(coinBalance);
        }
        moneyDoorInput.disabled = true;
        moneyDoorButton.disabled = true;
        moneyDoorFeedback.textContent = "Rahan ovi avautui! Sait heti 1 000 kolikkoa.";
        playUnlockSound();
      });
    }
  }
  if (isAnglerfishTrenchPage) {
    const hasDlc = localStorage.getItem(anglerfishDlcKey) === "1";
    const lockedNote = document.querySelector("[data-trench-locked-note]");
    const progressLabel = document.querySelector("[data-trench-progress]");
    const messageLabel = document.querySelector("[data-trench-message]");
    const collectionProgress = document.querySelector("[data-trench-collection-progress]");
    const collectionList = document.querySelector("[data-trench-collection]");
    const glimmerZone = document.querySelector("[data-anglerfish-glimmer-zone]");
    const eternityDoor = document.querySelector("[data-eternity-door]");
    const eternityMessage = document.querySelector("[data-eternity-door-message]");
    const eternityScene = document.querySelector("[data-eternity-door-scene]");
    let foundTreasures;
    try {
      const savedTreasures = JSON.parse(localStorage.getItem(anglerfishTrenchFoundKey) || "[]");
      foundTreasures = new Set(
        Array.isArray(savedTreasures)
          ? savedTreasures.filter((id) => anglerfishTrenchTreasures.some((treasure) => treasure.id === id))
          : []
      );
    } catch (error) {
      console.error("Syvänteen aarteiden lukeminen epäonnistui.", error);
      foundTreasures = new Set();
    }

    if (!hasDlc) {
      if (lockedNote) {
        lockedNote.hidden = false;
      }
      document.querySelectorAll("[data-trench-treasure], [data-eternity-door]").forEach((button) => {
        button.disabled = true;
      });
    } else {
      const updateTrenchProgress = () => {
        const foundCount = foundTreasures.size;
        if (progressLabel) {
          progressLabel.textContent = `Löydetyt aarteet: ${foundCount} / ${anglerfishTrenchTreasures.length}`;
        }
        if (collectionProgress) {
          collectionProgress.textContent = foundCount === anglerfishTrenchTreasures.length
            ? "Kaikki syvyyden aarteet löytyivät. Ikuisuuden ovi on valmis avattavaksi."
            : `Löydä kaikki ${anglerfishTrenchTreasures.length} aarretta rannasta Ikuisuuden ovelle.`;
        }
        if (collectionList) {
          collectionList.replaceChildren();
          anglerfishTrenchTreasures.forEach((treasure) => {
            const item = document.createElement("li");
            item.classList.toggle("is-found", foundTreasures.has(treasure.id));
            item.textContent = foundTreasures.has(treasure.id)
              ? `${treasure.icon} ${treasure.name}`
              : "✦ Tuntematon löytö";
            collectionList.append(item);
          });
        }
        document.querySelectorAll("[data-trench-treasure]").forEach((button) => {
          const treasure = anglerfishTrenchTreasures.find(({ id }) => id === button.dataset.trenchTreasure);
          if (!treasure) {
            return;
          }
          const found = foundTreasures.has(treasure.id);
          button.classList.toggle("is-found", found);
          button.disabled = found;
          button.querySelector("span").textContent = found ? treasure.icon : "✦";
          if (found) {
            button.querySelector("small").textContent = treasure.name;
          }
          button.setAttribute("aria-label", found ? `Löysit aarteen: ${treasure.name}` : button.getAttribute("aria-label"));
        });
        const doorOpen = localStorage.getItem(anglerfishEternityQuestKey) === "complete";
        const doorReady = foundCount === anglerfishTrenchTreasures.length;
        if (eternityDoor) {
          eternityDoor.disabled = !doorReady || doorTransitionStarted;
          eternityDoor.textContent = doorOpen ? "Jatka Minotauruksen linnaan" : "Avaa Ikuisuuden ovi";
        }
        if (doorOpen) {
          eternityScene?.classList.add("is-open");
        }
        if (eternityMessage) {
          eternityMessage.textContent = doorTransitionStarted
            ? "Ikuisuuden lukko murtuu. Valmistaudu astumaan uuteen maailmaan..."
            : doorOpen
              ? "Lukko on murtunut. Ikuisuuden oven takana odottaa Minotauruksen labyrintti."
              : doorReady
                ? "Kaikki kahdeksan aarretta ja Ikuisuuden avain ovat löytyneet. Ovi odottaa."
                : `Ovi odottaa kaikkia aarteita. Vielä ${anglerfishTrenchTreasures.length - foundCount} löytöä puuttuu.`;
        }
        if (messageLabel) {
          const questState = localStorage.getItem(anglerfishQuestKey);
          const glimmers = Number(localStorage.getItem(anglerfishGlimmersFoundKey) || 0);
          if (localStorage.getItem(anglerfishEternityQuestKey) === "complete") {
            messageLabel.textContent = "Ikuisuuden ovi on auki. Olet saavuttanut syvänteen salaisuuden.";
          } else if (localStorage.getItem(anglerfishRelicQuestKey) === "complete") {
            messageLabel.textContent = "Viisi aarretta löytyi! Krottikalan toinen salainen tehtävä on valmis.";
          } else if (questState === "active") {
            messageLabel.textContent = `Krottikalan tehtävä: etsi valonkipinät ${Math.min(glimmers, 3)} / 3.`;
          } else if (questState === "complete") {
            messageLabel.textContent = "Kolme valonkipinää löytyi! Krottikalan ensimmäinen salainen tehtävä on valmis.";
          } else if (foundCount === anglerfishTrenchTreasures.length) {
            messageLabel.textContent = "Kaikki löydöt ovat löytyneet. Ikuisuuden ovi kutsuu.";
          } else {
            messageLabel.textContent = "Jokaisessa syvyydessä odottaa jotakin kätkettyä.";
          }
          const activeFollowup = [...anglerfishFollowupQuests].reverse().find(
            (quest) => localStorage.getItem(quest.stateKey) === "active"
          );
          if (activeFollowup) {
            const savedProgress = Number(localStorage.getItem(activeFollowup.progressKey) || 0);
            const progress = Number.isSafeInteger(savedProgress) && savedProgress >= 0
              ? Math.min(savedProgress, activeFollowup.finds.length)
              : 0;
            messageLabel.textContent = `Krottikalan tehtävä: ${activeFollowup.title} · ${progress} / ${activeFollowup.finds.length}.`;
          }
        }
      };
      if (
        foundTreasures.size >= 5
        && localStorage.getItem(anglerfishRelicQuestKey) === "active"
      ) {
        localStorage.setItem(anglerfishRelicQuestKey, "complete");
      }

      const treasureHuntMarkers = document.querySelectorAll("[data-trench-treasure]");
      treasureHuntMarkers.forEach((marker) => {
        const collectTreasure = () => {
          const treasure = anglerfishTrenchTreasures.find(({ id }) => id === marker.dataset.trenchTreasure);
          if (!treasure || foundTreasures.has(treasure.id)) {
            return;
          }
          foundTreasures.add(treasure.id);
          localStorage.setItem(anglerfishTrenchFoundKey, JSON.stringify([...foundTreasures]));
          inventory.add(treasure.id);
          localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
          coinBalance += 25;
          saveCoinBalance();
          playKnockSound();
          if (
            foundTreasures.size >= 5
            && localStorage.getItem(anglerfishRelicQuestKey) === "active"
          ) {
            localStorage.setItem(anglerfishRelicQuestKey, "complete");
            playUnlockSound();
          }
          updateTrenchProgress();
          if (messageLabel && localStorage.getItem(anglerfishRelicQuestKey) !== "complete") {
            messageLabel.textContent = `Löysit aarteen: ${treasure.name}. Sait 25 kolikkoa.`;
          }
        };
        marker.addEventListener("click", collectTreasure);
        marker.addEventListener("pointerup", (event) => {
          if (event.pointerType === "touch") {
            collectTreasure();
          }
        });
      });

      anglerfishFollowupQuests.forEach((quest) => {
        if (localStorage.getItem(quest.stateKey) !== "active") {
          return;
        }
        const savedProgress = Number(localStorage.getItem(quest.progressKey) || 0);
        const progress = Number.isSafeInteger(savedProgress) && savedProgress >= 0
          ? Math.min(savedProgress, quest.finds.length)
          : 0;
        quest.finds.slice(progress).forEach((find) => {
          const zone = document.getElementById(find.zone);
          if (!zone) {
            console.error(`Krottikalan tehtävän löytöalue puuttuu: ${find.zone}.`);
            return;
          }
          const marker = document.createElement("button");
          marker.className = "trench-find anglerfish-side-quest-find";
          marker.type = "button";
          marker.dataset.anglerfishQuestFind = find.id;
          marker.setAttribute("aria-label", `Etsi tehtävälöytö: ${find.name}`);
          marker.style.left = `${find.left}%`;
          marker.style.top = `${find.top}%`;
          marker.innerHTML = `<span aria-hidden="true">${find.icon}</span><small>${find.name}</small>`;
          marker.addEventListener("click", () => {
            marker.remove();
            const currentProgress = Number(localStorage.getItem(quest.progressKey) || 0);
            const safeProgress = Number.isSafeInteger(currentProgress) && currentProgress >= 0
              ? Math.min(currentProgress, quest.finds.length)
              : progress;
            const nextProgress = Math.min(
              quest.finds.length,
              safeProgress + 1
            );
            localStorage.setItem(quest.progressKey, String(nextProgress));
            const completed = nextProgress === quest.finds.length;
            if (completed) {
              localStorage.setItem(quest.stateKey, "complete");
              coinBalance += 150;
              saveCoinBalance();
              playUnlockSound();
            } else {
              playKnockSound();
            }
            updateTrenchProgress();
            if (messageLabel) {
              messageLabel.textContent = completed
                ? `${quest.title} suoritettu! Sait 150 kolikkoa.`
                : `Löysit kohteen ${find.name}. ${quest.title}: ${nextProgress} / ${quest.finds.length}.`;
            }
          });
          zone.append(marker);
        });
      });

      const glimmerPositions = [[20, 28], [50, 64], [80, 38]];
      const savedGlimmers = Number(localStorage.getItem(anglerfishGlimmersFoundKey) || 0);
      const foundGlimmers = Number.isSafeInteger(savedGlimmers) && savedGlimmers >= 0
        ? Math.min(savedGlimmers, 3)
        : 0;
      if (glimmerZone && localStorage.getItem(anglerfishQuestKey) === "active" && foundGlimmers < 3) {
        glimmerPositions.slice(foundGlimmers).forEach(([x, y], remainingIndex) => {
          const glimmer = document.createElement("button");
          glimmer.className = "anglerfish-dlc-glimmer";
          glimmer.type = "button";
          glimmer.setAttribute("aria-label", `Valonkipinä ${foundGlimmers + remainingIndex + 1} / 3`);
          glimmer.textContent = "✦";
          glimmer.style.left = `${x}%`;
          glimmer.style.top = `${y}%`;
          glimmer.addEventListener("click", () => {
            glimmer.remove();
            const nextFound = Number(localStorage.getItem(anglerfishGlimmersFoundKey) || 0) + 1;
            localStorage.setItem(anglerfishGlimmersFoundKey, String(nextFound));
            playKnockSound();
            if (nextFound >= glimmerPositions.length) {
              localStorage.setItem(anglerfishQuestKey, "complete");
              localStorage.removeItem(anglerfishGlimmersFoundKey);
              playUnlockSound();
            }
            updateTrenchProgress();
          });
          glimmerZone.append(glimmer);
        });
      }

      let doorTransitionStarted = false;
      eternityDoor?.addEventListener("click", () => {
        if (foundTreasures.size !== anglerfishTrenchTreasures.length) {
          return;
        }
        doorTransitionStarted = true;
        localStorage.setItem(anglerfishEternityQuestKey, "complete");
        playDoorSound();
        eternityScene?.classList.add("is-open", "is-opening");
        eternityDoor.disabled = true;
        updateTrenchProgress();
        window.setTimeout(() => {
          window.location.href = siteAccess.minotaurPage;
        }, 2300);
      });
      updateTrenchProgress();
    }
  }
  if (isMinotaurPage) {
    const gate = document.querySelector("[data-minotaur-gate]");
    const passwordForm = document.querySelector("[data-minotaur-password-form]");
    const passwordInput = passwordForm?.querySelector("input");
    const passwordFeedback = document.querySelector("[data-minotaur-password-feedback]");
    const labyrinth = document.querySelector("[data-minotaur-world]");
    const castleDoor = document.querySelector("[data-minotaur-castle-door]");
    const castleInterior = document.querySelector("[data-minotaur-castle-interior]");
    const castleMessage = document.querySelector("[data-minotaur-castle-message]");

    if (gate && passwordForm && passwordInput && passwordFeedback && labyrinth) {
      passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (passwordInput.value.trim().toLocaleLowerCase("fi") !== "minotaurus") {
          passwordFeedback.textContent = "Salasana ei avaa muuria. Kuuntele kivien takaa kuuluvaa arvoitusta ja yritä uudelleen.";
          passwordInput.select();
          return;
        }

        passwordInput.disabled = true;
        passwordForm.querySelector("button").disabled = true;
        passwordFeedback.textContent = "Salasana hyväksytty. Muuri alkaa halkeilla...";
        playDoorSound();
        gate.classList.add("is-collapsing");
        window.setTimeout(() => {
          labyrinth.hidden = false;
          labyrinth.classList.add("is-revealed");
          gate.remove();
          labyrinth.querySelector("h1").focus();
        }, 1900);
      });
    }

    if (castleInterior && localStorage.getItem(minotaurCastleOpenedKey) === "1") {
      castleInterior.hidden = false;
      castleDoor.disabled = true;
      castleDoor.textContent = "Minotauruksen linna on avattu";
      if (castleMessage) {
        castleMessage.textContent = "Linnan portti on jo avattu. Minotaurus odottaa suuressa salissa.";
      }
    }

    castleDoor?.addEventListener("click", () => {
      if (castleDoor.disabled || !castleInterior) {
        return;
      }
      castleDoor.disabled = true;
      castleDoor.classList.add("is-opening");
      if (castleMessage) {
        castleMessage.textContent = "Portti tärisee ja avautuu hitaasti...";
      }
      playDoorSound();
      window.setTimeout(() => {
        localStorage.setItem(minotaurCastleOpenedKey, "1");
        castleInterior.hidden = false;
        castleInterior.classList.add("is-revealed");
        castleDoor.textContent = "Minotauruksen linna on avattu";
        if (castleMessage) {
          castleMessage.textContent = "Linnan portti avautui. Minotaurus odottaa suuressa salissa.";
        }
      }, 1700);
    });
  }
  if (allSecretsDoor) {
    const allSecretsForm = allSecretsDoor.querySelector(".ground-door-form");
    const allSecretsInput = allSecretsDoor.querySelector("#all-secrets-door-code");
    const allSecretsFeedback = allSecretsDoor.querySelector(".ground-door-feedback");
    allSecretsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (allSecretsInput.value.trim().toLocaleLowerCase("fi") !== "kaikkisalaisuudet") {
        allSecretsFeedback.textContent = "Koodi ei avaa tätä ovea. Tarkista koodi ja yritä uudelleen.";
        allSecretsInput.focus();
        return;
      }

      const allSecretIds = Object.values(secretLocations).flat().map(({ id }) => id);
      const newlyFound = allSecretIds.filter((id) => !allFound.has(id));
      allSecretIds.forEach((id) => allFound.add(id));
      saveFound(allFound);
      if (newlyFound.length > 0) {
        coinBalance += newlyFound.length * secretRewardCoins;
        saveCoinBalance();
      }
      localStorage.setItem(keys.complete, "1");
      allSecretsInput.disabled = true;
      allSecretsForm.querySelector("button").disabled = true;
      playUnlockSound();
      allSecretsFeedback.textContent = "Koodi hyväksytty! Kaikki 10 salaisuutta löytyivät. Palkintosivu avautuu...";
      window.setTimeout(() => {
        window.location.href = "salaisuus-kettu.html?unlocked=1";
      }, 900);
    });
  }
  const treasureRewardMessage = document.querySelector("[data-treasure-reward]");
  if (isTreasurePage) {
    localStorage.setItem(keys.secretShopUnlocked, "1");
    if (localStorage.getItem(keys.treasureRewardClaimed) !== "1") {
      coinBalance += 100;
      localStorage.setItem(keys.treasureRewardClaimed, "1");
      saveCoinBalance();
      if (treasureRewardMessage) {
        treasureRewardMessage.textContent = "Aarrekammion palkinto: sait 100 kolikkoa! Sinivalaan salainen kauppa on nyt avattu.";
      }
    } else if (treasureRewardMessage) {
      treasureRewardMessage.textContent = "Aarrekammion palkinto on jo lunastettu. Sinivalaan salainen kauppa on avoinna.";
    }
  }
  const whaleSecretShopLink = document.querySelector("[data-whale-secret-shop]");
  if (whaleSecretShopLink && localStorage.getItem(keys.secretShopUnlocked) === "1") {
    whaleSecretShopLink.hidden = false;
  }
  const massiForm = document.querySelector("[data-massi-form]");
  if (massiForm) {
    const massiInput = massiForm.querySelector("input");
    const massiFeedback = massiForm.querySelector("[data-massi-feedback]");
    massiForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (massiInput.value.trim().toLocaleLowerCase("fi") !== "massi") {
        massiFeedback.textContent = "Koodi ei avaa ovea. Yritä uudelleen.";
        return;
      }

      massiInput.disabled = true;
      massiForm.querySelector("button").disabled = true;
      playUnlockSound();
      massiFeedback.textContent = "Koodi hyväksytty. Aarresaari paljastuu...";
      document.querySelector(".secret-room-card").classList.add("massi-opening");
      window.setTimeout(() => {
        sessionStorage.setItem(siteAccess.massiPageKey, "1");
        window.location.href = siteAccess.massiPage;
      }, 1500);
    });
  }
  const massiProgress = document.querySelector("[data-massi-progress]");
  const massiCollection = document.querySelector("[data-massi-collection]");
  if (isMassiPage && massiProgress && massiCollection) {
    let foundTreasures;
    try {
      foundTreasures = new Set(JSON.parse(localStorage.getItem(keys.massiFound) || "[]"));
    } catch (error) {
      console.error("Massin aarteiden edistymisen lukeminen epäonnistui.", error);
      foundTreasures = new Set();
    }

    const renderMassiCollection = () => {
      massiProgress.textContent = `Löydetty ${foundTreasures.size} / ${massiTreasures.length} aarretta · sait yhteensä ${foundTreasures.size * 25} kolikkoa`;
      massiCollection.replaceChildren();
      massiTreasures.forEach((treasure) => {
        const tile = document.createElement("div");
        tile.className = "massi-treasure-tile";
        tile.classList.toggle("is-found", foundTreasures.has(treasure.id));
        tile.setAttribute("aria-label", foundTreasures.has(treasure.id) ? treasure.name : "Piilotettu aarre");
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = foundTreasures.has(treasure.id) ? treasure.icon : "？";
        const label = document.createElement("span");
        label.textContent = foundTreasures.has(treasure.id) ? treasure.name : "Etsi aarre";
        tile.append(icon, label);
        massiCollection.append(tile);
      });
    };
    const treasureHunt = document.createElement("div");
    treasureHunt.className = "massi-hunt";
    treasureHunt.setAttribute("aria-label", "Piilotetut Massin aarteet");
    massiTreasures.forEach((treasure, index) => {
      const marker = document.createElement("button");
      marker.className = "hidden-secret massi-hidden-treasure";
      marker.type = "button";
      marker.dataset.massiTreasure = treasure.id;
      marker.setAttribute("aria-label", `Piilotettu aarre ${index + 1}`);
      marker.textContent = "✦";
      marker.style.setProperty("--secret-x", `${[7, 92, 15, 85, 5, 95, 25, 75, 12, 88, 42, 58][index]}%`);
      marker.style.setProperty("--secret-y", `${[21, 28, 43, 48, 65, 69, 82, 88, 35, 57, 91, 17][index]}%`);
      marker.hidden = foundTreasures.has(treasure.id);
      marker.addEventListener("click", () => {
        if (foundTreasures.has(treasure.id)) {
          return;
        }

        foundTreasures.add(treasure.id);
        localStorage.setItem(keys.massiFound, JSON.stringify([...foundTreasures]));
        inventory.add(treasure.id);
        localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
        coinBalance += 25;
        saveCoinBalance();
        marker.hidden = true;
        renderMassiCollection();
        massiProgress.textContent = `Löysit aarteen ${foundTreasures.size} / ${massiTreasures.length}: ${treasure.name}! Sait 25 kolikkoa.`;
      });
      treasureHunt.append(marker);
    });
    document.body.append(treasureHunt);
    renderMassiCollection();
  }

  const setMode = (enabled) => {
    document.body.classList.toggle("secret-mode", enabled);
    if (enabled) {
      localStorage.setItem(keys.mode, "1");
    } else {
      localStorage.removeItem(keys.mode);
    }
  };

  if (localStorage.getItem(keys.mode) === "1") {
    document.body.classList.add("secret-mode");
  }

  const locations = secretLocations[pageName] || [];
  if (locations.length) {
    const hunt = document.createElement("div");
    hunt.className = pageName === "index.html"
      ? "secret-hunt home-secret-hunt"
      : "secret-hunt";
    hunt.setAttribute("aria-label", "Piilotetut ketun salaisuudet");

    locations.forEach(({ id, x, y }) => {
      const marker = document.createElement("button");
      marker.className = "hidden-secret";
      marker.type = "button";
      marker.dataset.secret = id;
      marker.setAttribute("aria-label", `Piilotettu salaisuus ${id}`);
      marker.textContent = "✦";
      marker.style.setProperty("--secret-x", `${x}%`);
      marker.style.setProperty("--secret-y", `${y}%`);
      marker.hidden = allFound.has(id);
      marker.addEventListener("click", () => {
        if (allFound.has(id)) {
          return;
        }

        allFound.add(id);
        saveFound(allFound);
        coinBalance += secretRewardCoins;
        saveCoinBalance();
        marker.hidden = true;
        if (progress) {
          progress.textContent = `Löysit ${allFound.size} / ${secretCount} salaisuutta ja sait ${secretRewardCoins} kolikkoa!`;
        }

        if (allFound.size === secretCount) {
          localStorage.setItem(keys.complete, "1");
          if (progress) {
            progress.textContent = "Löysit kaikki! Kettusivu avautuu viideksi sekunniksi...";
          }
          window.setTimeout(() => {
            window.location.href = "salaisuus-kettu.html?unlocked=1";
          }, 600);
        }
      });
      hunt.append(marker);
    });

    document.body.append(hunt);
  }

  const shopProducts = document.querySelector("[data-shop-products]");
  const shopStatus = document.querySelector("[data-shop-status]");
  if (shopProducts && shopStatus) {
    currentShopItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "shop-product";
      const icon = document.createElement("span");
      icon.className = "shop-product-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.icon;
      const title = document.createElement("h2");
      title.textContent = item.name;
      const description = document.createElement("p");
      description.textContent = item.description;
      const buyButton = document.createElement("button");
      buyButton.className = "button";
      buyButton.type = "button";
      const updateBuyButton = () => {
        const alreadyOwned = inventory.has(item.id);
        buyButton.disabled = alreadyOwned || coinBalance < item.price;
        buyButton.textContent = alreadyOwned ? "Jo ostettu" : `Osta · ${item.price} kolikkoa`;
      };
      updateBuyButton();
      buyButton.addEventListener("click", () => {
        if (inventory.has(item.id)) {
          shopStatus.textContent = `Sinulla on jo esine ${item.name}.`;
          return;
        }
        if (coinBalance < item.price) {
          shopStatus.textContent = "Kolikot eivät riitä tähän ostokseen.";
          return;
        }

        coinBalance -= item.price;
        inventory.add(item.id);
        localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
        saveCoinBalance();
        updateBuyButton();
        currentShopItems.forEach((ownedItem) => {
          const productCard = shopProducts.querySelector(`[data-shop-item="${ownedItem.id}"]`);
          const productButton = productCard && productCard.querySelector("button");
          if (productButton) {
            productButton.disabled = inventory.has(ownedItem.id) || coinBalance < ownedItem.price;
            if (!inventory.has(ownedItem.id)) {
              productButton.textContent = `Osta · ${ownedItem.price} kolikkoa`;
            }
          }
        });
        shopStatus.textContent = `Ostit esineen ${item.name}. Se lisättiin tavaraluetteloosi!`;
      });
      card.dataset.shopItem = item.id;
      card.append(icon, title, description, buyButton);
      shopProducts.append(card);
    });
  }

  if (gamePage) {
    const activateButton = document.querySelector("[data-mode-on]");
    const deactivateButton = document.querySelector("[data-mode-off]");

    if (progress) {
      progress.textContent = document.body.classList.contains("secret-mode")
        ? `Löysit ${allFound.size} / ${secretCount} salaisuutta. Etsi ne etusivulta!`
        : "Salainen modi ei ole päällä.";
    }

    activateButton.addEventListener("click", () => {
      setMode(true);
      if (progress) {
        progress.textContent = `Löysit ${allFound.size} / ${secretCount} salaisuutta. Etsi ne etusivulta!`;
      }
    });

    deactivateButton.addEventListener("click", () => {
      setMode(false);
      if (progress) {
        progress.textContent = "Salainen modi ei ole päällä.";
      }
    });
  }

  const reindeerHomeLink = document.querySelector("[data-mystic-home-link]");
  const laplandHomeLink = document.querySelector("[data-lapland-home-link]");
  const canRevealReindeerLinks = document.body.classList.contains("secret-mode")
    && localStorage.getItem(keys.reindeerRevealed) === "1";
  if (
    canRevealReindeerLinks
  ) {
    reindeerHomeLink?.removeAttribute("hidden");
    laplandHomeLink?.removeAttribute("hidden");
  }

  if (mysticReindeerPage) {
    const canOpenMysticPage = document.body.classList.contains("secret-mode")
      && localStorage.getItem(keys.reindeerRevealed) === "1";
    if (!canOpenMysticPage) {
      window.location.replace("index.html");
    }
  }

  if (inventoryPage) {
    const list = document.querySelector("[data-inventory-list]");
    const emptyMessage = document.querySelector("[data-inventory-empty]");
    emptyMessage.hidden = inventory.size > 0;
    inventory.forEach((item) => {
      const entry = document.createElement("li");
      if (item === "key") {
        const key = document.createElement("span");
        key.className = "inventory-key-model";
        key.setAttribute("aria-hidden", "true");
        ["key-bow", "key-shaft", "key-tooth"].forEach((part) => {
          const element = document.createElement("span");
          element.className = part;
          key.append(element);
        });
        const label = document.createElement("span");
        label.textContent = "Avain";
        entry.append(key, label);
      } else if (allShopItems.some((shopItem) => shopItem.id === item)) {
        const shopItem = allShopItems.find((candidate) => candidate.id === item);
        const icon = document.createElement("span");
        icon.className = "inventory-treasure-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = shopItem.icon;
        const label = document.createElement("span");
        label.textContent = shopItem.name;
        entry.append(icon, label);
      } else {
        entry.textContent = item;
      }
      list.append(entry);
    });
  }

  const keyholeButton = document.querySelector("[data-keyhole-button]");
  if (keyholeButton) {
    const feedback = document.querySelector("[data-keyhole-feedback]");
    const caption = document.querySelector("[data-keyhole-caption]");
    const secretRoomUnlocked = localStorage.getItem(keys.secretRoomUnlocked) === "1";
    caption.textContent = secretRoomUnlocked ? "Avaa salainen huone" : "Salainen ovi";

    keyholeButton.addEventListener("click", () => {
      if (!secretRoomUnlocked && !inventory.has("key")) {
        feedback.textContent = "Lukko ei liiku. Etsi ensin avain.";
        return;
      }

      if (!secretRoomUnlocked) {
        inventory.delete("key");
        localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
        localStorage.setItem(keys.secretRoomUnlocked, "1");
      }

      feedback.textContent = "Avain kääntyy lukossa...";
      keyholeButton.disabled = true;
      playDoorSound();
      document.body.classList.add("door-opening");
      window.setTimeout(() => {
        window.location.href = "salainen-huone.html";
      }, 2400);
    });
  }

  if (secretRoomPage && localStorage.getItem(keys.secretRoomUnlocked) !== "1") {
    window.location.replace("index.html");
  }

  const laplandReindeer = document.querySelector("[data-lapland-reindeer]");
  const droppedKey = document.querySelector("[data-dropped-key]");
  const keyFeedback = document.querySelector("[data-key-feedback]");
  if (laplandReindeer && droppedKey) {
    if (inventory.has("key")) {
      keyFeedback.textContent = "Löysit avaimen ja lisäsit sen jo tavaraluetteloon.";
    } else if (localStorage.getItem(keys.keyDropped) === "1") {
      droppedKey.hidden = false;
    }

    laplandReindeer.addEventListener("click", () => {
      if (inventory.has("key")) {
        keyFeedback.textContent = "Avain on jo tavaraluettelossasi.";
        return;
      }

      const reindeerPosition = laplandReindeer.getBoundingClientRect();
      droppedKey.style.setProperty("--key-left", `${reindeerPosition.left + reindeerPosition.width / 2}px`);
      droppedKey.style.setProperty("--key-top", `${reindeerPosition.bottom - 20}px`);
      localStorage.setItem(keys.keyDropped, "1");
      droppedKey.hidden = false;
      keyFeedback.textContent = "Poro pudotti avaimen! Klikkaa avainta lisätäksesi sen tavaraluetteloon.";
    });

    droppedKey.addEventListener("click", () => {
      inventory.add("key");
      localStorage.setItem(keys.inventory, JSON.stringify([...inventory]));
      localStorage.removeItem(keys.keyDropped);
      droppedKey.hidden = true;
      keyFeedback.textContent = "Avain lisättiin tavaraluetteloon!";
    });
  }

  if (rewardPage) {
    const countdown = document.querySelector("[data-countdown]");
    document.body.classList.add("secret-mode");
    const kettuForm = document.querySelector("[data-kettu-form]");
    kettuForm.hidden = false;
    const kettuInput = document.querySelector("[data-kettu-input]");
    const kettuFeedback = document.querySelector("[data-kettu-feedback]");
    const rewardReindeerTrigger = document.querySelector("[data-reward-reindeer-trigger]");
    const reindeerRevealLink = document.querySelector("[data-mystic-reindeer-reveal]");
    countdown.textContent = "Kirjoita sana “kettu” avataksesi viiden sekunnin palkinnon.";
    kettuInput.focus();
    kettuForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (kettuInput.value.trim().toLocaleLowerCase("fi") !== "kettu") {
        kettuFeedback.hidden = false;
        kettuFeedback.textContent = "Väärä sana — kokeile uudelleen.";
        kettuInput.focus();
        return;
      }

      localStorage.setItem(keys.reindeer, "1");
      kettuInput.disabled = true;
      kettuForm.querySelector("button").disabled = true;
      kettuFeedback.hidden = false;
      kettuFeedback.textContent = "Oikein! Paina poroa löytääksesi vielä yhden salaisuuden.";
      rewardReindeerTrigger.hidden = false;

      let remainingSeconds = 5;
      let countdownTimer;
      const updateCountdown = () => {
        countdown.textContent = `Salainen kettusivu sulkeutuu ${remainingSeconds} sekunnin kuluttua.`;
        remainingSeconds -= 1;

        if (remainingSeconds < 0) {
          window.clearInterval(countdownTimer);
          window.location.replace("salaisuus.html");
        }
      };

      updateCountdown();
      countdownTimer = window.setInterval(updateCountdown, 1000);

      rewardReindeerTrigger.addEventListener("click", () => {
        window.clearInterval(countdownTimer);
        rewardReindeerTrigger.hidden = true;
        reindeerRevealLink.hidden = false;
        localStorage.setItem(keys.reindeerRevealed, "1");
        countdown.textContent = "Salaisuus paljastui. Löydät seuraavan vihjeen etusivulta.";
        kettuFeedback.textContent = "Poro katosi — etsi nyt huomaamaton “Mystinen poro” -painike etusivulta.";
      }, { once: true });
    });
  }
})();
