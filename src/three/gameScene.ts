import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RunnerCharacter } from './character';
import { WorldEnvironment } from './environment';
import { TrackManager } from './trackManager';
import { sound } from '../audio/soundEngine';
import { 
  EnvironmentTheme, 
  MathCategory, 
  MathQuestion, 
  PowerUpItem 
} from '../types/game';

export interface GameSceneCallbacks {
  onScoreUpdate: (score: number, distance: number) => void;
  onCoinCollected: (count: number, isGem: boolean) => void;
  onMathGatePassed: (question: MathQuestion, isCorrect: boolean, chosenOption: number) => void;
  onPowerupActivated: (type: PowerUpItem['type'], durationSeconds: number) => void;
  onCollisionHurt: (livesLeft: number) => void;
  onGameOver: (reason: string) => void;
  onVictory: () => void;
  onComboUpdate: (combo: number, multiplier: number, isReset: boolean) => void;
}

export class GameScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isDisposed: boolean = false;

  // Game sub-systems
  public character: RunnerCharacter;
  public environment: WorldEnvironment;
  public trackManager: TrackManager;
  private callbacks: GameSceneCallbacks;

  // Gameplay state
  public isPaused: boolean = false;
  public isRunning: boolean = true;
  public currentLane: number = 0; // -1: Left, 0: Center, 1: Right
  public targetLaneX: number = 0;
  public playerSpeed: number = 15.5; // Comfortable, readable base speed
  public currentSpeed: number = 15.5;
  public distanceRan: number = 0;
  public score: number = 0;
  public coinsCollected: number = 0;
  public lives: number = 3;

  // Combo Multiplier System
  public currentCombo: number = 0;
  public comboMultiplier: number = 1.0;

  // Jump & slide kinematics
  private playerY: number = 0;
  private playerVy: number = 0;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly gravity: number = -46;
  private readonly jumpVelocity: number = 14.5;

  // Powerups active
  public activeShield: boolean = false;
  public activeMagnet: boolean = false;
  public activeMultiplier: boolean = false;
  public activeSlowMo: boolean = false;
  public activeTurbo: boolean = false;
  private powerupTimers: { [key: string]: number } = {};

  // Level progression targets
  public targetQuestions: number = 5;
  public questionsAnswered: number = 0;
  public isEndless: boolean = false;

  constructor(
    container: HTMLElement,
    theme: EnvironmentTheme,
    category: MathCategory,
    difficulty: number,
    callbacks: GameSceneCallbacks,
    characterOptions: any
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Software-WebGL Guard as required by Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera positioned behind player's head and back
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 3.4, 6.8);
    this.camera.lookAt(0, 1.4, -6);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Initialize Subsystems
    this.environment = new WorldEnvironment(this.scene, theme);
    this.trackManager = new TrackManager(this.scene, theme);
    this.trackManager.currentCategory = category;
    this.trackManager.currentDifficulty = difficulty;
    this.trackManager.setTheme(theme);

    this.character = new RunnerCharacter(characterOptions);
    this.scene.add(this.character.mesh);

    // 6. Handle Window Resize
    window.addEventListener('resize', this.onResize);

    // 7. Start Render Loop
    this.clock.start();
    this.loop();
  }

  public changeLane(direction: 'left' | 'right') {
    if (!this.isRunning || this.isPaused) return;

    if (direction === 'left' && this.currentLane > -1) {
      this.currentLane--;
    } else if (direction === 'right' && this.currentLane < 1) {
      this.currentLane++;
    }

    this.targetLaneX = this.trackManager.lanePositions[this.currentLane + 1];
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.isSliding = false;
      this.playerVy = this.jumpVelocity;
      this.character.isJumping = true;
      this.character.isSliding = false;
      sound.playJump();
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused) return;
    if (this.isJumping) {
      // Fast drop down when sliding mid-air
      this.playerVy = -20;
    }
    this.isSliding = true;
    this.slideTimer = 0.65; // duration of slide
    this.character.isSliding = true;
    sound.playSlide();
  }

  public setQuality(quality: 'high' | 'medium' | 'low') {
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
    } else if (quality === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(1.2);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  private loop = () => {
    if (this.isDisposed) return;
    this.frameId = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (!this.isPaused && this.isRunning) {
      this.updatePhysics(delta);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(delta: number) {
    // 1. Exponential Difficulty Curve:
    // Speed scales gently with distance: v(d) = baseSpeed + maxBoost * (1 - e^(-distance / 600))
    // Normal, comfortable running pace that never gets excessively fast
    const maxSpeedBoost = 3.2;
    const decayDistance = 600.0;
    const exponentialCurveSpeed = this.playerSpeed + maxSpeedBoost * (1.0 - Math.exp(-this.distanceRan / decayDistance));

    // Apply active power-up modifiers (Slow-Mo / Turbo)
    let speedMult = 1.0;
    if (this.activeSlowMo) speedMult *= 0.55;
    if (this.activeTurbo) speedMult *= 1.5;

    this.currentSpeed = exponentialCurveSpeed * speedMult;
    const frameDistance = this.currentSpeed * delta;
    this.distanceRan += frameDistance;
    // Scale distance score with combo multiplier bonus
    const comboDistanceBonus = 1 + (this.comboMultiplier - 1) * 0.5;
    this.score += Math.round(frameDistance * (this.activeMultiplier ? 4 : 2) * comboDistanceBonus);
    this.callbacks.onScoreUpdate(this.score, Math.floor(this.distanceRan));

    // Update powerup timers
    Object.keys(this.powerupTimers).forEach(key => {
      this.powerupTimers[key] -= delta;
      if (this.powerupTimers[key] <= 0) {
        delete this.powerupTimers[key];
        if (key === 'shield') this.activeShield = false;
        if (key === 'magnet') this.activeMagnet = false;
        if (key === 'multiplier') this.activeMultiplier = false;
        if (key === 'slowmo') this.activeSlowMo = false;
        if (key === 'turbo') this.activeTurbo = false;
      }
    });

    // 2. Smooth Lateral Lane Movement (Spring / Exponential Damping)
    const currentX = this.character.mesh.position.x;
    const diffX = this.targetLaneX - currentX;
    this.character.mesh.position.x += diffX * Math.min(1, delta * 14);

    // Dynamic tilt angle
    this.character.laneLean = THREE.MathUtils.clamp(diffX * 0.8, -1, 1);

    // 3. Jump & Vertical Physics
    if (this.isJumping) {
      this.playerVy += this.gravity * delta;
      this.playerY += this.playerVy * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVy = 0;
        this.isJumping = false;
        this.character.isJumping = false;
      }
    }

    // 4. Slide duration timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.character.isSliding = false;
      }
    }

    this.character.mesh.position.y = this.playerY;

    // 5. Update character animation
    this.character.update(delta);

    // 6. Update environment & track systems
    this.environment.update(this.currentSpeed, delta);
    this.trackManager.update(this.currentSpeed, delta, 0);

    // 7. Dynamic Camera Follow (Over-the-shoulder behind player)
    const targetCamX = this.character.mesh.position.x * 0.45;
    const targetCamY = 3.4 + this.playerY * 0.35;
    this.camera.position.x += (targetCamX - this.camera.position.x) * (delta * 8);
    this.camera.position.y += (targetCamY - this.camera.position.y) * (delta * 8);

    // 8. Collision Detection
    this.checkCollisions();
  }

  private checkCollisions() {
    const charX = this.character.mesh.position.x;
    const charY = this.playerY;
    const playerZ = 0; // Character is at origin Z = 0

    // Character bounding box
    const charMinX = charX - 0.4;
    const charMaxX = charX + 0.4;
    const charMinY = charY;
    const charMaxY = charY + (this.isSliding ? 0.7 : 1.8);
    const charMinZ = playerZ - 0.4;
    const charMaxZ = playerZ + 0.4;

    // A. Coins & Gems Collision
    this.trackManager.coins.forEach(coin => {
      if (coin.data.collected) return;

      let dx = coin.mesh.position.x - charX;
      let dy = coin.mesh.position.y - (charY + 1.0);
      let dz = coin.mesh.position.z - playerZ;

      // Magnet effect: attract nearby coins
      if (this.activeMagnet && dz < 18 && dz > -8) {
        coin.mesh.position.x += (charX - coin.mesh.position.x) * 0.15;
        coin.mesh.position.y += ((charY + 1.0) - coin.mesh.position.y) * 0.15;
        dx = coin.mesh.position.x - charX;
        dy = coin.mesh.position.y - (charY + 1.0);
      }

      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 1.35) {
        coin.data.collected = true;
        this.coinsCollected += coin.data.isGem ? 5 : 1;
        this.score += coin.data.isGem ? 250 : 50;

        if (coin.data.isGem) {
          sound.playGem();
        } else {
          sound.playCoin();
        }

        this.callbacks.onCoinCollected(this.coinsCollected, !!coin.data.isGem);
      }
    });

    // B. Power-Ups Collision
    this.trackManager.powerups.forEach(pu => {
      if (pu.data.collected) return;

      const dx = pu.mesh.position.x - charX;
      const dz = pu.mesh.position.z - playerZ;
      if (Math.abs(dx) < 1.2 && Math.abs(dz) < 1.2) {
        pu.data.collected = true;
        this.activatePowerup(pu.data.type);
      }
    });

    // C. Obstacles Collision
    for (const obs of this.trackManager.obstacles) {
      if (obs.data.passed) continue;

      const obsZ = obs.mesh.position.z;
      // Close in Z
      if (obsZ > -1.2 && obsZ < 1.2) {
        const obsX = obs.mesh.position.x;
        const xDist = Math.abs(obsX - charX);

        if (xDist < 0.95) {
          // Check vertical passability
          let hit = false;

          if (obs.data.type === 'tech_crate') {
            // Must jump over
            if (charMinY < 0.75) hit = true;
          } else if (obs.data.type === 'laser_barrier') {
            // Must slide under
            if (charMaxY > 1.2) hit = true;
          } else {
            // Spikes or Drone: lane collision
            hit = true;
          }

          if (hit) {
            obs.data.passed = true;
            this.handlePlayerDamage('collision');
            return;
          }
        }
      } else if (obsZ > 2.0) {
        obs.data.passed = true;
      }
    }

    // D. Math Gate Passage Collision (Crucial game core!)
    for (const gate of this.trackManager.gates) {
      if (gate.data.resolved) continue;

      const gateZ = gate.mesh.position.z;

      // When player reaches gate threshold
      if (gateZ >= -0.5 && gateZ <= 1.5) {
        gate.data.resolved = true;
        this.questionsAnswered++;

        // Determine player lane at the gate (0: Left, 1: Center, 2: Right)
        const chosenLaneIdx = this.currentLane + 1; // map -1,0,1 to 0,1,2
        const isCorrect = chosenLaneIdx === gate.data.question.correctIndex;
        gate.data.isCorrect = isCorrect;
        gate.data.chosenLane = chosenLaneIdx;

        if (isCorrect) {
          // Success! Audio muted per user request
          this.currentCombo++;
          this.comboMultiplier = this.getComboMultiplier(this.currentCombo);
          const earned = Math.round(1000 * this.comboMultiplier * (this.activeMultiplier ? 2 : 1));
          this.score += earned;
          this.callbacks.onComboUpdate(this.currentCombo, this.comboMultiplier, false);
        } else {
          // Mistake! Audio muted per user request
          this.currentCombo = 0;
          this.comboMultiplier = 1.0;
          this.callbacks.onComboUpdate(0, 1.0, true);
          this.handlePlayerDamage('math_error');
        }

        this.callbacks.onMathGatePassed(gate.data.question, isCorrect, gate.data.question.options[chosenLaneIdx]);

        // Check level completion
        if (!this.isEndless && this.questionsAnswered >= this.targetQuestions) {
          setTimeout(() => {
            this.character.isCelebrating = true;
            sound.playVictory();
            this.callbacks.onVictory();
          }, 600);
        }
      }
    }
  }

  public getComboMultiplier(combo: number): number {
    if (combo <= 1) return 1.0;
    if (combo === 2) return 1.5;
    if (combo === 3) return 2.0;
    if (combo === 4) return 2.5;
    if (combo === 5) return 3.0;
    if (combo === 6) return 3.5;
    if (combo === 7) return 4.0;
    return 5.0; // Max 5.0x
  }

  public activatePowerup(type: PowerUpItem['type']) {
    const duration = 12; // 12 seconds duration
    this.powerupTimers[type] = duration;
    sound.playPowerup();

    if (type === 'shield') this.activeShield = true;
    if (type === 'magnet') this.activeMagnet = true;
    if (type === 'multiplier') this.activeMultiplier = true;
    if (type === 'slowmo') this.activeSlowMo = true;
    if (type === 'turbo') this.activeTurbo = true;

    this.callbacks.onPowerupActivated(type, duration);
  }

  private handlePlayerDamage(reason: 'collision' | 'math_error') {
    // Damage or obstacle collision breaks the current combo streak
    if (this.currentCombo > 0) {
      this.currentCombo = 0;
      this.comboMultiplier = 1.0;
      this.callbacks.onComboUpdate(0, 1.0, true);
    }

    // If shield is active, absorb hit
    if (this.activeShield) {
      this.activeShield = false;
      delete this.powerupTimers['shield'];
      sound.playPowerup();
      this.character.triggerStumble();
      return;
    }

    this.lives--;
    if (reason === 'collision') {
      sound.playCrash();
    }
    this.character.triggerStumble();
    this.callbacks.onCollisionHurt(this.lives);

    if (this.lives <= 0) {
      this.isRunning = false;
      this.callbacks.onGameOver(reason === 'math_error' ? 'إجابات غير صحيحة متعددة' : 'اصطدام بعقبة');
    }
  }

  public restart(
    theme: EnvironmentTheme,
    category: MathCategory,
    difficulty: number,
    targetQuestions: number,
    baseSpeed: number,
    isEndless: boolean = false
  ) {
    this.score = 0;
    this.distanceRan = 0;
    this.coinsCollected = 0;
    this.lives = 3;
    this.currentCombo = 0;
    this.comboMultiplier = 1.0;
    this.callbacks.onComboUpdate(0, 1.0, false);
    this.questionsAnswered = 0;
    this.targetQuestions = targetQuestions;
    this.playerSpeed = baseSpeed;
    this.currentSpeed = baseSpeed;
    this.isEndless = isEndless;
    this.isRunning = true;
    this.isPaused = false;
    this.currentLane = 0;
    this.targetLaneX = 0;
    this.playerY = 0;
    this.playerVy = 0;
    this.isJumping = false;
    this.isSliding = false;

    // Reset character
    this.character.mesh.position.set(0, 0, 0);
    this.character.isCelebrating = false;
    this.character.isStumbling = false;

    // Reset track and environment
    this.trackManager.reset();
    this.trackManager.currentCategory = category;
    this.trackManager.currentDifficulty = difficulty;
    this.trackManager.setTheme(theme);
    this.environment.setTheme(theme, this.scene);
  }

  public changeCharacter(options: any) {
    if (this.character && this.character.mesh) {
      this.scene.remove(this.character.mesh);
    }
    this.character = new RunnerCharacter(options);
    this.scene.add(this.character.mesh);
  }

  private onResize = () => {
    if (this.isDisposed || !this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
