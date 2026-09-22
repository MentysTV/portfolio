/**
 * CYBER VIOLET // STREAM CORE JAVASCRIPT
 * Designed for MentysTV // OBS Browser Source Support
 */

const STREAM_CONFIG = {
  channelName: "MentysTV",
  startingCountdownSeconds: 300, // 5 minut
  socials: {
    twitch: "MentysTV",
    youtube: "MentysTV",
    discord: "discord.gg/mentys",
    instagram: "@mentystv",
    tiktok: "@mentystv"
  },
  soundEnabled: true
};

// Web Audio API Procedural Sound Engine
class CyberAudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Futuristic dual-oscillator chime for Follows/Subs/Alerts
  playAlertChime() {
    if (!STREAM_CONFIG.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      // Arpeggiated cyber chime: F#5 -> A#5 -> C#6 -> F#6
      osc1.frequency.setValueAtTime(739.99, now);
      osc1.frequency.exponentialRampToValueAtTime(1479.98, now + 0.15);

      osc2.frequency.setValueAtTime(932.33, now);
      osc2.frequency.exponentialRampToValueAtTime(1864.66, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.25);
      osc2.stop(now + 1.25);
    } catch (e) {
      console.warn("Audio init deferred until user interaction", e);
    }
  }

  // Stinger transition cinematic bass sweep + glitch
  playStingerSound() {
    if (!STREAM_CONFIG.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }
}

const CyberSound = new CyberAudioEngine();

// Cyber Particle Background System
class CyberBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 55;
    this.width = this.canvas.width = 1920;
    this.height = this.canvas.height = 1080;
    this.init();
  }

  init() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.4 ? 'rgba(157, 78, 221, ' : 'rgba(0, 245, 212, ',
        alpha: Math.random() * 0.6 + 0.2
      });
    }
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw glowing particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color.includes('157') ? '#9d4edd' : '#00f5d4';
      this.ctx.fill();

      // Connect close nodes with faint digital lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 140) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(157, 78, 221, ${0.25 * (1 - dist / 140)})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
        }
      }
    }
  }
}

// Countdown Timer Handler
class StreamCountdown {
  constructor(displayElementId, initialSeconds = 300, onComplete = null) {
    this.display = document.getElementById(displayElementId);
    this.seconds = initialSeconds;
    this.onComplete = onComplete;
    this.interval = null;
    this.start();
  }

  start() {
    this.updateDisplay();
    this.interval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
        this.updateDisplay();
      } else {
        clearInterval(this.interval);
        if (this.onComplete) this.onComplete();
      }
    }, 1000);
  }

  updateDisplay() {
    if (!this.display) return;
    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    this.display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

// Global alert trigger for OBS testing & integration
window.triggerStreamAlert = function(type, user, message) {
  const wrapper = document.getElementById('alert-box');
  if (!wrapper) return;

  const titleEl = document.getElementById('alert-title');
  const userEl = document.getElementById('alert-user');
  const msgEl = document.getElementById('alert-message');
  const imgEl = document.getElementById('alert-img');

  let title = "NOVÝ SLEDUJÍCÍ!";
  let img = "../assets/emotes/mentys_hype_112.png";

  if (type === 'sub') {
    title = "NOVÝ ODBĚRATEL (SUB)!";
    img = "../assets/emotes/mentys_gg_112.png";
  } else if (type === 'donate') {
    title = "DONACE / PODPORA!";
    img = "../assets/emotes/mentys_hype_112.png";
  } else if (type === 'raid') {
    title = "PŘÍCHOZÍ RAID!";
    img = "../assets/emotes/mentys_rage_112.png";
  }

  if (titleEl) titleEl.textContent = title;
  if (userEl) userEl.textContent = user || "CyberGamer99";
  if (msgEl) msgEl.textContent = message || "Vítej na streamu!";
  if (imgEl) imgEl.src = img;

  wrapper.style.display = 'flex';
  const alertCard = wrapper.querySelector('.cyber-alert');
  if (alertCard) {
    alertCard.classList.remove('hide');
  }

  CyberSound.playAlertChime();

  setTimeout(() => {
    if (alertCard) {
      alertCard.classList.add('hide');
      setTimeout(() => {
        wrapper.style.display = 'none';
      }, 500);
    }
  }, 5000);
};
