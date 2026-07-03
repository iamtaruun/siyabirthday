/**
 * ============================================================
 * SCRIPT.JS — Happy Birthday Siya
 * Production-ready Vanilla JavaScript
 * ============================================================
 */

(function() {
  'use strict';

  // ============================================================
  // DOM CACHE
  // ============================================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const dom = {
    loading: {
      screen: $('#loading-screen'),
      fill: $('#progress-bar-fill'),
      percent: $('#loading-percent'),
      starField: $('#loading-star-field'),
      particles: $('#loading-particles'),
    },
    hero: {
      btn: $('#begin-journey-btn'),
      starField: $('#hero-star-field'),
      balloons: $('#hero-balloons'),
    },
    music: {
      player: $('#music-player'),
      disc: $('#music-disc'),
      toggle: $('#music-toggle'),
      icon: $('#music-icon'),
      mute: $('#music-mute'),
      muteIcon: $('#mute-icon'),
      volume: $('#music-volume'),
      audio: $('#bg-music'),
    },
    toast: $('#toast-container'),
    fx: $('#fx-canvas'),
    videoModal: {
      modal: $('#video-modal'),
      backdrop: $('#video-modal-backdrop'),
      title: $('#video-modal-title'),
      video: $('#modal-video'),
      missing: $('#video-missing'),
      missingName: $('#video-missing-name'),
      playPause: $('#video-playpause'),
      replay: $('#video-replay'),
      skip: $('#video-skip'),
      continue: $('#video-continue'),
    },
    secret: $('#secret-celebration'),
    ending: {
      text: $('#ending-text-dom'),
      credits: $('#ending-credits'),
      starField: $('#ending-star-field'),
    },
    letter: {
      text: $('#letter-text'),
      cursor: $('#letter-cursor'),
    },
    games: {
      catchcake: {
        intro: $('#catchcake-intro'),
        startBtn: $('#catchcake-start-btn'),
        hud: $('#catchcake-hud'),
        timer: $('#catchcake-timer'),
        score: $('#catchcake-score'),
        arena: $('#catchcake-arena'),
        basket: $('#catchcake-basket'),
        result: $('#catchcake-result'),
        finalScore: $('#catchcake-final-score'),
      },
      quiz: {
        intro: $('#quiz-intro'),
        startBtn: $('#quiz-start-btn'),
        hud: $('#quiz-hud'),
        current: $('#quiz-current'),
        total: $('#quiz-total'),
        score: $('#quiz-score'),
        container: $('#quiz-container'),
        result: $('#quiz-result'),
        finalScore: $('#quiz-final-score'),
        secretBtn: $('#quiz-secret-btn'),
        bonusContainer: $('#secret-bonus-container'),
      },
      gift: {
        intro: $('#gift-intro'),
        startBtn: $('#gift-start-btn'),
        grid: $('#gift-grid'),
        decryptOverlay: $('#decrypt-overlay'),
        decryptFill: $('#decrypt-bar-fill'),
        decryptPercent: $('#decrypt-percent'),
      },
    },
    hippo: $('#hidden-hippo'),
    easterCake: $('#easter-cake'),
  };

  // ============================================================
  // STATE
  // ============================================================
  const state = {
    musicPlaying: false,
    musicMuted: false,
    musicVolume: 60,
    journeyStarted: false,
    loadingComplete: false,
    // Games
    catchcake: { score: 0, timer: 30, active: false, interval: null, dropInterval: null },
    quiz: { score: 0, current: 0, answered: false, completed: false },
    gift: { correctIndex: -1, opened: [], revealed: false, decrypting: false },
    // Easter
    cakeClicks: 0,
    secretTyped: '',
    // Ending
    endingShown: false,
    // Video
    videoOpen: false,
    videoCallback: null,
    // Wrong gift videos tracking
    wrongGiftVideos: [],
    wrongGiftIndex: 0,
  };

  // ============================================================
  // UTILITIES
  // ============================================================
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function randFloat(min, max) { return Math.random() * (max - min) + min; }

  function pick(arr) { return arr[rand(0, arr.length - 1)]; }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ============================================================
  // TOAST SYSTEM
  // ============================================================
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    dom.toast.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, duration);
  }

  // ============================================================
  // FX CANVAS — Confetti / Fireworks / Particles
  // ============================================================
  const fx = {
    canvas: dom.fx,
    ctx: null,
    particles: [],
    running: false,
    animId: null,

    init() {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    clear() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.particles = [];
    },

    // ---- Confetti ----
    confetti(count = 120, colors = ['#ff5e9c', '#9b5de5', '#4cd9ec', '#ffd166', '#f6f4ff']) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: randFloat(0, this.canvas.width),
          y: randFloat(-this.canvas.height * 0.2, 0),
          w: randFloat(6, 14),
          h: randFloat(4, 8),
          color: pick(colors),
          vx: randFloat(-2, 2),
          vy: randFloat(1.5, 4.5),
          rot: randFloat(0, Math.PI * 2),
          rotSpeed: randFloat(-0.08, 0.08),
          life: 1,
          decay: randFloat(0.002, 0.008),
          gravity: 0.04,
        });
      }
      this.start();
    },

    // ---- Fireworks ----
    firework(x, y, count = 60, colors = ['#ff5e9c', '#9b5de5', '#4cd9ec', '#ffd166', '#f6f4ff', '#ff6b6b']) {
      const cx = x || randFloat(this.canvas.width * 0.1, this.canvas.width * 0.9);
      const cy = y || randFloat(this.canvas.height * 0.1, this.canvas.height * 0.5);
      for (let i = 0; i < count; i++) {
        const angle = randFloat(0, Math.PI * 2);
        const speed = randFloat(1.5, 6);
        this.particles.push({
          x: cx,
          y: cy,
          w: randFloat(3, 6),
          h: randFloat(3, 6),
          color: pick(colors),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: randFloat(0, Math.PI * 2),
          rotSpeed: randFloat(-0.05, 0.05),
          life: 1,
          decay: randFloat(0.006, 0.018),
          gravity: 0.06,
          trail: true,
        });
      }
      this.start();
    },

    // ---- Multi-fireworks ----
    fireworksBurst(count = 6) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.firework(
            randFloat(this.canvas.width * 0.1, this.canvas.width * 0.9),
            randFloat(this.canvas.height * 0.1, this.canvas.height * 0.5),
            rand(40, 80)
          );
        }, i * 200);
      }
    },

    start() {
      if (this.running) return;
      this.running = true;
      this.loop();
    },

    loop() {
      if (!this.running) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles = this.particles.filter(p => p.life > 0.01);

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.04;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.rot += p.rotSpeed || 0;
        p.life -= p.decay || 0.01;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (this.particles.length === 0) {
        this.running = false;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
      }

      this.animId = requestAnimationFrame(() => this.loop());
    },

    stop() {
      this.running = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.clear();
    },
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================
  function initLoading() {
    let progress = 0;
    const target = 100;
    const step = () => {
      progress += rand(2, 6);
      if (progress > target) progress = target;
      dom.loading.fill.style.width = progress + '%';
      dom.loading.percent.textContent = progress + '%';
      if (progress < target) {
        setTimeout(step, rand(60, 200));
      } else {
        dom.loading.screen.classList.add('loaded');
        state.loadingComplete = true;
        // Generate hero stars after loading
        generateHeroStars();
        generateHeroBalloons();
        generateEndingStars();
        // Start IntersectionObserver
        initRevealObserver();
        // Handle image errors
        initImagePlaceholders();
        // Init games
        initCatchCake();
        initQuiz();
        initGiftGame();
        // Init letter
        initLetter();
        // Init easter eggs
        initEasterEggs();
        // Init keyboard secret
        initKeyboardSecret();
        // Init music
        initMusic();
        // Init video modal
        initVideoModal();
        // Init ending
        initEnding();
        // Init clickable stars
        initClickableStars();
        // Check if all games completed
        checkAllGamesCompleted();
      }
    };
    step();
  }

  // ============================================================
  // MUSIC
  // ============================================================
  function initMusic() {
    const audio = dom.music.audio;
    const player = dom.music.player;
    const disc = dom.music.disc;
    const toggle = dom.music.toggle;
    const icon = dom.music.icon;
    const mute = dom.music.mute;
    const muteIcon = dom.music.muteIcon;
    const volume = dom.music.volume;

    audio.volume = state.musicVolume / 100;

    toggle.addEventListener('click', () => {
      if (state.musicPlaying) {
        audio.pause();
        state.musicPlaying = false;
        icon.textContent = '▶️';
        disc.classList.remove('spinning');
      } else {
        audio.play().catch(() => {});
        state.musicPlaying = true;
        icon.textContent = '⏸️';
        disc.classList.add('spinning');
      }
    });

    mute.addEventListener('click', () => {
      state.musicMuted = !state.musicMuted;
      audio.muted = state.musicMuted;
      muteIcon.textContent = state.musicMuted ? '🔇' : '🔊';
    });

    volume.addEventListener('input', () => {
      state.musicVolume = parseInt(volume.value, 10);
      audio.volume = state.musicVolume / 100;
      if (state.musicMuted) {
        state.musicMuted = false;
        audio.muted = false;
        muteIcon.textContent = '🔊';
      }
    });

    // Update disc rotation when playing
    audio.addEventListener('play', () => {
      state.musicPlaying = true;
      icon.textContent = '⏸️';
      disc.classList.add('spinning');
    });

    audio.addEventListener('pause', () => {
      state.musicPlaying = false;
      icon.textContent = '▶️';
      disc.classList.remove('spinning');
    });
  }

  function startMusic() {
    const audio = dom.music.audio;
    audio.play().catch(() => {});
    state.musicPlaying = true;
    dom.music.icon.textContent = '⏸️';
    dom.music.disc.classList.add('spinning');
    dom.music.player.classList.add('visible');
  }

  // ============================================================
  // BEGIN JOURNEY
  // ============================================================
  dom.hero.btn.addEventListener('click', () => {
    if (state.journeyStarted) return;
    state.journeyStarted = true;
    startMusic();
    // Scroll to timeline
    const target = $('#timeline');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast('🎉 Journey begun! Welcome, Siya!');
  });

  // ============================================================
  // SCROLL ANIMATIONS (IntersectionObserver)
  // ============================================================
  function initRevealObserver() {
    const reveals = $$('.reveal');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      }
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    });
    for (const el of reveals) {
      observer.observe(el);
    }
  }

  // ============================================================
  // IMAGE PLACEHOLDERS
  // ============================================================
  function initImagePlaceholders() {
    const frames = $$('.gallery-frame');
    for (const frame of frames) {
      const img = frame.querySelector('img');
      if (!img) continue;
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const placeholder = frame.querySelector('.img-placeholder');
        if (placeholder) {
          placeholder.style.display = 'flex';
        }
        frame.classList.add('img-error');
      });
    }
  }

  // ============================================================
  // HERO STARS & BALLOONS
  // ============================================================
  function generateHeroStars() {
    const container = dom.hero.starField;
    if (!container) return;
    const count = 80;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = randFloat(1.5, 4);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = randFloat(0, 100) + '%';
      star.style.top = randFloat(0, 100) + '%';
      star.style.animationDelay = randFloat(0, 5) + 's';
      star.style.animationDuration = randFloat(2, 5) + 's';
      if (Math.random() < 0.15) {
        star.classList.add('clickable-star');
        star.dataset.message = pick([
          '🌟 You found a star!',
          '✨ Wish upon a star!',
          '⭐ Siya is a star!',
          '💫 Birthday magic!',
        ]);
      }
      container.appendChild(star);
    }
  }

  function generateHeroBalloons() {
    const container = dom.hero.balloons;
    if (!container) return;
    const emojis = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'hero-balloon';
      balloon.textContent = pick(emojis);
      balloon.style.left = randFloat(2, 96) + '%';
      balloon.style.fontSize = randFloat(1.6, 3.2) + 'rem';
      balloon.style.animationDuration = randFloat(8, 16) + 's';
      balloon.style.animationDelay = randFloat(0, 14) + 's';
      balloon.style.opacity = randFloat(0.3, 0.8);
      container.appendChild(balloon);
    }
  }

  // ============================================================
  // ENDING STARS
  // ============================================================
  function generateEndingStars() {
    const container = dom.ending.starField;
    if (!container) return;
    const count = 100;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = randFloat(1, 3.5);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = randFloat(0, 100) + '%';
      star.style.top = randFloat(0, 100) + '%';
      star.style.animationDelay = randFloat(0, 6) + 's';
      star.style.animationDuration = randFloat(2, 6) + 's';
      container.appendChild(star);
    }
  }

  // ============================================================
  // CLICKABLE STARS
  // ============================================================
  function initClickableStars() {
    document.addEventListener('click', (e) => {
      const star = e.target.closest('.clickable-star');
      if (star) {
        const msg = star.dataset.message || '⭐ Twinkle twinkle!';
        showToast(msg);
        fx.confetti(30);
        star.style.transform = 'scale(2)';
        setTimeout(() => { star.style.transform = ''; }, 300);
      }
    });
  }

  // ============================================================
  // VIDEO MODAL
  // ============================================================
  function initVideoModal() {
    const modal = dom.videoModal.modal;
    const backdrop = dom.videoModal.backdrop;
    const video = dom.videoModal.video;
    const missing = dom.videoModal.missing;
    const missingName = dom.videoModal.missingName;
    const playPause = dom.videoModal.playPause;
    const replay = dom.videoModal.replay;
    const skip = dom.videoModal.skip;
    const continueBtn = dom.videoModal.continue;
    const title = dom.videoModal.title;

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      video.pause();
      video.src = '';
      video.load();
      missing.hidden = true;
      state.videoOpen = false;
      if (state.videoCallback) {
        const cb = state.videoCallback;
        state.videoCallback = null;
        cb();
      }
    }

    backdrop.addEventListener('click', closeModal);

    playPause.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
        playPause.textContent = '⏸️';
      } else {
        video.pause();
        playPause.textContent = '▶️';
      }
    });

    replay.addEventListener('click', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      playPause.textContent = '⏸️';
    });

    skip.addEventListener('click', closeModal);
    continueBtn.addEventListener('click', closeModal);

    // Handle video errors
    video.addEventListener('error', () => {
      const src = video.src;
      if (src) {
        const parts = src.split('/');
        const filename = parts[parts.length - 1] || 'video.mp4';
        missingName.textContent = filename;
        missing.hidden = false;
        video.style.display = 'none';
        playPause.textContent = '⏭️';
      }
    });

    video.addEventListener('play', () => { playPause.textContent = '⏸️'; });
    video.addEventListener('pause', () => { playPause.textContent = '▶️'; });
    video.addEventListener('ended', () => { playPause.textContent = '🔁'; });

    // Expose open function
    window.openVideo = function(filename, titleText = '🎉 Reward Unlocked') {
      return new Promise((resolve) => {
        state.videoCallback = resolve;
        title.textContent = titleText || '🎉 Reward Unlocked';
        video.style.display = 'block';
        missing.hidden = true;
        video.pause();
        video.src = filename;
        video.load();
        video.play().catch(() => {});
        playPause.textContent = '⏸️';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        state.videoOpen = true;
      });
    };
  }

  // ============================================================
  // GAME 1: CATCH THE CAKE
  // ============================================================
  function initCatchCake() {
    const g = dom.games.catchcake;
    const arena = g.arena;
    const basket = g.basket;
    let items = [];
    let gameRunning = false;
    let score = 0;
    let timeLeft = 30;
    let timerInterval = null;
    let dropInterval = null;
    let basketX = 50;
    let arenaRect = null;

    const CAKE_EMOJIS = ['🎂', '🧁', '🍰', '🎂', '🧁'];
    const BOMB_EMOJI = '💣';

    function updateBasket() {
      const rect = arena.getBoundingClientRect();
      const width = rect.width - 64;
      const pct = clamp(basketX, 0, 100);
      basket.style.left = (pct / 100 * width + 32) + 'px';
    }

    function spawnItem() {
      if (!gameRunning) return;
      const isCake = Math.random() < 0.65;
      const el = document.createElement('div');
      el.className = 'falling-item';
      el.textContent = isCake ? pick(CAKE_EMOJIS) : BOMB_EMOJI;
      el.dataset.type = isCake ? 'cake' : 'bomb';
      const rect = arena.getBoundingClientRect();
      const x = randFloat(20, rect.width - 20);
      el.style.left = x + 'px';
      const duration = randFloat(1800, 3200);
      el.style.animationDuration = duration + 'ms';
      el.classList.add('falling');
      arena.appendChild(el);
      items.push({ el, type: el.dataset.type, x, y: -40, speed: randFloat(1.8, 3.6) });

      // Remove after animation
      setTimeout(() => {
        if (el.parentNode) el.remove();
        items = items.filter(it => it.el !== el);
      }, duration + 100);
    }

    function checkCollisions() {
      const rect = arena.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      const basketCenter = basketRect.left + basketRect.width / 2;
      const basketY = basketRect.top;

      for (const item of items) {
        if (!item.el.parentNode) continue;
        const itemRect = item.el.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const itemBottom = itemRect.bottom;

        if (itemBottom >= basketY && itemBottom <= basketY + 20) {
          const dist = Math.abs(itemCenter - basketCenter);
          if (dist < 40) {
            if (item.type === 'cake') {
              score += 10;
              g.score.textContent = score;
              arena.classList.remove('flash-good');
              void arena.offsetWidth;
              arena.classList.add('flash-good');
              showToast('🎂 +10!');
            } else {
              score = Math.max(0, score - 5);
              g.score.textContent = score;
              arena.classList.remove('flash-bad');
              void arena.offsetWidth;
              arena.classList.add('flash-bad');
              showToast('💣 -5!');
            }
            item.el.remove();
            items = items.filter(it => it !== item);
          }
        }
      }
    }

    function startGame() {
      // Reset
      score = 0;
      timeLeft = 30;
      gameRunning = true;
      g.score.textContent = '0';
      g.timer.textContent = '30';
      g.intro.hidden = true;
      g.result.hidden = true;
      g.hud.hidden = false;
      arena.hidden = false;
      items = [];
      basketX = 50;
      updateBasket();

      // Clear any existing items
      arena.querySelectorAll('.falling-item').forEach(el => el.remove());

      // Focus arena for keyboard
      arena.focus();

      timerInterval = setInterval(() => {
        timeLeft--;
        g.timer.textContent = timeLeft;
        if (timeLeft <= 0) {
          endGame();
        }
      }, 1000);

      dropInterval = setInterval(spawnItem, rand(400, 900));
      // Spawn a few immediately
      for (let i = 0; i < 3; i++) {
        setTimeout(spawnItem, i * 300);
      }

      // Collision check loop
      function collLoop() {
        if (!gameRunning) return;
        checkCollisions();
        requestAnimationFrame(collLoop);
      }
      collLoop();
    }

    function endGame() {
      gameRunning = false;
      clearInterval(timerInterval);
      clearInterval(dropInterval);
      g.hud.hidden = true;
      arena.hidden = true;
      g.result.hidden = false;
      g.finalScore.textContent = score;

      // Clean up items
      arena.querySelectorAll('.falling-item').forEach(el => el.remove());
      items = [];

      // Open reward video
      setTimeout(() => {
        window.openVideo('reward1.mp4', '🎂 Cake Catcher!').then(() => {
          // Check all games
          checkAllGamesCompleted();
        });
      }, 600);
    }

    // Start button
    g.startBtn.addEventListener('click', startGame);

    // Mouse / touch movement
    arena.addEventListener('mousemove', (e) => {
      if (!gameRunning) return;
      const rect = arena.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 100;
      basketX = clamp(x, 5, 95);
      updateBasket();
    });

    arena.addEventListener('touchmove', (e) => {
      if (!gameRunning) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = arena.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width * 100;
      basketX = clamp(x, 5, 95);
      updateBasket();
    }, { passive: false });

    // Keyboard
    arena.addEventListener('keydown', (e) => {
      if (!gameRunning) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        basketX = clamp(basketX - 4, 5, 95);
        updateBasket();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        basketX = clamp(basketX + 4, 5, 95);
        updateBasket();
      }
    });

    // Also allow keyboard when arena is not focused but game is active
    document.addEventListener('keydown', (e) => {
      if (!gameRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const active = document.activeElement;
        if (active && active.closest && active.closest('.catchcake-arena')) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          basketX = clamp(basketX - 4, 5, 95);
          updateBasket();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          basketX = clamp(basketX + 4, 5, 95);
          updateBasket();
        }
      }
    });

    // Update basket position on resize
    window.addEventListener('resize', updateBasket);
  }

  // ============================================================
  // GAME 2: FRIENDSHIP QUIZ
  // ============================================================
  function initQuiz() {
    const g = dom.games.quiz;
    const questions = [
      {
        q: 'In which class did we actually start talking?',
        options: ['10th', '11th', '12th', 'College'],
        correct: 1,
      },
      {
        q: 'Where did we first meet?',
        options: ['School', 'Instagram', 'Tuition', 'College'],
        correct: 0,
      },
      {
        q: 'Who usually starts the conversation?',
        options: ['Me', 'You', 'Both', 'Nobody'],
        correct: 2,
      },
      {
        q: 'What\'s the nickname I call you the most?',
        options: ['Lendi', 'Mirchi', 'Ghongha Hippo', 'Potato'],
        correct: 2,
      },
      {
        q: 'Who sends more reels?',
        options: ['Me', 'You', 'Both', 'Neither'],
        correct: 0,
      },
      {
        q: 'Who laughs first during a serious moment?',
        options: ['Me', 'You', 'Both', 'Nobody'],
        correct: 2,
      },
      {
        q: 'Who\'s more dramatic?',
        options: ['Me', 'You', 'Both', 'Nobody'],
        correct: 2,
      },
    ];

    const wrongMessages = ['Seriously 😂', 'Think Again', 'Retry', 'You should know this', "I'm disappointed 😂"];
    let currentIndex = 0;
    let score = 0;
    let answered = false;
    let quizActive = false;

    function renderQuestion() {
      if (currentIndex >= questions.length) {
        showResult();
        return;
      }
      const q = questions[currentIndex];
      g.current.textContent = currentIndex + 1;
      g.total.textContent = questions.length;
      g.score.textContent = score;

      g.container.innerHTML = `
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <button class="quiz-option" data-index="${idx}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      `;

      answered = false;
      const options = g.container.querySelectorAll('.quiz-option');
      const feedback = g.container.querySelector('#quiz-feedback');

      for (const btn of options) {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const idx = parseInt(btn.dataset.index, 10);
          const correct = idx === q.correct;

          for (const b of options) {
            b.disabled = true;
            if (parseInt(b.dataset.index, 10) === q.correct) {
              b.classList.add('correct');
            }
          }

          if (correct) {
            score++;
            g.score.textContent = score;
            feedback.textContent = '✅ Correct! 🎉';
            feedback.style.color = '#4cec8c';
            showToast('✅ Correct!');
          } else {
            btn.classList.add('wrong');
            const msg = pick(wrongMessages);
            feedback.textContent = '❌ ' + msg;
            feedback.style.color = '#ff5050';
            showToast('❌ ' + msg);
          }

          setTimeout(() => {
            currentIndex++;
            renderQuestion();
          }, 1200);
        });
      }
    }

    function showResult() {
      g.hud.hidden = true;
      g.container.hidden = true;
      g.result.hidden = false;
      g.finalScore.textContent = score;
      state.quiz.score = score;
      state.quiz.completed = true;

      if (score === 7) {
        showToast('🏆 Perfect score! You\'re a true friend!');
        fx.confetti(80);
      } else if (score >= 5) {
        showToast('👏 Great job! You know each other well!');
      } else {
        showToast('😂 Oops! Time to make more memories!');
      }

      checkAllGamesCompleted();
    }

    function startQuiz() {
      currentIndex = 0;
      score = 0;
      quizActive = true;
      g.intro.hidden = true;
      g.result.hidden = true;
      g.hud.hidden = false;
      g.container.hidden = false;
      g.bonusContainer.hidden = true;
      g.score.textContent = '0';
      renderQuestion();
    }

    g.startBtn.addEventListener('click', startQuiz);

    // Bonus question
    g.secretBtn.addEventListener('click', () => {
      g.result.hidden = true;
      g.bonusContainer.hidden = false;
      g.bonusContainer.innerHTML = `
        <div class="quiz-question">Who is the world's best best friend?</div>
        <div class="quiz-options">
          ${['Tarun', 'Tarun', 'Tarun', 'Tarun'].map((opt, idx) => `
            <button class="quiz-option bonus-option" data-index="${idx}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="bonus-feedback"></div>
      `;

      const options = g.bonusContainer.querySelectorAll('.bonus-option');
      const feedback = g.bonusContainer.querySelector('#bonus-feedback');

      for (const btn of options) {
        btn.addEventListener('click', () => {
          for (const b of options) {
            b.disabled = true;
            b.classList.add('correct');
          }
          feedback.textContent = '✅ Correct 😂 You really know!';
          feedback.style.color = '#4cec8c';
          showToast('😂 Of course it\'s Tarun!');
          fx.confetti(50);

          setTimeout(() => {
            window.openVideo('reward2.mp4', '🎉 Best Friend Bonus!').then(() => {
              checkAllGamesCompleted();
            });
          }, 600);
        });
      }
    });
  }

  // ============================================================
  // GAME 3: FIND THE GIFT
  // ============================================================
  function initGiftGame() {
    const g = dom.games.gift;
    const wrongVideos = [
      'wrong1.mp4', 'wrong2.mp4', 'wrong3.mp4', 'wrong4.mp4',
      'wrong5.mp4', 'wrong6.mp4', 'wrong7.mp4', 'wrong8.mp4',
    ];
    let correctIndex = -1;
    let opened = [];
    let revealed = false;
    let decrypting = false;

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = rand(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function startGame() {
      g.intro.hidden = true;
      g.grid.hidden = false;
      g.decryptOverlay.hidden = true;
      opened = [];
      revealed = false;
      decrypting = false;
      correctIndex = rand(0, 8);

      // Shuffle wrong videos and assign
      const shuffledWrongs = shuffleArray([...wrongVideos]);

      g.grid.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const box = document.createElement('div');
        box.className = 'gift-box';
        box.dataset.index = i;
        box.textContent = '🎁';
        box.dataset.correct = i === correctIndex ? 'true' : 'false';

        // Assign wrong video if not correct
        if (i !== correctIndex) {
          const vidIdx = opened.filter(idx => idx !== correctIndex).length;
          box.dataset.wrongVideo = shuffledWrongs[opened.filter(idx => idx !== correctIndex).length % shuffledWrongs.length];
        }

        box.addEventListener('click', () => handleGiftClick(i, box));
        g.grid.appendChild(box);
      }
    }

    async function handleGiftClick(index, box) {
      if (opened.includes(index)) return;
      if (revealed || decrypting) return;
      opened.push(index);

      const isCorrect = index === correctIndex;

      if (isCorrect) {
        revealed = true;
        box.textContent = '🎁';
        box.classList.add('correct-glow');
        showToast('🎉 You found the real gift!');
        fx.confetti(100);

        // Decrypt animation
        g.decryptOverlay.hidden = false;
        decrypting = true;
        const fill = g.decryptFill;
        const percent = g.decryptPercent;
        const steps = [10, 35, 67, 100];
        for (const step of steps) {
          fill.style.width = step + '%';
          percent.textContent = step + '%';
          await sleep(rand(400, 800));
        }

        decrypting = false;
        showToast('🎁 Gift unlocked!');

        setTimeout(() => {
          window.openVideo('reward3.mp4', '🎁 The Real Gift!').then(() => {
            checkAllGamesCompleted();
          });
        }, 400);

      } else {
        // Wrong gift
        box.textContent = '❌';
        box.classList.add('opened');
        const video = box.dataset.wrongVideo || pick(wrongVideos);
        showToast('😂 Nice try!');
        // Play wrong video
        await window.openVideo(video, '🎁 Wrong Gift!');
        // Check if all wrong gifts are opened
        const wrongOpened = opened.filter(idx => idx !== correctIndex).length;
        if (wrongOpened >= 8) {
          showToast('😂 You opened all the wrong ones! The real one is still waiting...');
        }
      }
    }

    g.startBtn.addEventListener('click', startGame);
  }

  // ============================================================
  // CHECK ALL GAMES COMPLETED
  // ============================================================
  function checkAllGamesCompleted() {
    // Check if all 3 games are completed
    // Game 1: catchcake result shown (check if result is visible)
    const game1Done = !dom.games.catchcake.result.hidden;
    // Game 2: quiz completed
    const game2Done = state.quiz.completed;
    // Game 3: gift revealed
    const game3Done = dom.games.gift.decryptOverlay && !dom.games.gift.decryptOverlay.hidden;

    // We'll track completion differently - check if videos have been played
    // Using a simple flag system
    if (!window._gameCompletion) {
      window._gameCompletion = { g1: false, g2: false, g3: false };
    }

    // Update from state
    if (game1Done) window._gameCompletion.g1 = true;
    if (game2Done) window._gameCompletion.g2 = true;
    if (game3Done) window._gameCompletion.g3 = true;

    // If all three are done, show a special message
    if (window._gameCompletion.g1 && window._gameCompletion.g2 && window._gameCompletion.g3) {
      if (!window._allGamesToastShown) {
        window._allGamesToastShown = true;
        setTimeout(() => {
          showToast('🏆 All games completed! You\'re the ultimate friend!');
          fx.fireworksBurst(8);
        }, 500);
      }
    }
  }

  // Override the check to use video modal close callbacks
  const origOpenVideo = window.openVideo;
  window.openVideo = function(filename, titleText) {
    return new Promise((resolve) => {
      // Track which game this video belongs to
      let gameId = null;
      if (filename.includes('reward1')) gameId = 'g1';
      else if (filename.includes('reward2')) gameId = 'g2';
      else if (filename.includes('reward3')) gameId = 'g3';

      if (!window._gameCompletion) {
        window._gameCompletion = { g1: false, g2: false, g3: false };
      }

      const modal = dom.videoModal.modal;
      const video = dom.videoModal.video;
      const missing = dom.videoModal.missing;
      const missingName = dom.videoModal.missingName;
      const playPause = dom.videoModal.playPause;
      const title = dom.videoModal.title;
      const continueBtn = dom.videoModal.continue;

      // Set up one-time continue handler
      const continueHandler = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        video.pause();
        video.src = '';
        video.load();
        missing.hidden = true;
        state.videoOpen = false;

        if (gameId) {
          window._gameCompletion[gameId] = true;
          checkAllGamesCompleted();
        }

        resolve();
        continueBtn.removeEventListener('click', continueHandler);
        backdropHandler && backdrop.removeEventListener('click', backdropHandler);
      };

      const backdropHandler = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        video.pause();
        video.src = '';
        video.load();
        missing.hidden = true;
        state.videoOpen = false;
        if (gameId) {
          window._gameCompletion[gameId] = true;
          checkAllGamesCompleted();
        }
        resolve();
        continueBtn.removeEventListener('click', continueHandler);
        backdrop.removeEventListener('click', backdropHandler);
      };

      const closeHandler = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        video.pause();
        video.src = '';
        video.load();
        missing.hidden = true;
        state.videoOpen = false;
        if (gameId) {
          window._gameCompletion[gameId] = true;
          checkAllGamesCompleted();
        }
        resolve();
        continueBtn.removeEventListener('click', continueHandler);
        backdrop.removeEventListener('click', backdropHandler);
        skipBtn.removeEventListener('click', closeHandler);
      };

      const skipBtn = dom.videoModal.skip;
      skipBtn.addEventListener('click', closeHandler);

      continueBtn.addEventListener('click', continueHandler);
      const backdrop = dom.videoModal.backdrop;
      backdrop.addEventListener('click', backdropHandler);

      title.textContent = titleText || '🎉 Reward Unlocked';
      video.style.display = 'block';
      missing.hidden = true;
      video.pause();
      video.src = filename;
      video.load();
      video.play().catch(() => {});
      playPause.textContent = '⏸️';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      state.videoOpen = true;
    });
  };

  // ============================================================
  // LETTER TYPING EFFECT
  // ============================================================
  function initLetter() {
    const text = dom.letter.text;
    const cursor = dom.letter.cursor;
    const fullText = `Dear Siya,

  Happy Birthday!

  I just wanted to make something a little different for you instead of simply sending a message.

  I hope this small website made you smile, laugh, and reminded you of some fun memories we've shared.

  Thank you for being such a good friend.

  Keep smiling, keep laughing, and keep being the amazing Ghongha Hippo that you are. 😂

  May this year bring you happiness, success, and countless unforgettable memories.

  Happy Birthday once again.

  — Tarun`;

    let index = 0;
    let typing = false;

    function typeNext() {
      if (index >= fullText.length) {
        cursor.classList.add('done');
        return;
      }
      typing = true;
      const char = fullText[index];
      if (char === '\n') {
        text.innerHTML += '<br>';
      } else if (char === ' ') {
        text.innerHTML += ' ';
      } else {
        text.innerHTML += char;
      }
      index++;
      const delay = char === '\n' ? 120 : char === ' ' ? 60 : rand(20, 45);
      setTimeout(typeNext, delay);
    }

    // Start typing when section comes into view
    const letterSection = $('#final-letter');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !typing && index === 0) {
          setTimeout(typeNext, 400);
        }
      }
    }, { threshold: 0.3 });

    if (letterSection) observer.observe(letterSection);
  }

  // ============================================================
  // ENDING
  // ============================================================
  function initEnding() {
    const text = dom.ending.text;
    const credits = dom.ending.credits;
    let triggered = false;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          // Show text
          setTimeout(() => {
            text.classList.add('show');
            // Fireworks
            fx.fireworksBurst(10);
            fx.confetti(150);
            // After text animation, show credits
            setTimeout(() => {
              credits.classList.add('show');
              // More fireworks
              setTimeout(() => {
                fx.fireworksBurst(6);
                fx.confetti(100);
              }, 500);
            }, 2200);
          }, 400);
        }
      }
    }, { threshold: 0.2 });

    const endingSection = $('#final-ending');
    if (endingSection) observer.observe(endingSection);
  }

  // ============================================================
  // EASTER EGGS
  // ============================================================
  function initEasterEggs() {
    // ---- Hidden Hippo ----
    dom.hippo.addEventListener('click', () => {
      showToast('🦛 Achievement Unlocked: Ghongha Hippo Found!');
      fx.confetti(80, ['#9b5de5', '#ff5e9c', '#4cd9ec', '#ffd166']);
    });

    // ---- Easter Cake (5 clicks) ----
    let cakeCount = 0;
    dom.easterCake.addEventListener('click', () => {
      cakeCount++;
      if (cakeCount >= 5) {
        showToast('🎂 Cake overload! Here\'s some confetti!');
        fx.fireworksBurst(12);
        fx.confetti(200);
        cakeCount = 0;
      } else {
        showToast(`🎂 ${5 - cakeCount} more clicks for a surprise...`);
      }
    });

    // ---- Clickable stars are handled globally ----
  }

  // ============================================================
  // KEYBOARD SECRET
  // ============================================================
  function initKeyboardSecret() {
    let typed = '';
    const secret = 'SIYA';
    const overlay = dom.secret;

    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        typed += key;
        if (typed.length > secret.length) {
          typed = typed.slice(-secret.length);
        }
        if (typed === secret) {
          typed = '';
          // Trigger celebration
          overlay.classList.add('show');
          showToast('🎊 Secret Code Unlocked: SIYA!');
          fx.fireworksBurst(15);
          fx.confetti(200);

          setTimeout(() => {
            overlay.classList.remove('show');
          }, 4000);
        }
      }
    });

    // Close overlay on click
    overlay.addEventListener('click', () => {
      overlay.classList.remove('show');
    });
  }

  // ============================================================
  // ADDITIONAL: Handle missing video fallback in modal
  // ============================================================
  // The video modal already handles missing files via the error event

  // ============================================================
  // INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    fx.init();
    initLoading();
  });

  // ============================================================
  // HANDLE WINDOW RESIZE FOR GAME 1
  // ============================================================
  // Already handled in game 1

  // ============================================================
  // ENSURE TOAST CONTAINER EXISTS
  // ============================================================
  // Already in HTML

  console.log('🎉 Happy Birthday Siya! 🎉');

})();