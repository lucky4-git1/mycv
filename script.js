/**
 * ========================================================
 * K. SRIYUTH — PORTFOLIO & CV EXPERIENCE ENGINE
 * Architecture: Cosmic Glassmorphic Cyberpunk Bento
 * Micro-Interactions: Starfield Canvas, Dynamic Spotlight,
 * Lenis Smooth Scroll, Web Audio SFX, Quick-Nav Rail,
 * Project Filters, Deep-Dive Modal, Command Palette
 * ========================================================
 */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const motionEnabled = !prefersReducedMotion;

    /* ══════════════════════════════════════════════════════════
       1. SYNTHESIZED WEB AUDIO SFX ENGINE
    ══════════════════════════════════════════════════════════ */
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem("sriyuth_sound") === "true";
            this.initUI();
        }

        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === "suspended") {
                this.ctx.resume();
            }
        }

        playBlip() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.035);
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.035);
            } catch (e) {}
        }

        playClick() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(420, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.045);
                gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.045);
            } catch (e) {}
        }

        playSuccess() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = "sine";
                    const t = this.ctx.currentTime + (i * 0.05);
                    osc.frequency.setValueAtTime(f, t);
                    gain.gain.setValueAtTime(0.05, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.1);
                });
            } catch (e) {}
        }

        initUI() {
            const btn = document.getElementById("soundToggleBtn");
            const icon = document.getElementById("soundIcon");

            const update = () => {
                if (icon) {
                    icon.className = this.enabled 
                        ? "ph-bold ph-speaker-high text-purple-400" 
                        : "ph-bold ph-speaker-slash text-slate-500";
                }
                if (btn) {
                    btn.setAttribute("title", this.enabled ? "Sound FX: ON (Click to mute)" : "Sound FX: OFF (Click to unmute)");
                }
            };

            update();

            if (btn) {
                btn.addEventListener("click", () => {
                    this.enabled = !this.enabled;
                    localStorage.setItem("sriyuth_sound", String(this.enabled));
                    update();
                    if (this.enabled) {
                        this.playSuccess();
                        showToast("Audio sound effects enabled");
                    } else {
                        showToast("Audio sound effects muted");
                    }
                });
            }
        }
    }

    const sound = new SoundEngine();

    // Attach sound to interactive elements
    function attachSoundListeners() {
        document.querySelectorAll("a, button, .filter-tab-pill, .skill-tile, .project-bento-card").forEach(el => {
            el.addEventListener("mouseenter", () => sound.playBlip());
            el.addEventListener("click", () => sound.playClick());
        });
    }
    attachSoundListeners();

    /* ══════════════════════════════════════════════════════════
       2. LENIS SMOOTH SCROLLING ENGINE
    ══════════════════════════════════════════════════════════ */
    let lenis = null;
    if (typeof Lenis !== "undefined" && motionEnabled) {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
            infinite: false
        });

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Intercept native anchor jumps for buttery smooth Lenis scroll
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href");
                if (targetId && targetId !== "#" && targetId.length > 1) {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        lenis.scrollTo(targetEl, { offset: -80 });
                    }
                }
            });
        });

        window.lenis = lenis;
    }

    /* ══════════════════════════════════════════════════════════
       3. AMBIENT STARFIELD CANVAS (Cosmic Particle Simulation)
    ══════════════════════════════════════════════════════════ */
    const starfieldCanvas = document.getElementById("starfieldCanvas");
    if (starfieldCanvas && motionEnabled) {
        const ctx = starfieldCanvas.getContext("2d");
        let width, height;
        let stars = [];
        const STAR_COUNT = Math.min(120, Math.floor(window.innerWidth / 12));

        function resizeCanvas() {
            width = starfieldCanvas.width = window.innerWidth;
            height = starfieldCanvas.height = window.innerHeight;
            initStars();
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.6 + 0.4,
                    alpha: Math.random() * 0.7 + 0.2,
                    speedY: Math.random() * 0.15 + 0.05,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    color: Math.random() > 0.4 ? "168, 85, 247" : "56, 189, 248" // Purple or Cyan
                });
            }
        }

        function drawStars() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.y -= s.speedY;
                if (s.y < 0) s.y = height;

                s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.008;
                const clampedAlpha = Math.max(0.1, Math.min(0.85, s.alpha));

                ctx.fillStyle = `rgba(${s.color}, ${clampedAlpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(drawStars);
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        drawStars();
    }

    /* ══════════════════════════════════════════════════════════
       4. CUSTOM CYBER CURSOR (Fluid Lag & Hover Scale)
    ══════════════════════════════════════════════════════════ */
    const cursorEl = document.getElementById("customCursor");
    if (cursorEl && hasFinePointer && motionEnabled) {
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        let targetX = cursorX;
        let targetY = cursorY;
        let isVisible = false;

        document.addEventListener("mousemove", (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!isVisible) {
                cursorX = targetX;
                cursorY = targetY;
                isVisible = true;
                cursorEl.classList.add("is-visible");
            }
        }, { passive: true });

        document.addEventListener("mousedown", () => cursorEl.classList.add("is-clicking"));
        document.addEventListener("mouseup", () => cursorEl.classList.remove("is-clicking"));

        const INTERACTIVE = "a, button, input, .spotlight-card, .skill-tile, .filter-tab-pill, .cmd-item";
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(INTERACTIVE)) cursorEl.classList.add("is-hover");
        });
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(INTERACTIVE)) {
                const to = e.relatedTarget;
                if (!to || !to.closest || !to.closest(INTERACTIVE)) cursorEl.classList.remove("is-hover");
            }
        });

        document.addEventListener("mouseleave", () => cursorEl.classList.remove("is-visible"));
        document.addEventListener("mouseenter", () => {
            if (isVisible) cursorEl.classList.add("is-visible");
        });

        function renderCursor() {
            cursorX += (targetX - cursorX) * 0.22;
            cursorY += (targetY - cursorY) * 0.22;
            cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();
    } else {
        document.body.classList.add("no-custom-cursor");
        if (cursorEl) cursorEl.style.display = "none";
    }

    /* ══════════════════════════════════════════════════════════
       5. DYNAMIC SPOTLIGHT MOUSE TRACKING
    ══════════════════════════════════════════════════════════ */
    const spotlightCards = document.querySelectorAll(".spotlight-card");
    document.addEventListener("mousemove", (e) => {
        spotlightCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    }, { passive: true });

    /* ══════════════════════════════════════════════════════════
       6. QUICK-NAV RAIL SCROLL-SPY
    ══════════════════════════════════════════════════════════ */
    const navItems = document.querySelectorAll(".quick-nav-item");
    const sections = ["home", "about", "projects", "skills", "experience", "achievements", "contact"];

    function updateQuickNav() {
        const scrollPosition = window.scrollY + 200;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section) {
                const top = section.offsetTop;
                if (scrollPosition >= top) {
                    navItems.forEach(item => {
                        const target = item.getAttribute("data-nav");
                        if (target === sections[i]) {
                            item.classList.add("active");
                        } else {
                            item.classList.remove("active");
                        }
                    });
                    break;
                }
            }
        }
    }

    window.addEventListener("scroll", updateQuickNav, { passive: true });
    updateQuickNav();

    /* ══════════════════════════════════════════════════════════
       7. PROJECT FILTER TABS
    ══════════════════════════════════════════════════════════ */
    const filterTabs = document.querySelectorAll(".filter-tab-pill");
    const projectCards = document.querySelectorAll(".project-bento-card");

    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const filter = tab.getAttribute("data-filter");

            projectCards.forEach(card => {
                const category = card.getAttribute("data-category");
                if (filter === "all" || category === filter) {
                    card.style.display = "flex";
                    gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    /* ══════════════════════════════════════════════════════════
       8. PROJECT DEEP-DIVE MODAL ENGINE
    ══════════════════════════════════════════════════════════ */
    const projectDetails = {
        simpleide: {
            title: "SimpleIDE — Browser-Based Cloud IDE",
            category: "WEB APPS / DEVTOOLS",
            image: "images/p-simpleide.jpg",
            desc: "SimpleIDE is an open-source AI-assisted coding environment engineered with React, TypeScript, and Docker container execution sandboxes. It features the Monaco editor engine, instant real-time linting, multi-file workspace trees, terminal emulation, and intelligent code completions.",
            tech: ["React", "TypeScript", "Node.js", "Docker", "Monaco Editor", "Tailwind CSS"],
            link: "https://github.com/lucky4-git1/SimpleIDE"
        },
        riri: {
            title: "RIRI — Autonomous AI Content & Agent Workflow",
            category: "AI TOOLS / AUTOMATION",
            image: "images/p-riri.jpg",
            desc: "RIRI is an intelligent multi-agent research and text optimization platform. Built using Python, local ONNX neural models, and streaming LLM APIs, it automates copy transformation, structural style adjustments, and intelligent AST summaries with sub-500ms latency.",
            tech: ["Python", "ONNX", "FastAPI", "React", "Next.js", "Tailwind CSS"],
            link: "https://github.com/lucky4-git1"
        },
        seo: {
            title: "SEO Intelligence & Audit Suite",
            category: "WEB APPS / ANALYTICS",
            image: "images/p-seo.jpg",
            desc: "A production analytics suite that inspects web pages for Core Web Vitals, metadata hygiene, accessibility scores, and backlink topology. Automatically produces comprehensive visual graphs and formatted PDF audit deliverables.",
            tech: ["React", "PostgreSQL", "Node.js", "Puppeteer", "Tailwind CSS"],
            link: "https://github.com/lucky4-git1"
        },
        magzone: {
            title: "MAGZONE360 — Interactive Digital Marketplace",
            category: "CLIENT WORK / E-COMMERCE",
            image: "images/p-magzone.jpg",
            desc: "MAGZONE360 is a premier digital publication marketplace and subscription portal. Engineered with high-conversion e-commerce funnels, smooth pagination, interactive reader modes, and responsive cart checkout flows.",
            tech: ["React", "Redux Toolkit", "Node.js", "Express", "Tailwind CSS"],
            link: "https://github.com/lucky4-git1"
        }
    };

    const modal = document.getElementById("projectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalCategory = document.getElementById("modalCategory");
    const modalImage = document.getElementById("modalImage");
    const modalDescription = document.getElementById("modalDescription");
    const modalTechStack = document.getElementById("modalTechStack");
    const modalLiveLink = document.getElementById("modalLiveLink");

    function openProjectModal(id) {
        const data = projectDetails[id];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalCategory.textContent = data.category;
        modalImage.src = data.image;
        modalImage.alt = data.title;
        modalDescription.textContent = data.desc;

        modalTechStack.innerHTML = data.tech.map(t => 
            `<span class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-300">${t}</span>`
        ).join("");

        modalLiveLink.href = data.link;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (lenis) lenis.stop();
        sound.playSuccess();
    }

    function closeProjectModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lenis) lenis.start();
        sound.playClick();
    }

    document.querySelectorAll(".btn-project-modal").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-project-id");
            openProjectModal(id);
        });
    });

    const closeBtn1 = document.getElementById("modalCloseBtn");
    const closeBtn2 = document.getElementById("modalCloseBtn2");
    if (closeBtn1) closeBtn1.addEventListener("click", closeProjectModal);
    if (closeBtn2) closeBtn2.addEventListener("click", closeProjectModal);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeProjectModal();
        });
    }

    /* ══════════════════════════════════════════════════════════
       9. COMMAND PALETTE (CTRL+K)
    ══════════════════════════════════════════════════════════ */
    const cmdPalette = document.getElementById("cmdPalette");
    const cmdTriggerBtn = document.getElementById("cmdTriggerBtn");
    const cmdInput = document.getElementById("cmdInput");
    const cmdItems = document.querySelectorAll(".cmd-item");

    function openCmdPalette() {
        if (!cmdPalette) return;
        cmdPalette.classList.add("active");
        cmdPalette.setAttribute("aria-hidden", "false");
        if (cmdInput) {
            cmdInput.value = "";
            setTimeout(() => cmdInput.focus(), 50);
        }
        document.body.style.overflow = "hidden";
        if (lenis) lenis.stop();
        sound.playBlip();
    }

    function closeCmdPalette() {
        if (!cmdPalette) return;
        cmdPalette.classList.remove("active");
        cmdPalette.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lenis) lenis.start();
    }

    if (cmdTriggerBtn) {
        cmdTriggerBtn.addEventListener("click", openCmdPalette);
    }

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (cmdPalette.classList.contains("active")) {
                closeCmdPalette();
            } else {
                openCmdPalette();
            }
        } else if (e.key === "Escape") {
            if (cmdPalette && cmdPalette.classList.contains("active")) {
                closeCmdPalette();
            }
            if (modal && modal.classList.contains("active")) {
                closeProjectModal();
            }
        }
    });

    if (cmdPalette) {
        cmdPalette.addEventListener("click", (e) => {
            if (e.target === cmdPalette) closeCmdPalette();
        });
    }

    if (cmdInput) {
        cmdInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            cmdItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? "flex" : "none";
            });
        });
    }

    cmdItems.forEach(item => {
        item.addEventListener("click", () => {
            const action = item.getAttribute("data-action");
            const target = item.getAttribute("data-target");

            closeCmdPalette();

            if (action === "scroll" && target) {
                const targetEl = document.querySelector(target);
                if (targetEl) {
                    if (lenis) {
                        lenis.scrollTo(targetEl, { offset: -80 });
                    } else {
                        targetEl.scrollIntoView({ behavior: "smooth" });
                    }
                }
            } else if (action === "resume") {
                window.location.href = "K_Sriyuth_Resume.pdf";
            } else if (action === "sound") {
                const soundBtn = document.getElementById("soundToggleBtn");
                if (soundBtn) soundBtn.click();
            }
        });
    });

    /* ══════════════════════════════════════════════════════════
       10. COPY EMAIL TO CLIPBOARD & TOAST
    ══════════════════════════════════════════════════════════ */
    const copyEmailBtn = document.getElementById("copyEmailBtn");
    const toastMsg = document.getElementById("toastMsg");
    const toastText = document.getElementById("toastText");
    let toastTimeout = null;

    function showToast(message) {
        if (!toastMsg) return;
        if (toastText) toastText.textContent = message;
        toastMsg.classList.add("show");

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastMsg.classList.remove("show");
        }, 3200);
    }

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", () => {
            const email = copyEmailBtn.getAttribute("data-email") || "sriyuthk122@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                showToast(`Copied ${email} to clipboard!`);
                sound.playSuccess();
            }).catch(() => {
                showToast("Could not copy to clipboard");
            });
        });
    }

    /* ══════════════════════════════════════════════════════════
       11. ENTRANCE GSAP REVEALS (Subtle Stagger)
    ══════════════════════════════════════════════════════════ */
    if (motionEnabled) {
        gsap.from("#home .glass-panel", {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: "power3.out"
        });

        gsap.utils.toArray("main section:not(#home)").forEach(sec => {
            gsap.from(sec, {
                scrollTrigger: {
                    trigger: sec,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 35,
                duration: 0.75,
                ease: "power2.out"
            });
        });
    }

    console.log("%c[K. SRIYUTH] Portfolio & CV initialized cleanly. Dark Cosmic Glassmorphism active.", "color: #a855f7; font-weight: bold; font-size: 12px;");
});
