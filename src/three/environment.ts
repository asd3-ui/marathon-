import * as THREE from 'three';
import { EnvironmentTheme } from '../types/game';

export class WorldEnvironment {
  public group: THREE.Group;
  public theme: EnvironmentTheme;
  public fog: THREE.Fog;
  public ambientLight: THREE.HemisphereLight;
  public dirLight: THREE.DirectionalLight;
  private particleSystem: THREE.Points | null = null;
  private sceneryProps: THREE.Group[] = [];
  private themeConfig: Record<EnvironmentTheme, {
    skyColor: number;
    groundColor: number;
    fogNear: number;
    fogFar: number;
    sunColor: number;
    sunIntensity: number;
  }>;

  constructor(scene: THREE.Scene, theme: EnvironmentTheme = 'futuristic_city') {
    this.group = new THREE.Group();
    this.theme = theme;
    scene.add(this.group);

    this.themeConfig = {
      cosmic_math_dimension: {
        skyColor: 0x18052e, // Deep cosmic purple from reference image
        groundColor: 0x070314,
        fogNear: 35,
        fogFar: 140,
        sunColor: 0xec4899, // Cyber magenta rim light
        sunIntensity: 2.4
      },
      futuristic_city: {
        skyColor: 0x38bdf8,
        groundColor: 0x0f172a,
        fogNear: 35,
        fogFar: 130,
        sunColor: 0xfff7ed,
        sunIntensity: 2.2
      },
      magic_forest: {
        skyColor: 0x064e3b,
        groundColor: 0x022c22,
        fogNear: 25,
        fogFar: 110,
        sunColor: 0x34d399,
        sunIntensity: 1.8
      },
      desert_temple: {
        skyColor: 0xfbbf24,
        groundColor: 0x78350f,
        fogNear: 30,
        fogFar: 120,
        sunColor: 0xffedd5,
        sunIntensity: 2.4
      },
      ice_kingdom: {
        skyColor: 0x7dd3fc,
        groundColor: 0x0369a1,
        fogNear: 30,
        fogFar: 125,
        sunColor: 0xe0f2fe,
        sunIntensity: 2.0
      },
      volcano_world: {
        skyColor: 0x450a0a,
        groundColor: 0x1c1917,
        fogNear: 20,
        fogFar: 100,
        sunColor: 0xf97316,
        sunIntensity: 2.1
      },
      math_sanctuary: {
        skyColor: 0x1e1b4b,
        groundColor: 0x0f172a,
        fogNear: 30,
        fogFar: 130,
        sunColor: 0xc084fc,
        sunIntensity: 2.2
      }
    };

    const cfg = this.themeConfig[theme];

    // Horizon matched Fog
    this.fog = new THREE.Fog(cfg.skyColor, cfg.fogNear, cfg.fogFar);
    scene.fog = this.fog;
    scene.background = new THREE.Color(cfg.skyColor);

    // Warm Key Directional Sunlight
    this.dirLight = new THREE.DirectionalLight(cfg.sunColor, cfg.sunIntensity);
    this.dirLight.position.set(20, 35, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 120;
    this.dirLight.shadow.camera.left = -15;
    this.dirLight.shadow.camera.right = 15;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -10;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    scene.add(this.dirLight);

    // Cool Hemisphere Fill Light
    this.ambientLight = new THREE.HemisphereLight(cfg.skyColor, cfg.groundColor, 1.2);
    scene.add(this.ambientLight);

    this.buildWorldScenery();
  }

  public setTheme(theme: EnvironmentTheme, scene: THREE.Scene) {
    this.theme = theme;
    const cfg = this.themeConfig[theme];
    this.fog.color.setHex(cfg.skyColor);
    this.fog.near = cfg.fogNear;
    this.fog.far = cfg.fogFar;
    scene.background = new THREE.Color(cfg.skyColor);

    this.dirLight.color.setHex(cfg.sunColor);
    this.dirLight.intensity = cfg.sunIntensity;
    this.ambientLight.color.setHex(cfg.skyColor);
    this.ambientLight.groundColor.setHex(cfg.groundColor);

    // Rebuild scenery
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.sceneryProps = [];
    this.buildWorldScenery();
  }

  private buildWorldScenery() {
    // 1. Distant procedural backdrop terrain
    this.buildDistantBackdrop();

    // 2. Side scenery modules flanking the runner track (repeated every 25 units along Z)
    for (let z = -120; z <= 60; z += 24) {
      const propGroup = this.createSceneryModule(z);
      this.group.add(propGroup);
      this.sceneryProps.push(propGroup);
    }

    // 3. Environmental atmospheric particles (snow, embers, fireflies, cosmic dust)
    this.buildParticles();
  }

  private buildDistantBackdrop() {
    if (this.theme === 'cosmic_math_dimension') {
      // 1. Distant Glowing Celestial Planet
      const planetGeo = new THREE.SphereGeometry(14, 24, 24);
      const planetMat = new THREE.MeshStandardMaterial({
        color: 0x9333ea,
        roughness: 0.4,
        metalness: 0.5,
        emissive: 0x581c87,
        emissiveIntensity: 0.6
      });
      const planet = new THREE.Mesh(planetGeo, planetMat);
      planet.position.set(-36, 42, -110);
      this.group.add(planet);

      // Planet Ring
      const ringGeo = new THREE.RingGeometry(18, 24, 32);
      ringGeo.rotateX(Math.PI / 2.5);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      planet.add(ring);

      // Distant Cyan Secondary Moon
      const moonGeo = new THREE.SphereGeometry(6, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.5
      });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moon.position.set(40, 36, -95);
      this.group.add(moon);

      // 2. Floating 3D Glowing Polyhedra (cubes, octahedrons from reference image)
      const colors = [0xec4899, 0x06b6d4, 0x22c55e, 0xf59e0b, 0xa855f7];
      for (let i = 0; i < 14; i++) {
        const polyGroup = new THREE.Group();
        const col = colors[i % colors.length];

        const isCube = i % 2 === 0;
        const geom = isCube ? new THREE.BoxGeometry(2.2, 2.2, 2.2) : new THREE.OctahedronGeometry(1.8);
        const mat = new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.2,
          metalness: 0.8,
          emissive: col,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.85
        });
        const mesh = new THREE.Mesh(geom, mat);
        polyGroup.add(mesh);

        // Wireframe edges
        const wireGeo = new THREE.WireframeGeometry(geom);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        polyGroup.add(wire);

        polyGroup.position.set(
          (i % 2 === 0 ? -1 : 1) * (18 + (i * 2.5)),
          12 + (i % 5) * 4,
          -30 - (i * 6)
        );
        polyGroup.rotation.set(i * 0.4, i * 0.5, i * 0.2);
        this.group.add(polyGroup);
      }
      return;
    }

    // Distant futuristic city skyline / mountain silhouettes
    const backdropGeo = new THREE.BoxGeometry(160, 40, 2);
    const backdropMat = new THREE.MeshStandardMaterial({
      color: this.theme === 'futuristic_city' ? 0x0284c7 : 0x1e1b4b,
      roughness: 0.9,
      metalness: 0.1
    });

    // Left and right silhouette walls far away
    const leftBackdrop = new THREE.Mesh(backdropGeo, backdropMat);
    leftBackdrop.position.set(-28, 15, -90);
    leftBackdrop.rotation.y = Math.PI / 10;
    this.group.add(leftBackdrop);

    const rightBackdrop = new THREE.Mesh(backdropGeo, backdropMat);
    rightBackdrop.position.set(28, 15, -90);
    rightBackdrop.rotation.y = -Math.PI / 10;
    this.group.add(rightBackdrop);

    // Floating fluffy clouds in the sky
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.0
    });

    for (let c = 0; c < 8; c++) {
      const cloudGroup = new THREE.Group();
      const puffGeo = new THREE.DodecahedronGeometry(3 + Math.random() * 2, 1);
      
      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((p - 1.5) * 3, Math.sin(p) * 1.5, Math.cos(p) * 1.5);
        puff.scale.set(1 + Math.random() * 0.3, 0.8 + Math.random() * 0.3, 1);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 80,
        22 + Math.random() * 15,
        -40 - Math.random() * 80
      );
      this.group.add(cloudGroup);
    }
  }

  private createSceneryModule(z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = z;

    if (this.theme === 'cosmic_math_dimension') {
      // Cosmic Synthwave glowing cyber pylons and math crystals
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x090518, roughness: 0.2, metalness: 0.8 });
      const magentaLight = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const cyanLight = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

      [-5.6, 5.6].forEach((x, idx) => {
        const col = new THREE.Group();
        col.position.set(x, 0, 0);

        // Slender cyber pylon
        const pylonGeo = new THREE.BoxGeometry(0.6, 12, 0.6);
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.y = 6;
        pylon.castShadow = true;
        col.add(pylon);

        // Glowing neon strip
        const stripGeo = new THREE.BoxGeometry(0.12, 11, 0.65);
        const strip = new THREE.Mesh(stripGeo, idx === 0 ? magentaLight : cyanLight);
        strip.position.set(0, 6, 0);
        col.add(strip);

        // Floating floating math crystal on top
        const crystalGeo = new THREE.OctahedronGeometry(0.7);
        const crystalMat = new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0xec4899 : 0x06b6d4,
          emissive: idx === 0 ? 0xec4899 : 0x06b6d4,
          emissiveIntensity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = 13;
        col.add(crystal);

        group.add(col);
      });
      return group;
    }

    if (this.theme === 'futuristic_city') {
      // 1. Futuristic Columns with glowing lights (like reference image)
      const columnMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.7 });
      const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.8 });
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      [-5.8, 5.8].forEach(x => {
        const col = new THREE.Group();
        col.position.set(x, 0, 0);

        // Main pillar
        const pillarGeo = new THREE.CylinderGeometry(0.8, 0.9, 10, 16);
        const pillar = new THREE.Mesh(pillarGeo, columnMat);
        pillar.position.y = 5;
        pillar.castShadow = true;
        col.add(pillar);

        // Gold cap rings
        const ringGeo = new THREE.TorusGeometry(0.95, 0.15, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const topRing = new THREE.Mesh(ringGeo, goldTrimMat);
        topRing.position.y = 9.2;
        col.add(topRing);
        const botRing = new THREE.Mesh(ringGeo, goldTrimMat);
        botRing.position.y = 0.6;
        col.add(botRing);

        // Glowing cyan light strip
        const glowGeo = new THREE.BoxGeometry(0.2, 7, 0.2);
        const glowStrip = new THREE.Mesh(glowGeo, glowMat);
        glowStrip.position.set(x > 0 ? -0.85 : 0.85, 5, 0);
        col.add(glowStrip);

        // Planter box with green cartoon bush
        const planterGeo = new THREE.BoxGeometry(1.8, 1, 2.5);
        const planterMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5 });
        const planter = new THREE.Mesh(planterGeo, planterMat);
        planter.position.set(x > 0 ? 1.2 : -1.2, 0.5, 0);
        col.add(planter);

        const hedgeGeo = new THREE.DodecahedronGeometry(1.1, 1);
        const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
        const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
        hedge.position.set(x > 0 ? 1.2 : -1.2, 1.6, 0);
        hedge.castShadow = true;
        col.add(hedge);

        group.add(col);
      });

      // Neon overhead archway spanning the 3 lanes every 48 units
      if (Math.abs(z) % 48 === 0) {
        const arch = this.createFuturisticArch();
        arch.position.set(0, 0, 0);
        group.add(arch);
      }
    } else if (this.theme === 'magic_forest') {
      // Giant glowing mushrooms and ancient trees
      const mushroomMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 });
      const glowCapMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, emissive: 0x059669, emissiveIntensity: 0.5 });
      [-5.5, 5.5].forEach(x => {
        const mGroup = new THREE.Group();
        mGroup.position.set(x, 0, 0);

        const stemGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 10);
        const stem = new THREE.Mesh(stemGeo, mushroomMat);
        stem.position.y = 2;
        mGroup.add(stem);

        const capGeo = new THREE.ConeGeometry(1.8, 1.2, 12);
        const cap = new THREE.Mesh(capGeo, glowCapMat);
        cap.position.y = 4.2;
        mGroup.add(cap);

        group.add(mGroup);
      });
    } else if (this.theme === 'ice_kingdom') {
      // Shimmering crystal spires
      const iceMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1, metalness: 0.9 });
      [-5.5, 5.5].forEach(x => {
        const spireGeo = new THREE.ConeGeometry(0.8, 8, 5);
        const spire = new THREE.Mesh(spireGeo, iceMat);
        spire.position.set(x, 4, 0);
        spire.castShadow = true;
        group.add(spire);
      });
    } else if (this.theme === 'volcano_world') {
      // Dark basalt spires with glowing lava slits
      const basaltMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
      const lavaMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      [-5.5, 5.5].forEach(x => {
        const rockGeo = new THREE.BoxGeometry(1.4, 7, 1.4);
        const rock = new THREE.Mesh(rockGeo, basaltMat);
        rock.position.set(x, 3.5, 0);
        group.add(rock);

        const crackGeo = new THREE.BoxGeometry(0.2, 5, 1.5);
        const crack = new THREE.Mesh(crackGeo, lavaMat);
        crack.position.set(x, 3.5, 0);
        group.add(crack);
      });
    } else {
      // Math Sanctuary / Desert: Geometric floating monoliths
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 });
      [-5.5, 5.5].forEach(x => {
        const obeliskGeo = new THREE.CylinderGeometry(0.4, 0.8, 7, 4);
        const obelisk = new THREE.Mesh(obeliskGeo, goldMat);
        obelisk.position.set(x, 3.5, 0);
        group.add(obelisk);
      });
    }

    return group;
  }

  private createFuturisticArch(): THREE.Group {
    const archGroup = new THREE.Group();

    // Semi-circular arch torus spanning lanes
    const arcGeo = new THREE.TorusGeometry(5.2, 0.35, 8, 24, Math.PI);
    arcGeo.rotateZ(Math.PI);
    const arcMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.position.set(0, 5.2, 0);
    archGroup.add(arc);

    // Neon glowing inner rim
    const innerArcGeo = new THREE.TorusGeometry(4.8, 0.12, 6, 24, Math.PI);
    innerArcGeo.rotateZ(Math.PI);
    const innerArcMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const innerArc = new THREE.Mesh(innerArcGeo, innerArcMat);
    innerArc.position.set(0, 5.2, 0);
    archGroup.add(innerArc);

    return archGroup;
  }

  private buildParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30; // X
      positions[i + 1] = Math.random() * 18;     // Y
      positions[i + 2] = -Math.random() * 80;    // Z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let particleColor = 0x38bdf8;
    if (this.theme === 'magic_forest') particleColor = 0x34d399;
    if (this.theme === 'volcano_world') particleColor = 0xf97316;
    if (this.theme === 'ice_kingdom') particleColor = 0xe0f2fe;

    const material = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.group.add(this.particleSystem);
  }

  public update(speed: number, delta: number) {
    // Scroll scenery along Z toward player (+Z) to create endless movement
    const moveZ = speed * delta;

    this.sceneryProps.forEach(prop => {
      prop.position.z += moveZ;
      if (prop.position.z > 30) {
        prop.position.z -= 180; // Recycle behind
      }
    });

    // Animate particles
    if (this.particleSystem) {
      const pos = this.particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i + 1] += moveZ * 0.4;
        if (pos[i + 1] > 20) {
          pos[i + 1] = -60;
        }
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
  }
}
