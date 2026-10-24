import * as THREE from 'three';
import { 
  ObstacleData, 
  ObstacleType, 
  CoinData, 
  PowerUpItem, 
  GateData, 
  MathCategory, 
  EnvironmentTheme 
} from '../types/game';
import { 
  createTrackTexture, 
  createCosmicGridTexture,
  createTechCrateTexture, 
  createCoinTexture, 
  createGateHeaderTexture, 
  createOptionBadgeTexture 
} from './materials';
import { generateMathQuestion } from '../math/mathGenerator';

export class TrackManager {
  public group: THREE.Group;
  
  // Track floor meshes
  private trackSegments: THREE.Mesh[] = [];
  private trackTexture: THREE.CanvasTexture;
  private crateTexture: THREE.CanvasTexture;
  private coinTexture: THREE.CanvasTexture;

  // Active game entities in the 3D scene
  public obstacles: { data: ObstacleData; mesh: THREE.Group }[] = [];
  public coins: { data: CoinData; mesh: THREE.Group }[] = [];
  public powerups: { data: PowerUpItem; mesh: THREE.Group }[] = [];
  public gates: { data: GateData; mesh: THREE.Group; headerMesh: THREE.Mesh; badges: THREE.Mesh[] }[] = [];

  // Spawner states
  public currentCategory: MathCategory = 'addition';
  public currentDifficulty: number = 1;
  public lanePositions: number[] = [-2.2, 0, 2.2]; // Left, Center, Right

  private nextGateZ: number = -60;
  private nextObstacleZ: number = -25;
  private nextCoinZ: number = -15;
  private nextPowerupZ: number = -100;

  constructor(scene: THREE.Scene, theme: EnvironmentTheme = 'futuristic_city') {
    this.group = new THREE.Group();
    scene.add(this.group);

    this.trackTexture = createTrackTexture();
    this.crateTexture = createTechCrateTexture();
    this.coinTexture = createCoinTexture();

    // Build infinite continuous floor tiles (5 segments of 50 units each = 250 units length)
    this.buildTrackSegments();
  }

  private buildTrackSegments() {
    const segLength = 50;
    const trackWidth = 7.4;

    const trackMat = new THREE.MeshStandardMaterial({
      map: this.trackTexture,
      roughness: 0.35,
      metalness: 0.2
    });
    this.trackTexture.repeat.set(1, 10);

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(trackWidth, segLength);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, trackMat);
      mesh.position.set(0, 0, -i * segLength + 25);
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.trackSegments.push(mesh);

      // Glowing side curbs
      const curbGeo = new THREE.BoxGeometry(0.35, 0.4, segLength);
      const curbMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.6
      });
      const leftCurb = new THREE.Mesh(curbGeo, curbMat);
      leftCurb.position.set(-trackWidth / 2, 0.2, -i * segLength + 25);
      this.group.add(leftCurb);

      const rightCurb = new THREE.Mesh(curbGeo, curbMat);
      rightCurb.position.set(trackWidth / 2, 0.2, -i * segLength + 25);
      this.group.add(rightCurb);
    }
  }

  public update(speed: number, delta: number, playerZ: number) {
    const moveZ = speed * delta;

    // 1. Move track floor
    const segLength = 50;
    this.trackSegments.forEach(seg => {
      seg.position.z += moveZ;
      if (seg.position.z > 50) {
        seg.position.z -= segLength * 5;
      }
    });

    // 2. Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.mesh.position.z += moveZ;
      obs.data.z = obs.mesh.position.z;

      // Moving drone logic
      if (obs.data.type === 'moving_drone') {
        obs.mesh.position.x = Math.sin(Date.now() * 0.003 + obs.data.z * 0.1) * 2.2;
      }

      // Cleanup
      if (obs.mesh.position.z > 15) {
        this.group.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 3. Move coins & rotate
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.mesh.position.z += moveZ;
      coin.data.z = coin.mesh.position.z;
      coin.mesh.rotation.y += delta * 4;

      if (coin.mesh.position.z > 15 || coin.data.collected) {
        this.group.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // 4. Move power-ups & hover
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.mesh.position.z += moveZ;
      pu.data.z = pu.mesh.position.z;
      pu.mesh.rotation.y += delta * 3;
      pu.mesh.position.y = 1.1 + Math.sin(Date.now() * 0.005) * 0.2;

      if (pu.mesh.position.z > 15 || pu.data.collected) {
        this.group.remove(pu.mesh);
        this.powerups.splice(i, 1);
      }
    }

    // 5. Move math gates
    for (let i = this.gates.length - 1; i >= 0; i--) {
      const gate = this.gates[i];
      gate.mesh.position.z += moveZ;
      gate.data.z = gate.mesh.position.z;

      // Animate badge bobbing
      gate.badges.forEach((b, bIdx) => {
        b.position.y = 1.8 + Math.sin(Date.now() * 0.005 + bIdx) * 0.1;
      });

      if (gate.mesh.position.z > 15) {
        this.group.remove(gate.mesh);
        this.gates.splice(i, 1);
      }
    }

    // 6. Procedural Spawning along the road
    this.spawnEntitiesAhead();
  }

  public setTheme(theme: EnvironmentTheme) {
    if (theme === 'cosmic_math_dimension') {
      this.trackTexture = createCosmicGridTexture();
    } else {
      this.trackTexture = createTrackTexture();
    }
    this.trackTexture.repeat.set(1, 10);
    this.trackSegments.forEach(seg => {
      const mat = seg.material as THREE.MeshStandardMaterial;
      mat.map = this.trackTexture;
      mat.needsUpdate = true;
    });
  }

  private spawnEntitiesAhead() {
    // 1. Continuous Math Gate Spawning
    let furthestGateZ = 0;
    if (this.gates.length === 0) {
      furthestGateZ = 0;
    } else {
      furthestGateZ = this.gates[0].mesh.position.z;
      for (let i = 1; i < this.gates.length; i++) {
        if (this.gates[i].mesh.position.z < furthestGateZ) {
          furthestGateZ = this.gates[i].mesh.position.z;
        }
      }
    }

    // 1. Continuous Math Gate Spawning (Spaced out to ~110 units for clear thinking distance)
    if (furthestGateZ > -160) {
      const targetZ = furthestGateZ === 0 ? -90 : furthestGateZ - 115;
      this.spawnMathGate(targetZ);
    }

    // 2. Continuous Obstacle Spawning (Reduced density & wide safety margin around gates)
    let furthestObsZ = 0;
    if (this.obstacles.length === 0) {
      furthestObsZ = 0;
    } else {
      furthestObsZ = this.obstacles[0].mesh.position.z;
      for (let i = 1; i < this.obstacles.length; i++) {
        if (this.obstacles[i].mesh.position.z < furthestObsZ) {
          furthestObsZ = this.obstacles[i].mesh.position.z;
        }
      }
    }

    if (furthestObsZ > -160) {
      const targetZ = furthestObsZ === 0 ? -40 : furthestObsZ - (40 + Math.random() * 22);
      // Ensure large clear zone of 30 units before and after every gate
      const isTooCloseToGate = this.gates.some(g => Math.abs(g.mesh.position.z - targetZ) < 30);
      if (!isTooCloseToGate) {
        this.spawnObstacle(targetZ);
      }
    }

    // 3. Continuous Coin Trails Spawning
    let furthestCoinZ = 0;
    if (this.coins.length === 0) {
      furthestCoinZ = 0;
    } else {
      furthestCoinZ = this.coins[0].mesh.position.z;
      for (let i = 1; i < this.coins.length; i++) {
        if (this.coins[i].mesh.position.z < furthestCoinZ) {
          furthestCoinZ = this.coins[i].mesh.position.z;
        }
      }
    }

    if (furthestCoinZ > -140) {
      const targetZ = furthestCoinZ === 0 ? -15 : furthestCoinZ - (20 + Math.random() * 12);
      this.spawnCoinTrail(targetZ);
    }

    // 4. Continuous Powerup Spawning
    let furthestPowerupZ = 0;
    if (this.powerups.length === 0) {
      furthestPowerupZ = 0;
    } else {
      furthestPowerupZ = this.powerups[0].mesh.position.z;
      for (let i = 1; i < this.powerups.length; i++) {
        if (this.powerups[i].mesh.position.z < furthestPowerupZ) {
          furthestPowerupZ = this.powerups[i].mesh.position.z;
        }
      }
    }

    if (furthestPowerupZ > -120) {
      const targetZ = furthestPowerupZ === 0 ? -90 : furthestPowerupZ - (110 + Math.random() * 50);
      this.spawnPowerup(targetZ);
    }
  }

  public spawnMathGate(zPos: number): GateData {
    const question = generateMathQuestion(this.currentCategory, this.currentDifficulty);
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, zPos);

    // 1. Futuristic Arch Structure
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x09071c,
      roughness: 0.25,
      metalness: 0.8
    });

    // Outer support columns
    [-3.8, 3.8].forEach(x => {
      const colGeo = new THREE.BoxGeometry(0.5, 6.2, 0.5);
      const col = new THREE.Mesh(colGeo, archMat);
      col.position.set(x, 3.1, 0);
      col.castShadow = true;
      gateGroup.add(col);

      // Glowing column light strip
      const lightGeo = new THREE.BoxGeometry(0.12, 5.8, 0.52);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.set(x, 3.1, 0);
      gateGroup.add(lightMesh);
    });

    // Top Header Crossbar placed higher to prevent blocking view
    const crossbarGeo = new THREE.BoxGeometry(8.2, 0.4, 0.6);
    const crossbar = new THREE.Mesh(crossbarGeo, archMat);
    crossbar.position.set(0, 5.8, 0);
    gateGroup.add(crossbar);

    // 2. Compact Math Question Billboard placed up high
    const headerTexture = createGateHeaderTexture(question.equation, question.questionArabic);
    const headerMat = new THREE.MeshBasicMaterial({
      map: headerTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const headerGeo = new THREE.PlaneGeometry(6.6, 1.55);
    const headerMesh = new THREE.Mesh(headerGeo, headerMat);
    headerMesh.position.set(0, 4.85, 0);
    gateGroup.add(headerMesh);

    // 3. Three Lane Rectangular Neon Doorway Portals (Left, Middle, Right)
    // Matching reference image: Left = Magenta, Middle = Cyan, Right = Lime Green
    const portalStyles = [
      { hex: 0xec4899, css: '#ec4899' }, // Lane 0 (x = -2.2, Left)
      { hex: 0x06b6d4, css: '#06b6d4' }, // Lane 1 (x = 0, Center)
      { hex: 0x22c55e, css: '#22c55e' }  // Lane 2 (x = 2.2, Right)
    ];

    const badges: THREE.Mesh[] = [];

    this.lanePositions.forEach((laneX, idx) => {
      const portalGroup = new THREE.Group();
      portalGroup.position.set(laneX, 0, 0);

      const style = portalStyles[idx];

      // Rectangular Neon Doorway Portal Frame (from reference image)
      const frameMat = new THREE.MeshBasicMaterial({ color: style.hex });

      // Left post
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 0.12), frameMat);
      postL.position.set(-0.95, 1.4, 0);
      portalGroup.add(postL);

      // Right post
      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 0.12), frameMat);
      postR.position.set(0.95, 1.4, 0);
      portalGroup.add(postR);

      // Top lintel
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.12), frameMat);
      lintel.position.set(0, 2.8, 0);
      portalGroup.add(lintel);

      // Glowing step pad on the ground in front of the portal
      const padMat = new THREE.MeshBasicMaterial({ color: style.hex });
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.2), padMat);
      pad.position.set(0, 0.03, 0);
      portalGroup.add(pad);

      // Clear, compact 3D numeric badge centered in the portal
      const badgeTexture = createOptionBadgeTexture(question.options[idx], style.css);
      const badgeMat = new THREE.MeshBasicMaterial({
        map: badgeTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const badgeGeo = new THREE.PlaneGeometry(1.1, 1.1);
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.position.y = 1.7;
      portalGroup.add(badge);
      badges.push(badge);

      gateGroup.add(portalGroup);
    });

    this.group.add(gateGroup);

    const gateData: GateData = {
      id: `gate_${Date.now()}_${Math.random()}`,
      z: zPos,
      question,
      resolved: false
    };

    this.gates.push({
      data: gateData,
      mesh: gateGroup,
      headerMesh,
      badges
    });

    return gateData;
  }

  private spawnObstacle(zPos: number) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = this.lanePositions[laneIdx];
    const laneId = laneIdx - 1; // -1, 0, 1

    const randType = Math.random();
    let type: ObstacleType = 'tech_crate';
    if (randType < 0.28) {
      type = 'tech_crate'; // Jump over
    } else if (randType < 0.5) {
      type = 'laser_barrier'; // Slide under
    } else if (randType < 0.66) {
      type = 'spikes'; // Avoid lane
    } else if (randType < 0.8) {
      type = 'energy_wall'; // Tall forcefield, lane switch
    } else if (randType < 0.9) {
      type = 'quantum_barrier'; // Dual plasma barrier
    } else {
      type = 'moving_drone'; // Floating moving drone
    }

    const obsGroup = new THREE.Group();
    obsGroup.position.set(laneX, 0, zPos);

    if (type === 'tech_crate') {
      // Tech Crate matching reference image
      const crateMat = new THREE.MeshStandardMaterial({
        map: this.crateTexture,
        roughness: 0.3,
        metalness: 0.4
      });
      const crateGeo = new THREE.BoxGeometry(1.8, 0.85, 1.4);
      const crateMesh = new THREE.Mesh(crateGeo, crateMat);
      crateMesh.position.y = 0.425;
      crateMesh.castShadow = true;
      crateMesh.receiveShadow = true;
      obsGroup.add(crateMesh);

      // Yellow/orange warning light bar on top
      const topBarGeo = new THREE.BoxGeometry(1.6, 0.12, 0.3);
      const topBarMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const topBar = new THREE.Mesh(topBarGeo, topBarMat);
      topBar.position.y = 0.9;
      obsGroup.add(topBar);

    } else if (type === 'laser_barrier') {
      // High laser barrier requiring slide under
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
      const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), poleMat);
      leftPole.position.set(-1.0, 1.2, 0);
      obsGroup.add(leftPole);

      const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), poleMat);
      rightPole.position.set(1.0, 1.2, 0);
      obsGroup.add(rightPole);

      // High beam
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.1);
      beamGeo.rotateZ(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.6; // High, must duck
      obsGroup.add(beam);

      // Warning sign
      const signGeo = new THREE.BoxGeometry(0.6, 0.3, 0.1);
      const signMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.y = 1.9;
      obsGroup.add(sign);

    } else if (type === 'spikes') {
      // Ground energy spikes
      const spikeMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.2, metalness: 0.6 });
      for (let s = -0.6; s <= 0.6; s += 0.4) {
        const spikeGeo = new THREE.ConeGeometry(0.18, 0.75, 6);
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.set(s, 0.375, 0);
        spike.castShadow = true;
        obsGroup.add(spike);
      }

    } else if (type === 'energy_wall') {
      // Tall Holographic Energy Wall (Switch lane)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2, metalness: 0.8 });
      const frameGeo = new THREE.BoxGeometry(1.9, 2.6, 0.15);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = 1.3;
      obsGroup.add(frame);

      const plasmaMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const plasma = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.4), plasmaMat);
      plasma.position.y = 1.3;
      obsGroup.add(plasma);

      // Glowing hazard stripes
      const warningStrip = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.18), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      warningStrip.position.y = 2.4;
      obsGroup.add(warningStrip);

    } else if (type === 'quantum_barrier') {
      // Dual Quantum Plasma Arch
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.7 });
      [-0.9, 0.9].forEach(px => {
        const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 2.2), pillarMat);
        pMesh.position.set(px, 1.1, 0);
        obsGroup.add(pMesh);

        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        orb.position.set(px, 2.2, 0);
        obsGroup.add(orb);
      });

      const fieldMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5 });
      const field = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.8), fieldMat);
      field.position.y = 1.1;
      obsGroup.add(field);

    } else {
      // Floating moving tech drone
      const droneMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3, metalness: 0.7 });
      const coreGeo = new THREE.SphereGeometry(0.45, 12, 12);
      const core = new THREE.Mesh(coreGeo, droneMat);
      core.position.y = 1.0;
      obsGroup.add(core);

      const eyeGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 1.0, -0.35); // Eye looks forward
      obsGroup.add(eye);
    }

    this.group.add(obsGroup);

    this.obstacles.push({
      data: {
        id: `obs_${Date.now()}_${Math.random()}`,
        type,
        lane: laneId,
        z: zPos,
        width: 1.8,
        height: type === 'laser_barrier' ? 2.2 : 0.9,
        passed: false
      },
      mesh: obsGroup
    });
  }

  private spawnCoinTrail(zPos: number) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = this.lanePositions[laneIdx];
    const count = 4 + Math.floor(Math.random() * 3);

    const isGem = Math.random() < 0.2; // 20% chance of gem trail

    for (let i = 0; i < count; i++) {
      const z = zPos - i * 2.5;
      const coinGroup = new THREE.Group();
      coinGroup.position.set(laneX, 0.9, z);

      if (isGem) {
        // Shimmering Diamond Gem
        const gemGeo = new THREE.OctahedronGeometry(0.35);
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          roughness: 0.1,
          metalness: 0.9,
          emissive: 0x0891b2,
          emissiveIntensity: 0.7
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.castShadow = true;
        coinGroup.add(gem);
      } else {
        // Golden Coin matching reference image
        const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
        coinGeo.rotateZ(Math.PI / 2);
        const coinMat = new THREE.MeshStandardMaterial({
          map: this.coinTexture,
          roughness: 0.25,
          metalness: 0.85
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.castShadow = true;
        coinGroup.add(coin);
      }

      this.group.add(coinGroup);

      this.coins.push({
        data: {
          id: `coin_${Date.now()}_${i}_${Math.random()}`,
          lane: laneIdx - 1,
          z,
          y: 0.9,
          collected: false,
          isGem
        },
        mesh: coinGroup
      });
    }
  }

  private spawnPowerup(zPos: number) {
    const laneIdx = Math.floor(Math.random() * 3);
    const laneX = this.lanePositions[laneIdx];
    const types: ('shield' | 'magnet' | 'multiplier' | 'slowmo' | 'turbo')[] = [
      'shield', 'magnet', 'multiplier', 'slowmo', 'turbo'
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    const puGroup = new THREE.Group();
    puGroup.position.set(laneX, 1.2, zPos);

    // Glowing orb container
    const orbGeo = new THREE.SphereGeometry(0.55, 16, 16);
    let orbColor = 0x38bdf8;
    if (type === 'magnet') orbColor = 0xef4444;
    if (type === 'multiplier') orbColor = 0xf59e0b;
    if (type === 'slowmo') orbColor = 0xa855f7;
    if (type === 'turbo') orbColor = 0x10b981;

    const orbMat = new THREE.MeshStandardMaterial({
      color: orbColor,
      roughness: 0.2,
      metalness: 0.8,
      emissive: orbColor,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    puGroup.add(orb);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(0.75, 0.05, 8, 24);
    ringGeo.rotateX(Math.PI / 3);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    puGroup.add(ring);

    this.group.add(puGroup);

    this.powerups.push({
      data: {
        id: `pu_${Date.now()}_${Math.random()}`,
        lane: laneIdx - 1,
        z: zPos,
        type,
        collected: false
      },
      mesh: puGroup
    });
  }

  public reset() {
    // Clear all spawned entities
    this.obstacles.forEach(o => this.group.remove(o.mesh));
    this.obstacles = [];

    this.coins.forEach(c => this.group.remove(c.mesh));
    this.coins = [];

    this.powerups.forEach(p => this.group.remove(p.mesh));
    this.powerups = [];

    this.gates.forEach(g => this.group.remove(g.mesh));
    this.gates = [];

    this.nextGateZ = -60;
    this.nextObstacleZ = -25;
    this.nextCoinZ = -15;
    this.nextPowerupZ = -100;
  }
}
