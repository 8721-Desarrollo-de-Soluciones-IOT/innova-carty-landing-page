(() => {
  const cfg = window.IC_CONFIG;
  const dict = window.IC_I18N;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  // ---- Language (ES in the HTML, EN from the dictionary) ----
  const original = new Map();
  $$('[data-i18n]').forEach((el) => original.set(el, el.innerHTML));
  $$('[data-i18n-ph]').forEach((el) => original.set(el, el.placeholder));
  $$('[data-i18n-alt]').forEach((el) => original.set(el, el.alt));
  let lang = 'es';

  const t = (key) => (dict[lang] && dict[lang][key]) || dict.es[key] || key;

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    const pick = (el, key) => (lang === 'en' && dict.en[key]) || original.get(el);
    $$('[data-i18n]').forEach((el) => { el.innerHTML = pick(el, el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = pick(el, el.dataset.i18nPh); });
    $$('[data-i18n-alt]').forEach((el) => { el.alt = pick(el, el.dataset.i18nAlt); });
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    storage.set('ic-lang', lang);
  }
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  const saved = storage.get('ic-lang');
  if (saved === 'en') setLang('en');

  // ---- Links to the Web App ----
  $$('[data-webapp-link]').forEach((a) => { a.href = cfg.webAppUrl; });

  // ---- Toast ----
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
  }

  // ---- Mobile menu ----
  const nav = $('#nav');
  const toggle = $('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    $('.ms', toggle).textContent = open ? 'close' : 'menu';
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    $('.ms', toggle).textContent = 'menu';
  }));

  // ---- Highlight the section in view ----
  const links = new Map($$('a', nav).map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      const a = links.get(e.target.id);
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));

  // ---- Benefits tabs (mobile only; desktop shows both cards) ----
  const tabs = $$('.segmented [role="tab"]');
  const mobile = window.matchMedia('(max-width: 760px)');
  function showPanel(id) {
    tabs.forEach((tab) => {
      const on = tab.getAttribute('aria-controls') === id;
      tab.setAttribute('aria-selected', String(on));
      document.getElementById(tab.getAttribute('aria-controls')).hidden = mobile.matches && !on;
    });
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => showPanel(tab.getAttribute('aria-controls'))));
  mobile.addEventListener('change', () => showPanel($('.segmented [aria-selected="true"]').getAttribute('aria-controls')));
  showPanel('seg-shoppers');

  // ---- Product video ----
  $('[data-video]').addEventListener('click', (e) => {
    if (!cfg.productVideoUrl) { toast(t('toast.video')); return; }
    const frame = document.createElement('iframe');
    frame.src = cfg.productVideoUrl + (cfg.productVideoUrl.includes('?') ? '&' : '?') + 'autoplay=1';
    frame.title = 'Innova Carty';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    e.currentTarget.closest('.video').append(frame);
  });

  // ---- Store badges (app not published yet) ----
  $$('.store').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toast(t('toast.store')); }));

  // ---- Request-a-demo form ----
  const form = $('#demo-form');
  const rules = {
    company: (v) => v.trim().length > 0,
    ruc: (v) => /^\d{11}$/.test(v.trim()),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    carts: (v) => Number(v) > 0,
  };
  function validate(input) {
    const ok = rules[input.name] ? rules[input.name](input.value) : true;
    input.closest('.field').classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }
  Object.keys(rules).forEach((name) => form.elements[name].addEventListener('blur', (e) => validate(e.target)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fieldsOk = Object.keys(rules).map((name) => validate(form.elements[name])).every(Boolean);
    const privacyOk = form.elements.privacy.checked;
    $('#privacy-err').classList.toggle('show', !privacyOk);
    if (!fieldsOk || !privacyOk) {
      const first = $('.invalid input', form) || form.elements.privacy;
      first.focus();
      return;
    }
    // No backend in Sprint 1: keep the lead locally so the flow can be demoed end to end.
    const lead = Object.fromEntries(new FormData(form));
    const leads = JSON.parse(storage.get('ic-leads') || '[]');
    leads.push({ ...lead, createdAt: new Date().toISOString() });
    storage.set('ic-leads', JSON.stringify(leads));
    form.reset();
    $('.form__ok', form).hidden = false;
    toast($('.form__ok', form).textContent);
  });
})();
