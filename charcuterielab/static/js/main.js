// Scroll reveal
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => observer.observe(el));
  }

  // Mobile nav
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && path.startsWith(a.getAttribute('href')) && a.getAttribute('href') !== '/') {
      a.classList.add('active');
    }
  });

  // Newsletter / notify forms
  document.querySelectorAll('.nl-form, .book-notify').forEach(form => {
    const btn = form.querySelector('button');
    const input = form.querySelector('input[type="email"]');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      if (input.value.includes('@')) {
        const orig = btn.textContent;
        btn.textContent = '✓ Done!';
        btn.style.background = '#3A7D44';
        input.value = '';
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 3000);
      } else {
        input.style.borderColor = '#C0392B';
        setTimeout(() => input.style.borderColor = '', 2000);
      }
    });
  });

  // Category filter (blog page)
  const filterTabs = document.querySelectorAll('.filter-tab[data-cat]');
  const postCards = document.querySelectorAll('.post-card[data-cats]');
  if (filterTabs.length && postCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.cat;
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        postCards.forEach(card => {
          const cats = card.dataset.cats || '';
          if (cat === 'all' || cats.includes(cat)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
});
