/* ============================================
   MOJ KRAGUJEVAC — Interactions
   ============================================ */

(function () {
    'use strict';

    // ─── Navigation: scroll state ───────────────
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    function handleNavScroll() {
        const y = window.scrollY;
        if (y > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = y;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ─── Mobile menu toggle ─────────────────────
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('navMenu');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ─── Scroll reveal animations ───────────────
    const revealTargets = [
        '.intro__lead',
        '.intro__pullquote',
        '.stat',
        '.t-item',
        '.landmark',
        '.sumarice__quote',
        '.sumarice__text p',
        '.sumarice__numbers',
        '.numb',
        '.g-item',
        '.cta__title',
        '.cta__text',
        '.cta__actions',
        '.cta__handle'
    ];

    const elements = document.querySelectorAll(revealTargets.join(', '));
    elements.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('in-view');
                    }, i * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -80px 0px'
        });

        elements.forEach(el => observer.observe(el));
    } else {
        // Fallback — pokaži sve odmah
        elements.forEach(el => el.classList.add('in-view'));
    }

    // ─── Smooth scroll sa nav offset ────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        });
    });

    // ─── Subtilno parallax za hero ──────────────
    const heroBg = document.querySelector('.hero__bg');
    const sumariceBg = document.querySelector('.sumarice__bg');

    if (heroBg && window.innerWidth > 768) {
        let ticking = false;

        function updateParallax() {
            const scrolled = window.scrollY;

            if (scrolled < window.innerHeight) {
                const offset = scrolled * 0.35;
                heroBg.style.transform = `translateY(${offset}px) scale(${1 + scrolled * 0.0002})`;
            }

            if (sumariceBg) {
                const rect = sumariceBg.parentElement.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    const offset = (progress - 0.5) * 80;
                    sumariceBg.style.transform = `translateY(${offset}px) scale(1.05)`;
                }
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    // ─── Newsletter modal ────────────────────────
    const nlModal   = document.getElementById('nlModal');
    const nlOpenBtn = document.getElementById('nlOpenBtn');
    const nlClose   = document.getElementById('nlClose');
    const nlForm    = document.getElementById('nlForm');
    const nlEmail   = document.getElementById('nlEmail');
    const nlMsg     = document.getElementById('nlMsg');

    const NL_KEY = 'mk_newsletter_v1';

    function nlGetAll() {
        try { return JSON.parse(localStorage.getItem(NL_KEY)) || []; }
        catch { return []; }
    }

    function nlSave(email) {
        const list = nlGetAll();
        if (list.some(e => e.email.toLowerCase() === email.toLowerCase())) return false;
        list.push({ email, ts: new Date().toISOString() });
        localStorage.setItem(NL_KEY, JSON.stringify(list));
        return true;
    }

    function nlOpen() {
        nlModal.classList.add('open');
        nlModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        nlMsg.textContent = '';
        nlMsg.className = 'nl-modal__msg';
        nlEmail.value = '';
        setTimeout(() => nlEmail.focus(), 420);
    }

    function nlClose2() {
        nlModal.classList.remove('open');
        nlModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (nlOpenBtn) nlOpenBtn.addEventListener('click', nlOpen);
    if (nlClose)   nlClose.addEventListener('click', nlClose2);
    nlModal.querySelector('.nl-modal__backdrop').addEventListener('click', nlClose2);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nlModal.classList.contains('open')) nlClose2();
    });

    nlForm.addEventListener('submit', e => {
        e.preventDefault();
        const val = nlEmail.value.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(val)) {
            nlMsg.className = 'nl-modal__msg nl-modal__msg--error';
            nlMsg.textContent = '⚠ Unesite ispravnu email adresu.';
            return;
        }
        if (nlSave(val)) {
            nlMsg.className = 'nl-modal__msg nl-modal__msg--success';
            nlMsg.textContent = '✓ Uspešno ste se pretplatili! Hvala vam.';
            setTimeout(nlClose2, 2200);
        } else {
            nlMsg.className = 'nl-modal__msg nl-modal__msg--error';
            nlMsg.textContent = '⚠ Ova adresa je već registrovana.';
        }
    });

    // ─── Console paskha (jer si Nikola haker) ──
    console.log(
        '%c Moj Kragujevac %c — Srce Šumadije ',
        'background:#E8642A;color:#1A1410;font-weight:bold;padding:6px 12px;font-family:Georgia,serif;font-size:14px;',
        'background:#1A1410;color:#F4ECDC;padding:6px 12px;font-style:italic;font-family:Georgia,serif;font-size:13px;'
    );
    console.log('%c@moj.kragujevac · moj.kragujevacc@gmail.com', 'color:#6B1E1E;font-size:11px;');
    console.log('%c💌 Newsletter pretplatnici → JSON.parse(localStorage.getItem("mk_newsletter_v1"))', 'color:#4A6B2D;font-size:10px;font-style:italic;');

})();
