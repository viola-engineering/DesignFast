/* ============================================================
   DESIGNFAST — app.js
   Shared vanilla JS: nav, scroll reveal, page interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── Scroll Reveal ─────────────────────────────────────── */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => io.observe(el));
  }

  /* ── Nav: Active Link Detection ────────────────────────── */
  function initNavActive() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop();
      if (linkPage === currentPath || (currentPath === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── Nav: Scrolled State ───────────────────────────────── */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Hamburger ──────────────────────────────────── */
  function initMobileNav() {
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ── Toast Notification ────────────────────────────────── */
  function showToast(message, duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
  window.showToast = showToast;

  /* ── Generator Page ────────────────────────────────────── */
  function initGeneratorPage() {
    const genPage = document.querySelector('.generator-layout');
    if (!genPage) return;

    /* Textarea char count */
    const textarea = document.querySelector('.gen-textarea');
    const charCount = document.querySelector('.gen-char-count');
    if (textarea && charCount) {
      const maxChars = 600;
      const update = () => {
        const remaining = maxChars - textarea.value.length;
        charCount.textContent = `${textarea.value.length} / ${maxChars}`;
        charCount.classList.toggle('char-warn', remaining < 50);
      };
      textarea.addEventListener('input', update);
      update();
    }

    /* Model toggle */
    const modelBtns = document.querySelectorAll('.model-btn');
    modelBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modelBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    /* Mode options */
    const modeOptions = document.querySelectorAll('.mode-option');
    modeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        modeOptions.forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    /* Version buttons */
    const versionBtns = document.querySelectorAll('.version-btn');
    versionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        versionBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updateVersionTabs(parseInt(btn.dataset.count, 10));
      });
    });

    /* Style cards (single select) */
    const styleCards = document.querySelectorAll('.gen-style-card');
    styleCards.forEach((card) => {
      card.addEventListener('click', () => {
        styleCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    /* AI pick button */
    const aiPickBtn = document.querySelector('.gen-ai-pick-btn');
    if (aiPickBtn) {
      aiPickBtn.addEventListener('click', () => {
        styleCards.forEach((c) => c.classList.remove('selected'));
        showToast('✦ AI will select the best style for your prompt');
      });
    }

    /* Generate button */
    const generateBtn = document.querySelector('.btn-generate');
    const outputEmpty = document.querySelector('.output-empty');
    const outputFrame = document.querySelector('.output-preview-frame');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.output-status span');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const promptVal = textarea ? textarea.value.trim() : '';
        if (!promptVal) {
          showToast('Please describe what you want to build first');
          textarea && textarea.focus();
          return;
        }
        runGeneration();
      });
    }

    function runGeneration() {
      if (!generateBtn) return;

      // Update button state
      generateBtn.classList.add('generating');
      generateBtn.innerHTML = '<div class="spinner"></div> Generating…';

      // Update status
      if (statusDot) { statusDot.className = 'status-dot generating'; }
      if (statusText) { statusText.textContent = 'Generating…'; }

      setTimeout(() => {
        generateBtn.classList.remove('generating');
        generateBtn.innerHTML = '<span class="btn-generate-icon">⚡</span> Regenerate';

        if (statusDot) { statusDot.className = 'status-dot ready'; }
        if (statusText) { statusText.textContent = 'Ready'; }

        if (outputEmpty) { outputEmpty.classList.add('js-hidden'); }
        if (outputFrame) { outputFrame.classList.add('visible'); }

        showToast('✦ Design generated! 3 versions ready.');

        // Show version tabs
        const versionTabsContainer = document.querySelector('.output-version-tabs');
        if (versionTabsContainer) {
          versionTabsContainer.classList.add('js-visible');
        }

        // Enable download & iterate
        const iterateBar = document.querySelector('.iterate-bar');
        if (iterateBar) { iterateBar.classList.add('js-visible'); }

      }, 2400);
    }

    /* Version tabs */
    const versionTabs = document.querySelectorAll('.version-tab');
    versionTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        versionTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    function updateVersionTabs(count) {
      const tabsContainer = document.querySelector('.output-version-tabs');
      if (!tabsContainer) return;
      tabsContainer.innerHTML = '';
      for (let i = 1; i <= count; i++) {
        const t = document.createElement('button');
        t.className = 'version-tab' + (i === 1 ? ' active' : '');
        t.textContent = 'V' + i;
        t.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.version-tab').forEach((x) => x.classList.remove('active'));
          t.classList.add('active');
        });
        tabsContainer.appendChild(t);
      }
    }

    /* Iterate bar */
    const iterateBtn = document.querySelector('.btn-iterate');
    const iterateInput = document.querySelector('.iterate-input');

    if (iterateBtn && iterateInput) {
      iterateBtn.addEventListener('click', () => {
        const val = iterateInput.value.trim();
        if (!val) return;
        iterateBtn.textContent = 'Applying…';
        iterateBtn.disabled = true;
        setTimeout(() => {
          iterateBtn.textContent = 'Apply';
          iterateBtn.disabled = false;
          iterateInput.value = '';
          showToast('✦ Refinement applied to all versions');
        }, 1600);
      });

      iterateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') iterateBtn.click();
      });
    }

    /* Download button */
    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        showToast('✦ Preparing your download…');
        setTimeout(() => showToast('✦ designfast-output.zip downloaded!'), 1200);
      });
    }
  }

  /* ── Styles Gallery Page ───────────────────────────────── */
  function initStylesPage() {
    const stylesPage = document.querySelector('.styles-page');
    if (!stylesPage) return;

    /* Filter tabs */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const styleCards = document.querySelectorAll('.style-card-full');
    const countBadge = document.querySelector('.styles-count-badge');

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        let visible = 0;

        styleCards.forEach((card) => {
          const tags = card.dataset.tags || '';
          if (filter === 'all' || tags.includes(filter)) {
            card.classList.remove('hidden');
            visible++;
          } else {
            card.classList.add('hidden');
          }
        });

        if (countBadge) {
          countBadge.textContent = `${visible} styles`;
        }
      });
    });

    /* Use style buttons */
    const useButtons = document.querySelectorAll('.style-use-btn');
    useButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const styleName = btn.dataset.style;
        // Store in sessionStorage and navigate to generator
        sessionStorage.setItem('selectedStyle', styleName);
        window.location.href = 'generate.html';
      });
    });
  }

  /* ── Pricing Page ──────────────────────────────────────── */
  function initPricingPage() {
    const pricingPage = document.querySelector('.pricing-page');
    if (!pricingPage) return;

    /* FAQ accordion */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        faqItems.forEach((i) => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  /* ── Restore selected style from styles page ───────────── */
  function restoreSelectedStyle() {
    const selected = sessionStorage.getItem('selectedStyle');
    if (!selected) return;

    const styleCards = document.querySelectorAll('.gen-style-card');
    styleCards.forEach((card) => {
      if (card.dataset.style === selected) {
        styleCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    sessionStorage.removeItem('selectedStyle');
  }

  /* ── Init All ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavActive();
    initNavScroll();
    initMobileNav();
    initGeneratorPage();
    initStylesPage();
    initPricingPage();
    restoreSelectedStyle();
  });

})();
