import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const terrainStyles = {
  hall: { floor: 0x34333a, stone: 0x5d5960, glow: 0xffae63, fog: 0x171820 },
  garden: { floor: 0x293b35, stone: 0x526d5d, glow: 0x9be8ad, fog: 0x101c1a },
  bridge: { floor: 0x293847, stone: 0x526b7a, glow: 0x8bcfff, fog: 0x111923 },
  cinder: { floor: 0x49312b, stone: 0x745044, glow: 0xff874e, fog: 0x201412 },
  throne: { floor: 0x40372f, stone: 0x75634e, glow: 0xffd778, fog: 0x1a1618 }
};

const rarityColors = {
  common: 0xd9d4c8,
  uncommon: 0x8ce0a4,
  rare: 0x76c7ff,
  epic: 0xc89aff,
  legendary: 0xffd36f,
  mythic: 0xff9ed8,
  godly: 0xfff1a3,
  cursed: 0xf27889
};

const toWorldX = (x) => (x - 480) / 54;
const toWorldZ = (y) => (y - 300) / 54;

function addMesh(parent, geometry, material, position, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function material(color, roughness = 0.72, metalness = 0.08, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

function makeNoiseTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const value = 96 + Math.floor(Math.random() * 112);
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function disposeTree(root) {
  root.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((entry) => {
        entry.map?.dispose();
        entry.dispose();
      });
    }
  });
  root.clear();
}

function addBlade(parent, points, bladeMaterial) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.075,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.018,
    bevelThickness: 0.018
  });
  geometry.translate(0, 0, -0.0375);
  return addMesh(parent, geometry, bladeMaterial, [0, 0, 0]);
}

function createWeapon(weaponData) {
  const weapon = new THREE.Group();
  const weaponId = weaponData?.id || "training-sword";
  const color = rarityColors[weaponData?.rarity] || rarityColors.common;
  const bladeMaterial = material(0xdce9f2, 0.22, 0.86, {
    emissive: color,
    emissiveIntensity: 0.12
  });
  const darkMetal = material(0x483a35, 0.48, 0.64);
  const grip = material(0x39251d, 0.88, 0.04);
  const shaft = addMesh(weapon, new THREE.CylinderGeometry(0.047, 0.055, 0.34, 10), grip, [0, -0.07, 0]);
  const isSpear = /spear|halberd|staff/.test(weaponId);
  const isAxe = /axe|breaker/.test(weaponId);
  const isScythe = /scythe|soul-eater/.test(weaponId);
  const isGreatsword = /greatsword|worldbreaker|last-blade|void-crown/.test(weaponId);

  if (isSpear) {
    shaft.scale.y = 4.7;
    shaft.position.y = 0.58;
    addBlade(weapon, [[-0.16, 1.18], [-0.1, 1.66], [0, 1.96], [0.1, 1.66], [0.16, 1.18], [0, 1.35]], bladeMaterial);
    addMesh(weapon, new THREE.BoxGeometry(0.3, 0.07, 0.1), darkMetal, [0, 1.2, 0]);
  } else if (isAxe) {
    shaft.scale.y = 3.8;
    shaft.position.y = 0.48;
    addBlade(weapon, [[0.04, 0.42], [-0.18, 0.62], [-0.58, 0.96], [-0.62, 0.56], [-0.47, 0.31], [-0.2, 0.25], [0.04, 0.4]], bladeMaterial);
    addMesh(weapon, new THREE.BoxGeometry(0.37, 0.08, 0.1), darkMetal, [0.02, 0.4, 0]);
  } else if (isScythe) {
    shaft.scale.y = 4.1;
    shaft.position.y = 0.52;
    addBlade(weapon, [[0, 1.08], [-0.2, 1.32], [-0.52, 1.58], [-0.84, 1.66], [-0.7, 1.42], [-0.42, 1.25], [-0.12, 1.15]], bladeMaterial);
  } else {
    addBlade(
      weapon,
      isGreatsword
        ? [[-0.14, 0.13], [-0.23, 0.78], [-0.2, 1.22], [0, 1.66], [0.2, 1.22], [0.23, 0.78], [0.14, 0.13]]
        : [[-0.1, 0.13], [-0.16, 0.72], [-0.12, 1.03], [0, 1.38], [0.12, 1.03], [0.16, 0.72], [0.1, 0.13]],
      bladeMaterial
    );
    addMesh(weapon, new THREE.BoxGeometry(isGreatsword ? 0.5 : 0.39, 0.075, 0.105), darkMetal, [0, 0.14, 0]);
  }

  addMesh(weapon, new THREE.SphereGeometry(0.085, 12, 8), darkMetal, [0, -0.27, 0]);
  weapon.scale.setScalar(isGreatsword ? 0.78 : isSpear || isScythe ? 0.68 : 0.75);
  weapon.rotation.z = -0.32;
  weapon.position.set(0.48, 0.92, -0.08);
  return weapon;
}

function createCharacter({ boss = false, champion = false, player = false, weapon = null } = {}) {
  const group = new THREE.Group();
  const armorColor = player ? 0x315c76 : boss ? 0x743c36 : champion ? 0x5a4379 : 0x554b43;
  const bodyColor = player ? 0xc1aa86 : boss ? 0x9b6551 : champion ? 0x9a85ae : 0x9d9586;
  const metalColor = player ? 0xc2a96e : boss ? 0xc19458 : champion ? 0xa78bca : 0x83786c;
  const armor = material(armorColor, 0.42, 0.54);
  const body = material(bodyColor, 0.82, 0.03);
  const metal = material(metalColor, 0.3, 0.8);
  const dark = material(0x211c1a, 0.65, 0.2);
  const jointGeometry = new THREE.SphereGeometry(1, 18, 12);
  const limbGeometry = new THREE.CylinderGeometry(0.095, 0.12, 0.47, 10);
  const headSize = boss ? 0.38 : 0.29;

  addMesh(group, limbGeometry, armor, [-0.19, 0.34, 0], [1, 1.15, 1]);
  addMesh(group, limbGeometry, armor, [0.19, 0.34, 0], [1, 1.15, 1]);
  addMesh(group, jointGeometry, dark, [-0.19, 0.08, 0], [0.16, 0.1, 0.22]);
  addMesh(group, jointGeometry, dark, [0.19, 0.08, 0], [0.16, 0.1, 0.22]);
  addMesh(group, new THREE.BoxGeometry(0.66, 0.64, 0.4), armor, [0, 0.93, 0]);
  addMesh(group, jointGeometry, body, [0, 1.42, 0], [headSize, headSize * 1.1, headSize]);
  addMesh(group, new THREE.BoxGeometry(0.49, 0.14, 0.44), metal, [0, 1.56, 0.015]);
  addMesh(group, new THREE.BoxGeometry(0.29, 0.07, 0.045), dark, [0, 1.39, -0.255]);
  addMesh(group, jointGeometry, metal, [-0.42, 1.12, 0], [0.2, 0.24, 0.24]);
  addMesh(group, jointGeometry, metal, [0.42, 1.12, 0], [0.2, 0.24, 0.24]);
  addMesh(group, limbGeometry, body, [-0.46, 0.78, 0], [0.86, 1.05, 0.9]).rotation.z = 0.16;
  addMesh(group, limbGeometry, body, [0.46, 0.78, 0], [0.86, 1.05, 0.9]).rotation.z = -0.16;
  addMesh(group, new THREE.BoxGeometry(0.72, 0.1, 0.46), metal, [0, 0.66, 0]);

  const eyeMaterial = material(0xff754f, 0.3, 0.1, {
    emissive: 0xff3d24,
    emissiveIntensity: 1.8
  });
  addMesh(group, jointGeometry, eyeMaterial, [-0.11, 1.43, -0.247], [0.045, 0.035, 0.024]);
  addMesh(group, jointGeometry, eyeMaterial, [0.11, 1.43, -0.247], [0.045, 0.035, 0.024]);

  const hornMaterial = material(boss ? 0x30231e : 0x776a57, 0.58, 0.12);
  const hornGeometry = new THREE.ConeGeometry(boss ? 0.14 : 0.1, boss ? 0.68 : 0.46, 12);
  const leftHorn = addMesh(group, hornGeometry, hornMaterial, [-0.24, 1.7, 0], [1, 1, 0.8]);
  const rightHorn = addMesh(group, hornGeometry, hornMaterial, [0.24, 1.7, 0], [1, 1, 0.8]);
  leftHorn.rotation.z = -0.52;
  rightHorn.rotation.z = 0.52;

  const weaponGroup = createWeapon(weapon);
  group.add(weaponGroup);
  if (!player) {
    group.scale.setScalar(boss ? 1.55 : champion ? 1.18 : 0.92);
  }
  return { group, body, weaponGroup, weaponId: weapon?.id || null };
}

function createTorch(parent, x, z, color, lights) {
  const fixture = new THREE.Group();
  fixture.position.set(x, 2.7, z);
  parent.add(fixture);
  const iron = material(0x343337, 0.35, 0.82);
  const flameMaterial = material(color, 0.25, 0.05, {
    emissive: color,
    emissiveIntensity: 3
  });
  addMesh(fixture, new THREE.BoxGeometry(0.16, 0.52, 0.16), iron, [0, 0, 0]);
  const flame = addMesh(fixture, new THREE.SphereGeometry(0.15, 12, 10), flameMaterial, [0, 0.38, 0], [0.72, 1.6, 0.72]);
  const light = new THREE.PointLight(color, 6, 8, 1.6);
  light.position.set(x, 3.2, z);
  parent.add(light);
  lights.push({ flame, light, offset: Math.random() * 8 });
}

function createDungeon(scene, field, roomNumber) {
  const palette = terrainStyles[field.terrain] || terrainStyles.hall;
  const room = new THREE.Group();
  room.userData.roomNumber = roomNumber;
  scene.add(room);
  const noise = makeNoiseTexture();
  const stoneMaterial = material(palette.stone, 0.9, 0.04, { map: noise, bumpMap: noise, bumpScale: 0.075 });
  const floorMaterial = material(palette.floor, 0.95, 0.02, { map: noise, bumpMap: noise, bumpScale: 0.045 });
  const darkStone = material(0x19191e, 0.92, 0.02);
  const metal = material(0x82766c, 0.4, 0.76);
  const floor = addMesh(room, new THREE.PlaneGeometry(18, 12), floorMaterial, [0, -0.13, 0]);
  floor.rotation.x = -Math.PI / 2;
  const grid = new THREE.GridHelper(18, 18, 0x70695e, 0x514c49);
  grid.position.y = -0.055;
  grid.material.transparent = true;
  grid.material.opacity = 0.19;
  room.add(grid);

  addMesh(room, new THREE.BoxGeometry(18.5, 0.6, 0.5), darkStone, [0, -0.18, -6.05]);
  addMesh(room, new THREE.BoxGeometry(18.5, 0.6, 0.5), darkStone, [0, -0.18, 6.05]);
  addMesh(room, new THREE.BoxGeometry(0.5, 0.6, 12), darkStone, [-9.05, -0.18, 0]);
  addMesh(room, new THREE.BoxGeometry(0.5, 0.6, 12), darkStone, [9.05, -0.18, 0]);
  addMesh(room, new THREE.BoxGeometry(18, 0.55, 0.8), stoneMaterial, [0, 0.14, -6.12]);
  addMesh(room, new THREE.BoxGeometry(18, 0.55, 0.8), stoneMaterial, [0, 0.14, 6.12]);
  addMesh(room, new THREE.BoxGeometry(0.8, 0.55, 12), stoneMaterial, [-9.12, 0.14, 0]);
  addMesh(room, new THREE.BoxGeometry(0.8, 0.55, 12), stoneMaterial, [9.12, 0.14, 0]);

  [-1, 1].forEach((side) => {
    [-1, 1].forEach((depth) => {
      const x = side * 8.15;
      const z = depth * 5.15;
      addMesh(room, new THREE.CylinderGeometry(0.42, 0.54, 4.1, 8), stoneMaterial, [x, 1.9, z]);
      addMesh(room, new THREE.CylinderGeometry(0.66, 0.66, 0.26, 8), metal, [x, 4.02, z]);
      addMesh(room, new THREE.CylinderGeometry(0.58, 0.58, 0.2, 8), metal, [x, -0.02, z]);
    });
  });

  addMesh(room, new THREE.BoxGeometry(0.16, 3.25, 0.24), metal, [-1.6, 1.55, -5.9]);
  addMesh(room, new THREE.BoxGeometry(0.16, 3.25, 0.24), metal, [1.6, 1.55, -5.9]);
  addMesh(room, new THREE.BoxGeometry(3.35, 0.28, 0.35), metal, [0, 3.08, -5.9]);

  const torchLights = [];
  createTorch(room, -7.5, -4.7, palette.glow, torchLights);
  createTorch(room, 7.5, -4.7, palette.glow, torchLights);
  createTorch(room, -7.5, 4.7, palette.glow, torchLights);
  createTorch(room, 7.5, 4.7, palette.glow, torchLights);

  const portal = new THREE.Group();
  portal.position.set(0, 1.65, -5.68);
  room.add(portal);
  const portalMaterial = material(palette.glow, 0.25, 0.1, {
    emissive: palette.glow,
    emissiveIntensity: 2.4,
    transparent: true,
    opacity: 0.82
  });
  const portalRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.11, 16, 48), portalMaterial);
  portal.add(portalRing);
  const portalLight = new THREE.PointLight(palette.glow, 0, 7, 1.5);
  portalLight.position.set(0, 1.7, -4.8);
  room.add(portalLight);

  const shards = new THREE.Group();
  room.add(shards);
  for (let index = 0; index < 17; index += 1) {
    const x = (Math.sin(index * 9.17 + roomNumber) * 7.1);
    const z = Math.cos(index * 3.91 + roomNumber) * 4.5;
    const shard = addMesh(
      shards,
      new THREE.DodecahedronGeometry(0.12 + (index % 3) * 0.045, 0),
      material(index % 2 ? palette.glow : 0x292a30, 0.65, 0.25, {
        emissive: index % 4 === 0 ? palette.glow : 0x000000,
        emissiveIntensity: 0.25
      }),
      [x, -0.02, z]
    );
    shard.rotation.set(index * 0.6, index * 0.9, index * 0.35);
  }
  return { room, palette, portal, portalLight, torchLights };
}

export function createMinos3DRenderer(canvas) {
  if (!canvas) {
    throw new Error("3D-luolaston piirtoalustaa ei löytynyt.");
  }
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11131b);
  scene.fog = new THREE.FogExp2(0x171820, 0.034);
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 90);
  const hemisphere = new THREE.HemisphereLight(0xb9d8f3, 0x251b18, 1.9);
  scene.add(hemisphere);
  const keyLight = new THREE.DirectionalLight(0xffd7a4, 3.2);
  keyLight.position.set(-5, 12, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -12;
  scene.add(keyLight);

  const actorLayer = new THREE.Group();
  const lootLayer = new THREE.Group();
  scene.add(actorLayer, lootLayer);
  let roomState = null;
  let hero = null;
  let currentWeaponId = null;
  let enemyModels = new Map();
  let lootModels = new Map();
  let slash = null;
  let spellLight = null;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    if (width === lastCanvasWidth && height === lastCanvasHeight) {
      return;
    }
    lastCanvasWidth = width;
    lastCanvasHeight = height;
    const pixelRatio = Math.min(
      Math.max(window.devicePixelRatio || 1, 2),
      3840 / width,
      2160 / height
    );
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  function ensureRoom(field, roomNumber) {
    if (roomState?.room.userData.roomNumber === roomNumber) {
      return;
    }
    if (roomState) {
      scene.remove(roomState.room);
      disposeTree(roomState.room);
    }
    roomState = createDungeon(scene, field, roomNumber);
    scene.fog.color.setHex(roomState.palette.fog);
    scene.background.setHex(roomState.palette.fog);
  }

  function updateActorModels(state) {
    if (!hero) {
      hero = createCharacter({ player: true, weapon: state.equippedWeapon });
      actorLayer.add(hero.group);
      currentWeaponId = state.equippedWeapon.id;
    } else if (currentWeaponId !== state.equippedWeapon.id) {
      hero.group.remove(hero.weaponGroup);
      disposeTree(hero.weaponGroup);
      hero.weaponGroup = createWeapon(state.equippedWeapon);
      hero.group.add(hero.weaponGroup);
      hero.weaponId = state.equippedWeapon.id;
      currentWeaponId = state.equippedWeapon.id;
    }

    const liveEnemies = new Set(state.enemies.filter((enemy) => !enemy.dead));
    if (state.boss && !state.boss.dead) {
      liveEnemies.add(state.boss);
    }
    enemyModels.forEach((model, enemy) => {
      if (!liveEnemies.has(enemy)) {
        actorLayer.remove(model.group);
        disposeTree(model.group);
        enemyModels.delete(enemy);
      }
    });
    liveEnemies.forEach((enemy) => {
      if (!enemyModels.has(enemy)) {
        const model = createCharacter({ boss: enemy.isBoss, champion: enemy.isChampion });
        const healthBar = new THREE.Group();
        const red = material(0x351b1d, 0.55, 0.04);
        const green = material(0x79d78c, 0.42, 0.02, { emissive: 0x216432, emissiveIntensity: 0.4 });
        const back = addMesh(healthBar, new THREE.BoxGeometry(0.9, 0.075, 0.035), red, [0, 0, 0]);
        const fill = addMesh(healthBar, new THREE.BoxGeometry(0.85, 0.045, 0.04), green, [0, 0, 0.025]);
        model.group.add(healthBar);
        model.healthBar = { group: healthBar, back, fill };
        actorLayer.add(model.group);
        enemyModels.set(enemy, model);
      }
    });
  }

  function updateLoot(state, time) {
    const currentDrops = new Set(state.lootDrops.filter((drop) => !drop.collected));
    lootModels.forEach((model, drop) => {
      if (!currentDrops.has(drop)) {
        lootLayer.remove(model);
        disposeTree(model);
        lootModels.delete(drop);
      }
    });
    currentDrops.forEach((drop) => {
      let model = lootModels.get(drop);
      if (!model) {
        model = new THREE.Group();
        const gold = material(0xffd36d, 0.23, 0.85, { emissive: 0xffa51e, emissiveIntensity: 0.8 });
        addMesh(model, new THREE.TorusGeometry(0.2, 0.055, 10, 20), gold, [0, 0, 0]);
        const light = new THREE.PointLight(0xffbd54, 1.2, 2.4);
        light.position.y = 0.3;
        model.add(light);
        lootLayer.add(model);
        lootModels.set(drop, model);
      }
      model.position.set(toWorldX(drop.x), 0.33 + Math.sin(time * 3 + drop.x) * 0.08, toWorldZ(drop.y));
      model.rotation.x = Math.PI / 2;
      model.rotation.z = time * 0.8;
    });
  }

  function render(state) {
    resize();
    ensureRoom(state.field, state.roomNumber);
    updateActorModels(state);
    const time = performance.now() / 1000;
    const playerX = toWorldX(state.player.x);
    const playerZ = toWorldZ(state.player.y);
    const facingAngle = Math.atan2(-state.player.facing.x, -state.player.facing.y);
    hero.group.position.set(playerX, 0, playerZ);
    hero.group.rotation.y = facingAngle;
    hero.group.position.y = Math.sin(time * 7) * 0.025;
    hero.body.emissive.setHex(state.player.invulnerability > 0 ? 0x6a6a55 : 0x000000);
    hero.body.emissiveIntensity = state.player.invulnerability > 0 ? 0.65 : 0;

    enemyModels.forEach((model, enemy) => {
      const x = toWorldX(enemy.x);
      const z = toWorldZ(enemy.y);
      model.group.position.set(x, Math.sin(time * 3 + enemy.x) * 0.025, z);
      model.group.rotation.y = Math.atan2(-(state.player.x - enemy.x), -(state.player.y - enemy.y));
      model.group.position.y += enemy.isBoss ? 0 : Math.sin(time * 5 + enemy.y) * 0.035;
      model.body.emissive.setHex(enemy.hitFlash > 0 ? 0xff5438 : 0x000000);
      model.body.emissiveIntensity = enemy.hitFlash > 0 ? 1.2 : 0;
      model.healthBar.group.position.set(0, enemy.isBoss ? 3.35 : 2.3, 0);
      model.healthBar.group.rotation.y = -model.group.rotation.y;
      const ratio = THREE.MathUtils.clamp(enemy.health / enemy.maxHealth, 0, 1);
      model.healthBar.fill.scale.x = ratio;
      model.healthBar.fill.position.x = -0.425 * (1 - ratio);
    });

    updateLoot(state, time);
    const cameraTarget = new THREE.Vector3(playerX, 0.95, playerZ);
    const follow = new THREE.Vector3(
      THREE.MathUtils.clamp(playerX + Math.sin(facingAngle) * 4.8, -7.6, 7.6),
      8.4,
      THREE.MathUtils.clamp(playerZ + Math.cos(facingAngle) * 5.6, -5.05, 5.05)
    );
    camera.position.lerp(follow, 0.16);
    camera.lookAt(cameraTarget);

    roomState.portal.visible = state.exitOpen;
    roomState.portal.rotation.z = time * 0.22;
    roomState.portalLight.intensity = state.exitOpen ? 4.5 : 0;
    roomState.torchLights.forEach(({ flame, light, offset }) => {
      const flicker = 0.82 + Math.sin(time * 8 + offset) * 0.13 + Math.sin(time * 17 + offset) * 0.05;
      flame.scale.y = 1.6 * flicker;
      light.intensity = 5.5 * flicker;
    });

    if (!slash) {
      slash = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.09, 12, 32, Math.PI * 1.1),
        material(rarityColors[state.equippedWeapon.rarity] || rarityColors.common, 0.2, 0.5, {
          emissive: rarityColors[state.equippedWeapon.rarity] || rarityColors.common,
          emissiveIntensity: 1.9,
          transparent: true,
          opacity: 0.8
        })
      );
      scene.add(slash);
    }
    slash.visible = state.slashTimer > 0;
    if (slash.visible) {
      slash.position.set(
        playerX + state.player.facing.x * 0.72,
        0.82,
        playerZ + state.player.facing.y * 0.72
      );
      slash.rotation.set(Math.PI / 2, 0, facingAngle - 0.4);
      slash.material.opacity = Math.min(1, state.slashTimer / 0.22);
    }

    if (!spellLight) {
      spellLight = new THREE.PointLight(0x9cdbff, 0, 13, 1.4);
      scene.add(spellLight);
    }
    spellLight.position.set(playerX, 1.5, playerZ);
    spellLight.intensity = state.spellFlash > 0 ? 12 * (state.spellFlash / 0.45) : 0;
    renderer.render(scene, camera);
  }

  return {
    render,
    dispose() {
      resizeObserver.disconnect();
      renderer.dispose();
      disposeTree(scene);
    }
  };
}
