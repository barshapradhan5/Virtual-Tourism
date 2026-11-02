class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(type: 'temple' | 'beach' | 'nature' | 'mountain' = 'temple') {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'temple') {
      this.playTempleChimes();
    } else if (type === 'beach') {
      this.playOceanWaves();
    } else {
      this.playBreeze();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.suspend();
    }
  }

  public toggle(type: 'temple' | 'beach' | 'nature' | 'mountain' = 'temple'): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(type);
      return true;
    }
  }

  private playTempleChimes() {
    if (!this.ctx || !this.gainNode) return;

    const playBell = () => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      // Pentatonic overtone frequencies
      const freqs = [528, 660, 792, 1056];
      osc.frequency.value = freqs[Math.floor(Math.random() * freqs.length)];
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      bellGain.gain.setValueAtTime(0.001, now);
      bellGain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(bellGain);
      bellGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 4.0);
    };

    playBell();
    this.intervalId = setInterval(playBell, 4500);
  }

  private playOceanWaves() {
    if (!this.ctx || !this.gainNode) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    // Modulate wave frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // one wave every ~6s
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }

  private playBreeze() {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.Q.value = 1.0;

    osc.connect(filter);
    filter.connect(this.gainNode);
    osc.start();
  }
}

export const ambientSound = new AmbientSoundEngine();

