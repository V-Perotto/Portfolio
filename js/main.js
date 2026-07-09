/* ============================================================
   Portfólio Vittorio Perotto
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   0. Tela de boot — conexão SSH fake (máx. 5s, pulável)
   ============================================================ */
(function bootSequence() {
  const screen = document.getElementById("bootScreen");
  const body = document.getElementById("bootBody");
  if (!screen || !body) return;

  let finished = false;
  const timers = [];

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    document.removeEventListener("keydown", finish);
    screen.removeEventListener("click", finish);
    document.body.classList.remove("booting");
    screen.classList.add("boot-hidden");
    timers.length = 0;
    setTimeout(() => screen.remove(), 600);
  }

  if (reducedMotion) {
    screen.remove();
    document.body.classList.remove("booting");
    return;
  }

  document.addEventListener("keydown", finish);
  screen.addEventListener("click", finish);
  // hard cap: nunca passa de 5s (4,8s + 0,5s de fade ≈ teto)
  setTimeout(finish, 4800);

  function schedule(delay, fn) {
    timers.push(setTimeout(fn, delay));
  }

  // cursor único que acompanha a linha ativa, como num terminal real
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "▊";

  // cria uma linha; "parts" são [classe, texto] renderizados na hora
  function addLine(parts) {
    const p = document.createElement("p");
    p.className = "boot-line";
    parts.forEach(([cls, text]) => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text;
      p.appendChild(span);
    });
    p.appendChild(cursor);
    body.appendChild(p);
    return p;
  }

  // digita "text" dentro de um span novo no fim da linha
  function typeInto(line, text, speed, cls, onDone) {
    const span = document.createElement("span");
    if (cls) span.className = cls;
    line.appendChild(span);
    line.appendChild(cursor);
    let i = 0;
    (function step() {
      if (finished) return;
      span.textContent = text.slice(0, ++i);
      if (i < text.length) timers.push(setTimeout(step, speed));
      else if (onDone) timers.push(setTimeout(onDone, 0));
    })();
  }

  const anonPrompt = [
    ["prompt-user", "anon"], ["prompt-at", "@"], ["prompt-host", "127.0.0.1"],
    ["prompt-colon", ":"], ["prompt-path", "~"], ["prompt-dollar", "$ "],
  ];
  const viperPrompt = [
    ["prompt-user", "viper"], ["prompt-at", "@"], ["prompt-host", "portfolio"],
    ["prompt-colon", ":"], ["prompt-path", "~"], ["prompt-dollar", "$ "],
  ];

  const line1 = addLine(anonPrompt);
  typeInto(line1, "ssh viper@portfolio", 42, null, () => {
    schedule(250, () => {
      addLine([["boot-dim", "Conectando a portfolio na porta 22..."]]);
      schedule(500, () => {
        const pass = addLine([[null, "viper@portfolio's password: "]]);
        typeInto(pass, "••••••••", 55, null, () => {
          schedule(450, () => {
            addLine([["boot-ok", "Autenticado. "], [null, "Bem-vindo ao PortfolioOS 1.0 LTS"]]);
            schedule(300, () => {
              const now = new Date().toLocaleString("pt-BR");
              addLine([["boot-dim", `Last login: ${now} from 127.0.0.1`]]);
              schedule(400, () => {
                const run = addLine(viperPrompt);
                typeInto(run, "./iniciar_portfolio.sh", 24, "boot-ok", () => {
                  schedule(350, finish);
                });
              });
            });
          });
        });
      });
    });
  });
})();

/* ============================================================
   1. Matrix rain no hero (canvas)
   ============================================================ */
(function matrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas || reducedMotion) return;

  const ctx = canvas.getContext("2d");
  const chars = "アイウエオカキクケコ01<>[]{}$#@&%*+=;/\\|~^";
  const fontSize = 15;
  let columns = 0;
  let drops = [];
  let animationId = null;

  function resize() {
    const hero = canvas.parentElement;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
  }

  function draw() {
    ctx.fillStyle = "rgba(10, 6, 18, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      // alterna verde/roxo entre colunas para casar com a paleta
      ctx.fillStyle = i % 3 === 0 ? "#7b3fb3" : "#2fa876";
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let last = 0;
  function loop(ts) {
    if (ts - last > 55) { // ~18fps: chuva mais lenta e menos CPU
      draw();
      last = ts;
    }
    animationId = requestAnimationFrame(loop);
  }

  // pausa quando o hero sai da tela
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animationId) animationId = requestAnimationFrame(loop);
    } else if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
  observer.observe(canvas.parentElement);

  window.addEventListener("resize", resize);
  resize();
})();

/* ============================================================
   2. Efeito de digitação no hero (roda em loop entre frases)
   ============================================================ */
(function typeWriter() {
  const target = document.getElementById("typedRole");
  if (!target) return;

  const phrases = [
    "whoami",
    "Desenvolvedor Full-Stack",
    "Analista de Sistemas",
    "Arquiteto de Software",
    'echo "TypeScript · Vue · PostgreSQL"',
  ];

  if (reducedMotion) {
    target.textContent = phrases[1];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      target.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, 1800); // pausa com a frase completa
        return;
      }
      setTimeout(tick, 65 + Math.random() * 60);
    } else {
      charIndex--;
      target.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 30);
    }
  }

  setTimeout(tick, 900);
})();

/* ============================================================
   3. Reveal on scroll
   ============================================================ */
(function scrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
})();

/* ============================================================
   4. Menu mobile
   ============================================================ */
(function mobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  // fecha o menu ao clicar em um link
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
})();

/* ============================================================
   5. Links extras de contato
   Adicione aqui seus links (GitHub, LinkedIn, etc.) — eles são
   renderizados automaticamente na seção de contato.
   Exemplo:
     { key: "github",   url: "https://github.com/seu-usuario" },
     { key: "linkedin", url: "https://linkedin.com/in/seu-perfil" },
   ============================================================ */
const extraLinks = [
  { key: "github",   url: "https://github.com/V-Perotto" },
  { key: "linkedin", url: "https://www.linkedin.com/in/vittorioperotto/" },
];

(function renderExtraLinks() {
  const list = document.getElementById("contactList");
  if (!list || !extraLinks.length) return;

  extraLinks.forEach(({ key, url }) => {
    const li = document.createElement("li");

    const keySpan = document.createElement("span");
    keySpan.className = "c-key";
    keySpan.textContent = key;

    const sepSpan = document.createElement("span");
    sepSpan.className = "c-sep";
    sepSpan.textContent = "=";

    const link = document.createElement("a");
    link.className = "c-val";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url.replace(/^https?:\/\//, "");

    li.append(keySpan, sepSpan, link);
    list.appendChild(li);
  });
})();

/* ============================================================
   6. Ano do footer
   ============================================================ */
(function footerYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   7. Scrollspy — destaca na navbar a seção visível
   ============================================================ */
(function scrollSpy() {
  const links = document.querySelectorAll("#navLinks a[href^='#']");
  const byId = new Map();
  links.forEach((a) => byId.set(a.getAttribute("href").slice(1), a));

  const sections = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  let currentId = null;

  function activate(id) {
    if (id === currentId) return;
    currentId = id;
    const link = byId.get(id);
    links.forEach((a) => a.classList.toggle("active", a === link));
  }

  // ativa a última seção cujo topo já passou da linha de leitura (45% da
  // viewport); calculado a cada scroll — não depende de eventos de cruzamento,
  // então não dessincroniza em scroll rápido/suave
  function update() {
    ticking = false;
    const probe = window.innerHeight * 0.45;
    let active = null;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= probe) active = s.id;
    });
    activate(active);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();
