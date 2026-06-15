    /* ── CURSOR ──────────────────────────────────────────── */
    const cur  = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top  = my + 'px';
    });

    (function raf() {
      rx += (mx - rx) * .1;
      ry += (my - ry) * .1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(raf);
    })();

    document.querySelectorAll('a, .btn, .proj, .p-more').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cl'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cl'));
    });

    /* ── TEXT SCRAMBLE ───────────────────────────────────── */
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#—✦∗';

    function scramble(el, text) {
      const old = el.innerText;
      const len = Math.max(old.length, text.length);
      const q   = Array.from({ length: len }, (_, i) => ({
        from: old[i] || '',
        to:   text[i] || '',
        start: Math.floor(Math.random() * 10),
        end:   10 + Math.floor(Math.random() * 18),
        ch: ''
      }));
      let frame = 0;
      (function tick() {
        let out = '', done = 0;
        for (const c of q) {
          if (frame >= c.end) {
            out += c.to; done++;
          } else if (frame >= c.start) {
            if (c.to === ' ' || c.from === ' ') {
              out += ' ';
            } else {
              if (!c.ch || Math.random() < .28)
                c.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
              out += `<span style="opacity:.45;color:var(--i2)">${c.ch}</span>`;
            }
          } else {
            out += c.from;
          }
        }
        el.innerHTML = out;
        if (done < q.length) { requestAnimationFrame(tick); frame++; }
      })();
    }
/* ── SEQUENTIAL SCRAMBLE ────────────────────────── */
function scrambleSequential(el, text) {
  const oldText = el.innerText;
  const maxLength = Math.max(oldText.length, text.length);
  let frame = 0;
  const speed = 2; 

  (function tick() {
    let out = '';
    let isDone = true;
    for (let i = 0; i < maxLength; i++) {
      const progress = Math.floor(frame / speed);
      if (i < progress) {
        out += (text[i] || '');
      } else if (i === progress) {
        const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        out += `<span style="opacity:.6;color:var(--i2)">${randomChar}</span>`;
        isDone = false;
      } else {
        out += (oldText[i] || '');
      }
    }
    el.innerHTML = out;
    if (!isDone) { requestAnimationFrame(tick); frame++; }
    else { el.innerText = text; }
  })();
}

 // Scramble section headlines when they enter viewport
function initMainAnimations() {
    document.body.classList.add('page-loaded');
    ['hl1', 'hl2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let fired = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) {
        fired = true;
        setTimeout(() => {
          const key = el.getAttribute('data-lang');
          const text = langData[currentLang][key];
          scramble(el, text);
        }, 400);
      }
    }, { threshold: .5 }).observe(el);
  });
 // Scramble project headings on hover
  document.querySelectorAll('.p-hl').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const key = el.getAttribute('data-lang');
      const t = langData[currentLang][key];
      scramble(el, t);
    });
  });
 /* ── SCROLL REVEAL + SKILL BARS ──────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('show');
      e.target.querySelectorAll('.skill-fill').forEach(b => {
        b.style.width = b.dataset.w + '%';
      });
    });
  }, { threshold: .1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  // Trigger bars visible on initial load
  setTimeout(() => {
    document.querySelectorAll('.skill-fill').forEach(b => {
      if (b.getBoundingClientRect().top < window.innerHeight)
        b.style.width = b.dataset.w + '%';
    });
  }, 200);
}

    /* ── 3D TILT (project cards) ─────────────────────────── */
    document.querySelectorAll('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const x = ((e.clientX - left) / width  - .5) *  9;
        const y = ((e.clientY - top)  / height - .5) * -9;
        c.style.transition = 'transform .08s ease';
        c.style.transform  = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateZ(5px)`;
      });
      c.addEventListener('mouseleave', () => {
        c.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
        c.style.transform  = '';
      });
    });

    /* ── MAGNETIC BUTTONS ────────────────────────────────── */
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = (e.clientX - left - width  / 2) * .32;
        const y = (e.clientY - top  - height / 2) * .32;
        btn.style.transition = 'transform .1s ease';
        btn.style.transform  = `translate(${x}px,${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
        btn.style.transform  = '';
      });
    });

    /* ── DATE ────────────────────────────────────────────── */
function updateDateDisplay(lang) {
  const el = document.getElementById('date-out');
  const yrEl = document.getElementById('yr');
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();

  if (yrEl) yrEl.textContent = y;
  if (el) {
    if (lang === 'vi') {
      el.textContent = `THÁNG ${m + 1} NĂM ${y}`;
    } else if (lang === 'ja') {
      el.textContent = `${y}年${m + 1}月`;
    } else {
      const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                      'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
      el.textContent = `${months[m]} ${y}`;
    }
  }
}
let sysLang = navigator.language || navigator.userLanguage;
let currentLang = sysLang.startsWith('vi') ? 'vi' : (sysLang.startsWith('ja') ? 'ja' : 'en');

function applyLanguage(lang, animate = false) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (langData[lang] && langData[lang][key]) {
      const newText = langData[lang][key];
      if (animate) {
        scrambleSequential(el, newText);
      } else {
        el.innerHTML = newText;
      }
    }
  });
  updateDateDisplay(lang);
}

function changeLanguage(lang) {
  if (lang === currentLang) return;
  applyLanguage(lang, true);
}

window.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang, false);
});

window.addEventListener('load', () => {
  const overlay = document.getElementById('welcome-screen');
  const line1 = document.getElementById('print-line1');
  const line2 = document.getElementById('print-line2');
  const line3 = document.getElementById('print-line3');
  const stamp = document.getElementById('welcome-stamp');
  if (!overlay) {
    initMainAnimations();
    return;
  }

  const typeText = (el, text, speed, callback) => {
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(timer);
        if (callback) setTimeout(callback, 150);
      }
    }, speed);
  };

  setTimeout(() => {
    typeText(line1, "Loading...", 40, () => {
      setTimeout(() => {
        line1.textContent = "Loading finished.";
        
        setTimeout(() => {
          typeText(line2, "The Hiep Times", 50, () => {
            typeText(line3, "Edition 2026 - Initializing digital frontier...", 30, () => {
              
              setTimeout(() => {
                if (stamp) stamp.classList.add('stamped');
                overlay.classList.add('shake');
                
                setTimeout(() => {
                  overlay.classList.remove('shake');
                  
                  setTimeout(() => {
                    overlay.classList.add('fade-out');
                    setTimeout(() => {
                      overlay.style.display = 'none'; 
                      initMainAnimations(); 
                      checkDeviceAndShowModal();
                    }, 800);

                  }, 1200);
                  
                }, 150);
              }, 900);

            });
          });
        }, 300);
      }, 500);
    });
  }, 400);
});
function checkDeviceAndShowModal() {
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    const modal = document.getElementById('mobile-modal');
    if (modal) {
      modal.classList.add('show');
    }
  }
}

const modalCloseBtn = document.getElementById('m-modal-close');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', function() {
    const modal = document.getElementById('mobile-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  });
}