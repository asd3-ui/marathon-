/**
 * Procedural Web Audio API sound synthesizer and voice engine.
 * 100% zero-dependency, works offline without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentStep: number = 0;
  
  public musicVolume: number = 0.5;
  public sfxVolume: number = 0.7;
  public isMuted: boolean = false;
  public voiceEnabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(music: number, sfx: number, muted: boolean) {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.isMuted = muted;

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : music, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : sfx, this.ctx.currentTime);
    }
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    // Upward pitch sweep + noise component for jet boost
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);

    // Jet burst hiss
    this.playNoise(0.12, 0.2);
  }

  public playSlide() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);

    this.playNoise(0.18, 0.15);
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Dual bell chime
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.12);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  public playGem() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  public playCorrectAnswer() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Triumphant rising major arpeggio: C5 -> E5 -> G5 -> C6
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  public playWrongAnswer() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Dissonant descending buzzer
    [260, 245, 190].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, startTime + 0.15);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

    gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);

    this.playNoise(0.3, 0.4);
  }

  public playPowerup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Fanfare: C5, E5, G5, high C6 sustained
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.12 },
      { f: 523.25, d: 0.12, t: 0.24 },
      { f: 659.25, d: 0.24, t: 0.36 },
      { f: 783.99, d: 0.24, t: 0.60 },
      { f: 1046.50, d: 0.60, t: 0.84 }
    ];

    notes.forEach(n => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startTime);

      gain.gain.setValueAtTime(0.4 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + n.d);
    });
  }

  private playNoise(duration: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Upbeat background arcade music loop
  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const bassScale = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00]; // C3 to A3
    const leadScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25]; // C4 to C5
    
    const tempo = 132; // BPM
    const stepDuration = 60 / tempo / 4; // 16th notes
    
    this.currentStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const step = this.currentStep % 16;
      this.currentStep++;

      // Bassline on beats 0, 4, 8, 12, etc.
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const bassFreq = bassScale[(Math.floor(this.currentStep / 16) + (step % 4)) % bassScale.length];

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);

        gain.gain.setValueAtTime(0.12 * this.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + stepDuration * 1.8);
      }

      // Snappy arcade high arp
      if (step % 3 === 0 || step === 14) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const leadFreq = leadScale[(step * 2 + Math.floor(this.currentStep / 8)) % leadScale.length];

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(leadFreq, now);

        gain.gain.setValueAtTime(0.08 * this.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + stepDuration * 1.2);
      }

      // Soft percussion tick
      if (step % 4 === 0) {
        this.playDrumTick(now, step === 0 || step === 8);
      }
    }, stepDuration * 1000);
  }

  private playDrumTick(time: number, isKick: boolean) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isKick) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      gain.gain.setValueAtTime(0.25 * this.musicVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      gain.gain.setValueAtTime(0.1 * this.musicVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + (isKick ? 0.12 : 0.08));
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  // Voice Speech Synthesis for Math Prompts & Celebrations
  public speak(text: string, lang: 'ar' | 'en' = 'ar') {
    if (!this.voiceEnabled || this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1; // energetic
      utterance.volume = this.sfxVolume;

      // Match voice language
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = lang === 'ar' ? 'ar' : 'en';
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis error ignored silently
    }
  }
}

export const sound = new SoundEngine();
