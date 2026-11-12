(() => {
  const launchStage = document.querySelector("[data-launch-stage]");
  if (!launchStage) {
    console.error("Rakettialustan näkymää ei löytynyt.");
    return;
  }

  const orbitStage = document.querySelector("[data-orbit-stage]");
  const pyramidStage = document.querySelector("[data-pyramid-stage]");
  const throneStage = document.querySelector("[data-throne-stage]");
  const underworldStage = document.querySelector("[data-underworld-stage]");
  const owlStage = document.querySelector("[data-owl-stage]");
  const coinStage = document.querySelector("[data-coin-stage]");
  const cityStage = document.querySelector("[data-city-stage]");
  const cityGameStage = document.querySelector("[data-city-game-stage]");
  const launchButton = document.querySelector("[data-launch-button]");
  const launchVideo = document.querySelector("[data-launch-video]");
  const launchVideoCaption = document.querySelector("[data-launch-video-caption]");
  const countdownDisplay = document.querySelector("[data-countdown]");
  const journeyStatus = document.querySelector("[data-journey-status]");
  const enterButton = document.querySelector("[data-enter-pyramid]");
  const leverButton = document.querySelector("[data-pull-lever]");
  const altarButton = document.querySelector("[data-touch-altar]");
  const altarStatus = document.querySelector("[data-altar-status]");
  const altarBeam = document.querySelector("[data-altar-beam]");
  const owlDialogue = document.querySelector("[data-owl-dialogue]");
  const blueDoorButton = document.querySelector("[data-blue-door]");
  const blueDoorLabel = document.querySelector("[data-blue-door-label]");
  const wishStatus = document.querySelector("[data-wish-status]");
  const wishForm = document.querySelector("[data-wish-form]");
  const wishCodeInput = document.querySelector("[data-wish-code]");
  const wishHint = document.querySelector("[data-wish-hint]");
  const takeCoinButton = document.querySelector("[data-take-coin]");
  const coinStatus = document.querySelector("[data-coin-status]");
  const secondGate = document.querySelector("[data-second-gate]");
  const cityGateButton = document.querySelector("[data-city-gate]");
  const cityQuestStatus = document.querySelector("[data-city-quest-status]");
  const openCityGateButton = document.querySelector("[data-open-city-gate]");
  const cityGateCaption = document.querySelector("[data-city-gate-caption]");

  if (!orbitStage || !pyramidStage || !throneStage || !underworldStage || !owlStage || !coinStage || !cityStage || !cityGameStage || !launchButton || !countdownDisplay || !journeyStatus || !enterButton || !leverButton || !altarButton || !altarStatus || !altarBeam || !owlDialogue || !blueDoorButton || !blueDoorLabel || !wishStatus || !wishForm || !wishCodeInput || !wishHint || !takeCoinButton || !coinStatus || !secondGate || !cityGateButton || !cityQuestStatus || !openCityGateButton || !cityGateCaption) {
    console.error("Seikkailun ohjaimia ei löytynyt.");
    return;
  }

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  let launchAudioContext = null;
  let launchAudioNodes = [];
  const owlTasks = new Set();
  const wishes = new Set();
  const cityTasks = new Set();
  const wishWords = {
    valo: { word: "VALO", hint: "Mikä syttyy pimeyteen ja näyttää tien?", gift: "Pöllön kristalli syttyy tähtivalolla." },
    rohkeus: { word: "SIIPI", hint: "Millä pöllö kohoaa yötaivaalle?", gift: "Hopeinen siipi antaa sinulle rohkeutta." },
    koti: { word: "KUU", hint: "Mikä hopeinen valo vartioi yötä?", gift: "Kuun opas näyttää turvallisen kotireitin." },
    viisaus: { word: "TÄHTI", hint: "Mikä pieni valo suunnistaa taivaan halki?", gift: "Tähtimuisto lisää viisauttasi." },
    rauha: { word: "UNI", hint: "Mihin hiljainen yö sinut kuljettaa?", gift: "Unen siunaus tuo mieleesi rauhan." }
  };
  const owlTaskMessages = {
    feather: "Pöllö: “Unisulka palasi siivelleni. Hyvin tehty, kulkija.”",
    star: "Pöllö: “Kolme merkkiä löysi taas paikkansa taivaalla.”",
    riddle: "Pöllö: “Tieto kasvaa jakamalla. Ratkaisit arvoitukseni.”"
  };
  const cityTaskMessages = {
    lantern: "Kuulyhdyt syttyvät. Kaupunki kylpee hopeisessa valossa.",
    archive: "Kadonnut tähtikartta löytyy kirkon vanhasta arkistosta.",
    choir: "Pöllökuoro laulaa aamun tervetulleeksi. Tehtävä suoritettu!"
  };

  const prepareLaunchAudio = async () => {
    if (!AudioContextConstructor) {
      return false;
    }

    launchAudioContext ??= new AudioContextConstructor();
    await launchAudioContext.resume();
    return launchAudioContext.state === "running";
  };

  const startLaunchSoundscape = () => {
    if (!launchAudioContext || launchAudioContext.state !== "running") {
      journeyStatus.textContent = "Laukaisuvideo käynnistyi, mutta selaimen äänitehosteet eivät ole käytettävissä.";
      return;
    }

    const audio = launchAudioContext;
    const startAt = audio.currentTime;
    const engine = audio.createOscillator();
    const engineFilter = audio.createBiquadFilter();
    const engineVolume = audio.createGain();
    engine.type = "sawtooth";
    engine.frequency.setValueAtTime(38, startAt);
    engine.frequency.exponentialRampToValueAtTime(92, startAt + 2.6);
    engineFilter.type = "lowpass";
    engineFilter.frequency.setValueAtTime(280, startAt);
    engineFilter.frequency.exponentialRampToValueAtTime(960, startAt + 3.2);
    engineVolume.gain.setValueAtTime(0.0001, startAt);
    engineVolume.gain.exponentialRampToValueAtTime(0.055, startAt + 0.8);
    engine.connect(engineFilter).connect(engineVolume).connect(audio.destination);
    engine.start(startAt);

    const overtone = audio.createOscillator();
    const overtoneVolume = audio.createGain();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(56, startAt);
    overtone.frequency.exponentialRampToValueAtTime(112, startAt + 4.5);
    overtoneVolume.gain.setValueAtTime(0.0001, startAt);
    overtoneVolume.gain.exponentialRampToValueAtTime(0.026, startAt + 1.2);
    overtone.connect(overtoneVolume).connect(audio.destination);
    overtone.start(startAt);

    const noiseBuffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const noiseChannel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseChannel.length; index += 1) {
      noiseChannel[index] = (Math.random() * 2 - 1) * (1 - index / noiseChannel.length * 0.18);
    }
    const exhaust = audio.createBufferSource();
    const exhaustFilter = audio.createBiquadFilter();
    const exhaustVolume = audio.createGain();
    exhaust.buffer = noiseBuffer;
    exhaust.loop = true;
    exhaustFilter.type = "lowpass";
    exhaustFilter.frequency.setValueAtTime(1600, startAt);
    exhaustFilter.frequency.exponentialRampToValueAtTime(4500, startAt + 1.5);
    exhaustVolume.gain.setValueAtTime(0.0001, startAt);
    exhaustVolume.gain.exponentialRampToValueAtTime(0.035, startAt + 0.5);
    exhaustVolume.gain.setValueAtTime(0.035, startAt + 1.2);
    exhaustVolume.gain.exponentialRampToValueAtTime(0.0001, startAt + 4.5);
    exhaust.connect(exhaustFilter).connect(exhaustVolume).connect(audio.destination);
    exhaust.start(startAt);
    exhaust.stop(startAt + 4.6);

    launchAudioNodes = [
      { source: engine, volume: engineVolume },
      { source: overtone, volume: overtoneVolume }
    ];
  };

  const stopLaunchSoundscape = () => {
    const audio = launchAudioContext;
    if (!audio || audio.state === "closed") {
      launchAudioNodes = [];
      return;
    }

    const stopAt = audio.currentTime;
    launchAudioNodes.forEach(({ source, volume }) => {
      volume.gain.cancelScheduledValues(stopAt);
      volume.gain.setTargetAtTime(0.0001, stopAt, 0.18);
      source.stop(stopAt + 0.9);
    });
    launchAudioNodes = [];
  };

  const playLaunchVideo = async () => {
    if (!launchVideo) {
      throw new Error("Laukaisuvideota ei löydy sivulta.");
    }

    launchVideo.muted = true;
    launchVideo.volume = 0;
    launchVideo.currentTime = 0;
    let onEnded;
    let onError;
    const playbackEnded = new Promise((resolve, reject) => {
      onEnded = () => resolve();
      onError = () => reject(new Error("Laukaisuvideota ei voitu toistaa."));
      launchVideo.addEventListener("ended", onEnded, { once: true });
      launchVideo.addEventListener("error", onError, { once: true });
    });

    try {
      await launchVideo.play();
      if (launchVideoCaption) {
        launchVideoCaption.textContent = "Laukaisu käynnissä · alkuperäinen puheääni on mykistetty";
      }
      startLaunchSoundscape();
      await playbackEnded;
    } finally {
      launchVideo.removeEventListener("ended", onEnded);
      launchVideo.removeEventListener("error", onError);
      launchVideo.pause();
      stopLaunchSoundscape();
    }
  };

  const completeOwlTask = (button) => {
    const task = button.dataset.owlQuest;
    if (!task || owlTasks.has(task)) {
      return;
    }
    owlTasks.add(task);
    button.classList.add("is-complete");
    button.querySelector("[data-quest-mark]").textContent = "VALMIS";
    owlDialogue.querySelector("p:last-child").textContent = owlTaskMessages[task];
    if (owlTasks.size === 3) {
      blueDoorButton.disabled = false;
      blueDoorLabel.textContent = "Kaikki tehtävät valmiit · avaa sininen ovi";
      owlDialogue.querySelector("p:last-child").textContent = "“Autoit saliani. Sininen ovi on nyt avoinna sinulle.”";
      journeyStatus.textContent = "Pöllö luottaa sinuun. Sininen ovi on avattu.";
    }
  };

  document.querySelectorAll("[data-owl-quest]").forEach((button) => {
    button.addEventListener("click", () => completeOwlTask(button));
  });

  let selectedWish = "";
  document.querySelectorAll("[data-wish]").forEach((button) => {
    button.addEventListener("click", () => {
      const wish = button.dataset.wish;
      const reward = wishWords[wish];
      if (!reward || wishes.has(wish)) {
        return;
      }
      selectedWish = wish;
      document.querySelectorAll("[data-wish]").forEach((wishButton) => {
        wishButton.classList.toggle("is-selected", wishButton === button);
      });
      wishHint.textContent = reward.hint;
      wishStatus.textContent = "Ratkaise pöllön arvoitus ja kirjoita vastaus salaiseksi sanaksi.";
      wishCodeInput.value = "";
      wishCodeInput.focus();
    });
  });

  wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const reward = wishWords[selectedWish];
    if (!reward) {
      wishStatus.textContent = "Valitse ensin toive, jonka haluat esittää.";
      return;
    }
    if (wishCodeInput.value.trim().toLocaleUpperCase("fi") !== reward.word) {
      wishStatus.textContent = "Salainen sana ei sopinut tähän toiveeseen. Kuuntele pöllön arvoitusta.";
      wishCodeInput.select();
      return;
    }

    wishes.add(selectedWish);
    const grantedWish = selectedWish;
    const selectedButton = document.querySelector(`[data-wish="${grantedWish}"]`);
    selectedButton.disabled = true;
    selectedButton.classList.remove("is-selected");
    selectedButton.classList.add("wish-granted");
    selectedButton.querySelector("span").textContent = "TOTEUTUI";
    wishCodeInput.value = "";
    wishHint.textContent = "Valitse toinen toive tai palaa pöllön tehtävien pariin.";
    wishStatus.textContent = `Toive toteutui. ${reward.gift}`;
    owlDialogue.querySelector("p:last-child").textContent = `“Toiveesi kuultiin. ${reward.gift}”`;
    journeyStatus.textContent = `Pöllö toteutti toiveesi: ${reward.gift}`;
    selectedWish = "";
  });

  blueDoorButton.addEventListener("click", () => {
    if (blueDoorButton.disabled) {
      return;
    }
    owlStage.hidden = true;
    coinStage.hidden = false;
    coinStage.classList.add("coin-room-entered");
    journeyStatus.textContent = "Sinisen oven takaa löytyi pieni kammio ja yksi kolikko.";
  });

  takeCoinButton.addEventListener("click", async () => {
    if (takeCoinButton.disabled) {
      return;
    }
    takeCoinButton.disabled = true;
    takeCoinButton.classList.add("coin-collected");
    coinStage.classList.add("coin-floor-collapse");
    coinStatus.textContent = "Kolikko on kädessäsi — kivinen lattia alkaa romahtaa!";
    journeyStatus.textContent = "Kolikon nostaminen avasi lattian alta toisen portin.";
    await wait(1800);
    secondGate.hidden = false;
    secondGate.classList.add("gate-revealed");
    coinStatus.textContent = "Pöllö huutaa: “Mitä te avaat?”";
  });

  cityGateButton.addEventListener("click", () => {
    if (cityGateButton.disabled) {
      return;
    }
    cityGateButton.disabled = true;
    window.playPortalTransition("Pöllökaupunki", () => {
      coinStage.hidden = true;
      cityStage.hidden = false;
      cityStage.classList.add("city-arrives");
      journeyStatus.textContent = "Astuit Pöllökaupunkiin. Tähtikirkon pöllöt tarvitsevat apuasi.";
    });
  });

  openCityGateButton.addEventListener("click", async () => {
    if (openCityGateButton.disabled) {
      return;
    }
    openCityGateButton.disabled = true;
    cityStage.classList.add("city-cathedral-opening");
    journeyStatus.textContent = "Pöllökirkon suuret ovet avautuvat tähtivalossa.";
    await wait(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 2100);
    cityStage.hidden = true;
    cityGameStage.hidden = false;
    cityGameStage.classList.add("city-game-entered");
    document.dispatchEvent(new CustomEvent("citygame:start"));
    journeyStatus.textContent = "Pöllökaupungin kadut ovat avoinna. Lähde tutkimaan!";
  });

  document.querySelectorAll("[data-city-quest]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = button.dataset.cityQuest;
      if (!task || cityTasks.has(task)) {
        return;
      }
      cityTasks.add(task);
      button.classList.add("is-complete");
      button.querySelector("b").textContent = "VALMIS";
      cityQuestStatus.textContent = cityTaskMessages[task];
      if (cityTasks.size === 3) {
        cityQuestStatus.textContent = "Kaikki kirkon tehtävät suoritettu. Pöllökaupunki kiittää sinua!";
        openCityGateButton.disabled = false;
        cityGateCaption.textContent = "KIRKON OVET AVATTU · ASTU SISÄÄN";
        cityStage.classList.add("city-gate-unlocked");
        journeyStatus.textContent = "Olet Pöllökaupungin ystävä. Tähtikirkon ovet avautuvat!";
      }
    });
  });

  launchButton.addEventListener("click", async () => {
    if (launchButton.disabled) {
      return;
    }
    launchButton.disabled = true;
    launchButton.textContent = "LÄHTÖ KÄYNNISSÄ";
    launchStage.classList.add("countdown-active");
    journeyStatus.textContent = "Lähtölaskenta käynnistyy. Hyvää matkaa!";
    if (AudioContextConstructor) {
      try {
        if (!await prepareLaunchAudio()) {
          journeyStatus.textContent = "Lähtölaskenta käynnistyy. Äänitehosteet eivät ole käytettävissä tässä selaimessa.";
        }
      } catch (error) {
        console.error("Rakettiäänitehosteiden valmistelu epäonnistui.", error);
        journeyStatus.textContent = "Lähtölaskenta käynnistyy. Äänitehosteiden käynnistäminen epäonnistui.";
      }
    }

    for (let number = 10; number >= 1; number -= 1) {
      countdownDisplay.textContent = String(number);
      countdownDisplay.setAttribute("aria-label", String(number));
      await wait(1000);
    }

    countdownDisplay.textContent = "NYT!";
    launchStage.hidden = true;
    orbitStage.hidden = false;
    orbitStage.classList.add("orbit-active", "has-launch-video");
    journeyStatus.textContent = "Kymmenen sekunnin lähtölaskenta valmis. Raketti laukaistaan nyt!";
    try {
      await playLaunchVideo();
    } catch (error) {
      console.error("Laukaisuvideon toistaminen epäonnistui.", error);
      if (launchVideoCaption) {
        launchVideoCaption.textContent = "Video ei käynnistynyt. Näytetään vaihtoehtoinen rakettimatka.";
      }
      orbitStage.classList.remove("has-launch-video");
      journeyStatus.textContent = "Laukaisuvideo ei käynnistynyt. Jatketaan vaihtoehtoisella tähtimatkalla.";
      await wait(5200);
    }
    orbitStage.classList.add("orbit-leaving");
    await wait(1300);
    orbitStage.hidden = true;
    pyramidStage.hidden = false;
    pyramidStage.classList.add("pyramid-landed");
    journeyStatus.textContent = "Laskeutuminen onnistui. Mystinen pyramidi on edessäsi.";
  });

  enterButton.addEventListener("click", () => {
    pyramidStage.hidden = true;
    throneStage.hidden = false;
    throneStage.classList.add("temple-entered");
    journeyStatus.textContent = "Pyramidin sisältä löytyy Kuun valtaistuin ja vipu.";
  });

  leverButton.addEventListener("click", async () => {
    if (leverButton.disabled) {
      return;
    }
    leverButton.disabled = true;
    leverButton.textContent = "LATTIA AVAUTUU...";
    throneStage.classList.add("floor-opening");
    journeyStatus.textContent = "Vipu liikahti. Kivilattia avautuu ja huone vajoaa alas.";
    await wait(1700);
    throneStage.hidden = true;
    underworldStage.hidden = false;
    underworldStage.classList.add("underworld-revealed");
    journeyStatus.textContent = "Pääsit maanalaiseen sielujen saliin.";
  });

  altarButton.addEventListener("click", () => {
    if (altarButton.disabled) {
      return;
    }
    altarButton.disabled = true;
    underworldStage.classList.add("altar-beam-active");
    underworldStage.classList.add("altar-awakened");
    altarStatus.textContent = "Alttari herää. Valonsäde lävistää katon ja nousee pyramidiin...";
    journeyStatus.textContent = "Alttarin valo kutsuu muinaisen vartijan esiin.";
    altarBeam.setAttribute("aria-hidden", "false");
    window.setTimeout(async () => {
      underworldStage.hidden = true;
      owlStage.hidden = false;
      owlStage.classList.add("owl-arrives");
      altarBeam.setAttribute("aria-hidden", "true");
      journeyStatus.textContent = "Kaiken tietävä pöllö odottaa salaisessa tähtipyhäkössä.";
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 450 : 3900);
  });
})();
