(() => {
  const installButton = document.querySelector("[data-install-app]");
  const installStatus = document.querySelector("[data-install-status]");
  let installPrompt = null;

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch((error) => {
        console.error("Sovelluksen offline-tuen käyttöönotto epäonnistui.", error);
        if (installStatus) {
          installStatus.textContent = "Sovellustilan käyttöönotto epäonnistui. Tarkista sivuston palvelin.";
        }
      });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) {
      installButton.hidden = false;
    }
  });

  installButton?.addEventListener("click", async () => {
    if (!installPrompt) {
      if (installStatus) {
        installStatus.textContent = "Asennus vaatii sivuston HTTPS-yhteyden tai localhost-palvelimen. Avaa selaimen valikosta Lisää aloitusnäyttöön.";
      }
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (installStatus) {
      installStatus.textContent = choice.outcome === "accepted"
        ? "Pöllökaupunki lisättiin sovelluksiisi."
        : "Voit asentaa sovelluksen myöhemmin selaimen valikosta.";
    }
    installPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    if (installButton) {
      installButton.hidden = true;
    }
    if (installStatus) {
      installStatus.textContent = "Pöllökaupunki-sovellus on asennettu.";
    }
  });

  document.querySelectorAll("a.city-home-portal").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      if (typeof window.playPortalTransition !== "function") {
        console.error("Portaalisiirtymän käynnistystoimintoa ei löytynyt.");
        return;
      }
      event.preventDefault();
      window.playPortalTransition("Pöllökaupunki", () => {
        window.location.assign(link.href);
      });
    });
  });
})();
