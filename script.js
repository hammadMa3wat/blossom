/* ═══════════════════════════════════════
   LUMIÈRE & LACE — JavaScript
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────
     CUSTOM BLOOM CURSOR 🌸
  ──────────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;
  let trailTimer = 0;

  // Petal emojis for trail
  const PETALS = ['🌸', '🌺', '✿', '❀', '🌷', '💮'];

  // Move cursor instantly, ring lags behind
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';

    // Spawn petal trail every ~70ms of movement
    const now = Date.now();
    if (now - trailTimer > 70) {
      trailTimer = now;
      spawnPetalTrail(mouseX, mouseY);
    }
  });

  // Smooth ring follow via rAF
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Click: bloom burst + scale
  document.addEventListener('mousedown', (e) => {
    cursor.classList.add('clicking');
    cursorRing.classList.add('clicking');
    spawnClickBloom(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
    cursorRing.classList.remove('clicking');
  });

  // Hover over interactive elements → grow ring
  document.querySelectorAll('a, button, input, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width  = '70px';
      cursorRing.style.height = '70px';
      cursorRing.style.borderColor = 'var(--dusty-rose)';
      cursorRing.style.opacity = '0.65';
      cursor.style.fontSize = '30px';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width  = '';
      cursorRing.style.height = '';
      cursorRing.style.borderColor = '';
      cursorRing.style.opacity = '';
      cursor.style.fontSize = '';
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '';
  });

  function spawnPetalTrail(x, y) {
    const petal = document.createElement('div');
    petal.className = 'petal-trail';
    petal.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
    const tx = (Math.random() - 0.5) * 60;
    const ty = Math.random() * 40 + 20;
    const tr = (Math.random() - 0.5) * 180 + 'deg';
    petal.style.left = x + 'px';
    petal.style.top  = y + 'px';
    petal.style.setProperty('--tx', tx + 'px');
    petal.style.setProperty('--ty', ty + 'px');
    petal.style.setProperty('--tr', tr);
    petal.style.fontSize = (10 + Math.random() * 10) + 'px';
    document.body.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove());
  }

  function spawnClickBloom(x, y) {
    const burst = document.createElement('div');
    burst.className = 'click-bloom';
    burst.textContent = '🌸';
    burst.style.left = x + 'px';
    burst.style.top  = y + 'px';
    document.body.appendChild(burst);
    burst.addEventListener('animationend', () => burst.remove());
    // Spawn a mini ring of petals on click
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist  = 40 + Math.random() * 30;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      setTimeout(() => spawnPetalTrail(px, py), i * 30);
    }
  }

  /* ────────────────────────────────────
     NAVBAR scroll effect
  ──────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ────────────────────────────────────
     HAMBURGER menu
  ──────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ────────────────────────────────────
     SPARKLE / PETAL CANVAS
  ──────────────────────────────────── */
  const canvas = document.getElementById('sparkleCanvas');
  const ctx    = canvas.getContext('2d');

  let particles = [];
  let animFrameId;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.5;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.life   = Math.random() * 200 + 100;
      this.maxLife = this.life;
      // colour: gold or pink
      const hues = ['rgba(212,175,135,', 'rgba(255,173,197,', 'rgba(255,214,224,', 'rgba(255,255,255,'];
      this.colour = hues[Math.floor(Math.random() * hues.length)];
      this.isStar = Math.random() > 0.6;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life--;
      const ratio = this.life / this.maxLife;
      this.currentOpacity = this.opacity * (ratio < 0.2 ? ratio / 0.2 : ratio > 0.8 ? 1 : 1);
      if (this.life <= 0) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;
      if (this.isStar) {
        ctx.fillStyle = this.colour + '1)';
        drawStar(ctx, this.x, this.y, 4, this.size * 2, this.size);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colour + '1)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  // Spawn particles
  for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // Stagger initial positions
    particles.push(p);
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animFrameId = requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Pause particles when hero is out of view (performance)
  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!animFrameId) animateParticles();
    } else {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }, { threshold: 0.1 });
  heroObserver.observe(document.getElementById('hero'));

  /* ────────────────────────────────────
     SCROLL REVEAL
  ──────────────────────────────────── */
  const revealEls = [
    ...document.querySelectorAll('.product-card'),
    ...document.querySelectorAll('.feature-card'),
    ...document.querySelectorAll('.testimonial-card'),
    document.querySelector('.newsletter-inner'),
    document.querySelector('.footer-inner'),
  ].filter(Boolean);

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    const delay = (i % 3) * 0.1;
    el.style.transitionDelay = delay + 's';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ────────────────────────────────────
     CART STATE
  ──────────────────────────────────── */
  let cart = [];

  const cartBtn     = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');
  const cartCount   = document.getElementById('cartCount');
  const cartItems   = document.getElementById('cartItems');
  const cartFooter  = document.getElementById('cartFooter');
  const cartTotal   = document.getElementById('cartTotal');
  const toast       = document.getElementById('toast');

  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cart.length === 0) {
      cartCount.classList.remove('visible');
      cartItems.innerHTML = '<p class="cart-empty">Your basket is empty ✨</p>';
      cartFooter.style.display = 'none';
    } else {
      cartCount.classList.add('visible');
      cartFooter.style.display = 'block';
      cartTotal.textContent = '$' + total.toFixed(2);
      cartItems.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <span class="cart-item-name">${item.name} × ${item.qty}</span>
          <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
          <button class="cart-item-remove" data-idx="${idx}" aria-label="Remove ${item.name}">✕</button>
        </div>
      `).join('');

      cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
          renderCart();
        });
      });
    }
  }

  function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price: parseFloat(price), qty: 1 });
    }
    renderCart();
    showToast(`${name} added ✨`);

    // Bounce cart button
    cartBtn.style.transform = 'scale(1.25)';
    setTimeout(() => { cartBtn.style.transform = ''; }, 300);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // Wire up all "Add to Cart" & "Quick Add" buttons
  document.querySelectorAll('[data-name][data-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, btn.dataset.price);
    });
  });

  renderCart();

  /* ────────────────────────────────────
     NEWSLETTER FORM
  ──────────────────────────────────── */
  const newsletterForm = document.getElementById('newsletterForm');
  const formSuccess    = document.getElementById('formSuccess');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value.trim();
    if (!email || !email.includes('@')) {
      document.getElementById('emailInput').style.outline = '2px solid #FFADC5';
      return;
    }
    newsletterForm.style.display = 'none';
    formSuccess.style.display = 'block';
  });

  /* ────────────────────────────────────
     ANIMATED TAB TITLE 🌸
  ──────────────────────────────────── */
  const TAB_TITLES = [
    '🌸 Onebloom',
    '✨ Making beauty,',
    '🧵 one bead',
    '💛 at a time.',
    '🌺 Onebloom',
    '🌸 Handcrafted with love',
  ];
  let tabIdx = 0;
  let tabInterval = null;

  function startTitleCycle() {
    tabInterval = setInterval(() => {
      tabIdx = (tabIdx + 1) % TAB_TITLES.length;
      document.title = TAB_TITLES[tabIdx];
    }, 1800);
  }

  function stopTitleCycle() {
    clearInterval(tabInterval);
    tabInterval = null;
  }

  // Start cycling immediately
  startTitleCycle();

  // When user leaves tab — show "come back" message
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTitleCycle();
      document.title = '🌸 Come back! We miss you…';
    } else {
      document.title = TAB_TITLES[tabIdx];
      startTitleCycle();
    }
  });

  /* ────────────────────────────────────
     SMOOTH HERO SCROLL HINT
  ──────────────────────────────────── */
  document.querySelector('.hero-scroll-hint')?.addEventListener('click', () => {
    document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
  });

  /* ────────────────────────────────────
     ACTIVE NAV LINK on scroll
  ──────────────────────────────────── */
  const sections = ['collections', 'features', 'testimonials', 'newsletter']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinkEls = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinkEls.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + id) {
            a.style.color = 'var(--dusty-rose)';
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));

});
