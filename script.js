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

    // ─── Newsletter modal (samo na stranicama koje ga imaju) ───
    const nlModal = document.getElementById('nlModal');
    if (nlModal) {
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
    }

    // ─── Lightbox galerija ──────────────────────
    (function initLightbox() {
        const items = Array.from(document.querySelectorAll('[data-lightbox]'));
        if (!items.length) return;

        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.className = 'lightbox';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-hidden', 'true');
        lb.innerHTML = `
            <div class="lightbox__backdrop"></div>
            <button class="lightbox__close" aria-label="Zatvori">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <button class="lightbox__prev" aria-label="Prethodna">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button class="lightbox__next" aria-label="Sledeća">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <figure class="lightbox__figure">
                <img class="lightbox__img" src="" alt="">
                <figcaption class="lightbox__caption"></figcaption>
            </figure>
            <div class="lightbox__counter"></div>
        `;
        document.body.appendChild(lb);

        let current = 0;
        const lbImg     = lb.querySelector('.lightbox__img');
        const lbCaption = lb.querySelector('.lightbox__caption');
        const lbCounter = lb.querySelector('.lightbox__counter');

        function show(index) {
            const item = items[index];
            const src  = item.dataset.src;
            const cap  = item.dataset.caption || '';
            lbImg.classList.add('loading');
            lbImg.onload = () => lbImg.classList.remove('loading');
            lbImg.src = src;
            lbImg.alt = cap;
            lbCaption.textContent = cap;
            lbCounter.textContent = (index + 1) + ' / ' + items.length;
            current = index;
            const single = items.length <= 1;
            lb.querySelector('.lightbox__prev').style.display = single ? 'none' : '';
            lb.querySelector('.lightbox__next').style.display = single ? 'none' : '';
        }

        function openLb(index) {
            show(index);
            lb.classList.add('open');
            lb.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLb() {
            lb.classList.remove('open');
            lb.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        items.forEach(function (item, i) {
            item.addEventListener('click', function () { openLb(i); });
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') openLb(i);
            });
        });

        lb.querySelector('.lightbox__backdrop').addEventListener('click', closeLb);
        lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
        lb.querySelector('.lightbox__prev').addEventListener('click', function () {
            show((current - 1 + items.length) % items.length);
        });
        lb.querySelector('.lightbox__next').addEventListener('click', function () {
            show((current + 1) % items.length);
        });

        document.addEventListener('keydown', function (e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') closeLb();
            if (e.key === 'ArrowLeft')  show((current - 1 + items.length) % items.length);
            if (e.key === 'ArrowRight') show((current + 1) % items.length);
        });
    })();

    // ─── Timeline: collapsible dropdown(s) ──────
    function initCollapsibleTimeline(wrapId, btnId, labelClass, collapsedMax, scrollAnchorId) {
        const wrap = document.getElementById(wrapId);
        const btn = document.getElementById(btnId);
        if (!wrap || !btn) return;

        const label = btn.querySelector(labelClass);
        const showText = label.dataset.show;
        const hideText = label.dataset.hide;

        wrap.style.maxHeight = collapsedMax;

        function expand() {
            wrap.classList.remove('is-collapsed');
            wrap.style.maxHeight = wrap.scrollHeight + 'px';
            btn.setAttribute('aria-expanded', 'true');
            label.textContent = hideText;
        }

        function collapse() {
            wrap.style.maxHeight = wrap.scrollHeight + 'px';
            requestAnimationFrame(() => {
                wrap.classList.add('is-collapsed');
                wrap.style.maxHeight = collapsedMax;
            });
            btn.setAttribute('aria-expanded', 'false');
            label.textContent = showText;
            const anchor = scrollAnchorId ? document.getElementById(scrollAnchorId) : null;
            if (anchor && anchor.getBoundingClientRect().top < 0) {
                anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        wrap.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'max-height') return;
            if (!wrap.classList.contains('is-collapsed')) {
                wrap.style.maxHeight = 'none';
            }
        });

        window.addEventListener('resize', () => {
            if (!wrap.classList.contains('is-collapsed')) {
                wrap.style.maxHeight = 'none';
            }
        });

        btn.addEventListener('click', () => {
            if (wrap.classList.contains('is-collapsed')) expand();
            else collapse();
        });
    }

    initCollapsibleTimeline('timelineCollapsible', 'timelineToggle', '.timeline__toggle-text', '22rem', 'istorija');
    initCollapsibleTimeline('bigTimelineCollapsible', 'bigTimelineToggle', '.big-timeline__toggle-text', '32rem', 'hronologija');
    initCollapsibleTimeline('factsCollapsible', 'factsToggle', '.facts__toggle-text', '26rem', 'zanimljivosti');

    // ─── Console paskha (jer si Nikola haker) ──
    console.log(
        '%c Moj Kragujevac %c — Srce Šumadije ',
        'background:#E8642A;color:#1A1410;font-weight:bold;padding:6px 12px;font-family:Georgia,serif;font-size:14px;',
        'background:#1A1410;color:#F4ECDC;padding:6px 12px;font-style:italic;font-family:Georgia,serif;font-size:13px;'
    );
    console.log('%c@moj.kragujevac · moj.kragujevacc@gmail.com', 'color:#6B1E1E;font-size:11px;');
    console.log('%c💌 Newsletter pretplatnici → JSON.parse(localStorage.getItem("mk_newsletter_v1"))', 'color:#4A6B2D;font-size:10px;font-style:italic;');

})();
