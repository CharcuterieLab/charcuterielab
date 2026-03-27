document.addEventListener('DOMContentLoaded', () => {

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => obs.observe(el));
  }

  // Mobile nav
  const burger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href !== '/' && path.startsWith(href)) a.classList.add('active');
  });

  // Newsletter forms (all instances)
  document.querySelectorAll('.nl-form').forEach(form => {
    const btn = form.querySelector('button');
    const input = form.querySelector('input[type="email"]');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      if (input.value.includes('@')) {
        window.open('https://charcuterie-lab-report.beehiiv.com/subscribe?email=' + encodeURIComponent(input.value), '_blank');
        const orig = btn.textContent;
        btn.textContent = '✓ Redirecting...';
        input.value = '';
        setTimeout(() => btn.textContent = orig, 3000);
      } else {
        input.style.borderColor = 'var(--amber)';
        setTimeout(() => input.style.borderColor = '', 2000);
      }
    });
  });

  // Category filter tabs (blog list page)
  const tabs = document.querySelectorAll('.filter-tab[data-cat]');
  const cards = document.querySelectorAll('.post-card[data-cats]');
  if (tabs.length && cards.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = tab.dataset.cat;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        cards.forEach(card => {
          const cats = card.dataset.cats || '';
          card.style.display = (cat === 'all' || cats.includes(cat)) ? '' : 'none';
        });
      });
    });
  }

  // Netlify Identity redirect
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (!user) {
        window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
      }
    });
  }

});
