(() => {
  const stage = document.querySelector("[data-city-game-stage]");
  const canvas = document.querySelector("[data-city-canvas]");
  if (!stage || !(canvas instanceof HTMLCanvasElement)) {
    console.error("Pöllökaupungin pelialuetta ei löytynyt.");
    return;
  }

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    console.error("Pöllökaupungin piirtoalustaa ei voitu käynnistää.");
    return;
  }

  const positionLabel = document.querySelector("[data-city-position]");
  const starLabel = document.querySelector("[data-star-count]");
  const statusLabel = document.querySelector("[data-city-game-status]");
  const teleportOverlay = document.querySelector("[data-city-teleport]");
  const templeStage = document.querySelector("[data-city-temple]");
  const keysDown = new Set();
  const touchControls = new Map([
    ["[data-game-left]", "left"],
    ["[data-game-right]", "right"],
    ["[data-game-jump]", "jump"]
  ]);
  const worldWidth = 5700;
  const gravity = 1850;
  const moveSpeed = 340;
  const jumpSpeed = 735;
  const referenceFloorY = 483;
  const platformLayout = [
    { x: 390, y: 390, width: 185, height: 22 },
    { x: 810, y: 345, width: 210, height: 22 },
    { x: 1220, y: 400, width: 205, height: 22 },
    { x: 1650, y: 345, width: 220, height: 22 },
    { x: 2110, y: 390, width: 190, height: 22 },
    { x: 2520, y: 340, width: 220, height: 22 },
    { x: 2990, y: 390, width: 200, height: 22 },
    { x: 3420, y: 345, width: 240, height: 22 },
    { x: 3910, y: 390, width: 210, height: 22 },
    { x: 4390, y: 340, width: 235, height: 22 },
    { x: 4890, y: 385, width: 210, height: 22 }
  ];
  const starPositions = [
    [300, 390], [490, 342], [780, 445], [905, 280],
    [1190, 445], [1320, 345], [1610, 445], [1760, 274],
    [2080, 445], [2190, 340], [2490, 445], [2630, 268],
    [2960, 445], [3090, 340], [3390, 445], [3540, 276],
    [3880, 445], [4000, 340], [4360, 445], [4510, 260],
    [4860, 445], [5000, 337], [5350, 445], [5500, 390]
  ];
  const stars = starPositions.map(([x, y], index) => ({
    x,
    y,
    phase: index * 0.63,
    collected: false
  }));
  const npcList = [
    { x: 650, name: "Lyhtypöllö", line: "Auta kirkon lyhtytehtävässä — kaupungin katuvalot ovat nyt kirkkaat!" },
    { x: 1450, name: "Arkistonhoitaja", line: "Vanha tähtikartta osoittaa kaupungin kaukaisimpaan puutarhaan." },
    { x: 2220, name: "Kuoronjohtaja", line: "Kuuntele tuulta: kolme säveltä avaa aamun salaisuuden." },
    { x: 3190, name: "Siltaopas", line: "Kokeile hyppyä laiturilta laiturille ja kurkkaa alas kimmeltävään jokeen." },
    { x: 4180, name: "Yövartija", line: "Siniset lyhdyt näyttävät tien takaisin tähtikirkolle." },
    { x: 5100, name: "Puutarhuri", line: "Kaikki kaksikymmentäneljä kristallia kuuluvat yhteiseen taivaaseen." }
  ];
  const secretPlaces = [
    { x: 1080, name: "Kuunliljojen lähde", clue: "Kosteiden kivien alta löytyi Kuunliljojen lähde." },
    { x: 3760, name: "Kaikukellari", clue: "Vanhan kellotornin alta paljastui laulava Kaikukellari." },
    { x: 4820, name: "Pöllöjen tähtipuutarha", clue: "Salainen tähtipuutarha hehkuu sinisten lyhtyjen takana." }
  ];
  const templePortalX = 2850;
  const discoveredSecrets = new Set();
  let trophyCollected = false;
  const landmarks = [
    { x: 80, width: 400, height: 270, color: "#b88e92", roof: "#75607e", kind: "house" },
    { x: 550, width: 320, height: 225, color: "#ddc099", roof: "#8b687b", kind: "tower" },
    { x: 990, width: 440, height: 290, color: "#9b8cb3", roof: "#655879", kind: "library" },
    { x: 1570, width: 350, height: 235, color: "#d0a07e", roof: "#6d5f7c", kind: "house" },
    { x: 2100, width: 420, height: 300, color: "#a6a0bd", roof: "#665b7e", kind: "spire" },
    { x: 2710, width: 370, height: 245, color: "#c59a8f", roof: "#765b76", kind: "house" },
    { x: 3300, width: 460, height: 320, color: "#8d9db3", roof: "#59627c", kind: "tower" },
    { x: 3980, width: 390, height: 250, color: "#c5a783", roof: "#77627b", kind: "library" },
    { x: 4640, width: 480, height: 305, color: "#a58fb0", roof: "#5c557d", kind: "spire" },
    { x: 5260, width: 350, height: 225, color: "#d4ad8b", roof: "#75617a", kind: "house" }
  ];

  let viewWidth = 800;
  let viewHeight = 500;
  let pixelRatio = 1;
  let cameraX = 0;
  let running = false;
  let frameHandle = 0;
  let lastFrameTime = 0;
  let totalCollected = 0;
  let player = { x: 150, y: 0, vx: 0, vy: 0, width: 44, height: 70, grounded: false, facing: 1 };

  const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      return;
    }
    viewWidth = bounds.width;
    viewHeight = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(viewWidth * pixelRatio);
    canvas.height = Math.round(viewHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (player.y === 0) {
      player.y = floorY() - player.height;
    }
  };

  const floorY = () => viewHeight - Math.max(70, viewHeight * 0.14);
  const platformOffset = () => floorY() - referenceFloorY;
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const roundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  };

  const drawSky = (time) => {
    const gradient = context.createLinearGradient(0, 0, 0, viewHeight);
    gradient.addColorStop(0, "#202b59");
    gradient.addColorStop(0.52, "#7b7198");
    gradient.addColorStop(1, "#e0a77e");
    context.fillStyle = gradient;
    context.fillRect(0, 0, viewWidth, viewHeight);

    const sunX = viewWidth * 0.77 - cameraX * 0.025;
    const sunY = viewHeight * 0.24;
    const halo = context.createRadialGradient(sunX, sunY, 8, sunX, sunY, viewHeight * 0.25);
    halo.addColorStop(0, "rgba(255,244,204,.96)");
    halo.addColorStop(0.12, "rgba(255,224,175,.55)");
    halo.addColorStop(1, "rgba(255,220,165,0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, viewWidth, viewHeight * 0.72);

    for (let index = 0; index < 38; index += 1) {
      const x = ((index * 197 + 41) % 1900 - (cameraX * 0.11) % 1900 + 1900) % 1900 / 1900 * viewWidth;
      const y = (index * 67 + 29) % Math.floor(viewHeight * 0.45);
      const twinkle = 0.32 + (Math.sin(time * 0.0015 + index) + 1) * 0.28;
      context.globalAlpha = twinkle;
      context.fillStyle = "#fff4d8";
      context.beginPath();
      context.arc(x, y, index % 8 === 0 ? 2 : 1.1, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  const drawBackgroundCity = (time) => {
    const layers = [
      { factor: 0.16, base: floorY() * 0.73, color: "#77718c", alpha: 0.34 },
      { factor: 0.32, base: floorY() * 0.83, color: "#625d7c", alpha: 0.51 },
      { factor: 0.56, base: floorY() * 0.94, color: "#524963", alpha: 0.76 }
    ];
    layers.forEach((layer, layerIndex) => {
      context.fillStyle = layer.color;
      context.globalAlpha = layer.alpha;
      for (let index = -1; index < 18; index += 1) {
        const buildingWidth = 70 + (index * 43 + layerIndex * 21) % 80;
        const x = (index * 180 - cameraX * layer.factor) % (viewWidth + 180);
        const height = 50 + (index * 61 + layerIndex * 29) % Math.max(90, viewHeight * 0.31);
        const y = layer.base - height;
        context.fillRect(x, y, buildingWidth, height);
        context.beginPath();
        context.moveTo(x - 9, y);
        context.lineTo(x + buildingWidth / 2, y - 25 - layerIndex * 5);
        context.lineTo(x + buildingWidth + 9, y);
        context.closePath();
        context.fill();
        if (layerIndex === 2) {
          for (let windowX = x + 13; windowX < x + buildingWidth - 8; windowX += 25) {
            for (let windowY = y + 22; windowY < layer.base - 25; windowY += 31) {
              const lit = Math.sin(index * 9 + windowX + time * 0.0004) > 0.1;
              if (lit) {
                context.fillStyle = "rgba(255,226,164,.75)";
                context.fillRect(windowX, windowY, 7, 11);
                context.fillStyle = layer.color;
              }
            }
          }
        }
      }
    });
    context.globalAlpha = 1;

    const farLandmarkX = 3350 - cameraX * 0.22;
    if (farLandmarkX > -260 && farLandmarkX < viewWidth + 260) {
      const base = floorY() - 92;
      context.save();
      context.translate(farLandmarkX, base);
      context.globalAlpha = 0.48;
      context.fillStyle = "#eee1d0";
      context.fillRect(-120, -175, 240, 175);
      context.beginPath();
      context.moveTo(-145, -175);
      context.lineTo(0, -250);
      context.lineTo(145, -175);
      context.closePath();
      context.fill();
      context.fillRect(-98, -245, 42, 140);
      context.fillRect(56, -245, 42, 140);
      context.beginPath();
      context.moveTo(-112, -245);
      context.lineTo(-77, -295);
      context.lineTo(-42, -245);
      context.moveTo(42, -245);
      context.lineTo(77, -295);
      context.lineTo(112, -245);
      context.fill();
      context.restore();
    }
  };

  const drawLandmark = (building, time) => {
    const x = building.x - cameraX;
    const base = floorY();
    if (x + building.width < -80 || x > viewWidth + 80) {
      return;
    }

    const y = base - building.height;
    context.save();
    context.shadowColor = "rgba(29,22,47,.26)";
    context.shadowBlur = 18;
    context.shadowOffsetY = 8;
    context.fillStyle = building.color;
    context.fillRect(x, y + building.height * 0.22, building.width, building.height * 0.78);
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.fillStyle = building.roof;
    context.beginPath();
    context.moveTo(x - 18, y + building.height * 0.24);
    context.lineTo(x + building.width / 2, y - 32);
    context.lineTo(x + building.width + 18, y + building.height * 0.24);
    context.closePath();
    context.fill();

    if (building.kind === "tower" || building.kind === "spire") {
      context.fillStyle = building.color;
      context.fillRect(x + building.width * 0.12, y, building.width * 0.18, building.height * 0.57);
      context.fillRect(x + building.width * 0.7, y, building.width * 0.18, building.height * 0.57);
      context.fillStyle = building.roof;
      [x + building.width * 0.21, x + building.width * 0.79].forEach((towerX) => {
        context.beginPath();
        context.moveTo(towerX - building.width * 0.1, y + 8);
        context.lineTo(towerX, y - (building.kind === "spire" ? 70 : 48));
        context.lineTo(towerX + building.width * 0.1, y + 8);
        context.closePath();
        context.fill();
      });
    }

    const windowColor = `rgba(255,232,185,${0.7 + Math.sin(time * 0.001 + building.x) * 0.12})`;
    const columns = Math.max(2, Math.floor(building.width / 90));
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < 2; row += 1) {
        const windowX = x + 35 + column * ((building.width - 70) / columns);
        const windowY = y + 72 + row * 74;
        context.fillStyle = windowColor;
        roundedRect(context, windowX, windowY, 21, 33, [11, 11, 3, 3]);
        context.fill();
        context.fillStyle = "rgba(100,111,151,.62)";
        context.fillRect(windowX + 9, windowY, 2, 33);
      }
    }

    context.fillStyle = "#604d66";
    roundedRect(context, x + building.width / 2 - 25, base - 83, 50, 83, [25, 25, 2, 2]);
    context.fill();
    context.fillStyle = "#ffd98f";
    context.beginPath();
    context.arc(x + building.width / 2, base - 51, 3, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const drawGround = () => {
    const ground = floorY();
    const gradient = context.createLinearGradient(0, ground, 0, viewHeight);
    gradient.addColorStop(0, "#927a88");
    gradient.addColorStop(0.1, "#64556d");
    gradient.addColorStop(1, "#302c47");
    context.fillStyle = gradient;
    context.fillRect(0, ground, viewWidth, viewHeight - ground);
    context.fillStyle = "#e3c4a0";
    context.fillRect(0, ground, viewWidth, 5);
    context.fillStyle = "rgba(244,214,178,.3)";
    for (let index = 0; index < 18; index += 1) {
      const tileX = ((index * 105 - cameraX * 0.97) % (viewWidth + 110) + viewWidth + 110) % (viewWidth + 110);
      context.fillRect(tileX, ground + 30, 2, viewHeight - ground);
    }
    context.fillStyle = "rgba(255,225,182,.18)";
    for (let index = 0; index < 7; index += 1) {
      const x = ((index * 190 - cameraX * 0.8) % (viewWidth + 200) + viewWidth + 200) % (viewWidth + 200);
      context.fillRect(x, ground + 48 + (index % 2) * 28, 38 + (index % 3) * 12, 3);
    }
  };

  const drawPlatform = (platform) => {
    const x = platform.x - cameraX;
    if (x + platform.width < -20 || x > viewWidth + 20) {
      return;
    }
    context.save();
    context.shadowColor = "rgba(83,211,255,.35)";
    context.shadowBlur = 13;
    const stone = context.createLinearGradient(x, platform.y, x, platform.y + platform.height);
    stone.addColorStop(0, "#c7a6a2");
    stone.addColorStop(1, "#62566f");
    context.fillStyle = stone;
    roundedRect(context, x, platform.y, platform.width, platform.height, 8);
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = "#aef1f4";
    roundedRect(context, x + 8, platform.y + 3, platform.width - 16, 5, 3);
    context.fill();
    context.fillStyle = "rgba(48,50,73,.64)";
    for (let pebble = x + 14; pebble < x + platform.width - 10; pebble += 34) {
      context.fillRect(pebble, platform.y + 13, 14, 3);
    }
    context.restore();
  };

  const drawLamp = (worldX, time, index) => {
    const x = worldX - cameraX;
    const ground = floorY();
    if (x < -40 || x > viewWidth + 40) {
      return;
    }
    context.save();
    context.strokeStyle = "#4a405d";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(x, ground);
    context.lineTo(x, ground - 100);
    context.lineTo(x + 22, ground - 112);
    context.stroke();
    const flicker = 0.75 + Math.sin(time * 0.004 + index) * 0.12;
    const glow = context.createRadialGradient(x + 22, ground - 118, 2, x + 22, ground - 118, 42);
    glow.addColorStop(0, `rgba(255,242,179,${flicker})`);
    glow.addColorStop(0.24, "rgba(185,235,255,.45)");
    glow.addColorStop(1, "rgba(123,202,255,0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x + 22, ground - 118, 42, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff1bd";
    context.beginPath();
    context.arc(x + 22, ground - 118, 8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const drawStar = (star, time) => {
    if (star.collected) {
      return;
    }
    const x = star.x - cameraX;
    if (x < -40 || x > viewWidth + 40) {
      return;
    }
    const y = star.y + platformOffset() + Math.sin(time * 0.002 + star.phase) * 7;
    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(time * 0.001 + star.phase) * 0.18);
    context.shadowColor = "#98f2ff";
    context.shadowBlur = 21;
    context.fillStyle = "#ecffff";
    context.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const radius = point % 2 === 0 ? 15 : 6;
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    context.closePath();
    context.fill();
    context.restore();
  };

  const drawTemplePortal = (time) => {
    const x = templePortalX - cameraX;
    if (x < -100 || x > viewWidth + 100) {
      return;
    }
    const ground = floorY();
    const pulse = 0.72 + (Math.sin(time * 0.002) + 1) * 0.14;
    context.save();
    context.translate(x, ground - 10);
    context.shadowColor = "#8ff5ff";
    context.shadowBlur = 36 * pulse;
    context.strokeStyle = `rgba(185,245,255,${pulse})`;
    context.lineWidth = 9;
    context.beginPath();
    context.ellipse(0, -72, 39, 68, 0, Math.PI, 0);
    context.lineTo(39, 0);
    context.moveTo(-39, 0);
    context.lineTo(-39, -72);
    context.stroke();
    context.shadowBlur = 0;
    const beam = context.createLinearGradient(0, -140, 0, -8);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.5, `rgba(175,245,255,${pulse * 0.5})`);
    beam.addColorStop(1, "rgba(255,255,255,.82)");
    context.fillStyle = beam;
    context.fillRect(-28, -142, 56, 140);
    context.fillStyle = "#fff4c4";
    context.font = "900 13px Arial";
    context.textAlign = "center";
    context.fillText("VALON TEMPPELI", 0, -158);
    if (Math.abs(player.x + player.width / 2 - templePortalX) < 150) {
      context.fillStyle = "#edffff";
      context.fillText("E · ASTU SÄTEESEEN", 0, -179);
    }
    context.restore();
  };

  const drawSecretPlaces = (time) => {
    secretPlaces.forEach((place, index) => {
      if (discoveredSecrets.has(place.name)) {
        return;
      }
      const x = place.x - cameraX;
      if (x < -60 || x > viewWidth + 60) {
        return;
      }
      const ground = floorY();
      const shimmer = 0.58 + (Math.sin(time * 0.003 + index * 2) + 1) * 0.18;
      context.save();
      context.globalAlpha = shimmer;
      context.shadowColor = "#b8a4ff";
      context.shadowBlur = 22;
      context.fillStyle = "#d9caff";
      context.beginPath();
      context.arc(x, ground - 21, 8 + Math.sin(time * 0.003 + index) * 2, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.textAlign = "center";
      context.font = "900 11px Arial";
      if (Math.abs(player.x + player.width / 2 - place.x) < 135) {
        context.fillText("E · TUTKI SALAISUUS", x, ground - 47);
      }
      context.restore();
    });
  };

  const drawOwl = (x, y, scale, time, isPlayer = false) => {
    context.save();
    context.translate(x, y + Math.sin(time * 0.003 + x) * 2);
    context.scale(scale, scale);
    if (isPlayer && player.facing < 0) {
      context.scale(-1, 1);
    }

    context.fillStyle = "rgba(28,24,51,.24)";
    context.beginPath();
    context.ellipse(0, 4, 25, 8, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = isPlayer ? "#9a6f69" : "#77677b";
    context.beginPath();
    context.ellipse(0, -30, 21, 29, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = isPlayer ? "#e5c794" : "#d8c39b";
    context.beginPath();
    context.ellipse(0, -26, 13, 22, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = isPlayer ? "#b18479" : "#96829a";
    context.beginPath();
    context.arc(0, -55, 20, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(-17, -68);
    context.lineTo(-19, -86);
    context.lineTo(-5, -72);
    context.moveTo(17, -68);
    context.lineTo(19, -86);
    context.lineTo(5, -72);
    context.fill();

    [-8, 8].forEach((eyeX) => {
      context.fillStyle = "#fff1d2";
      context.beginPath();
      context.arc(eyeX, -56, 6, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#31466a";
      context.beginPath();
      context.arc(eyeX + 1.2, -56, 3.2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff";
      context.beginPath();
      context.arc(eyeX + 1.8, -57.2, 1.2, 0, Math.PI * 2);
      context.fill();
    });

    context.fillStyle = "#efc46d";
    context.beginPath();
    context.moveTo(-3, -48);
    context.lineTo(3, -48);
    context.lineTo(0, -42);
    context.closePath();
    context.fill();

    context.strokeStyle = "#edc16e";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-7, -4);
    context.lineTo(-9, 0);
    context.lineTo(-13, 0);
    context.moveTo(7, -4);
    context.lineTo(9, 0);
    context.lineTo(13, 0);
    context.stroke();
    if (isPlayer) {
      context.fillStyle = "#a9f2ff";
      context.beginPath();
      context.arc(19, -38, 4, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = "#74e6ff";
      context.shadowBlur = 14;
      context.fill();
    }
    context.restore();
  };

  const drawNPCs = (time) => {
    npcList.forEach((npc, index) => {
      const x = npc.x - cameraX;
      if (x < -50 || x > viewWidth + 50) {
        return;
      }
      drawOwl(x, floorY(), 0.95, time + index * 1200);
      context.save();
      context.textAlign = "center";
      context.font = "700 12px Arial";
      const labelWidth = context.measureText(npc.name).width + 20;
      roundedRect(context, x - labelWidth / 2, floorY() - 160, labelWidth, 25, 9);
      context.fillStyle = "rgba(25,33,64,.78)";
      context.fill();
      context.fillStyle = "#f9e9c8";
      context.fillText(npc.name, x, floorY() - 143);
      if (Math.abs(player.x + player.width / 2 - npc.x) < 115) {
        context.fillStyle = "#d4f7ff";
        context.font = "900 13px Arial";
        context.fillText("E · PUHU", x, floorY() - 171);
      }
      context.restore();
    });
  };

  const drawPlayer = (time) => {
    const screenX = player.x - cameraX + player.width / 2;
    const screenY = player.y + player.height;
    const walking = Math.abs(player.vx) > 8 && player.grounded;
    context.save();
    if (walking) {
      context.translate(0, Math.sin(time * 0.018) * 3);
    }
    drawOwl(screenX, screenY, 1.13, time, true);
    context.restore();
  };

  const nearestNPC = () => npcList.reduce((closest, npc) => {
    const distance = Math.abs(player.x + player.width / 2 - npc.x);
    return distance < closest.distance ? { npc, distance } : closest;
  }, { npc: null, distance: 116 });

  const interact = () => {
    if (Math.abs(player.x + player.width / 2 - templePortalX) < 150) {
      statusLabel.textContent = "Valonsäde kutsuu temppeliin. Astut säteeseen...";
      document.dispatchEvent(new CustomEvent("citygame:temple"));
      return;
    }
    const secret = secretPlaces.find((place) =>
      !discoveredSecrets.has(place.name) && Math.abs(player.x + player.width / 2 - place.x) < 100
    );
    if (secret) {
      discoveredSecrets.add(secret.name);
      statusLabel.textContent = `${secret.clue} Löysit salaisuuden ${discoveredSecrets.size} / ${secretPlaces.length}.`;
      return;
    }
    const nearby = nearestNPC();
    if (!nearby.npc) {
      statusLabel.textContent = "Etsi valon temppeli, salaisia paikkoja tai kävele pöllön luo.";
      return;
    }
    statusLabel.textContent = `${nearby.npc.name}: “${nearby.npc.line}”`;
  };

  const updatePositionLabel = () => {
    const area = player.x < 900 ? "Kuun lyhtykatu"
      : player.x < 1800 ? "Tähtikirjaston aukio"
        : player.x < 2800 ? "Hopeatornin tori"
          : player.x < 3900 ? "Laulavan sillan alue"
            : player.x < 4900 ? "Sinisten lyhtyjen puisto"
              : "Kuun puutarha";
    if (positionLabel) {
      positionLabel.textContent = area;
    }
  };

  const updatePlayer = (delta) => {
    const previousBottom = player.y + player.height;
    const left = keysDown.has("left") || keysDown.has("ArrowLeft") || keysDown.has("a") || keysDown.has("A");
    const right = keysDown.has("right") || keysDown.has("ArrowRight") || keysDown.has("d") || keysDown.has("D");
    if (left !== right) {
      player.vx = left ? -moveSpeed : moveSpeed;
      player.facing = left ? -1 : 1;
    } else {
      player.vx *= Math.pow(0.0015, delta);
      if (Math.abs(player.vx) < 4) {
        player.vx = 0;
      }
    }
    player.x = clamp(player.x + player.vx * delta, 0, worldWidth - player.width);

    if ((keysDown.has("jump") || keysDown.has(" ") || keysDown.has("ArrowUp") || keysDown.has("w") || keysDown.has("W")) && player.grounded) {
      player.vy = -jumpSpeed;
      player.grounded = false;
      keysDown.delete("jump");
    }

    player.vy = Math.min(1150, player.vy + gravity * delta);
    player.y += player.vy * delta;
    player.grounded = false;
    const currentBottom = player.y + player.height;
    const ground = floorY();
    if (currentBottom >= ground) {
      player.y = ground - player.height;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy >= 0) {
      for (const platform of platformLayout) {
        const platformY = platform.y + platformOffset();
        const overlapsHorizontally = player.x + player.width > platform.x && player.x < platform.x + platform.width;
        if (overlapsHorizontally && previousBottom <= platformY + 7 && currentBottom >= platformY) {
          player.y = platformY - player.height;
          player.vy = 0;
          player.grounded = true;
          break;
        }
      }
    }

    stars.forEach((star) => {
      if (star.collected) {
        return;
      }
      const floatingY = star.y + platformOffset();
      if (Math.abs(player.x + player.width / 2 - star.x) < 30
        && player.y < floatingY + 25
        && player.y + player.height > floatingY - 25) {
        star.collected = true;
        totalCollected += 1;
        if (starLabel) {
          starLabel.textContent = String(totalCollected);
        }
        statusLabel.textContent = totalCollected === 24
          ? "Keräsit kaikki 24 tähtikristallia. Pöllökaupunki loistaa taas kirkkaana!"
          : `Tähtikristalli löytyi · ${totalCollected} / 24. Etsi lisää kaupungin kaduilta!`;
      }
    });

    const targetCamera = clamp(player.x - viewWidth * 0.38, 0, worldWidth - viewWidth);
    cameraX += (targetCamera - cameraX) * Math.min(1, delta * 5.5);
    updatePositionLabel();
  };

  const render = (time) => {
    context.clearRect(0, 0, viewWidth, viewHeight);
    drawSky(time);
    drawBackgroundCity(time);

    const riverY = floorY() - 2;
    context.fillStyle = "rgba(78,174,207,.23)";
    context.fillRect(0, riverY + 10, viewWidth, 31);
    context.fillStyle = "rgba(207,245,240,.42)";
    for (let index = 0; index < 10; index += 1) {
      const rippleX = ((index * 177 - cameraX * 0.65) % (viewWidth + 180) + viewWidth + 180) % (viewWidth + 180);
      context.fillRect(rippleX, riverY + 21 + Math.sin(time * 0.002 + index) * 7, 40 + (index % 3) * 13, 2);
    }

    landmarks.forEach((building) => drawLandmark(building, time));
    for (let index = 0; index < 15; index += 1) {
      drawLamp(180 + index * 390, time, index);
    }
    drawGround();
    drawTemplePortal(time);
    drawSecretPlaces(time);
    platformLayout.forEach((platform) => drawPlatform({
      ...platform,
      y: platform.y + platformOffset()
    }));
    stars.forEach((star) => drawStar(star, time));
    drawNPCs(time);
    drawPlayer(time);
  };

  const tick = (time) => {
    if (!running) {
      return;
    }
    const delta = Math.min((time - lastFrameTime) / 1000 || 0, 0.035);
    lastFrameTime = time;
    updatePlayer(delta);
    render(time);
    frameHandle = window.requestAnimationFrame(tick);
  };

  const startGame = () => {
    if (running) {
      canvas.focus({ preventScroll: true });
      return;
    }
    running = true;
    resizeCanvas();
    player.y = floorY() - player.height;
    lastFrameTime = performance.now();
    canvas.focus({ preventScroll: true });
    frameHandle = window.requestAnimationFrame(tick);
  };

  window.addEventListener("resize", resizeCanvas);
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvas).observe(canvas);
  }

  document.addEventListener("citygame:start", startGame);
  canvas.addEventListener("pointerdown", () => canvas.focus({ preventScroll: true }));
  window.addEventListener("keydown", (event) => {
    if (!running || stage.hidden) {
      return;
    }
    const key = event.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(key)) {
      event.preventDefault();
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "A", "d", "D", "w", "W"].includes(key)) {
      keysDown.add(key);
    }
    if (key === "e" || key === "E") {
      interact();
    }
  });

  window.addEventListener("keyup", (event) => keysDown.delete(event.key));
  window.addEventListener("blur", () => keysDown.clear());

  touchControls.forEach((direction, selector) => {
    const button = document.querySelector(selector);
    if (!button) {
      return;
    }
    const release = (event) => {
      if (event) {
        event.preventDefault();
      }
      keysDown.delete(direction);
      button.classList.remove("is-pressed");
      button.setAttribute("aria-pressed", "false");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keysDown.add(direction);
      button.classList.add("is-pressed");
      button.setAttribute("aria-pressed", "true");
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  document.querySelector("[data-game-talk]")?.addEventListener("click", interact);
  document.addEventListener("citygame:temple", () => {
    if (!templeStage || !teleportOverlay) {
      statusLabel.textContent = "Temppelin sisäänkäyntiä ei löytynyt.";
      return;
    }
    running = false;
    window.cancelAnimationFrame(frameHandle);
    keysDown.clear();
    running = false;
    window.cancelAnimationFrame(frameHandle);
    keysDown.clear();
    window.playPortalTransition("Kalkkunatemppeli", () => {
      stage.hidden = true;
      templeStage.hidden = false;
      templeStage.classList.remove("temple-returning", "temple-collapsing", "temple-escaping");
      templeStage.classList.add("temple-arrival");
    });
  });

  document.querySelector("[data-trophy]")?.addEventListener("click", (event) => {
    const trophy = event.currentTarget;
    if (trophy.disabled || trophyCollected) {
      return;
    }
    trophy.disabled = true;
    trophyCollected = true;
    trophy.textContent = "POKAALI MUKANA";
    secretPlaces.push(
      { x: 720, name: "Kultakellon kolo", clue: "Pokaalin valo paljasti Kultakellon kolon vanhan tornin seinässä." },
      { x: 4390, name: "Kuunsillan salakammio", clue: "Pokaalin heijastus johdatti Kuunsillan salakammioon." }
    );
    templeStage.classList.add("temple-collapsing");
    document.querySelector("[data-temple-status]").textContent =
      "Pokaali irtosi jalustasta! Temppeli romahtaa — pakene valon uloskäynnille!";
    window.setTimeout(() => document.querySelector("[data-temple-escape]").disabled = false, 900);
  });

  document.querySelector("[data-temple-escape]")?.addEventListener("click", () => {
    const escapeButton = document.querySelector("[data-temple-escape]");
    if (escapeButton.disabled) {
      return;
    }
    escapeButton.disabled = true;
    templeStage.classList.add("temple-escaping");
    document.querySelector("[data-temple-status]").textContent =
      "Juokset sortuvien pylväiden alta kohti uloskäyntiä...";
    window.setTimeout(() => {
      templeStage.hidden = true;
      templeStage.classList.remove("temple-arrival", "temple-collapsing", "temple-escaping");
      stage.hidden = false;
      player.x = templePortalX + 170;
      player.vx = 0;
      player.vy = 0;
      player.y = floorY() - player.height;
      player.grounded = true;
      cameraX = clamp(player.x - viewWidth * 0.38, 0, worldWidth - viewWidth);
      updatePositionLabel();
      statusLabel.textContent = `Pakenit temppelistä pokaali mukanasi. Kaupungissa on nyt ${secretPlaces.length} löydettävää salaisuutta!`;
      escapeButton.disabled = false;
      render(performance.now());
      running = true;
      lastFrameTime = performance.now();
      frameHandle = window.requestAnimationFrame(tick);
    }, 2600);
  });

  const leaveForWebsite = () => {
    window.playPortalTransition("Salainen verkkosivu", () => {
      window.location.assign("index.html");
    });
  };
  document.querySelectorAll("[data-city-home-teleport]").forEach((button) => {
    button.addEventListener("click", leaveForWebsite);
  });
  document.querySelector("[data-temple-portal]")?.addEventListener("click", () => {
    if (!running || stage.hidden) {
      return;
    }
    player.x = templePortalX;
    player.vx = 0;
    cameraX = clamp(player.x - viewWidth * 0.38, 0, worldWidth - viewWidth);
    updatePositionLabel();
    document.dispatchEvent(new CustomEvent("citygame:temple"));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      keysDown.clear();
    } else if (running) {
      lastFrameTime = performance.now();
    }
  });

  window.addEventListener("pagehide", () => {
    running = false;
    window.cancelAnimationFrame(frameHandle);
    keysDown.clear();
  }, { once: true });

  resizeCanvas();
  if (document.body.dataset.cityDirect === "true") {
    startGame();
  }
})();
