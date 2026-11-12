(() => {
  const app = document.querySelector("[data-owl-chambers]");
  const roomMap = document.querySelector("[data-room-map]");
  const roomPanel = document.querySelector(".owl-chamber-room");
  const roomArt = document.querySelector("[data-room-art]");
  const roomNumber = document.querySelector("[data-room-number]");
  const roomTitle = document.querySelector("[data-room-title]");
  const roomDescription = document.querySelector("[data-room-description]");
  const leverList = document.querySelector("[data-room-levers]");
  const leverStatus = document.querySelector("[data-room-lever-status]");
  const routeStatus = document.querySelector("[data-room-route-status]");
  const secretList = document.querySelector("[data-room-secrets]");
  const secretStatus = document.querySelector("[data-secret-status]");
  const leverProgress = document.querySelector("[data-lever-progress]");
  const secretProgress = document.querySelector("[data-secret-progress]");
  const mapStatus = document.querySelector("[data-map-status]");
  const previousButton = document.querySelector("[data-previous-room]");
  const nextButton = document.querySelector("[data-next-room]");
  const neighborStatus = document.querySelector("[data-neighbor-status]");

  if (!app || !roomMap || !roomPanel || !roomArt || !roomNumber || !roomTitle || !roomDescription || !leverList || !leverStatus || !routeStatus || !secretList || !secretStatus || !leverProgress || !secretProgress || !mapStatus || !previousButton || !nextButton || !neighborStatus) {
    console.error("Pöllön vipukammioiden ohjaimia ei löytynyt.");
    return;
  }

  const rooms = [
    { name: "Kuun kirjasto", hue: 263, description: "Hopeiset kirjat kuiskivat tarinoita huoneiden välisistä salakäytävistä.", lever: "Avaa kirjahyllyn takainen kuusilta", secrets: ["Kuun kartan reunaan on piirretty ovi toiseen huoneeseen.", "Yhdessä kirjassa on pöllön sulka, joka hohtaa yöllä.", "Lattialaudan alla on viesti seuraavan huoneen vartijalta."] },
    { name: "Tähtipölyn observatorio", hue: 208, description: "Kattoikkunasta näkee tähtikuvion, jonka jokainen tähti merkitsee vipua.", lever: "Käännä tähtikiekon vipua", secrets: ["Sininen tähti osoittaa kohti huonetta numero neljä.", "Teleskoopin vierestä löytyy pieni messinkinen avain.", "Tähtikartassa yksi kuvio näyttää nukkuvalta pöllöltä."] },
    { name: "Sammalpuutarha", hue: 143, description: "Maan alla kasvaa sammalta ja pieniä valoja, jotka seuraavat kulkijaa.", lever: "Vedä juurten lomaan kätkettyä vipua", secrets: ["Sammaleen alla on vanha jalanjälki.", "Kivimaljassa kasvaa kultainen siemen.", "Lehtien väliin on kätketty salainen tervehdys."] },
    { name: "Kellokammio", hue: 35, description: "Kymmenen erilaista kelloa käy samaan tahtiin huoneiden kehän kanssa.", lever: "Vedä suurta kuparikellon vipua", secrets: ["Pienin kello soi vain, kun huone on hiljaa.", "Kellotaulun takana on piirros huoneesta seitsemän.", "Pendeliin on kaiverrettu pöllön nimi."] },
    { name: "Lasijärven huone", hue: 187, description: "Kirkas lattia heijastaa huoneen, joka näyttää olevan aivan alapuolella.", lever: "Käännä järvenrantaan kiinnitettyä vipua", secrets: ["Heijastuksessa näkyy ovi, jota ei ole seinässä.", "Lasin sisään on jäänyt hopeinen sulka.", "Aallot piirtävät kartan huoneeseen kuusi."] },
    { name: "Pilvien arkisto", hue: 226, description: "Pehmeät pilvet kantavat arkiston kirjeitä huoneesta toiseen.", lever: "Vedä pilviarkiston vipua", secrets: ["Yksi kirje on osoitettu tulevaisuuden tutkijalle.", "Pilveen on kirjoitettu salainen reittimerkki.", "Arkiston laatikossa on sulka ja kolme tähteä."] },
    { name: "Kultainen verstas", hue: 44, description: "Pienet työkalut rakentavat siltoja ja avaimia vieressä oleviin kammioihin.", lever: "Paina verstaan kultaista vipua", secrets: ["Pöydän alla on piirros liikkuvasta sillasta.", "Vasaran kahvaan on kaiverrettu salainen numero.", "Tyhjä lintuhäkki on avain arvoitukseen."] },
    { name: "Kaikujen tunneli", hue: 278, description: "Seinät palauttavat kulkijan sanat eri huoneiden ääninä.", lever: "Vedä kaikukäytävän vipua", secrets: ["Kolmas kaiku sanoo huoneen nimen väärin päin.", "Kiven sisällä on pieni äänetön kello.", "Seinässä näkyy viesti vain kuunvalossa."] },
    { name: "Revontulien sali", hue: 166, description: "Värikkäät valot solmivat näkyviä lankoja kaikkien kammioiden välille.", lever: "Käännä revontulien ohjausvipua", secrets: ["Vihreä valojuova kulkee takaisin ensimmäiseen huoneeseen.", "Lattialla on kartta, jossa on kymmenen ovea.", "Pylvääseen on piilotettu pieni taikalyhty."] },
    { name: "Pöllön pesähuone", hue: 321, description: "Kehän viimeinen huone katsoo takaisin kirjastoon ja sulkee reitin ympyräksi.", lever: "Vedä pesähuoneen kehävipua", secrets: ["Pesän pehmeässä reunassa on ensimmäinen kirjaston sivu.", "Pöllön silmissä näkyy koko huoneiden kehä.", "Viimeinen sulka kertoo, että uusi kierros voi alkaa."] }
  ];

  const foundSecrets = rooms.map(() => new Set());
  const leverNames = ["Lyhty", "Kirja", "Ikkuna", "Kartta", "Kello", "Silta", "Pylväs", "Laatikko", "Tähti", "Kehä"];
  const leverHints = [
    "lyhty heijastaa seinälle uuden merkin",
    "kirjan väliin ilmestyy vanha kartanpala",
    "ikkunan lasiin piirtyy sulkakuvio",
    "karttaan ilmestyy ohut kultainen reitti",
    "kellon sisällä kilahtaa pieni avain",
    "silta yhdistää kaksi kaukaista huonetta",
    "pylvään varjo osoittaa piilotettuun lokeroon",
    "laatikosta löytyy viesti seuraavalle kulkijalle",
    "tähti syttyy ja näyttää yhden salaisen oven",
    "kehän viimeinen merkki sulkee reitin ympyräksi"
  ];
  const pulledLevers = rooms.map(() => new Set());
  const unlockedRooms = new Set([0]);
  const lastLeverMessages = rooms.map(() => "");
  const routeMessages = rooms.map(() => "");
  let currentRoom = 0;

  const replayAnimation = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };

  const animateRoomArrival = () => {
    roomPanel.classList.remove("is-activated");
    replayAnimation(roomPanel, "is-entering");
  };

  const updateProgress = () => {
    const secretCount = foundSecrets.reduce((total, found) => total + found.size, 0);
    const leverCount = pulledLevers.reduce((total, pulled) => total + pulled.size, 0);
    leverProgress.textContent = `Vipuja: ${leverCount} / ${rooms.length * leverNames.length}`;
    secretProgress.textContent = `Salaisuuksia: ${secretCount} / ${rooms.length * 3}`;
  };

  const renderMap = () => {
    roomMap.replaceChildren();
    rooms.forEach((room, index) => {
      const button = document.createElement("button");
      button.className = "owl-room-map-button";
      button.type = "button";
      button.disabled = !unlockedRooms.has(index);
      button.setAttribute("aria-current", index === currentRoom ? "page" : "false");
      button.setAttribute("aria-label", `Huone ${index + 1}: ${room.name}, ${pulledLevers[index].size} / ${leverNames.length} vipua vedetty`);
      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");
      const name = document.createElement("strong");
      name.textContent = room.name;
      button.append(number, name);
      button.addEventListener("click", () => navigateToRoom(index));
      roomMap.append(button);
    });
  };

  const renderSecrets = () => {
    secretList.replaceChildren();
    rooms[currentRoom].secrets.forEach((secret, index) => {
      const button = document.createElement("button");
      const discovered = foundSecrets[currentRoom].has(index);
      button.className = "owl-room-secret";
      button.type = "button";
      button.disabled = discovered;
      button.setAttribute("aria-pressed", String(discovered));
      button.textContent = discovered ? `✦ Jälki ${index + 1} löydetty` : `✦ Tutki jälkeä ${index + 1}`;
      button.addEventListener("click", () => {
        foundSecrets[currentRoom].add(index);
        replayAnimation(secretList.parentElement, "is-discovering");
        secretStatus.textContent = foundSecrets[currentRoom].size === rooms[currentRoom].secrets.length
          ? `Kaikki tämän huoneen salaisuudet löytyivät. ${secret}`
          : secret;
        renderSecrets();
        updateProgress();
      });
      secretList.append(button);
    });
  };

  const renderLevers = () => {
    leverList.replaceChildren();
    leverNames.forEach((name, index) => {
      const pulled = pulledLevers[currentRoom].has(index);
      const button = document.createElement("button");
      button.className = "owl-room-lever";
      button.type = "button";
      button.disabled = pulled;
      button.setAttribute("aria-pressed", String(pulled));
      const leverDescription = index === 0 ? rooms[currentRoom].lever : `Vipu ${index + 1}, ${name}`;
      button.setAttribute("aria-label", `${leverDescription}${pulled ? ", vedetty" : ""}`);

      const art = document.createElement("span");
      art.className = "owl-room-lever-art";
      art.setAttribute("aria-hidden", "true");
      const handle = document.createElement("i");
      art.append(handle);

      const label = document.createElement("span");
      label.textContent = index === 0
        ? rooms[currentRoom].lever
        : `Vipu ${String(index + 1).padStart(2, "0")} · ${name}`;
      button.append(art, label);
      button.addEventListener("click", () => pullLever(index));
      leverList.append(button);
    });
  };

  const renderRoom = () => {
    const room = rooms[currentRoom];
    roomNumber.textContent = `HUONE ${String(currentRoom + 1).padStart(2, "0")} / ${rooms.length}`;
    roomTitle.textContent = room.name;
    roomDescription.textContent = room.description;
    roomArt.style.setProperty("--room-hue", String(room.hue));
    const firstLeverPulled = pulledLevers[currentRoom].has(0);
    routeStatus.textContent = routeMessages[currentRoom] || (firstLeverPulled
      ? "Ovi seuraavaan huoneeseen on auki. Valitse se huoneiden kehästä tai siirry eteenpäin."
      : "Ensimmäinen vipu avaa seuraavan kammion oven.");
    leverStatus.textContent = lastLeverMessages[currentRoom] || `${pulledLevers[currentRoom].size} / ${leverNames.length} vipua vedetty tässä huoneessa.`;

    const previousRoom = (currentRoom + rooms.length - 1) % rooms.length;
    const nextRoom = (currentRoom + 1) % rooms.length;
    previousButton.disabled = !unlockedRooms.has(previousRoom);
    nextButton.disabled = !unlockedRooms.has(nextRoom);
    neighborStatus.textContent = `Yhteydet: ${rooms[previousRoom].name} ↔ ${room.name} ↔ ${rooms[nextRoom].name}`;
    secretStatus.textContent = foundSecrets[currentRoom].size === rooms[currentRoom].secrets.length
      ? "Kaikki tämän huoneen salaisuudet löytyivät."
      : "Tutki huoneen kolme hohtavaa merkkiä.";
    renderLevers();
    renderSecrets();
    renderMap();
    updateProgress();
  };

  function navigateToRoom(index) {
    if (!unlockedRooms.has(index)) return;
    currentRoom = index;
    mapStatus.textContent = `Saavuit huoneeseen ${index + 1}: ${rooms[index].name}.`;
    renderRoom();
    animateRoomArrival();
  }

  function pullLever(index) {
    if (pulledLevers[currentRoom].has(index)) return;
    pulledLevers[currentRoom].add(index);
    replayAnimation(roomPanel, "is-activated");
    const roomIndex = currentRoom;
    const isFirstLever = index === 0;
    const nextRoom = (roomIndex + 1) % rooms.length;
    if (isFirstLever) unlockedRooms.add(nextRoom);
    lastLeverMessages[roomIndex] = `Vipu ${index + 1} vedetty: ${rooms[roomIndex].name} — ${leverHints[index]}.`;
    if (isFirstLever) {
      routeMessages[roomIndex] = roomIndex === rooms.length - 1
        ? "Kehän viimeinen ovi avautuu takaisin Kuun kirjastoon. Kaikki kymmenen kammiota ovat nyt yhteydessä."
        : `${rooms[nextRoom].name} avautuu. Uusi yhteys lisätty huoneiden kehään.`;
    }
    renderRoom();
    if (isFirstLever) {
      mapStatus.textContent = `Vipu avasi yhteyden huoneeseen ${nextRoom + 1}: ${rooms[nextRoom].name}.`;
    }
  }

  previousButton.addEventListener("click", () => {
    navigateToRoom((currentRoom + rooms.length - 1) % rooms.length);
  });

  nextButton.addEventListener("click", () => {
    navigateToRoom((currentRoom + 1) % rooms.length);
  });

  renderRoom();
  animateRoomArrival();
})();
