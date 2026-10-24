import * as THREE from 'three';

export interface CharacterCustomization {
  modelType?: 'athletic_runner' | 'cyber_prodigy' | 'space_explorer' | 'desert_phantom' | 'quantum_champion';
  hoodieColor: string;
  pantsColor: string;
  hairColor: string;
  backpackColor: string;
  accentColor?: string;
  thrusterColorHex: number;
}

export class RunnerCharacter {
  public mesh: THREE.Group;
  
  // Skeletal parts for kinematic animation
  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;
  private torso: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private backGearGroup: THREE.Group;
  private leftJetFlame: THREE.Mesh;
  private rightJetFlame: THREE.Mesh;
  private jetLight: THREE.PointLight;

  // Custom accessories
  private capeMesh: THREE.Mesh | null = null;
  private floatingCrystals: THREE.Mesh[] = [];

  // Animation state
  public isRunning: boolean = true;
  public isJumping: boolean = false;
  public isSliding: boolean = false;
  public isStumbling: boolean = false;
  public isCelebrating: boolean = false;
  public laneLean: number = 0; // -1 to +1

  private runCycleTime: number = 0;
  private stumbleTimer: number = 0;

  constructor(custom: CharacterCustomization) {
    this.mesh = new THREE.Group();
    const model = custom.modelType || 'athletic_runner';
    const accent = custom.accentColor || '#38bdf8';

    // Materials with realistic PBR properties
    const mainSuitMat = new THREE.MeshStandardMaterial({
      color: custom.hoodieColor,
      roughness: model === 'space_explorer' || model === 'quantum_champion' ? 0.3 : 0.55,
      metalness: model === 'quantum_champion' ? 0.6 : model === 'space_explorer' ? 0.4 : 0.12
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: custom.pantsColor,
      roughness: 0.65,
      metalness: 0.15
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: custom.hairColor,
      roughness: 0.6,
      metalness: 0.08
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: '#ffdfba', // Warm realistic skin tone
      roughness: 0.45,
      metalness: 0.0
    });

    const gearMat = new THREE.MeshStandardMaterial({
      color: custom.backpackColor,
      roughness: 0.35,
      metalness: 0.45
    });

    const accentEmissiveMat = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });

    const bootSoleMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.6,
      metalness: 0.3
    });

    const flameMat = new THREE.MeshBasicMaterial({
      color: custom.thrusterColorHex,
      transparent: true,
      opacity: 0.85
    });

    // 1. Root body group (pivot at ground level)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.1;
    this.mesh.add(this.bodyGroup);

    // 2. Torso
    // Character runs along -Z (into the screen).
    // Chest faces -Z. Back faces +Z (toward the camera).
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.26, 0.72, 14);
    this.torso = new THREE.Mesh(torsoGeo, mainSuitMat);
    this.torso.castShadow = true;
    this.bodyGroup.add(this.torso);

    // Chest detail / zipper on the FRONT (-Z)
    const chestZipGeo = new THREE.BoxGeometry(0.06, 0.65, 0.04);
    const chestZipMesh = new THREE.Mesh(chestZipGeo, accentEmissiveMat);
    chestZipMesh.position.set(0, 0, -0.16);
    this.torso.add(chestZipMesh);

    // 3. Head & Hair
    // Eyes look forward (-Z). Back of the head faces camera (+Z).
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.56, 0);

    const headGeo = new THREE.SphereGeometry(0.27, 18, 18);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Eyes on the FRONT (-Z) looking forward down the track
    const eyeGeo = new THREE.SphereGeometry(0.05, 12, 12);
    eyeGeo.scale(1, 1.3, 0.4);
    const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.09, 0.04, -0.25);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.09, 0.04, -0.25);
    this.headGroup.add(rightEye);

    // Realistic Hair & Head Accents:
    // Back of the head (+Z) is directly visible to the player
    this.buildBackHairAndHeadgear(model, hairMat, gearMat, accentEmissiveMat);
    this.bodyGroup.add(this.headGroup);

    // 4. Back Gear / Backpack / Cloak / Wings (+Z facing camera!)
    this.backGearGroup = new THREE.Group();
    this.backGearGroup.position.set(0, 0.05, 0.16); // Placed at +Z so it is prominent to the camera
    this.buildBackGear(model, gearMat, accentEmissiveMat, custom.thrusterColorHex);
    this.bodyGroup.add(this.backGearGroup);

    // 5. Arms
    this.leftArm = this.createArm(mainSuitMat, skinMat, accentEmissiveMat, true);
    this.leftArm.position.set(-0.38, 0.25, 0);
    this.bodyGroup.add(this.leftArm);

    this.rightArm = this.createArm(mainSuitMat, skinMat, accentEmissiveMat, false);
    this.rightArm.position.set(0.38, 0.25, 0);
    this.bodyGroup.add(this.rightArm);

    // 6. Cyber Thruster Boots & Legs
    // Feet point forward (-Z)
    this.leftLeg = this.createLeg(pantsMat, gearMat, bootSoleMat, accentEmissiveMat, true);
    this.leftLeg.position.set(-0.17, -0.34, 0);
    this.bodyGroup.add(this.leftLeg);

    this.rightLeg = this.createLeg(pantsMat, gearMat, bootSoleMat, accentEmissiveMat, false);
    this.rightLeg.position.set(0.17, -0.34, 0);
    this.bodyGroup.add(this.rightLeg);

    // 7. Jet Thruster Flames (under boots)
    const flameGeo = new THREE.ConeGeometry(0.14, 0.65, 8);
    flameGeo.rotateX(Math.PI);

    this.leftJetFlame = new THREE.Mesh(flameGeo, flameMat);
    this.leftJetFlame.position.set(0, -0.58, 0);
    this.leftJetFlame.scale.set(0.5, 0.5, 0.5);
    this.leftLeg.add(this.leftJetFlame);

    this.rightJetFlame = new THREE.Mesh(flameGeo, flameMat);
    this.rightJetFlame.position.set(0, -0.58, 0);
    this.rightJetFlame.scale.set(0.5, 0.5, 0.5);
    this.rightLeg.add(this.rightJetFlame);

    // Dynamic point light for thrusters
    this.jetLight = new THREE.PointLight(custom.thrusterColorHex, 2.8, 4.0);
    this.jetLight.position.set(0, -0.4, 0);
    this.bodyGroup.add(this.jetLight);
  }

  private buildBackHairAndHeadgear(
    model: string,
    hairMat: THREE.Material,
    gearMat: THREE.Material,
    accentMat: THREE.Material
  ) {
    // Detailed volumetric hair covering top and back (+Z)
    const hairSpikes = [
      { pos: [0, 0.16, 0.12], rot: [0.35, 0, 0], scale: [0.28, 0.42, 0.24] },
      { pos: [0.14, 0.18, 0.1], rot: [0.25, 0.3, -0.2], scale: [0.22, 0.38, 0.2] },
      { pos: [-0.14, 0.18, 0.1], rot: [0.25, -0.3, 0.2], scale: [0.22, 0.38, 0.2] },
      { pos: [0, 0.28, 0.02], rot: [0.1, 0, 0], scale: [0.26, 0.44, 0.22] },
      { pos: [0.18, 0.05, 0.12], rot: [0.3, 0.4, -0.2], scale: [0.18, 0.34, 0.18] },
      { pos: [-0.18, 0.05, 0.12], rot: [0.3, -0.4, 0.2], scale: [0.18, 0.34, 0.18] },
      { pos: [0, -0.06, 0.2], rot: [0.4, 0, 0], scale: [0.22, 0.3, 0.16] }, // Lower neck hair
      { pos: [0, 0.16, -0.22], rot: [-0.4, 0, 0], scale: [0.16, 0.24, 0.14] } // Front fringe
    ];

    const hairConeGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
    hairSpikes.forEach(sp => {
      const spike = new THREE.Mesh(hairConeGeo, hairMat);
      spike.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);
      spike.rotation.set(sp.rot[0], sp.rot[1], sp.rot[2]);
      spike.scale.set(sp.scale[0], sp.scale[1], sp.scale[2]);
      spike.castShadow = true;
      this.headGroup.add(spike);
    });

    if (model === 'cyber_prodigy') {
      // Tech headband with glowing visor node on back of head (+Z)
      const bandGeo = new THREE.CylinderGeometry(0.285, 0.285, 0.08, 16);
      const band = new THREE.Mesh(bandGeo, gearMat);
      band.position.y = 0.05;
      this.headGroup.add(band);

      const nodeGeo = new THREE.BoxGeometry(0.12, 0.06, 0.04);
      const node = new THREE.Mesh(nodeGeo, accentMat);
      node.position.set(0, 0.05, 0.28);
      this.headGroup.add(node);
    } else if (model === 'space_explorer') {
      // Sleek pilot helmet crest / atmospheric rebreather on back of neck
      const crestGeo = new THREE.BoxGeometry(0.1, 0.22, 0.14);
      const crest = new THREE.Mesh(crestGeo, accentMat);
      crest.position.set(0, 0.15, 0.22);
      this.headGroup.add(crest);
    } else if (model === 'desert_phantom') {
      // Tactical desert cowl wrap around neck and back of head
      const cowlGeo = new THREE.TorusGeometry(0.28, 0.09, 8, 16);
      cowlGeo.rotateX(Math.PI / 2);
      const cowl = new THREE.Mesh(cowlGeo, gearMat);
      cowl.position.set(0, -0.1, 0.06);
      this.headGroup.add(cowl);
    } else if (model === 'quantum_champion') {
      // Quantum crown / halo node hovering slightly behind head
      const haloGeo = new THREE.TorusGeometry(0.18, 0.03, 6, 16);
      haloGeo.rotateX(Math.PI / 4);
      const halo = new THREE.Mesh(haloGeo, accentMat);
      halo.position.set(0, 0.28, 0.2);
      this.headGroup.add(halo);
    }
  }

  private buildBackGear(
    model: string,
    gearMat: THREE.Material,
    accentMat: THREE.Material,
    thrusterHex: number
  ) {
    if (model === 'cyber_prodigy') {
      // Luminous Neon Chevron Wings Crest facing camera (+Z)
      const chevMat = new THREE.MeshBasicMaterial({ color: thrusterHex });

      const chevL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.03), chevMat);
      chevL.position.set(-0.08, 0.1, 0.04);
      chevL.rotation.z = Math.PI / 4;
      this.backGearGroup.add(chevL);

      const chevR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.03), chevMat);
      chevR.position.set(0.08, 0.1, 0.04);
      chevR.rotation.z = -Math.PI / 4;
      this.backGearGroup.add(chevR);

      // Compact cyber spine pack
      const spineGeo = new THREE.BoxGeometry(0.16, 0.44, 0.1);
      const spine = new THREE.Mesh(spineGeo, gearMat);
      this.backGearGroup.add(spine);

    } else if (model === 'space_explorer') {
      // Twin metallic oxygen/plasma thruster cylinders
      const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.48, 12);
      [-0.12, 0.12].forEach(x => {
        const tank = new THREE.Mesh(tankGeo, gearMat);
        tank.position.set(x, 0, 0.08);
        this.backGearGroup.add(tank);

        // Glowing energy gauge
        const gauge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.04), accentMat);
        gauge.position.set(x, 0, 0.16);
        this.backGearGroup.add(gauge);
      });

    } else if (model === 'desert_phantom') {
      // Tactical desert runner cape flowing behind on +Z
      const capeGeo = new THREE.PlaneGeometry(0.48, 0.72);
      const capeMat = new THREE.MeshStandardMaterial({
        color: 0xd97706, // Desert sand gold
        roughness: 0.8,
        side: THREE.DoubleSide
      });
      this.capeMesh = new THREE.Mesh(capeGeo, capeMat);
      this.capeMesh.position.set(0, -0.18, 0.08);
      this.capeMesh.rotation.x = 0.2;
      this.backGearGroup.add(this.capeMesh);

    } else if (model === 'quantum_champion') {
      // Floating quantum crystal wings hovering and pulsing behind back (+Z)
      const crystalGeo = new THREE.OctahedronGeometry(0.12);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: thrusterHex,
        emissive: thrusterHex,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.9
      });

      [-0.24, -0.12, 0.12, 0.24].forEach((x, i) => {
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set(x, 0.1 - (i % 2) * 0.12, 0.16);
        crystal.scale.set(0.8, 1.4, 0.6);
        this.backGearGroup.add(crystal);
        this.floatingCrystals.push(crystal);
      });

    } else {
      // Classic Athletic Runner Backpack
      const bpGeo = new THREE.BoxGeometry(0.38, 0.42, 0.16);
      const bpMesh = new THREE.Mesh(bpGeo, gearMat);
      bpMesh.position.set(0, 0, 0.08);
      bpMesh.castShadow = true;
      this.backGearGroup.add(bpMesh);

      // Gold buckle clasp
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), accentMat);
      buckle.position.set(0, 0.08, 0.17);
      this.backGearGroup.add(buckle);
    }
  }

  private createArm(suitMat: THREE.Material, skinMat: THREE.Material, accentMat: THREE.Material, isLeft: boolean): THREE.Group {
    const armGroup = new THREE.Group();

    // Upper arm
    const upperGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.36, 8);
    const upperMesh = new THREE.Mesh(upperGeo, suitMat);
    upperMesh.position.y = -0.16;
    upperMesh.castShadow = true;
    armGroup.add(upperMesh);

    // Accent sleeve band
    const bandGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.06, 8);
    const bandMesh = new THREE.Mesh(bandGeo, accentMat);
    bandMesh.position.y = -0.14;
    armGroup.add(bandMesh);

    // Forearm & Hand
    const handGeo = new THREE.SphereGeometry(0.075, 8, 8);
    const handMesh = new THREE.Mesh(handGeo, skinMat);
    handMesh.position.y = -0.36;
    armGroup.add(handMesh);

    return armGroup;
  }

  private createLeg(
    pantsMat: THREE.Material,
    gearMat: THREE.Material,
    soleMat: THREE.Material,
    accentMat: THREE.Material,
    isLeft: boolean
  ): THREE.Group {
    const legGroup = new THREE.Group();

    // Thigh + Shin (Pants)
    const legGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.44, 8);
    const legMesh = new THREE.Mesh(legGeo, pantsMat);
    legMesh.position.y = -0.22;
    legMesh.castShadow = true;
    legGroup.add(legMesh);

    // Cyber boot cuff
    const cuffGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.14, 10);
    const cuffMesh = new THREE.Mesh(cuffGeo, gearMat);
    cuffMesh.position.y = -0.42;
    legGroup.add(cuffMesh);

    // Boot sole / foot pointing forward (-Z)
    const footGeo = new THREE.BoxGeometry(0.18, 0.14, 0.36);
    const footMesh = new THREE.Mesh(footGeo, soleMat);
    footMesh.position.set(0, -0.48, -0.06); // Tip points forward (-Z)
    footMesh.castShadow = true;
    legGroup.add(footMesh);

    // Glowing LED sole strip on side
    const ledGeo = new THREE.BoxGeometry(0.19, 0.03, 0.34);
    const ledMesh = new THREE.Mesh(ledGeo, accentMat);
    ledMesh.position.set(0, -0.52, -0.06);
    legGroup.add(ledMesh);

    // Thruster nozzle ring at bottom
    const nozzleGeo = new THREE.TorusGeometry(0.075, 0.025, 8, 12);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, gearMat);
    nozzleMesh.position.set(0, -0.56, 0);
    legGroup.add(nozzleMesh);

    return legGroup;
  }

  public update(delta: number) {
    if (this.isStumbling) {
      this.stumbleTimer += delta;
      this.bodyGroup.rotation.z = Math.sin(this.stumbleTimer * 20) * 0.2;
      this.bodyGroup.rotation.x = 0.3; // Lean back when stumbling
      if (this.stumbleTimer > 0.6) {
        this.isStumbling = false;
        this.stumbleTimer = 0;
        this.bodyGroup.rotation.z = 0;
        this.bodyGroup.rotation.x = 0;
      }
      return;
    }

    if (this.isCelebrating) {
      // Victory pose: arms raised high, joyful bounce
      this.leftArm.rotation.x = Math.PI * 0.8;
      this.rightArm.rotation.x = Math.PI * 0.8;
      this.leftArm.rotation.z = 0.4;
      this.rightArm.rotation.z = -0.4;
      this.bodyGroup.position.y = 1.1 + Math.sin(Date.now() * 0.008) * 0.1;
      return;
    }

    if (this.isJumping) {
      // Jump pose: legs tucked forward, arms back, jet thruster flame blasting
      this.leftLeg.rotation.x = -0.5;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -0.7;
      this.rightArm.rotation.x = -0.7;

      const flamePulse = 1.3 + Math.sin(Date.now() * 0.03) * 0.4;
      this.leftJetFlame.scale.set(flamePulse, flamePulse * 1.6, flamePulse);
      this.rightJetFlame.scale.set(flamePulse, flamePulse * 1.6, flamePulse);
      this.jetLight.intensity = 4.8;
      return;
    }

    if (this.isSliding) {
      // Sliding pose: low crouch forward into the screen (-Z)
      this.bodyGroup.position.y = 0.52;
      this.bodyGroup.rotation.x = 0.7; // Lean forward along direction of motion
      this.leftLeg.rotation.x = 1.1;
      this.rightLeg.rotation.x = 0.9;
      this.leftArm.rotation.x = 0.5;
      this.rightArm.rotation.x = 0.5;

      this.leftJetFlame.scale.set(0.8, 1.0, 0.8);
      this.rightJetFlame.scale.set(0.8, 1.0, 0.8);
      return;
    }

    // Normal running animation cycle
    this.bodyGroup.position.y = 1.1 + Math.abs(Math.sin(this.runCycleTime * 12)) * 0.12;
    this.runCycleTime += delta;

    const runSpeed = 13.5;
    const stride = Math.sin(this.runCycleTime * runSpeed);

    // Opposite swinging of legs and arms along Z
    this.leftLeg.rotation.x = -stride * 0.75;
    this.rightLeg.rotation.x = stride * 0.75;

    this.leftArm.rotation.x = stride * 0.85;
    this.rightArm.rotation.x = -stride * 0.85;

    // Head bobbing slightly
    this.headGroup.rotation.y = Math.sin(this.runCycleTime * runSpeed * 0.5) * 0.06;

    // Dynamic lane lean (rolls into the lane)
    this.mesh.rotation.z = this.laneLean * 0.22;
    this.mesh.rotation.y = this.laneLean * 0.14;

    // Animate cape wave if present
    if (this.capeMesh) {
      this.capeMesh.rotation.x = 0.25 + Math.sin(this.runCycleTime * 14) * 0.15;
    }

    // Animate floating quantum crystals
    if (this.floatingCrystals.length > 0) {
      const t = Date.now() * 0.004;
      this.floatingCrystals.forEach((cr, i) => {
        cr.position.y = 0.1 + Math.sin(t + i) * 0.08;
        cr.rotation.y += delta * 2;
      });
    }

    // Small thruster pulses on running strides
    const thrusterScale = 0.35 + Math.max(0, stride) * 0.35;
    this.leftJetFlame.scale.set(thrusterScale, thrusterScale, thrusterScale);
    this.rightJetFlame.scale.set(0.7 - thrusterScale, 0.7 - thrusterScale, 0.7 - thrusterScale);
    this.jetLight.intensity = 1.8 + Math.abs(stride) * 1.2;
  }

  public triggerStumble() {
    this.isStumbling = true;
    this.stumbleTimer = 0;
  }
}
