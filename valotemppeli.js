(() => {
  const consoleStage = document.querySelector("[data-portal-console]");
  const templeStage = document.querySelector("[data-light-temple]");
  const catacombsStage = document.querySelector("[data-catacombs-stage]");
  const catacombsScene = document.querySelector("[data-catacombs-scene]");
  const activationButton = document.querySelector("[data-activate-portal]");
  const portalStatus = document.querySelector("[data-portal-status]");
  const swordButton = document.querySelector("[data-light-sword]");
  const swordStatus = document.querySelector("[data-sword-status]");
  const catacombsStatus = document.querySelector("[data-catacombs-status]");
  const secretCount = document.querySelector("[data-secret-count]");
  const turkeyRoomButton = document.querySelector("[data-enter-turkey]");
  const turkeyRoom = document.querySelector("[data-turkey-room]");
  const turkeyLever = document.querySelector("[data-turkey-lever]");
  const turkeyCharacter = document.querySelector("[data-turkey-character]");
  const turkeyQuote = document.querySelector("[data-turkey-quote]");
  const turkeyCount = document.querySelector("[data-turkey-count]");
  const secretCodeStage = document.querySelector("[data-secret-code-stage]");
  const secretCodeOutput = document.querySelector("[data-secret-code]");
  const codeCountdown = document.querySelector("[data-code-countdown]");
  const copyCodeButton = document.querySelector("[data-copy-code]");
  const copyCodeStatus = document.querySelector("[data-code-copy-status]");
  const doorsStage = document.querySelector("[data-three-doors]");
  const doorCodeInput = document.querySelector("[data-door-code]");
  const enterDoorButton = document.querySelector("[data-enter-door]");
  const doorStatus = document.querySelector("[data-door-status]");
  const ending = document.querySelector("[data-owl-ending]");
  const owlTreeTrigger = ending?.querySelector("[data-owl-tree-trigger]");
  const owlJourneyStage = ending?.querySelector("[data-owl-journey-stage]");
  const owlJourneyVideo = ending?.querySelector("[data-owl-journey-video]");
  const owlJourneyStatus = ending?.querySelector("[data-owl-journey-status]");
  const owlCottageScreen = ending?.querySelector("[data-owl-cottage-screen]");
  const owlCottageHotspots = ending?.querySelector("[data-owl-cottage-hotspots]");
  const owlCottageLever = ending?.querySelector("[data-owl-cottage-lever]");
  const owlCottageBook = ending?.querySelector("[data-owl-cottage-book]");
  const owlLeverVideo = ending?.querySelector("[data-owl-lever-video]");
  const owlLeverStatus = ending?.querySelector("[data-owl-lever-status]");
  const owlBookVideo = ending?.querySelector("[data-owl-book-video]");
  const owlBookStatus = ending?.querySelector("[data-owl-book-status]");

  if (!consoleStage || !templeStage || !catacombsStage || !catacombsScene || !activationButton || !portalStatus || !swordButton || !swordStatus || !catacombsStatus || !secretCount || !turkeyRoomButton || !turkeyRoom || !turkeyLever || !turkeyCharacter || !turkeyQuote || !turkeyCount || !secretCodeStage || !secretCodeOutput || !codeCountdown || !copyCodeButton || !copyCodeStatus || !doorsStage || !doorCodeInput || !enterDoorButton || !doorStatus || !ending || !owlTreeTrigger || !owlJourneyStage || !owlJourneyVideo || !owlJourneyStatus || !owlCottageScreen || !owlCottageHotspots || !owlCottageLever || !owlCottageBook || !owlLeverVideo || !owlLeverStatus || !owlBookVideo || !owlBookStatus) {
    console.error("Valotemppelin, kalkkunahuoneen tai pöllöoven ohjaimia ei löytynyt.");
    return;
  }

  const SECRET_CODE = secretCodeOutput.textContent.trim();
  const secrets = new Map([
    ["lyhty", "Sinilyhtyyn on kätketty vanhan vartijan viesti."],
    ["riimu", "Muinaisriimu kertoo kadonneesta salakäytävästä."],
    ["kristalli", "Kristallin sisältä löytyy katakombien tähtikartta."]
  ]);
  const discoveredSecrets = new Set();
  let turkeyActivated = false;
  let turkeyClicks = 0;
  let turkeyExplosionRunning = false;
  let selectedDoor = "";
  let codeTimeout = 0;
  let countdownInterval = 0;
  let endingStarted = false;
  let owlJourneyStarted = false;
  let owlLeverVideoStarted = false;
  let owlBookVideoStarted = false;

  const showThreeDoors = () => {
    window.clearTimeout(codeTimeout);
    window.clearInterval(countdownInterval);
    secretCodeStage.hidden = true;
    doorsStage.hidden = false;
    doorsStage.scrollIntoView({ behavior: "smooth", block: "center" });
    doorsStage.querySelector("[data-door]")?.focus({ preventScroll: true });
  };

  const enterCatacombs = () => {
    templeStage.hidden = true;
    catacombsStage.hidden = false;
    document.body.classList.add("catacombs-open");
    catacombsStatus.textContent = "Tutki seinien salaisuudet ja jatka sitten kalkkunan kammioon.";
    window.scrollTo(0, 0);
  };

  const playSwordJourney = async () => {
    if (swordButton.disabled) return;
    swordButton.disabled = true;
    swordStatus.textContent = "Miekka kosketettu. Portaali avautuu katakombeihin...";
    try {
      await window.playPortalTransition("Valon katakombit", enterCatacombs);
    } finally {
      swordButton.disabled = false;
    }
  };

  activationButton.addEventListener("click", async () => {
    if (activationButton.disabled) return;
    activationButton.disabled = true;
    consoleStage.classList.add("laser-firing");
    portalStatus.textContent = "Laser käynnistyy. Valosäde avaa käytävän Valotemppeliin...";
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    try {
      await window.playPortalTransition("Mystinen Valotemppeli", () => {
        consoleStage.hidden = true;
        templeStage.hidden = false;
        templeStage.classList.add("light-temple-arrives");
      });
    } finally {
      activationButton.disabled = false;
      consoleStage.classList.remove("laser-firing");
    }
  });

  swordButton.addEventListener("click", playSwordJourney);

  document.querySelectorAll("[data-catacomb-secret]").forEach((button) => {
    button.addEventListener("click", () => {
      const secretId = button.dataset.catacombSecret;
      if (!secretId || !secrets.has(secretId) || discoveredSecrets.has(secretId)) return;
      discoveredSecrets.add(secretId);
      button.setAttribute("aria-pressed", "true");
      button.classList.add("is-discovered");
      secretCount.textContent = `Salaisuudet löydetty: ${discoveredSecrets.size} / ${secrets.size}`;
      catacombsStatus.textContent = secrets.get(secretId);
      if (discoveredSecrets.size === secrets.size) {
        catacombsStatus.textContent = "Kaikki kolme salaisuutta löytyivät. Kalkkunan kammio odottaa.";
      }
    });
  });

  turkeyRoomButton.addEventListener("click", () => {
    catacombsScene.hidden = true;
    turkeyRoom.hidden = false;
    catacombsStage.classList.add("turkey-room-open");
    turkeyRoom.scrollIntoView({ behavior: "smooth", block: "center" });
    turkeyLever.focus({ preventScroll: true });
  });

  turkeyLever.addEventListener("click", () => {
    if (turkeyActivated || turkeyExplosionRunning) return;
    turkeyActivated = true;
    turkeyLever.disabled = true;
    turkeyRoom.classList.add("turkey-arrives");
    turkeyCharacter.hidden = false;
    turkeyQuote.textContent = 'Kalkkuna ilmestyy savupilveen ja sanoo: "pot".';
    turkeyCount.textContent = "Kalkkuna: 0 / 100";
    turkeyCharacter.focus({ preventScroll: true });
  });

  const copyCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SECRET_CODE);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = SECRET_CODE;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.append(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("Selain ei sallinut koodin kopiointia.");
      }
      copyCodeStatus.textContent = "Koodi kopioitu. Valitse yksi kolmesta ovesta ja liitä koodi.";
      showThreeDoors();
    } catch (error) {
      console.error("Salaisen koodin kopiointi epäonnistui.", error);
      copyCodeStatus.textContent = "Kopiointi estyi. Valitse koodi ja kopioi se käsin ennen ovien avautumista.";
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(secretCodeOutput);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  turkeyCharacter.addEventListener("click", async () => {
    if (!turkeyActivated || turkeyExplosionRunning) return;
    turkeyClicks += 1;
    turkeyCount.textContent = `Kalkkunan klikkaukset: ${turkeyClicks} / 100`;
    if (turkeyClicks === 10) {
      turkeyQuote.textContent = 'Kalkkuna katsoo sinua tiukasti ja sanoo: "Lopeta."';
      turkeyRoom.classList.add("turkey-irritated");
      return;
    }
    if (turkeyClicks < 100) {
      turkeyQuote.textContent = turkeyClicks < 10
        ? '"Pot."'
        : "Kalkkuna mulkaisee sinua varoittavasti.";
      return;
    }

    turkeyExplosionRunning = true;
    turkeyCharacter.disabled = true;
    turkeyQuote.textContent = "Kalkkuna raivostuu. Koko maailma räjähtää valoon!";
    turkeyRoom.classList.remove("turkey-irritated");
    catacombsStage.classList.add("turkey-exploding");
    await new Promise((resolve) => window.setTimeout(resolve, 1800));
    turkeyRoom.classList.remove("turkey-arrives");
    turkeyCharacter.hidden = true;
    turkeyLever.closest("[data-turkey-plinth]").hidden = true;
    turkeyQuote.hidden = true;
    turkeyCount.hidden = true;
    catacombsStage.classList.remove("turkey-exploding");
    secretCodeStage.hidden = false;
    secretCodeStage.scrollIntoView({ behavior: "smooth", block: "center" });
    copyCodeButton.focus({ preventScroll: true });

    let remainingSeconds = 3;
    codeCountdown.textContent = `Salainen koodi näkyy vielä ${remainingSeconds} sekuntia.`;
    countdownInterval = window.setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds > 0) {
        codeCountdown.textContent = `Salainen koodi näkyy vielä ${remainingSeconds} sekuntia.`;
      }
    }, 1000);
    codeTimeout = window.setTimeout(showThreeDoors, 3000);
  });

  copyCodeButton.addEventListener("click", copyCode);

  document.querySelectorAll("[data-door]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedDoor = button.dataset.door || "";
      document.querySelectorAll("[data-door]").forEach((door) => {
        const selected = door === button;
        door.classList.toggle("is-selected", selected);
        door.setAttribute("aria-pressed", String(selected));
      });
      doorStatus.textContent = `Ovi ${selectedDoor} valittu. Syötä tai liitä salainen koodi.`;
      doorCodeInput.focus({ preventScroll: true });
    });
  });

  const beginEnding = () => {
    if (endingStarted) return;
    endingStarted = true;
    doorsStage.hidden = true;
    ending.hidden = false;
    document.body.classList.add("site-crumbling");
    window.setTimeout(() => {
      Array.from(document.body.children).forEach((element) => {
        if (element !== ending) element.hidden = true;
      });
      document.body.classList.remove("site-crumbling");
      document.body.classList.add("owl-ending-active");
      ending.classList.add("owl-ending-revealed");
      owlTreeTrigger.focus({ preventScroll: true });
    }, 2800);
  };

  const startOwlJourney = async () => {
    if (owlJourneyStarted) return;
    owlJourneyStarted = true;
    owlTreeTrigger.disabled = true;
    owlJourneyStage.hidden = false;
    owlJourneyVideo.muted = false;
    owlJourneyVideo.volume = 1;
    owlJourneyVideo.currentTime = 0;
    try {
      await owlJourneyVideo.play();
    } catch (error) {
      console.error("Pöllöpuun videon toisto epäonnistui.", error);
      owlJourneyStatus.textContent = "Videon automaattinen käynnistys estyi. Käynnistä animaatio videon toistopainikkeella.";
      owlJourneyStatus.hidden = false;
      owlJourneyVideo.controls = true;
    }
  };

  owlTreeTrigger.addEventListener("click", startOwlJourney);
  owlJourneyVideo.addEventListener("ended", () => {
    owlJourneyVideo.hidden = true;
    owlJourneyStatus.hidden = true;
    owlCottageScreen.hidden = false;
    owlCottageHotspots.hidden = false;
  });

  const waitForVideoMetadata = (video) => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve();
    if (video.error) return Promise.reject(new Error("Videota ei voitu ladata."));
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        window.clearTimeout(timeout);
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("error", onError);
        if (error) reject(error);
        else resolve();
      };
      const onLoaded = () => finish();
      const onError = () => finish(new Error("Videota ei voitu ladata."));
      const timeout = window.setTimeout(() => finish(new Error("Videon lataus aikakatkaistiin.")), 15000);
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      video.addEventListener("error", onError, { once: true });
    });
  };

  const seekVideo = (video, time) => new Promise((resolve, reject) => {
    if (!video.seeking && Math.abs(video.currentTime - time) < 0.05) {
      resolve();
      return;
    }

    const finish = (error) => {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      if (error) reject(error);
      else resolve();
    };
    const onSeeked = () => finish();
    const onError = () => finish(new Error("Videossa ei voitu siirtyä oikeaan kohtaan."));
    const timeout = window.setTimeout(() => finish(new Error("Videon siirtyminen aikakatkaistiin.")), 12000);
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    try {
      video.currentTime = time;
      if (!video.seeking && Math.abs(video.currentTime - time) < 0.05) finish();
    } catch (error) {
      finish(error);
    }
  });

  const playFromLastTenSeconds = async (video) => {
    video.muted = false;
    video.volume = 1;

    const metadataReady = waitForVideoMetadata(video);
    const hadMetadata = video.readyState >= HTMLMediaElement.HAVE_METADATA;
    let startPlayback;
    if (hadMetadata) {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error("Videon kestoa ei voitu lukea.");
      }
      const startTime = Math.max(0, video.duration - 10);
      const seekReady = seekVideo(video, startTime);
      startPlayback = video.play().then(() => null, (error) => error);
      await Promise.all([metadataReady, seekReady]);
    } else {
      startPlayback = video.play().then(() => null, (error) => error);
      await metadataReady;
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error("Videon kestoa ei voitu lukea.");
      }
      await seekVideo(video, Math.max(0, video.duration - 10));
    }

    const playbackError = await startPlayback;
    if (playbackError) throw playbackError;
  };

  const startOwlLeverVideo = async () => {
    if (owlLeverVideoStarted) return;
    owlLeverVideoStarted = true;
    owlCottageLever.disabled = true;
    owlCottageScreen.hidden = true;
    owlCottageHotspots.hidden = true;
    owlLeverVideo.hidden = false;
    try {
      await playFromLastTenSeconds(owlLeverVideo);
    } catch (error) {
      owlLeverVideo.pause();
      console.error("Pöllömökin vivun videon toisto epäonnistui.", error);
      owlLeverStatus.textContent = "Videon automaattinen käynnistys estyi. Käynnistä animaatio videon toistopainikkeella.";
      owlLeverStatus.hidden = false;
      owlLeverVideo.controls = true;
      owlCottageHotspots.hidden = false;
    }
  };

  const startOwlBookVideo = async () => {
    if (owlBookVideoStarted) return;
    owlBookVideoStarted = true;
    owlCottageHotspots.hidden = true;
    owlCottageScreen.hidden = true;
    owlLeverVideo.pause();
    owlLeverVideo.hidden = true;
    owlBookVideo.hidden = false;
    try {
      await playFromLastTenSeconds(owlBookVideo);
    } catch (error) {
      owlBookVideo.pause();
      console.error("Salaisen kirjan videon toisto epäonnistui.", error);
      owlBookStatus.textContent = "Videon automaattinen käynnistys estyi. Käynnistä animaatio videon toistopainikkeella.";
      owlBookStatus.hidden = false;
      owlBookVideo.controls = true;
    }
  };

  owlCottageLever.addEventListener("click", startOwlLeverVideo);
  owlCottageBook.addEventListener("click", startOwlBookVideo);
  owlLeverVideo.addEventListener("ended", () => {
    owlLeverVideo.pause();
    owlCottageHotspots.hidden = false;
  });
  owlBookVideo.addEventListener("ended", () => {
    owlBookVideo.pause();
    window.location.assign("pollowalittomo.html");
  });

  const enterSelectedDoor = () => {
    if (!selectedDoor) {
      doorStatus.textContent = "Valitse ensin yksi kolmesta ovesta.";
      return;
    }
    if (doorCodeInput.value.trim().toUpperCase() !== SECRET_CODE) {
      doorStatus.textContent = "Koodi ei sovi tähän oveen. Tarkista koodi ja yritä uudelleen.";
      doorCodeInput.focus();
      return;
    }
    doorStatus.textContent = `Ovi ${selectedDoor} avautuu. Sivusto murenee tuhkaksi...`;
    beginEnding();
  };

  enterDoorButton.addEventListener("click", enterSelectedDoor);
  doorCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") enterSelectedDoor();
  });

  document.querySelector("[data-catacombs-return]")?.addEventListener("click", async () => {
    catacombsStage.hidden = true;
    document.body.classList.remove("catacombs-open");
    templeStage.hidden = false;
    templeStage.querySelector(".light-temple-back")?.focus({ preventScroll: true });
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn("Koko näytön tilasta poistuminen epäonnistui.", error);
      }
    }
  });
})();
