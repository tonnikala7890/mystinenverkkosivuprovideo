(() => {
  const modeKey = "secret-site-secret-mode";
  const normalButton = document.querySelector("[data-mode-normal]");
  const secretButton = document.querySelector("[data-mode-secret]");
  const modeStatus = document.querySelector("[data-mode-status]");
  const dome = document.querySelector("[data-glass-dome]");
  const coverButton = document.querySelector("[data-dome-cover]");
  const warningButton = document.querySelector("[data-warning-button]");
  const domeStatus = document.querySelector("[data-dome-status]");
  const alarmOverlay = document.querySelector("[data-alarm-overlay]");

  if (!normalButton || !secretButton || !modeStatus || !dome || !coverButton || !warningButton || !domeStatus || !alarmOverlay) {
    console.error("Tilasivun ohjaimia ei löytynyt.");
    return;
  }

  const showMode = (secretMode) => {
    document.body.classList.toggle("secret-mode", secretMode);
    normalButton.setAttribute("aria-pressed", String(!secretMode));
    secretButton.setAttribute("aria-pressed", String(secretMode));
    modeStatus.textContent = secretMode
      ? "Salainen tila on päällä. Piilotetut merkit näkyvät sivustolla."
      : "Normaali tila on päällä.";
  };

  const saveMode = (secretMode) => {
    try {
      if (secretMode) {
        localStorage.setItem(modeKey, "1");
      } else {
        localStorage.removeItem(modeKey);
      }
    } catch (error) {
      console.error("Sivuston tilan tallentaminen epäonnistui.", error);
      modeStatus.textContent = "Tila vaihtui tällä sivulla, mutta selaimen tallennus ei onnistunut.";
      document.body.classList.toggle("secret-mode", secretMode);
      normalButton.setAttribute("aria-pressed", String(!secretMode));
      secretButton.setAttribute("aria-pressed", String(secretMode));
      return;
    }

    showMode(secretMode);
  };

  let secretModeEnabled = false;
  try {
    secretModeEnabled = localStorage.getItem(modeKey) === "1";
  } catch (error) {
    console.error("Sivuston tallennetun tilan lukeminen epäonnistui.", error);
    modeStatus.textContent = "Tallennettua tilaa ei voitu lukea. Voit silti vaihtaa tilaa tällä sivulla.";
  }
  showMode(secretModeEnabled);

  normalButton.addEventListener("click", () => saveMode(false));
  secretButton.addEventListener("click", () => saveMode(true));

  coverButton.addEventListener("click", () => {
    const isOpen = dome.classList.toggle("is-open");
    coverButton.setAttribute("aria-expanded", String(isOpen));
    warningButton.disabled = !isOpen;
    coverButton.querySelector(".dome-cover-label").textContent = isOpen ? "SUOJAKUPU AUKI" : "SUOJAKUPU";
    coverButton.querySelector(".dome-cover-hint").textContent = isOpen ? "Sulje kupu lukitaksesi painikkeen" : "Avaa vain jos todella haluat";
    domeStatus.textContent = isOpen
      ? "Suojakupu auki · varoituspainike on nyt käytettävissä"
      : "Suojakupu kiinni · painike lukittu";
  });

  warningButton.addEventListener("click", () => {
    warningButton.disabled = true;
    warningButton.setAttribute("aria-label", "Älä koske. Käynnistä 4K-rakettiseikkailu");
    coverButton.disabled = true;
    domeStatus.textContent = "Hälytys käynnistyy. Siirryt raketin laukaisualustalle...";
    dome.classList.add("is-triggered");
    document.body.classList.add("alarm-active");
    alarmOverlay.setAttribute("aria-hidden", "false");

    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextConstructor) {
        const context = new AudioContextConstructor();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.22);
        oscillator.frequency.setValueAtTime(660, context.currentTime + 0.44);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.66);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, context.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, context.currentTime + 0.85);
        gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 1.05);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 1.08);
        oscillator.addEventListener("ended", () => context.close(), { once: true });
      }
    } catch (error) {
      console.error("Halytysääntä ei voitu toistaa.", error);
    }

    window.setTimeout(() => {
      window.location.href = "mystinen-raketti.html";
    }, 2600);
  });
})();
