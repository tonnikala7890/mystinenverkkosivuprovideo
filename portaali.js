(() => {
  const overlay = document.querySelector("[data-city-teleport]");
  const video = overlay?.querySelector("[data-city-teleport-video]");
  const label = overlay?.querySelector("[data-city-teleport-label]");
  const PORTAL_START = 13;
  const PORTAL_END = 17.25;
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const waitForVideoMetadata = () => new Promise((resolve, reject) => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      resolve();
      return;
    }
    if (video.error) {
      reject(new Error("Portaalivideota ei voitu ladata."));
      return;
    }
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Portaalivideon lataus aikakatkaistiin."));
    }, 8000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Portaalivideota ei voitu ladata."));
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);
  });
  let transitionRunning = false;

  window.playPortalTransition = async (destination, arrive) => {
    if (transitionRunning) {
      return;
    }
    if (typeof arrive !== "function") {
      throw new TypeError("Portaalisiirtymä tarvitsee saapumistoiminnon.");
    }

    transitionRunning = true;
    if (!overlay || !video || !label) {
      if (!overlay || !video || !label) {
        console.error("Portaalianimaation näkymää tai videota ei löytynyt.");
      }
      try {
        await arrive();
      } finally {
        transitionRunning = false;
      }
      return;
    }

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.remove("is-arriving", "is-unfolding", "is-leaving", "is-temple-beam");
    overlay.classList.add("is-active", "is-preparing");
    label.textContent = `Portaali avautuu: ${destination}`;
    video.muted = true;
    video.volume = 0;

    try {
      video.pause();
      video.currentTime = 0;
      video.playbackRate = 4;
      await Promise.all([waitForVideoMetadata(), video.play()]);
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          window.clearInterval(checkPlayback);
          reject(new Error("Portaalianimaation toisto aikakatkaistiin."));
        }, 12000);
        const finish = (error) => {
          window.clearTimeout(timeout);
          window.clearInterval(checkPlayback);
          video.removeEventListener("ended", onEnded);
          video.removeEventListener("error", onError);
          if (error) {
            reject(error);
          } else {
            video.pause();
            resolve();
          }
        };
        const checkPlayback = window.setInterval(() => {
          if (video.currentTime >= PORTAL_START && overlay.classList.contains("is-preparing")) {
            video.playbackRate = 1;
            overlay.classList.remove("is-preparing");
            overlay.classList.add("is-video");
          }
          if (video.currentTime >= PORTAL_END) {
            finish();
          }
        }, 50);
        const onEnded = () => {
          finish(video.currentTime < PORTAL_END
            ? new Error("Portaalivideo päättyi ennen portaalin läpikulkuosuutta.")
            : null);
        };
        const onError = () => finish(new Error("Portaalivideon toisto epäonnistui."));
        video.addEventListener("ended", onEnded);
        video.addEventListener("error", onError);
      });
    } catch (error) {
      console.error("Portaalivideon toisto epäonnistui.", error);
      video.pause();
      overlay.classList.remove("is-video", "is-preparing");
      overlay.classList.add("is-active");
      label.textContent = `Portaalivideo ei käynnistynyt. Valoportaali avautuu: ${destination}`;
      await wait(1600);
    }

    label.textContent = `Saavuit: ${destination}`;
    overlay.classList.add("is-arriving");
    try {
      await arrive();
      overlay.classList.add("is-unfolding");
      await wait(550);
    } finally {
      video.pause();
      video.playbackRate = 1;
      overlay.classList.remove("is-active", "is-video", "is-preparing", "is-arriving", "is-unfolding");
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      transitionRunning = false;
    }
  };
})();
