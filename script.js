const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    if (menuBtn) menuBtn.textContent = '☰';
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();


// Privacy-conscious visitor stats (anonymous random browser ID, no IP-based tracking).
(async () => {
  const endpoint = "/.netlify/functions/visitor-stats";
  let visitorId;
  try {
    visitorId = localStorage.getItem("mundcond_visitor_id");
    if (!visitorId) {
      visitorId = (crypto.randomUUID ? crypto.randomUUID() : "v-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem("mundcond_visitor_id", visitorId);
    }
  } catch (_) { visitorId = "temporary-" + Math.random().toString(36).slice(2); }
  const paint = (data) => {
    const today = document.getElementById("stats-today");
    const month = document.getElementById("stats-month");
    const online = document.getElementById("stats-online");
    if (today) today.textContent = Number(data.today ?? 0).toLocaleString();
    if (month) month.textContent = Number(data.month ?? 0).toLocaleString();
    if (online) online.textContent = Number(data.online ?? 0).toLocaleString();
  };
  async function ping() {
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId }), cache: "no-store" });
      if (!response.ok) return;
      paint(await response.json());
    } catch (_) {}
  }
  ping();
  setInterval(ping, 30000);
})();
