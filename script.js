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
  // 9B. TESTIMONIALS SLIDER & FILTERING (Neo-Tactile Engine)
  // -------------------------------------------------------------
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('t-prev-btn');
  const nextBtn = document.getElementById('t-next-btn');
  const dotsContainer = document.getElementById('testimonials-dots');
  const currentNumEl = document.getElementById('slider-current-num');
  const totalNumEl = document.getElementById('slider-total-num');
  const tFilterBtns = document.querySelectorAll('.t-filter-btn');
  const allCards = Array.from(document.querySelectorAll('.testimonials-slider-track .testimonial-card'));

  if (track && allCards.length) {
    let visibleCards = [...allCards];
    let currentIndex = 0;
    let autoSlideInterval = null;

    const formatNum = (n) => (n < 10 ? '0' + n : '' + n);

    const updateDotsUI = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      visibleCards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `t-dot ${idx === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          playTactileClick(520);
          scrollToIndex(idx);
        });
        dotsContainer.appendChild(dot);
      });
      if (totalNumEl) totalNumEl.textContent = formatNum(visibleCards.length);
      if (currentNumEl) currentNumEl.textContent = formatNum(currentIndex + 1);
    };

    const scrollToIndex = (idx) => {
      if (!visibleCards.length) return;
      currentIndex = Math.max(0, Math.min(idx, visibleCards.length - 1));
      const targetCard = visibleCards[currentIndex];
      if (targetCard) {
        track.scrollTo({
          left: targetCard.offsetLeft - track.offsetLeft,
          behavior: 'smooth'
        });
      }
      if (currentNumEl) currentNumEl.textContent = formatNum(currentIndex + 1);
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.t-dot') : [];
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };

    // Next & Prev click handlers
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        playTactileClick(620);
        let nextIdx = currentIndex + 1;
        if (nextIdx >= visibleCards.length) nextIdx = 0;
        scrollToIndex(nextIdx);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        playTactileClick(480);
        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) prevIdx = visibleCards.length - 1;
        scrollToIndex(prevIdx);
      });
    }

    // Scroll listener to update active index when user swipes or drags
    let scrollTimeout = null;
    track.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = track.scrollLeft;
        let closestIdx = 0;
        let minDiff = Infinity;
        visibleCards.forEach((card, idx) => {
          const diff = Math.abs((card.offsetLeft - track.offsetLeft) - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });
        currentIndex = closestIdx;
        if (currentNumEl) currentNumEl.textContent = formatNum(currentIndex + 1);
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.t-dot') : [];
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }, 60);
    });

    // Autoplay Timer (Every 5.5s, pauses on hover)
    const startAutoSlide = () => {
      stopAutoSlide();
      autoSlideInterval = setInterval(() => {
        let nextIdx = currentIndex + 1;
        if (nextIdx >= visibleCards.length) nextIdx = 0;
        scrollToIndex(nextIdx);
      }, 5500);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    };

    track.addEventListener('mouseenter', stopAutoSlide);
    track.addEventListener('mouseleave', startAutoSlide);
    track.addEventListener('touchstart', stopAutoSlide, { passive: true });

    // Category Filter Buttons
    if (tFilterBtns.length) {
      tFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          playTactileClick(560);
          tFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.getAttribute('data-t-filter');
          allCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });

          visibleCards = allCards.filter(card => card.style.display !== 'none');
          currentIndex = 0;
          updateDotsUI();
          scrollToIndex(0);
        });
      });
    }

    // Initialize UI
    updateDotsUI();
    startAutoSlide();
  }

  // -------------------------------------------------------------
  // 9C. AI NEURAL CANVAS & COMPUTER VISION HUD ANIMATION
  // Applicable across Whole Website (All .ai-neural-canvas instances)
  // -------------------------------------------------------------
  const aiCanvases = document.querySelectorAll('.ai-neural-canvas');
  if (aiCanvases.length > 0) {
    aiCanvases.forEach((aiCanvas) => {
      const ctx = aiCanvas.getContext('2d');
      let width = 0;
      let height = 0;
      let animationFrameId = null;
      let isVisible = false;

      const nodeCount = 58;
      const nodes = [];
      const impulses = []; // Synaptic action potentials (firing electrical pulses)
      const colors = [
        'rgba(124, 58, 237, ', // purple
        'rgba(6, 182, 212, ',  // cyan
        'rgba(37, 99, 235, ',  // blue
        'rgba(16, 185, 129, '  // emerald
      ];

      const mouse = { x: null, y: null, maxDist: 175 };
      let scanlineY = 0;

      const resizeCanvas = () => {
        const parent = aiCanvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        aiCanvas.width = width * dpr;
        aiCanvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      };

      const initNodes = () => {
        nodes.length = 0;
        impulses.length = 0;
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * (width || 1200),
            y: Math.random() * (height || 600),
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            radius: Math.random() * 2.4 + 1.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            bloom: 0 // extra glow when hit by impulse
          });
        }
      };

      const spawnImpulse = () => {
        if (nodes.length < 2 || impulses.length > 18) return;
        // Find a connected pair
        const fromIdx = Math.floor(Math.random() * nodes.length);
        const fromNode = nodes[fromIdx];
        const maxDist = 145;

        for (let j = 0; j < nodes.length; j++) {
          if (j === fromIdx) continue;
          const toNode = nodes[j];
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist && dist > 30) {
            impulses.push({
              from: fromNode,
              to: toNode,
              progress: 0,
              speed: 0.022 + Math.random() * 0.024,
              color: Math.random() > 0.4 ? 'rgba(6, 182, 212, ' : 'rgba(124, 58, 237, '
            });
            break;
          }
        }
      };

      const drawFrame = () => {
        if (!isVisible) return;
        ctx.clearRect(0, 0, width, height);

        // Update virtual scanline
        scanlineY += 1.4;
        if (scanlineY > height + 60) scanlineY = -30;

        // Draw connections between nodes
        const maxConnectDist = 135;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxConnectDist) {
              const alpha = (1 - dist / maxConnectDist) * 0.24;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
              ctx.lineWidth = 0.9;
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }

          // Connections to mouse cursor (Active Neural Probe)
          if (mouse.x !== null && mouse.y !== null) {
            const mdx = nodes[i].x - mouse.x;
            const mdy = nodes[i].y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < mouse.maxDist) {
              const mAlpha = (1 - mdist / mouse.maxDist) * 0.55;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(6, 182, 212, ${mAlpha})`;
              ctx.lineWidth = 1.3;
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }

        // Spawn periodic synaptic electrical impulses
        if (Math.random() < 0.28) {
          spawnImpulse();
        }

        // Draw and advance traveling impulses (Action Potentials)
        for (let k = impulses.length - 1; k >= 0; k--) {
          const imp = impulses[k];
          imp.progress += imp.speed;

          if (imp.progress >= 1) {
            imp.to.bloom = 1.0;
            impulses.splice(k, 1);
            continue;
          }

          const curX = imp.from.x + (imp.to.x - imp.from.x) * imp.progress;
          const curY = imp.from.y + (imp.to.y - imp.from.y) * imp.progress;

          // Electric core
          ctx.beginPath();
          ctx.arc(curX, curY, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = imp.color + '0.98)';
          ctx.fill();

          // Outer plasma halo
          ctx.beginPath();
          ctx.arc(curX, curY, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = imp.color + '0.28)';
          ctx.fill();
        }

        // Draw nodes and update physics
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.pulse += node.pulseSpeed;

          // Check scanline intersection (LIDAR highlight)
          const nearScan = Math.abs(node.y - scanlineY) < 18;
          if (nearScan) {
            node.bloom = Math.max(node.bloom, 0.7);
          }

          const currentRadius = node.radius + Math.sin(node.pulse) * 0.6 + node.bloom * 1.8;

          // Outer synaptic glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = node.color + (0.06 + node.bloom * 0.25) + ')';
          ctx.fill();

          // Core node
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.color + (0.85 + node.bloom * 0.15) + ')';
          ctx.fill();

          // Decay bloom
          if (node.bloom > 0.02) {
            node.bloom *= 0.91;
          } else {
            node.bloom = 0;
          }

          // Gentle movement
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        // Draw Computer Vision HUD Targeting Reticle around cursor
        if (mouse.x !== null && mouse.y !== null) {
          ctx.save();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
          ctx.lineWidth = 1.2;

          // Outer reticle circle
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
          ctx.stroke();

          // Inner dot
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(124, 58, 237, 0.9)';
          ctx.fill();

          // Crosshairs
          ctx.beginPath();
          ctx.moveTo(mouse.x - 30, mouse.y); ctx.lineTo(mouse.x - 14, mouse.y);
          ctx.moveTo(mouse.x + 14, mouse.y); ctx.lineTo(mouse.x + 30, mouse.y);
          ctx.moveTo(mouse.x, mouse.y - 30); ctx.lineTo(mouse.x, mouse.y - 14);
          ctx.moveTo(mouse.x, mouse.y + 14); ctx.lineTo(mouse.x, mouse.y + 30);
          ctx.stroke();

          // Live CV telemetry coordinate text
          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.fillText(`CV:TARGET [${Math.round(mouse.x)}, ${Math.round(mouse.y)}]`, mouse.x + 18, mouse.y - 14);
          ctx.fillStyle = 'rgba(5, 150, 105, 0.85)';
          ctx.fillText(`TRACKING: 99.4%`, mouse.x + 18, mouse.y - 4);
          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(drawFrame);
      };

      const parentSection = aiCanvas.parentElement;
      if (parentSection) {
        parentSection.addEventListener('mousemove', (e) => {
          const rect = parentSection.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        });

        parentSection.addEventListener('mouseleave', () => {
          mouse.x = null;
          mouse.y = null;
        });
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible = true;
            if (!animationFrameId) drawFrame();
          } else {
            isVisible = false;
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      }, { threshold: 0.05 });

      observer.observe(parentSection || aiCanvas);

      window.addEventListener('resize', () => {
        resizeCanvas();
        initNodes();
      });

      resizeCanvas();
      initNodes();
    });

    // Dynamic Live Inference Latency Counter Simulator (13.8ms ~ 15.2ms)
    setInterval(() => {
      const latencyEls = document.querySelectorAll('.ai-live-latency');
      const val = (13.6 + Math.random() * 1.6).toFixed(1) + 'ms';
      latencyEls.forEach(el => {
        el.textContent = val;
      });
    }, 2200);
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
