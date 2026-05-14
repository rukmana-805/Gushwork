document.addEventListener('DOMContentLoaded', () => {

  /*
    STICKY HEADER
    Appears when user scrolls past the hero section (first fold).
    Disappears when scrolling back up.
  */
  const stickyHeader = document.getElementById('sticky-header');
  const mainNav      = document.getElementById('main-nav');
  let lastScrollY    = 0;
  let heroHeight     = 0;

  function calcHeroHeight() {
    const hero = document.querySelector('.hero-section');
    heroHeight  = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
  }
  calcHeroHeight();
  window.addEventListener('resize', calcHeroHeight);

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    // Show sticky header after passing the hero section
    if (currentY > heroHeight) {
      stickyHeader.classList.add('visible');
    } else {
      stickyHeader.classList.remove('visible');
    }

    lastScrollY = currentY;
  }, { passive: true });


  /*
    IMAGE CAROUSEL WITH ZOOM
    - Prev/Next buttons cycle through slides
    - Thumbnail clicks jump to slide
    - On hover: zoomed preview appears in corner, tracks mouse position
   */
  const track      = document.getElementById('carousel-track');
  const slides     = document.querySelectorAll('.carousel-slide');
  const prevBtn    = document.getElementById('prev-btn');
  const nextBtn    = document.getElementById('next-btn');
  const thumbs     = document.querySelectorAll('.thumb');
  let currentIndex = 0;
  const total      = slides.length;

  /** Move carousel to given index */
  function goToSlide(index) {
    currentIndex = (index + total) % total;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update active classes
    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Thumbnail clicks
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      goToSlide(parseInt(thumb.dataset.index, 10));
    });
  });

  // Auto-advance every 5 seconds
  let autoAdvance = setInterval(() => goToSlide(currentIndex + 1), 5000);

  // Pause auto-advance on user interaction
  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(autoAdvance);
      autoAdvance = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  const carouselEl = document.getElementById('carousel');
  carouselEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carouselEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goToSlide(currentIndex + 1) : goToSlide(currentIndex - 1);
  }, { passive: true });

  /* --- Zoom preview: track mouse position inside each slide --- */
  slides.forEach(slide => {
    const zoomImg = slide.querySelector('.zoom-preview img');
    if (!zoomImg) return;

    slide.addEventListener('mousemove', e => {
      const rect = slide.getBoundingClientRect();
      // Normalise cursor position within slide (0–1)
      const xPct = (e.clientX - rect.left)  / rect.width;
      const yPct = (e.clientY - rect.top)   / rect.height;
      // Shift the zoomed image origin so the cursor maps to the center of the preview
      const ox = xPct * 100;
      const oy = yPct * 100;
      zoomImg.style.transformOrigin = `${ox}% ${oy}%`;
    });
  });


  /* 
    FAQ ACCORDION
  */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn  = item.querySelector('.faq-q');
    const icon = item.querySelector('.faq-icon');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(fi => {
        fi.classList.remove('open');
        fi.querySelector('.faq-icon').textContent = '▼';
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        icon.textContent = '▲';
      }
    });
  });


  /* 
    MANUFACTURING PROCESS TABS
   */
  const processTabs  = document.querySelectorAll('.process-tab');
  const processSteps = document.querySelectorAll('.process-step');

  processTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = parseInt(tab.dataset.step, 10);

      // Update tabs
      processTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update steps (only show if defined)
      processSteps.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.step, 10) === step);
      });
    });
  });

  /* Inner step prev/next arrows inside each process step */
  document.querySelectorAll('.proc-prev').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const activeTab = document.querySelector('.process-tab.active');
      const idx = parseInt(activeTab?.dataset.step ?? '0', 10);
      const prevTab = document.querySelector(`.process-tab[data-step="${idx - 1}"]`);
      if (prevTab) prevTab.click();
    });
  });
  document.querySelectorAll('.proc-next').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const activeTab = document.querySelector('.process-tab.active');
      const idx = parseInt(activeTab?.dataset.step ?? '0', 10);
      const nextTab = document.querySelector(`.process-tab[data-step="${idx + 1}"]`);
      if (nextTab) nextTab.click();
    });
  });


  /* 
    HAMBURGER MENU (mobile)
 */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const bars = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    });
  });


  /*
    VERSATILE APPLICATIONS CAROUSEL
    Uses pixel-based translation reading actual rendered card widths
 */
  const appTrack = document.getElementById('applications-track');
  const appPrev  = document.getElementById('app-prev');
  const appNext  = document.getElementById('app-next');
  let appIndex   = 0;

  function getAppCards() {
    return Array.from(document.querySelectorAll('.app-card'));
  }

  function getCardStep() {
    const cards = getAppCards();
    if (!cards.length) return 256;
    // card width + gap (16px)
    return cards[0].getBoundingClientRect().width + 16;
  }

  function getAppMax() {
    const cards = getAppCards();
    const wrapper = appTrack?.parentElement;
    if (!wrapper || !cards.length) return 0;
    const visible = Math.floor(wrapper.getBoundingClientRect().width / getCardStep());
    return Math.max(0, cards.length - visible);
  }

  function slideApps(dir) {
    appIndex = Math.min(Math.max(appIndex + dir, 0), getAppMax());
    const px = appIndex * getCardStep();
    appTrack.style.transform = `translateX(-${px}px)`;

    // highlight the middle visible card
    const cards = getAppCards();
    const wrapper = appTrack?.parentElement;
    const visible = wrapper ? Math.floor(wrapper.getBoundingClientRect().width / getCardStep()) : 3;
    const activeIdx = appIndex + Math.floor(visible / 2);
    cards.forEach((c, i) => c.classList.toggle('active', i === activeIdx));
  }

  appPrev?.addEventListener('click', () => slideApps(-1));
  appNext?.addEventListener('click', () => slideApps(1));

  // Click a card to make it active
  getAppCards().forEach(card => {
    card.addEventListener('click', () => {
      getAppCards().forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  /*
    SCROLL REVEAL – subtle fade-in for sections
  */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(
      '.feature-card, .testimonial-card, .portfolio-card, .faq-box, .specs-table-wrap'
    ).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });

    document.addEventListener('animationend', () => {});
    // Add class that applies the reveal
    document.head.insertAdjacentHTML('beforeend', `
      <style>
        .revealed { opacity: 1 !important; transform: translateY(0) !important; }
      </style>
    `);
  }

});
