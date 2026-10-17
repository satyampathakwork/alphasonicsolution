/**
 * ALPHASONIC SOLUTION - NEO-TACTILE WHITE THEME ENGINE
 * Tactile Mechanical Audio, Blueprint Configurator, ROI Simulator,
 * Plain/Tech View Toggler, Confetti Bursts, and Accordions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. TACTILE AUDIO SYNTHESIZER (Mechanical Switch Feedback)
  // -------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = false;

  const initAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  // Snappy mechanical click sound
  const playTactileClick = (freq = 480) => {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  };

  // Harmonious victory chime on goal action
  const playVictoryChime = () => {
    if (!soundEnabled || !audioCtx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + (idx * 0.07));

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + (idx * 0.07));
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (idx * 0.07) + 0.28);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + (idx * 0.07));
        osc.stop(audioCtx.currentTime + (idx * 0.07) + 0.28);
      });
    } catch (e) {
      console.warn('Victory audio notice:', e);
    }
  };

  // Sound Toggle Buttons (Desktop & Mobile Drawer in Sync)
  const soundToggleBtns = document.querySelectorAll('.sound-toggle-btn');
  const updateSoundUI = () => {
    soundToggleBtns.forEach(btn => {
      if (soundEnabled) {
        btn.classList.add('sound-on');
        btn.innerHTML = `
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <span>Sound: ON</span>
        `;
      } else {
        btn.classList.remove('sound-on');
        btn.innerHTML = `
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span>Sound: OFF</span>
        `;
      }
    });
  };

  soundToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      updateSoundUI();
      if (soundEnabled) {
        playVictoryChime();
        showToast('🔊 Mechanical Sound Feedback Active! Tap around!');
      }
    });
  });

  // Bind clicks across interactive elements
  document.querySelectorAll('button, .btn, .config-option-btn, .biz-chip, .faq-question-btn, .nav-link').forEach(el => {
    el.addEventListener('click', () => {
      playTactileClick();
    });
  });

  // -------------------------------------------------------------
  // 2. CONFETTI BURST (Pure Canvas)
  // -------------------------------------------------------------
  const canvas = document.getElementById('confetti-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animId = null;

  const resizeCanvas = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const launchConfetti = (originX, originY) => {
    if (!canvas || !ctx) return;
    const colors = ['#2563eb', '#ea580c', '#10b981', '#f59e0b', '#7c3aed', '#0f172a'];
    const count = 70;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3.5;
      particles.push({
        x: originX || window.innerWidth / 2,
        y: originY || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.22,
        decay: Math.random() * 0.016 + 0.012
      });
    }

    if (!animId) {
      updateConfetti();
    }
  };

  const updateConfetti = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(updateConfetti);
    } else {
      animId = null;
    }
  };

  document.querySelectorAll('.trigger-confetti').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      playVictoryChime();
    });
  });

  // -------------------------------------------------------------
  // 3. TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  const showToast = (msg) => {
    let toast = document.querySelector('.toast-message');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-message';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // -------------------------------------------------------------
  // 4. NAVBAR SCROLL & MOBILE MENU
  // -------------------------------------------------------------
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
      });
    });
  }

  // -------------------------------------------------------------
  // 5. INTERACTIVE BLUEPRINT CONFIGURATOR (DOPAMINE MECHANICAL FEEL)
  // -------------------------------------------------------------
  const configButtons = document.querySelectorAll('.config-option-btn');
  const configDays = document.getElementById('config-stat-days');
  const configLeads = document.getElementById('config-stat-leads');
  const configCount = document.getElementById('config-selected-count');
  const configApplyBtn = document.getElementById('config-apply-btn');
  const notesField = document.getElementById('notes');

  const updateConfigSummary = () => {
    let totalDays = 4; // base onboarding & design sprint
    let totalBoost = 20; // baseline
    let count = 0;
    let selectedNames = [];

    configButtons.forEach(btn => {
      if (btn.classList.contains('selected')) {
        count++;
        const days = parseInt(btn.dataset.days, 10) || 3;
        const boost = parseInt(btn.dataset.boost, 10) || 20;
        totalDays += days;
        totalBoost += boost;
        selectedNames.push(btn.querySelector('.config-option-title').textContent.trim());
      }
    });

    if (configCount) configCount.textContent = `${count} Selected`;
    if (configDays) configDays.textContent = `${Math.min(21, totalDays)} Days`;
    if (configLeads) configLeads.textContent = `+${totalBoost}%`;

    return selectedNames;
  };

  configButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const isSelected = btn.classList.contains('selected');
      const icon = btn.querySelector('.config-checkbox-icon');
      if (icon) {
        icon.innerHTML = isSelected 
          ? `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
          : '';
      }
      updateConfigSummary();
    });
  });

  if (configApplyBtn) {
    configApplyBtn.addEventListener('click', () => {
      const selected = updateConfigSummary();
      if (notesField && selected.length > 0) {
        notesField.value = `I configured a custom blueprint with: ${selected.join(', ')}. Please provide an estimated launch schedule and roadmap for our business.`;
      }
      launchConfetti();
      playVictoryChime();
      showToast('🚀 Custom Blueprint Attached! Scroll down to confirm your details.');
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initialize summary
  updateConfigSummary();

  // -------------------------------------------------------------
  // 6. SERVICE VIEW SWITCHER: SIMPLE ENGLISH VS TECH SPECS
  // -------------------------------------------------------------
  const plainBtn = document.getElementById('mode-plain-btn');
  const techBtn = document.getElementById('mode-tech-btn');
  const techBoxes = document.querySelectorAll('.tech-spec-box');

  if (plainBtn && techBtn) {
    plainBtn.addEventListener('click', () => {
      plainBtn.classList.add('active');
      techBtn.classList.remove('active');
      techBoxes.forEach(b => b.classList.remove('show'));
      showToast('📖 Simple English View (Zero jargon)');
    });

    techBtn.addEventListener('click', () => {
      techBtn.classList.add('active');
      plainBtn.classList.remove('active');
      techBoxes.forEach(b => b.classList.add('show'));
      showToast('⚙️ Under The Hood: Technical Stack & Architecture');
    });
  }

  // -------------------------------------------------------------
  // 7. INTERACTIVE ROI & GROWTH CALCULATOR
  // -------------------------------------------------------------
  const sliderLeads = document.getElementById('calc-leads-slider');
  const valLeads = document.getElementById('calc-leads-val');
  const sliderTicket = document.getElementById('calc-ticket-slider');
  const valTicket = document.getElementById('calc-ticket-val');
  const bizChips = document.querySelectorAll('.biz-chip');
  
  const calcStatRev = document.getElementById('calc-stat-revenue');
  const calcStatHours = document.getElementById('calc-stat-hours');
  const calcStatPayback = document.getElementById('calc-stat-payback');

  let activeMultiplier = 1.35;

  bizChips.forEach(chip => {
    chip.addEventListener('click', () => {
      bizChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeMultiplier = parseFloat(chip.dataset.mult) || 1.35;
      recalculateROI();
    });
  });

  const recalculateROI = () => {
    if (!sliderLeads || !sliderTicket || !calcStatRev) return;

    const leads = parseInt(sliderLeads.value, 10);
    const avgTicket = parseInt(sliderTicket.value, 10);

    valLeads.textContent = `${leads} / month`;
    valTicket.textContent = `$${avgTicket}`;

    const extraClients = Math.round(leads * 0.22 * activeMultiplier);
    const extraRev = extraClients * avgTicket;
    const hoursSaved = Math.min(28, Math.round(7 + (leads * 0.08)));

    calcStatRev.textContent = `+$${extraRev.toLocaleString()}`;
    if (calcStatHours) calcStatHours.textContent = `${hoursSaved} hrs/week`;
    if (calcStatPayback) calcStatPayback.textContent = `< ${Math.max(15, Math.round(42 - (extraClients * 2)))} Days`;
  };

  if (sliderLeads && sliderTicket) {
    sliderLeads.addEventListener('input', recalculateROI);
    sliderTicket.addEventListener('input', recalculateROI);
    recalculateROI();
  }

  // -------------------------------------------------------------
  // 8. COUNTER ANIMATION FOR METRICS
  // -------------------------------------------------------------
  const counters = document.querySelectorAll('[data-counter-target]');
  const animateNumber = (el) => {
    const target = parseFloat(el.getAttribute('data-counter-target'));
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1600;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = isDecimal ? (target * ease).toFixed(1) : Math.round(target * ease);

      el.textContent = `${prefix}${val}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = `${prefix}${target}${suffix}`;
    };
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  counters.forEach(c => observer.observe(c));

  // -------------------------------------------------------------
  // 9. FAQ ACCORDION
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const ans = item.querySelector('.faq-answer');

    if (btn && ans) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      });
    }
  });

  if (faqItems[0]) {
    const firstAns = faqItems[0].querySelector('.faq-answer');
    faqItems[0].classList.add('active');
    if (firstAns) firstAns.style.maxHeight = firstAns.scrollHeight + 'px';
  }

  // -------------------------------------------------------------
  // 10. FORM SUBMISSION VIA PHP SCRIPT
  // -------------------------------------------------------------
  const form = document.getElementById('advisory-intake');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = `<span>Sending Your Details...</span>`;

      const formData = new FormData(form);

      fetch('send-mail.php', {
        method: 'POST',
        body: formData
      })
      .then(async (res) => {
        let data;
        try {
          data = await res.json();
        } catch (err) {
          data = { success: res.ok, message: 'Server response status ' + res.status };
        }
        if (!res.ok && !data.success) {
          throw new Error(data.message || 'Server error ' + res.status);
        }
        return data;
      })
      .then((data) => {
        if (data && data.success) {
          form.reset();
          launchConfetti();
          playVictoryChime();
          showToast('🎉 Blueprint Request Received! Details sent to our team. We will reply within 24 hours.');
        } else {
          showToast('⚠️ ' + ((data && data.message) || 'Error sending request. Please WhatsApp us directly.'), 6000);
        }
      })
      .catch((err) => {
        console.error('Mail dispatch error:', err);
        showToast('⚠️ Could not send email: ' + err.message + '. Please contact via WhatsApp.', 6000);
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = orig;
      });
    });
  }
});
