/* ========================================================
   K. SRIYUTH - FUSED PORTFOLIO EXPERIENCE ENGINE
   Aesthetic: Neo-Brutalist Pastel & Cybernetic Fusion
   Features: GSAP Motion, Web Audio FX, AI Automation Simulator,
             Command Palette, 3D/Video Stage, Deep-Dive Modals
   ======================================================== */

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const motionEnabled = !prefersReducedMotion;

    /* ========================================================
       1. SYNTHESIZED WEB AUDIO FX (Subtle & Tactile)
       ======================================================== */
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem("sriyuth_sound") === "true";
            this.initToggle();
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

        playClick() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.04);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            } catch(e) {}
        }

        playBlip() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(540, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.03);
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.03);
            } catch(e) {}
        }

        playSuccess() {
            if (!this.enabled) return;
            try {
                this.initContext();
                if (!this.ctx) return;
                const notes = [440, 554.37, 659.25, 880];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = "sine";
                    const startTime = this.ctx.currentTime + (idx * 0.06);
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.06, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.12);
                });
            } catch(e) {}
        }

        initToggle() {
            const soundBtn = document.getElementById("soundToggle");
            const soundIcon = document.getElementById("soundIcon");
            const soundStatus = document.getElementById("soundStatus");

            const updateUI = () => {
                if (soundIcon) soundIcon.className = this.enabled ? "ph-bold ph-speaker-high text-xl" : "ph-bold ph-speaker-slash text-xl opacity-60";
                if (soundStatus) soundStatus.innerText = this.enabled ? "SFX ON" : "SFX OFF";
                if (soundBtn) {
                    soundBtn.classList.toggle("bg-a1", this.enabled);
                    soundBtn.setAttribute("aria-label", this.enabled ? "Sound effects enabled" : "Sound effects muted");
                }
            };

            updateUI();

            if (soundBtn) {
                soundBtn.addEventListener("click", () => {
                    this.enabled = !this.enabled;
                    localStorage.setItem("sriyuth_sound", String(this.enabled));
                    updateUI();
                    if (this.enabled) this.playSuccess();
                });
            }
        }
    }

    const sound = new SoundEngine();

    // Attach sound triggers
    document.querySelectorAll(".brutal-btn, .icon-btn, .cmd-item, .filter-tab, .sim-tab").forEach(el => {
        el.addEventListener("mouseenter", () => sound.playBlip());
        el.addEventListener("click", () => sound.playClick());
    });


    /* ========================================================
       2. HIGH-PERFORMANCE DUAL-LAYER CUSTOM CURSOR (ZERO-LAG)
       ======================================================== */
    class CustomCursor {
        constructor() {
            this.el = document.getElementById("cursor");
            if (!this.el || !hasFinePointer || prefersReducedMotion) {
                document.body.classList.add("no-custom-cursor");
                if (this.el) this.el.style.display = "none";
                return;
            }

            this.dot = this.el.querySelector(".custom-cursor__dot");
            this.ring = this.el.querySelector(".custom-cursor__ring");

            this.targetX = window.innerWidth / 2;
            this.targetY = window.innerHeight / 2;
            this.ringX = this.targetX;
            this.ringY = this.targetY;
            this.visible = false;
            this.isHovering = false;
            this.isClicking = false;
            this.ticking = false;
            this.lerp = 0.22; // Responsive damping

            this.INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], .hover-target, .cmd-item, .project-card, .filter-tab, .sim-tab, .skill-row, .brutal-btn";

            // Bind tick once to prevent garbage-collection stutter
            this.tick = this.tick.bind(this);

            this.bindEvents();
        }

        bindEvents() {
            let lastTarget = null;
            const onMove = (e) => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;

                if (!this.visible) {
                    this.ringX = this.targetX;
                    this.ringY = this.targetY;
                    this.visible = true;
                    this.el.classList.add("is-visible");
                }

                // ZERO-LATENCY: Dot updates immediately on hardware pointer input
                this.dot.style.transform = `translate3d(${this.targetX}px, ${this.targetY}px, 0)`;

                // Hover detection right from pointer event target
                const target = e.target;
                if (target && target !== lastTarget) {
                    lastTarget = target;
                    const isHit = target.closest && target.closest(this.INTERACTIVE_SELECTOR);
                    if (isHit && !this.isHovering) {
                        this.isHovering = true;
                        this.el.classList.add("is-hover");
                    } else if (!isHit && this.isHovering) {
                        this.isHovering = false;
                        this.el.classList.remove("is-hover");
                    }
                }

                // Wake RAF loop for smooth trailing ring
                if (!this.ticking) {
                    this.ticking = true;
                    requestAnimationFrame(this.tick);
                }
            };

            window.addEventListener("pointermove", onMove, { passive: true });
            window.addEventListener("mousemove", onMove, { passive: true });

            window.addEventListener("pointerdown", () => {
                this.isClicking = true;
                this.el.classList.add("is-clicking");
            }, { passive: true });

            window.addEventListener("pointerup", () => {
                this.isClicking = false;
                this.el.classList.remove("is-clicking");
            }, { passive: true });

            document.addEventListener("mouseleave", () => {
                this.visible = false;
                this.el.classList.remove("is-visible");
                lastTarget = null;
            });

            document.addEventListener("mouseenter", (e) => {
                onMove(e);
                this.ringX = e.clientX;
                this.ringY = e.clientY;
            });
        }

        tick() {
            const dx = this.targetX - this.ringX;
            const dy = this.targetY - this.ringY;

            // Spring-damped smooth interpolation
            this.ringX += dx * this.lerp;
            this.ringY += dy * this.lerp;

            this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0)`;

            // Sleep when resting to preserve 0% idle CPU and prevent frame drops
            if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
                requestAnimationFrame(this.tick);
            } else {
                this.ringX = this.targetX;
                this.ringY = this.targetY;
                this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0)`;
                this.ticking = false;
            }
        }
    }

    new CustomCursor();


    /* ========================================================
       3. THEME TOGGLE (Persistent Light/Dark Mode)
       ======================================================== */
    const themeToggle = document.getElementById("themeToggle");
    const html = document.documentElement;

    const savedTheme = localStorage.getItem("sriyuth_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        html.classList.add("dark");
    } else {
        html.classList.remove("dark");
    }

    function toggleTheme() {
        sound.playClick();
        html.classList.toggle("dark");
        const isDark = html.classList.contains("dark");
        localStorage.setItem("sriyuth_theme", isDark ? "dark" : "light");

        // Update GitHub stats theme dynamically
        const gitStats = document.getElementById("githubStatsImg");
        const gitLangs = document.getElementById("githubLangsImg");
        const themeParam = isDark ? "dark" : "default";
        if (gitStats) {
            gitStats.src = `https://github-readme-stats-eight-theta.vercel.app/api?username=lucky4-git1&show_icons=true&theme=${themeParam}&bg_color=00000000&hide_border=true`;
        }
        if (gitLangs) {
            gitLangs.src = `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=lucky4-git1&layout=compact&theme=${themeParam}&bg_color=00000000&hide_border=true`;
        }
    }

    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);


    /* ========================================================
       4. COMMAND PALETTE (CTRL + K / Launcher)
       ======================================================== */
    const cmdPalette = document.getElementById("cmdPalette");
    const cmdInput = document.getElementById("cmdInput");
    const cmdItems = document.querySelectorAll(".cmd-item");
    const cmdTrigger = document.getElementById("cmdTrigger");

    function openCmdPalette() {
        sound.playClick();
        cmdPalette.classList.add("active");
        cmdPalette.setAttribute("aria-hidden", "false");
        setTimeout(() => {
            if (cmdInput) {
                cmdInput.value = "";
                cmdInput.focus();
                filterCmdItems("");
            }
        }, 50);
    }

    function closeCmdPalette() {
        cmdPalette.classList.remove("active");
        cmdPalette.setAttribute("aria-hidden", "true");
    }

    function filterCmdItems(query) {
        const q = query.toLowerCase().trim();
        cmdItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? "flex" : "none";
        });
    }

    if (cmdTrigger) cmdTrigger.addEventListener("click", openCmdPalette);

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (cmdPalette.classList.contains("active")) {
                closeCmdPalette();
            } else {
                openCmdPalette();
            }
        }
        if (e.key === "Escape" && cmdPalette.classList.contains("active")) {
            closeCmdPalette();
        }
    });

    cmdPalette.addEventListener("click", (e) => {
        if (e.target === cmdPalette) closeCmdPalette();
    });

    if (cmdInput) {
        cmdInput.addEventListener("input", (e) => filterCmdItems(e.target.value));
    }

    cmdItems.forEach(item => {
        item.addEventListener("click", () => {
            const action = item.getAttribute("data-action");
            const target = item.getAttribute("data-target");

            closeCmdPalette();

            if (action === "theme") {
                toggleTheme();
            } else if (action === "sound") {
                const soundBtn = document.getElementById("soundToggle");
                if (soundBtn) soundBtn.click();
            } else if (action === "scroll" && target) {
                const el = document.querySelector(target);
                if (el) el.scrollIntoView({ behavior: "smooth" });
            } else if (action === "resume") {
                window.open("K_Sriyuth_Resume.pdf", "_blank");
            } else if (action === "simulator") {
                const el = document.querySelector("#automations");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                startSimulatedWorkflow("simpleide");
            }
        });
    });


    /* ========================================================
       5. CINEMATIC FULLSCREEN VIDEO-TO-HERO TRANSITION
       ======================================================== */
        function initCinematicHeroTransition() {
        const stageContainer = document.getElementById("hero-cinematic-stage");
        const pinnedViewport = document.getElementById("hero-pinned-viewport");
        const videoShell = document.getElementById("cinematicVideoShell");
        const destWrapper = document.getElementById("heroVideoWrapper");
                const stageToolbar = document.getElementById("stageToolbar");
        const stageCaption = document.getElementById("stageCaption");
        const heroLeftCol = document.getElementById("heroLeftCol");
        const nav = document.querySelector("nav");

        if (!stageContainer || !pinnedViewport || !videoShell || !destWrapper) return;

        function getDestMetrics() {
            const dRect = destWrapper.getBoundingClientRect();
            const pRect = pinnedViewport.getBoundingClientRect();
            return {
                x: dRect.left - pRect.left,
                y: dRect.top - pRect.top,
                width: dRect.width,
                height: dRect.height
            };
        }

        const videoEl = document.getElementById("heroVideo");
        if (videoEl) {
            videoEl.play().catch(e => {
                console.log("Autoplay policy handled:", e);
            });
            videoEl.onerror = () => {
                console.warn("Hero video failed to load, displaying poster.");
                videoEl.style.backgroundImage = "url('images/robot.png')";
                videoEl.style.backgroundSize = "cover";
            };
        }

        if (!motionEnabled) {
            const metrics = getDestMetrics();
            gsap.set(videoShell, {
                x: metrics.x,
                y: metrics.y,
                width: metrics.width,
                height: metrics.height,
                borderWidth: "3px",
                borderColor: "var(--color-border)",
                boxShadow: "8px 8px 0 0 var(--shadow-color)"
            });
                        if (nav) gsap.set(nav, { opacity: 1, y: 0 });
            if (heroLeftCol) gsap.set(heroLeftCol, { opacity: 1, x: 0 });
            if (stageToolbar) gsap.set(stageToolbar, { opacity: 1, y: 0 });
            if (stageCaption) gsap.set(stageCaption, { opacity: 1, y: 0 });
            return;
        }

        const isMobile = window.innerWidth < 768;
        const pinScrollDistance = isMobile ? 450 : 1000;

        gsap.set(videoShell, {
            top: 0,
            left: 0,
            x: 0,
            y: 0,
            width: "100vw",
            height: "100vh",
            borderWidth: "0px",
            borderColor: "transparent",
            boxShadow: "0px 0px 0px transparent"
        });
                if (nav) gsap.set(nav, { opacity: 0, y: -40 });
        if (stageToolbar) gsap.set(stageToolbar, { opacity: 0, y: -12 });
        if (stageCaption) gsap.set(stageCaption, { opacity: 0, y: 12 });

                gsap.set("#heroHeadline", { opacity: 0, x: -30 });
        gsap.set(".hero-role-badge", { opacity: 0, y: 16, scale: 0.95 });
        gsap.set("#heroBio", { opacity: 0, y: 20 });
        gsap.set("#heroCtas", { opacity: 0, y: 20 });
        gsap.set("#heroMetaBar", { opacity: 0, y: 15 });

        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: stageContainer,
                pin: pinnedViewport,
                start: "top top",
                end: () => `+=${pinScrollDistance}`,
                scrub: isMobile ? 0.4 : 0.8,
                invalidateOnRefresh: true
            }
        });

        heroTl.to(videoShell, {
            x: () => getDestMetrics().x,
            y: () => getDestMetrics().y,
            width: () => getDestMetrics().width,
            height: () => getDestMetrics().height,
            borderWidth: "3px",
            borderColor: "var(--color-border)",
            boxShadow: "8px 8px 0 0 var(--shadow-color)",
            ease: "power2.inOut",
            duration: 0.95
        }, 0);

        if (stageToolbar && stageCaption) {
            heroTl.to([stageToolbar, stageCaption], {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out"
            }, 0.35);
        }


        if (nav) {
            heroTl.to(nav, {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power2.out"
            }, 0.25);
        }

                heroTl.to("#heroHeadline", { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, 0.30);
        heroTl.to(".hero-role-badge", { opacity: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.25, ease: "power2.out" }, 0.45);
        heroTl.to("#heroBio", { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.55);
        heroTl.to("#heroCtas", { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.65);
        heroTl.to("#heroMetaBar", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.75);
    }

    initCinematicHeroTransition();

    /* ========================================================
       5.1. AWWWARDS-LEVEL KINETIC MARQUEE REDESIGN ENGINE
       Features: Dual-track counter-flow, seamless xPercent loop,
       ScrollTrigger dynamic velocity coupling, hover deceleration,
       accessible pause/resume toggle & reduced motion respect.
       ======================================================== */
    function initKineticMarquee() {
        const marqueeSection = document.getElementById("marqueeSection");
        const trackMain = document.getElementById("marqueeTrackMain");
        const trackSub = document.getElementById("marqueeTrackSub");
        const pauseBtn = document.getElementById("marqueePauseBtn");
        const pauseIcon = document.getElementById("marqueePauseIcon");
        const pauseText = document.getElementById("marqueePauseText");

        if (!trackMain || !trackSub) return;

        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            if (pauseBtn) {
                pauseBtn.setAttribute("aria-pressed", "true");
                if (pauseText) pauseText.innerText = "STATIC";
                pauseBtn.style.opacity = "0.6";
                pauseBtn.disabled = true;
            }
            return;
        }

        // Tier 2: Main Hero Ribbon (Leftward infinite smooth glide)
        // With 2 identical units, animating xPercent from 0 to -50 is 100% mathematically seamless
        const mainTween = gsap.to(trackMain, {
            xPercent: -50,
            repeat: -1,
            duration: 36,
            ease: "none"
        });

        // Tier 3: Sub-Ribbon Micro-Ticker (Rightward counter-flow infinite smooth glide)
        gsap.set(trackSub, { xPercent: -50 });
        const subTween = gsap.to(trackSub, {
            xPercent: 0,
            repeat: -1,
            duration: 44,
            ease: "none"
        });

        let isPaused = false;
        let isHovered = false;

        function setMarqueePaused(state) {
            isPaused = state;
            if (isPaused) {
                mainTween.pause();
                subTween.pause();
                if (pauseIcon) {
                    pauseIcon.classList.remove("ph-pause");
                    pauseIcon.classList.add("ph-play");
                }
                if (pauseText) pauseText.innerText = "RESUME";
                if (pauseBtn) pauseBtn.setAttribute("aria-pressed", "true");
            } else {
                mainTween.play();
                subTween.play();
                if (pauseIcon) {
                    pauseIcon.classList.remove("ph-play");
                    pauseIcon.classList.add("ph-pause");
                }
                if (pauseText) pauseText.innerText = "PAUSE";
                if (pauseBtn) pauseBtn.setAttribute("aria-pressed", "false");
            }
        }

        if (pauseBtn) {
            pauseBtn.addEventListener("click", () => {
                if (window.sound && typeof window.sound.playClick === "function") {
                    window.sound.playClick();
                }
                setMarqueePaused(!isPaused);
            });
        }

        // Hover deceleration: slow down to 0.25x speed for effortless readability
        if (marqueeSection) {
            marqueeSection.addEventListener("mouseenter", () => {
                if (isPaused) return;
                isHovered = true;
                gsap.to([mainTween, subTween], {
                    timeScale: 0.25,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            marqueeSection.addEventListener("mouseleave", () => {
                if (isPaused) return;
                isHovered = false;
                gsap.to([mainTween, subTween], {
                    timeScale: 1.0,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        }

        // ScrollTrigger Velocity Coupling: dynamically accelerate on rapid user scrolling
        let scrollVelocityTimer = null;
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.create({
                trigger: marqueeSection,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                    if (isPaused || isHovered) return;
                    const velocity = Math.abs(self.getVelocity() || 0);
                    if (velocity > 80) {
                        // Map velocity to speed multiplier between 1.0 and 3.2
                        const boost = Math.min(velocity / 500, 2.2);
                        const targetTimeScale = 1.0 + boost;

                        gsap.to([mainTween, subTween], {
                            timeScale: targetTimeScale,
                            duration: 0.2,
                            overwrite: "auto"
                        });

                        clearTimeout(scrollVelocityTimer);
                        scrollVelocityTimer = setTimeout(() => {
                            if (!isPaused && !isHovered) {
                                gsap.to([mainTween, subTween], {
                                    timeScale: 1.0,
                                    duration: 0.8,
                                    ease: "power1.out",
                                    overwrite: "auto"
                                });
                            }
                        }, 120);
                    }
                }
            });
        }
    }

    initKineticMarquee();

    /* ========================================================
       6. SIGNATURE INTERACTIVE AI SYSTEMS ARCHITECTURE EXHIBIT
       Verified software engineering showcase: SimpleIDE (Prime AI),
       RewriteBot, WhatsApp Cloud API & EMA Engine.
       Features 5-stage interactive workflow explorer, live bounded
       AST refactoring sandbox & unified diff inspector.
       ======================================================== */
    const ARCH_SYSTEMS = {
        simpleide: {
            id: "simpleide",
            tag: "FLAGSHIP DESKTOP TOOL",
            tagClass: "bg-a1 text-black",
            title: "SimpleIDE — Desktop AI Coding Agent & Bounded Execution Architecture",
            badges: [
                { text: "ELECTRON 28 + REACT 18 + VITE", class: "badge-lime" },
                { text: "161/161 TESTS PASSING", class: "badge-mint" },
                { text: "SECURE CONTEXTBRIDGE IPC", class: "badge-cobalt" },
                { text: "SAFESTORAGE ENCRYPTION", class: "badge-coral" }
            ],
            githubUrl: "https://github.com/lucky4-git1/SimpleIDE",
            auditDoc: "https://github.com/lucky4-git1/SimpleIDE/blob/main/AGENT_ARCHITECTURE_AUDIT.md",
            summary: "Built from scratch as an open-source desktop code editor featuring an embedded autonomous AI coding agent ('Prime AI'). SimpleIDE bridges the React UI with the Node.js operating system layer through a strict contextBridge IPC boundary (preload.js), executing bounded multi-step coding plans with unified AST diffing, syntax lint verification, and mandatory human confirmation before touching user files.",
            diagramHeadline: "VERIFIED PRIME AI WORKFLOW (ELECTRON 28 IPC CONDUIT)",
            stages: [
                {
                    num: "01",
                    name: "CONTEXT INGEST",
                    sub: "AST_SCAN & WORKSPACE",
                    files: "src/context/WorkspaceContext.jsx, preload.js",
                    description: "Scans open project files, maps exported symbols, and builds bounded context window for AI reasoning.",
                    metric: "Bounded AST Tree"
                },
                {
                    num: "02",
                    name: "PLAN SYNTHESIS",
                    sub: "RUN_AGENT_PLAN",
                    files: "src/components/AIPanel.jsx, ai.ipc.js",
                    description: "Streams plan via SSE. Formulates bounded steps with defined file mutations and rollbacks.",
                    metric: "Atomic JSON Plan"
                },
                {
                    num: "03",
                    name: "TOOL DISPATCH",
                    sub: "IPC & SAFE_STORAGE",
                    files: "electron/ipc/toolRouter.js, main.js",
                    description: "Dispatches atomic disk reads and syntax analysis tools across IPC without raw Node access.",
                    metric: "Encrypted Keys"
                },
                {
                    num: "04",
                    name: "DIFF & LINT",
                    sub: "UNIFIED AST DIFF ENGINE",
                    files: "src/utils/diffEngine.js, eslint.config.js",
                    description: "Generates unified diff representation. Runs lexical sanity checks to prevent broken ASTs.",
                    metric: "Syntax Verified"
                },
                {
                    num: "05",
                    name: "HUMAN COMMIT",
                    sub: "HUMAN-IN-THE-LOOP WRITE",
                    files: "src/components/DiffReviewModal.jsx",
                    description: "Renders visual diff to developer. Requires explicit approval before writing changes to disk.",
                    metric: "Atomic FS Write"
                }
            ],
            scenarios: [
                {
                    id: "leak",
                    name: "01: ASYNC MEMORY LEAK",
                    directive: "DETECT_LEAKS & CLEANUP",
                    desc: "Uncancelled interval inside React useEffect causing memory leaks on workspace unmount.",
                    inputCode: "// Unhandled interval leak in component lifecycle\nuseEffect(() => {\n  const syncTimer = setInterval(() => {\n    fetchWorkspaceMetrics(workspaceId);\n  }, 1000);\n  // Warning: missing cleanup return callback\n}, [workspaceId]);",
                    diffLines: [
                        { type: "ctx", num: 1, text: " useEffect(() => {" },
                        { type: "add", num: 2, text: "+   let isMounted = true;" },
                        { type: "ctx", num: 3, text: "     const syncTimer = setInterval(() => {" },
                        { type: "del", num: 4, text: "-     fetchWorkspaceMetrics(workspaceId);" },
                        { type: "add", num: 4, text: "+     if (isMounted) fetchWorkspaceMetrics(workspaceId);" },
                        { type: "ctx", num: 5, text: "     }, 1000);" },
                        { type: "del", num: 6, text: "-   // Warning: missing cleanup return callback" },
                        { type: "add", num: 6, text: "+   return () => {" },
                        { type: "add", num: 7, text: "+     isMounted = false;" },
                        { type: "add", num: 8, text: "+     clearInterval(syncTimer);" },
                        { type: "add", num: 9, text: "+   };" },
                        { type: "ctx", num: 10, text: " }, [workspaceId]);" }
                    ],
                    stats: { removed: 2, added: 6, status: "LEAK_PATCHED_CLEAN" }
                },
                {
                    id: "render",
                    name: "02: REACT RE-RENDER SURGE",
                    directive: "OPTIMIZE_REACT_RENDERS",
                    desc: "Expensive scoring filter recalculated redundantly on every parent render cycle.",
                    inputCode: "function ProjectSearch({ fileItems, filterKeyword }) {\n  // Expensive scoring recalculated on every parent re-render\n  const matchedFiles = fileItems.filter(f => computeAstScore(f, filterKeyword));\n  return <VirtualFileList items={matchedFiles} onSelect={openTab} />;\n}",
                    diffLines: [
                        { type: "ctx", num: 1, text: " function ProjectSearch({ fileItems, filterKeyword }) {" },
                        { type: "del", num: 2, text: "-   // Expensive scoring recalculated on every parent re-render" },
                        { type: "add", num: 2, text: "+   // Prime AI: Memoized computation pinned to stable dependencies" },
                        { type: "del", num: 3, text: "-   const matchedFiles = fileItems.filter(f => computeAstScore(f, filterKeyword));" },
                        { type: "add", num: 3, text: "+   const matchedFiles = useMemo(() => {" },
                        { type: "add", num: 4, text: "+     return fileItems.filter(f => computeAstScore(f, filterKeyword));" },
                        { type: "add", num: 5, text: "+   }, [fileItems, filterKeyword]);" },
                        { type: "ctx", num: 6, text: "   return <VirtualFileList items={matchedFiles} onSelect={openTab} />;" },
                        { type: "ctx", num: 7, text: " }" }
                    ],
                    stats: { removed: 2, added: 4, status: "MEMOIZED_CLEAN" }
                },
                {
                    id: "guard",
                    name: "03: NESTED LOGIC & GUARDS",
                    directive: "INJECT_GUARD_CLAUSES & TYPING",
                    desc: "Callback pyramid without early returns causing brittle state mutation.",
                    inputCode: "function processIpcTask(packet) {\n  if (packet) {\n    if (packet.type === \"DIFF_APPLY\") {\n      if (packet.payload && packet.payload.patch) {\n        return applyPatchToDisk(packet.payload.patch);\n      }\n    }\n  }\n}",
                    diffLines: [
                        { type: "ctx", num: 1, text: " function processIpcTask(packet) {" },
                        { type: "del", num: 2, text: "-   if (packet) {" },
                        { type: "del", num: 3, text: "-     if (packet.type === \"DIFF_APPLY\") {" },
                        { type: "del", num: 4, text: "-       if (packet.payload && packet.payload.patch) {" },
                        { type: "del", num: 5, text: "-         return applyPatchToDisk(packet.payload.patch);" },
                        { type: "del", num: 6, text: "-       }" },
                        { type: "del", num: 7, text: "-     }" },
                        { type: "del", num: 8, text: "-   }" },
                        { type: "add", num: 2, text: "+   // Prime AI: Inverted conditionals to early return guard clauses" },
                        { type: "add", num: 3, text: "+   if (!packet || packet.type !== \"DIFF_APPLY\" || !packet.payload?.patch) {" },
                        { type: "add", num: 4, text: "+     return { success: false, error: \"ERR_MALFORMED_IPC_PACKET\" };" },
                        { type: "add", num: 5, text: "+   }" },
                        { type: "add", num: 6, text: "+   return applyPatchToDisk(packet.payload.patch);" },
                        { type: "ctx", num: 7, text: " }" }
                    ],
                    stats: { removed: 7, added: 5, status: "GUARD_CLAUSE_OPTIMIZED" }
                }
            ]
        },

        rewritebot: {
            id: "rewritebot",
            tag: "LIVE VERCEL SUITE",
            tagClass: "bg-amber-400 text-black",
            title: "RewriteBot — Open-Source Privacy-First AI Writing & Paraphrasing Suite",
            badges: [
                { text: "FASTIFY 4.X + REACT 18", class: "badge-amber" },
                { text: "TYPESCRIPT STRICT", class: "badge-lime" },
                { text: "PRISMA 5.X + REDIS", class: "badge-cobalt" },
                { text: "LIVE ON VERCEL", class: "badge-mint" }
            ],
            githubUrl: "https://github.com/lucky4-git1/rewritebot",
            liveUrl: "https://rewritebot-client.vercel.app/",
            auditDoc: null,
            summary: "A high-performance, self-hostable alternative to commercial paraphrase tools with zero subscriptions, BYO-AI flexibility, and Turnitin-grade originality auditing. Architected with Fastify, React 18, and Redis queues, RewriteBot provides sub-50ms lexical tokenization and streaming semantic transformations.",
            diagramHeadline: "FASTIFY REST / SSE STREAMING PIPELINE",
            stages: [
                {
                    num: "01",
                    name: "INGESTION & CLEAN",
                    sub: "POST /API/REWRITE",
                    files: "server/src/routes/rewrite.ts",
                    description: "Receives raw user prose, sanitizes markdown tokens, and checks character quota.",
                    metric: "UTF-8 Buffer"
                },
                {
                    num: "02",
                    name: "TOKENIZE & SCORE",
                    sub: "FLESCH-KINCAID SCAN",
                    files: "shared/src/metrics.ts",
                    description: "Computes baseline readability grade, sentence complexity, and passive voice density.",
                    metric: "Grade Level Index"
                },
                {
                    num: "03",
                    name: "SEMANTIC DISPATCH",
                    sub: "AI ENGINE ROUTER",
                    files: "server/src/services/aiRouter.ts",
                    description: "Dispatches structured prompt with selected tone parameters to local/cloud LLM endpoint.",
                    metric: "Zero-Data Retention"
                },
                {
                    num: "04",
                    name: "DIFF & SIMILARITY",
                    sub: "ORIGINALITY AUDIT",
                    files: "server/src/services/diffAudit.ts",
                    description: "Executes word-level Levenshtein diff matrix to compute plagiarism safety score.",
                    metric: "Similarity Matrix"
                },
                {
                    num: "05",
                    name: "STREAMING DISPATCH",
                    sub: "SSE RESPONSE STREAM",
                    files: "client/src/hooks/useRewriteStream.ts",
                    description: "Streams transformed text chunks directly into the React client with zero buffering lag.",
                    metric: "Fastify SSE Stream"
                }
            ],
            modes: [
                {
                    id: "technical",
                    label: "TECHNICAL EDITORIAL",
                    original: "We are utilizing an advanced artificial intelligence solution in order to facilitate the process of rewriting complex content so that it becomes much more easier for users to comprehend.",
                    transformed: "We employ a client-side AI engine to refactor dense documentation into concise, developer-first prose.",
                    metrics: { wordsBefore: 26, wordsAfter: 14, reduction: "-46%", readingEase: "+34 pts" }
                },
                {
                    id: "brutalist",
                    label: "BRUTALIST PUNCH",
                    original: "The software platform was specifically designed and engineered to eliminate all the unnecessary and bloated subscriptions that standard corporate software companies normally charge users for on a monthly recurring basis.",
                    transformed: "Zero subscriptions. No bloated monthly charges. Pure, high-performance software.",
                    metrics: { wordsBefore: 28, wordsAfter: 9, reduction: "-68%", readingEase: "+45 pts" }
                },
                {
                    id: "executive",
                    label: "EXECUTIVE BREVITY",
                    original: "In light of the fact that our team has completed comprehensive testing procedures across the entire workspace, we are hereby submitting our evaluation for your consideration.",
                    transformed: "Workspace testing is complete (161/161 tests passing). Ready for production deployment.",
                    metrics: { wordsBefore: 24, wordsAfter: 10, reduction: "-58%", readingEase: "+28 pts" }
                }
            ]
        },

        whatsapp: {
            id: "whatsapp",
            tag: "CLOUD WEBHOOK ARCHITECTURE",
            tagClass: "bg-green-500 text-black",
            title: "WhatsApp AI Automation Platform — Meta Cloud Webhook & Lead Routing",
            badges: [
                { text: "OFFICIAL META CLOUD API", class: "badge-mint" },
                { text: "TYPESCRIPT + NODE.JS", class: "badge-lime" },
                { text: "HMAC-SHA256 SIGNATURE AUTH", class: "badge-coral" },
                { text: "MULTI-TENANT INBOX", class: "badge-cobalt" }
            ],
            githubUrl: "https://github.com/lucky4-git1/whatsapp-ai-automation",
            liveUrl: null,
            auditDoc: null,
            summary: "A production-grade multi-tenant SaaS platform built in TypeScript for AI-powered customer communication. Interfaces directly with the official Meta WhatsApp Business Cloud API with HMAC signature verification, multi-language intent classification (English, Telugu, Hindi), visual workflow triggers, and human takeover capabilities.",
            diagramHeadline: "META CLOUD API WEBHOOK LIFECYCLE",
            stages: [
                {
                    num: "01",
                    name: "WEBHOOK INGEST",
                    sub: "POST /API/WHATSAPP",
                    files: "src/routes/webhook.ts",
                    description: "Receives raw HTTP POST from Meta Cloud servers with encrypted messaging payload.",
                    metric: "HTTP 200 Handshake"
                },
                {
                    num: "02",
                    name: "HMAC AUTH",
                    sub: "X-HUB-SIGNATURE-256",
                    files: "src/middleware/metaAuth.ts",
                    description: "Validates incoming payload against Meta App Secret using crypto.createHmac('sha256').",
                    metric: "Cryptographic Auth"
                },
                {
                    num: "03",
                    name: "INTENT CLASSIFIER",
                    sub: "MULTILINGUAL NLP",
                    files: "src/services/intentEngine.ts",
                    description: "Extracts customer message intent and classifies priority (Quote Request, Support, Lead).",
                    metric: "98.2% Confidence"
                },
                {
                    num: "04",
                    name: "CRM ROUTER",
                    sub: "POSTGRES / PRISMA",
                    files: "src/controllers/leadController.ts",
                    description: "Syncs customer record to PostgreSQL database, checks agent availability, and queues task.",
                    metric: "ACID Transaction"
                },
                {
                    num: "05",
                    name: "GRAPH API SEND",
                    sub: "DISPATCH RESPONSE",
                    files: "src/services/metaClient.ts",
                    description: "Sends contextual response or template back through Meta Graph API v19.0 endpoint.",
                    metric: "Meta Cloud Dispatch"
                }
            ],
            payloadSample: {
                object: "whatsapp_business_account",
                entry: [
                    {
                        id: "WABA_ID_98241",
                        changes: [
                            {
                                value: {
                                    messaging_product: "whatsapp",
                                    metadata: { display_phone_number: "+91 9876543210", phone_number_id: "PHONE_ID_0029" },
                                    contacts: [{ profile: { name: "Ananya Rao" }, wa_id: "919876543210" }],
                                    messages: [{ from: "919876543210", id: "wamid.HBgLOTE...", timestamp: "1729501830", text: { body: "Need enterprise license quote and setup timeline for Hyderabad branch." }, type: "text" }]
                                },
                                field: "messages"
                            }
                        ]
                    }
                ]
            }
        },

        ema: {
            id: "ema",
            tag: "CAMPAIGN QUEUE PIPELINE",
            tagClass: "bg-blue-400 text-black",
            title: "EMA Engine — TypeScript Email Marketing Automation & Delivery Queue",
            badges: [
                { text: "TYPESCRIPT STRICT", class: "badge-lime" },
                { text: "RATE-LIMITED WORKERS", class: "badge-cobalt" },
                { text: "DKIM / SPF VERIFICATION", class: "badge-coral" },
                { text: "CRON SCHEDULER", class: "badge-mint" }
            ],
            githubUrl: "https://github.com/lucky4-git1/EMA-email-market-automation",
            liveUrl: null,
            auditDoc: null,
            summary: "Email marketing automation pipeline written in TypeScript. Designed for reliable cold outreach scheduling, dynamic contact segmentation, DNS deliverability score monitoring (DKIM, SPF, DMARC), and rolling concurrency queue workers with rate limiting.",
            diagramHeadline: "TYPESCRIPT CAMPAIGN QUEUE PIPELINE",
            stages: [
                {
                    num: "01",
                    name: "CRON TRIGGER",
                    sub: "NODE-CRON SCHEDULER",
                    files: "src/jobs/campaignCron.ts",
                    description: "Fires scheduled campaign batch cycles based on recipient timezone rules.",
                    metric: "Timezone Aligned"
                },
                {
                    num: "02",
                    name: "SEGMENTATION",
                    sub: "DATABASE FILTER",
                    files: "src/services/audienceFilter.ts",
                    description: "Executes targeted queries to extract validated active contacts matching campaign tags.",
                    metric: "Filtered Query"
                },
                {
                    num: "03",
                    name: "DYNAMIC INJECT",
                    sub: "TEMPLATE ENGINE",
                    files: "src/templates/injector.ts",
                    description: "Populates personalized fields (Name, Company, Custom Repo Link) into HTML/text email body.",
                    metric: "Variable Mapping"
                },
                {
                    num: "04",
                    name: "DELIVERABILITY",
                    sub: "DNS & DKIM CHECK",
                    files: "src/utils/dnsVerify.ts",
                    description: "Pre-flight checks on domain reputation, reverse DNS, and SPF/DKIM authentication.",
                    metric: "DNS Score 99.8"
                },
                {
                    num: "05",
                    name: "WORKER DISPATCH",
                    sub: "THROTTLED QUEUE",
                    files: "src/workers/dispatchQueue.ts",
                    description: "Dispatches emails through rolling worker threads respecting SMTP provider rate limits.",
                    metric: "25 req / sec Cap"
                }
            ]
        }
    };

    let currentSystemKey = "simpleide";
    let activeStageIndex = 0;
    let activeScenarioIndex = 0;
    let activeRewriteModeIndex = 0;

    function initSignatureArchitectureExhibit() {
        const container = document.getElementById("archExhibitContent");
        const tabs = document.querySelectorAll(".arch-tab");
        if (!container) return;

        function setSystem(key) {
            currentSystemKey = key;
            activeStageIndex = 0;
            activeScenarioIndex = 0;
            activeRewriteModeIndex = 0;

            tabs.forEach(tab => {
                const isCurrent = tab.getAttribute("data-system") === key;
                tab.setAttribute("aria-selected", isCurrent ? "true" : "false");
                if (isCurrent) {
                    tab.classList.add("active", "bg-a1", "text-black");
                    tab.classList.remove("bg-card", "text-text");
                } else {
                    tab.classList.remove("active", "bg-a1", "text-black");
                    tab.classList.add("bg-card", "text-text");
                }
            });

            // Smooth entrance animation
            gsap.fromTo(container, 
                { opacity: 0, y: 16 }, 
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
            );

            renderSystem(key);
        }

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                if (window.sound && typeof window.sound.playClick === "function") {
                    window.sound.playClick();
                }
                const key = tab.getAttribute("data-system");
                if (key && key !== currentSystemKey) {
                    setSystem(key);
                }
            });
        });

        function renderSystem(key) {
            const data = ARCH_SYSTEMS[key] || ARCH_SYSTEMS.simpleide;
            let html = "";

            // 1. Featured Project Card
            html += `
                <div class="p-6 md:p-8 bg-card brutal-border brutal-shadow">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-border ${data.tagClass}">${data.tag}</span>
                            ${data.badges.map(b => `<span class="brutal-badge ${b.class}">${b.text}</span>`).join("")}
                        </div>
                        <div class="flex flex-wrap items-center gap-2.5">
                            <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="brutal-btn brutal-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                                <i class="ph-bold ph-github-logo text-sm"></i>
                                <span>INSPECT REPO</span>
                            </a>
                            ${data.liveUrl ? `
                                <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="brutal-btn brutal-btn-mint text-xs py-1.5 px-3 flex items-center gap-1.5">
                                    <i class="ph-bold ph-arrow-square-out text-sm"></i>
                                    <span>LIVE APP</span>
                                </a>
                            ` : ""}
                            ${data.auditDoc ? `
                                <a href="${data.auditDoc}" target="_blank" rel="noopener noreferrer" class="brutal-btn text-xs py-1.5 px-3 flex items-center gap-1.5 bg-card hover:bg-slate-200 dark:hover:bg-slate-800">
                                    <i class="ph-bold ph-file-text text-sm"></i>
                                    <span>ARCHITECTURE AUDIT</span>
                                </a>
                            ` : ""}
                        </div>
                    </div>

                    <h3 class="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-text">${data.title}</h3>
                    <p class="font-mono-label text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-5xl mb-6">
                        ${data.summary}
                    </p>

                    <!-- Interactive Workflow Explorer -->
                    <div class="mt-8 pt-6 border-t-2 border-border">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                            <div class="font-mono text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2">
                                <span class="w-2.5 h-2.5 bg-accent-1 rounded-none border border-black inline-block"></span>
                                <span>${data.diagramHeadline}</span>
                            </div>
                            <span class="font-mono text-[11px] text-slate-400">CLICK STAGE NODE TO INSPECT SUBSYSTEM</span>
                        </div>

                        <!-- Conduits & Nodes Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" id="workflowNodesGrid">
                            ${data.stages.map((st, idx) => `
                                <div class="workflow-node p-3.5 sm:p-4 font-mono ${idx === activeStageIndex ? "active-stage" : ""}" data-stage="${idx}">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <span class="text-xs font-black opacity-60">STAGE ${st.num}</span>
                                        <span class="text-[10px] font-bold px-1.5 py-0.5 bg-white/20 uppercase tracking-widest">${st.metric}</span>
                                    </div>
                                    <div class="font-black text-sm text-text leading-tight mb-1">${st.name}</div>
                                    <div class="text-[11px] opacity-70 font-bold truncate">${st.sub}</div>
                                </div>
                            `).join("")}
                        </div>

                        <!-- Active Stage Telemetry Detail Card -->
                        <div class="p-4 bg-bg brutal-border mt-3 font-mono" id="stageDetailCard">
                            <!-- Populated dynamically via updateStageDetailCard() -->
                        </div>
                    </div>
                </div>
            `;

            // 2. Interactive Bounded Demonstration Card
            if (key === "simpleide") {
                const sc = data.scenarios[activeScenarioIndex];
                html += `
                    <div class="p-6 md:p-8 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-lime">BOUNDED SANDBOX</span>
                                    <span class="font-mono text-[11px] text-slate-400 font-bold">[ DETERMINISTIC AST REFACTOR ENGINE ]</span>
                                </div>
                                <h4 class="text-xl sm:text-2xl font-black text-text">Prime AI Interactive Code Refactor & Diff Inspector</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-3 py-1.5 brutal-border">
                                <i class="ph-bold ph-shield-check text-green-500 mr-1.5"></i>SAFE BOUNDED EXECUTION
                            </div>
                        </div>

                        <!-- Scenario Selector Pills -->
                        <div class="flex flex-wrap items-center gap-2 mb-4">
                            <span class="font-mono text-xs font-bold uppercase text-slate-500 mr-2">SELECT CODE SCENARIO:</span>
                            ${data.scenarios.map((s, sIdx) => `
                                <button class="scenario-btn font-mono text-xs font-bold px-3 py-1.5 brutal-border transition-all ${sIdx === activeScenarioIndex ? "bg-a1 text-black font-black" : "bg-bg text-text hover:bg-slate-200 dark:hover:bg-slate-800"}" data-scenario="${sIdx}">
                                    ${s.name}
                                </button>
                            `).join("")}
                        </div>

                        <p class="font-mono text-xs text-slate-500 mb-4" id="scenarioDescText">
                            ${sc.desc}
                        </p>

                        <!-- Code Workbench Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <!-- Left: Editable Code Buffer -->
                            <div class="lg:col-span-6 flex flex-col code-workbench brutal-border">
                                <div class="flex items-center justify-between p-2.5 bg-[#171922] border-b border-[#252836] text-xs">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-bold ph-file-code text-accent-1"></i>
                                        <span class="font-bold text-white">workspace/activeBuffer.js</span>
                                    </div>
                                    <span class="text-[11px] text-slate-400 font-mono" id="charCountDisplay">Tokens ~54</span>
                                </div>
                                <textarea id="sandboxCodeInput" class="code-editor-area p-3 w-full h-[240px] focus:outline-none" spellcheck="false">${sc.inputCode}</textarea>
                                <div class="p-3 bg-[#13151D] border-t border-[#252836] flex flex-wrap items-center justify-between gap-2">
                                    <span class="telemetry-bar-pill">
                                        <i class="ph-bold ph-cpu text-accent-1"></i>DIRECTIVE: <strong id="currentDirectiveText">${sc.directive}</strong>
                                    </span>
                                    <button id="executeRefactorBtn" class="brutal-btn brutal-btn-primary text-xs py-1.5 px-4 font-mono font-bold flex items-center gap-1.5">
                                        <i class="ph-bold ph-lightning text-sm"></i>
                                        <span>EXECUTE PRIME AGENT PASS</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Right: Unified Diff Inspector -->
                            <div class="lg:col-span-6 flex flex-col code-workbench brutal-border">
                                <div class="flex items-center justify-between p-2.5 bg-[#171922] border-b border-[#252836] text-xs">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-bold ph-git-diff text-green-400"></i>
                                        <span class="font-bold text-white">Unified AST Diff Review</span>
                                    </div>
                                    <span class="text-[11px] text-accent-1 font-mono font-bold" id="diffStatusTag">IPC_READY</span>
                                </div>
                                <div class="diff-viewer p-2" id="sandboxDiffViewer">
                                    ${sc.diffLines.map(dl => `
                                        <div class="diff-line diff-line-${dl.type}">
                                            <span class="diff-line-num">${dl.num}</span>
                                            <code>${dl.text}</code>
                                        </div>
                                    `).join("")}
                                </div>
                                <div class="p-3 bg-[#13151D] border-t border-[#252836] flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
                                    <div class="flex items-center gap-3">
                                        <span class="text-green-400 font-bold" id="diffStatsAdd">+${sc.stats.added} additions</span>
                                        <span class="text-red-400 font-bold" id="diffStatsDel">-${sc.stats.removed} deletions</span>
                                    </div>
                                    <span class="text-[11px] text-slate-400" id="measuredLatencyText">LATENCY: 14.8ms (CLIENT LEXICAL)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (key === "rewritebot") {
                const md = data.modes[activeRewriteModeIndex];
                html += `
                    <div class="p-6 md:p-8 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-amber">LIVE DEMO REPRODUCIBLE</span>
                                    <span class="font-mono text-[11px] text-slate-400 font-bold">[ CLIENT-SIDE SEMANTIC ENGINE ]</span>
                                </div>
                                <h4 class="text-xl sm:text-2xl font-black text-text">RewriteBot Semantic Paraphrase & Tone Transformer</h4>
                            </div>
                            <a href="https://rewritebot-client.vercel.app/" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-amber-500 hover:underline flex items-center gap-1 font-bold">
                                <span>OPEN PRODUCTION APP</span>
                                <i class="ph-bold ph-arrow-up-right"></i>
                            </a>
                        </div>

                        <!-- Mode Selector Pills -->
                        <div class="flex flex-wrap items-center gap-2 mb-4">
                            <span class="font-mono text-xs font-bold uppercase text-slate-500 mr-2">SELECT TONE DIRECTIVE:</span>
                            ${data.modes.map((m, mIdx) => `
                                <button class="rewrite-mode-btn font-mono text-xs font-bold px-3 py-1.5 brutal-border transition-all ${mIdx === activeRewriteModeIndex ? "bg-amber-400 text-black font-black" : "bg-bg text-text hover:bg-slate-200 dark:hover:bg-slate-800"}" data-mode="${mIdx}">
                                    ${m.label}
                                </button>
                            `).join("")}
                        </div>

                        <!-- Side-by-Side Comparison -->
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div class="lg:col-span-6 p-4 bg-bg brutal-border flex flex-col justify-between">
                                <div>
                                    <span class="font-mono text-xs font-bold uppercase text-slate-500 mb-2 block">RAW INPUT PROSE:</span>
                                    <p class="font-mono text-xs sm:text-sm text-text leading-relaxed" id="rewriteInputText">${md.original}</p>
                                </div>
                                <div class="mt-4 pt-3 border-t border-border flex justify-between items-center font-mono text-xs text-slate-500">
                                    <span>WORD COUNT: <strong class="text-text">${md.metrics.wordsBefore}</strong></span>
                                    <span>PASSIVE VOICE: DETECTED</span>
                                </div>
                            </div>

                            <div class="lg:col-span-6 p-4 bg-[#0C0D10] text-[#E0E2EC] brutal-border flex flex-col justify-between">
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-mono text-xs font-bold uppercase text-amber-400">TRANSFORMED COPY:</span>
                                        <span class="text-[11px] font-mono text-green-400 font-bold">${md.metrics.reduction} WORDS</span>
                                    </div>
                                    <p class="font-mono text-xs sm:text-sm text-white font-bold leading-relaxed" id="rewriteOutputText">${md.transformed}</p>
                                </div>
                                <div class="mt-4 pt-3 border-t border-white/20 flex flex-wrap justify-between items-center font-mono text-xs text-slate-400 gap-2">
                                    <span>READING EASE: <strong class="text-accent-1">${md.metrics.readingEase}</strong></span>
                                    <span>FASTIFY LATENCY: <strong class="text-white">~32ms</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (key === "whatsapp") {
                html += `
                    <div class="p-6 md:p-8 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-mint">WEBHOOK PAYLOAD INSPECTOR</span>
                                    <span class="font-mono text-[11px] text-slate-400 font-bold">[ VERIFIED META GRAPH API SCHEMA ]</span>
                                </div>
                                <h4 class="text-xl sm:text-2xl font-black text-text">Meta WhatsApp Business Cloud API Inbound Pipeline</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-3 py-1.5 brutal-border">
                                <i class="ph-bold ph-key text-amber-500 mr-1.5"></i>HMAC-SHA256 AUTHENTICATED
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div class="lg:col-span-7 code-workbench p-4 brutal-border">
                                <div class="flex justify-between items-center text-xs text-slate-400 mb-2 border-b border-white/10 pb-2">
                                    <span class="text-green-400 font-bold">POST /api/whatsapp/webhook</span>
                                    <span>HEADER: X-Hub-Signature-256</span>
                                </div>
                                <pre class="text-[11px] font-mono overflow-x-auto text-slate-300 leading-relaxed max-h-[260px]">${JSON.stringify(data.payloadSample, null, 2)}</pre>
                            </div>
                            <div class="lg:col-span-5 p-4 bg-bg brutal-border flex flex-col justify-between font-mono">
                                <div>
                                    <span class="text-xs font-bold uppercase text-slate-500 mb-2 block">INTENT CLASSIFIER & ROUTING TELEMETRY:</span>
                                    <div class="space-y-2 text-xs">
                                        <div class="p-2 bg-card brutal-border">
                                            <span class="text-slate-500 text-[10px] block">DETECTED INTENT</span>
                                            <strong class="text-green-600 dark:text-green-400">COMMERCIAL_INQUIRY [HIGH_PRIORITY]</strong>
                                        </div>
                                        <div class="p-2 bg-card brutal-border">
                                            <span class="text-slate-500 text-[10px] block">ROUTING TARGET</span>
                                            <strong class="text-text">Hyderabad Enterprise Sales Tier-1</strong>
                                        </div>
                                        <div class="p-2 bg-card brutal-border">
                                            <span class="text-slate-500 text-[10px] block">DISPATCH ACTION</span>
                                            <strong class="text-accent-3">Meta Graph API v19.0 Template Response</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-4 pt-3 border-t border-border text-[11px] text-slate-500 flex justify-between">
                                    <span>STATUS: HTTP 200 HANDSHAKE</span>
                                    <span>DB: PRISMA / POSTGRES</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (key === "ema") {
                html += `
                    <div class="p-6 md:p-8 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-cobalt">QUEUE TELEMETRY</span>
                                    <span class="font-mono text-[11px] text-slate-400 font-bold">[ TYPESCRIPT CRON & WORKER POOL ]</span>
                                </div>
                                <h4 class="text-xl sm:text-2xl font-black text-text">EMA Campaign Queue & Deliverability Pipeline</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-3 py-1.5 brutal-border">
                                <i class="ph-bold ph-clock text-blue-500 mr-1.5"></i>SCHEDULED CONCURRENCY
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono">
                            <div class="p-3 bg-bg brutal-border">
                                <span class="text-[10px] text-slate-500 uppercase block">ACTIVE POOL</span>
                                <strong class="text-base text-text">8 WORKER THREADS</strong>
                            </div>
                            <div class="p-3 bg-bg brutal-border">
                                <span class="text-[10px] text-slate-500 uppercase block">RATE LIMIT CAP</span>
                                <strong class="text-base text-blue-500">25 REQ / SEC</strong>
                            </div>
                            <div class="p-3 bg-bg brutal-border">
                                <span class="text-[10px] text-slate-500 uppercase block">DKIM / SPF SCORE</span>
                                <strong class="text-base text-green-500">99.8 / 100 PASS</strong>
                            </div>
                            <div class="p-3 bg-bg brutal-border">
                                <span class="text-[10px] text-slate-500 uppercase block">TRANSACTION STATE</span>
                                <strong class="text-base text-accent-1">ACID QUEUE ACTIVE</strong>
                            </div>
                        </div>

                        <div class="p-4 bg-[#0C0D10] text-[#E0E2EC] brutal-border font-mono text-xs">
                            <div class="flex justify-between items-center mb-2 text-slate-400 border-b border-white/10 pb-2">
                                <span class="text-blue-400 font-bold">[WORKER_LOG] Batch Pipeline Q4_TECH_FOUNDERS</span>
                                <span>CONCURRENCY_SAFE</span>
                            </div>
                            <div class="space-y-1 text-slate-300">
                                <div>[00:00:01] Ingested candidate list: 3,420 targets from audience query.</div>
                                <div>[00:00:02] Cleaned invalid MX records: 3,420 -> 412 verified recipient mailboxes.</div>
                                <div>[00:00:03] Injecting personalized GitHub repository references into template payload.</div>
                                <div class="text-green-400 font-bold">[00:00:04] DNS handshake confirmed. Rolling worker pool dispatching at 25 req/sec.</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;

            // Bind Node Click Handlers
            const nodeElements = container.querySelectorAll(".workflow-node");
            nodeElements.forEach(n => {
                n.addEventListener("click", () => {
                    const idx = parseInt(n.getAttribute("data-stage"), 10);
                    if (!isNaN(idx)) {
                        activeStageIndex = idx;
                        nodeElements.forEach(el => el.classList.remove("active-stage"));
                        n.classList.add("active-stage");
                        updateStageDetailCard(data, idx);
                        if (window.sound && typeof window.sound.playClick === "function") {
                            window.sound.playClick();
                        }
                    }
                });
            });

            updateStageDetailCard(data, activeStageIndex);

            // Bind SimpleIDE Scenario Handlers
            if (key === "simpleide") {
                const scenarioBtns = container.querySelectorAll(".scenario-btn");
                const codeInput = document.getElementById("sandboxCodeInput");
                const currentDirectiveText = document.getElementById("currentDirectiveText");
                const scenarioDescText = document.getElementById("scenarioDescText");
                const diffViewer = document.getElementById("sandboxDiffViewer");
                const diffStatsAdd = document.getElementById("diffStatsAdd");
                const diffStatsDel = document.getElementById("diffStatsDel");
                const executeBtn = document.getElementById("executeRefactorBtn");
                const diffStatusTag = document.getElementById("diffStatusTag");
                const latencyText = document.getElementById("measuredLatencyText");

                scenarioBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const sIdx = parseInt(btn.getAttribute("data-scenario"), 10);
                        if (!isNaN(sIdx)) {
                            activeScenarioIndex = sIdx;
                            scenarioBtns.forEach(b => {
                                b.classList.remove("bg-a1", "text-black", "font-black");
                                b.classList.add("bg-bg", "text-text");
                            });
                            btn.classList.add("bg-a1", "text-black", "font-black");
                            btn.classList.remove("bg-bg", "text-text");

                            const chosen = data.scenarios[sIdx];
                            if (codeInput) codeInput.value = chosen.inputCode;
                            if (currentDirectiveText) currentDirectiveText.innerText = chosen.directive;
                            if (scenarioDescText) scenarioDescText.innerText = chosen.desc;

                            // Reset diff viewer
                            if (diffViewer) {
                                diffViewer.innerHTML = chosen.diffLines.map(dl => `
                                    <div class="diff-line diff-line-${dl.type}">
                                        <span class="diff-line-num">${dl.num}</span>
                                        <code>${dl.text}</code>
                                    </div>
                                `).join("");
                            }
                            if (diffStatsAdd) diffStatsAdd.innerText = `+${chosen.stats.added} additions`;
                            if (diffStatsDel) diffStatsDel.innerText = `-${chosen.stats.removed} deletions`;
                            if (diffStatusTag) diffStatusTag.innerText = "IPC_READY";
                            if (window.sound && typeof window.sound.playClick === "function") {
                                window.sound.playClick();
                            }
                        }
                    });
                });

                if (executeBtn) {
                    executeBtn.addEventListener("click", () => {
                        const tStart = performance.now();
                        executeBtn.disabled = true;
                        executeBtn.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-sm"></i> PARSING AST...`;

                        // Animate through workflow nodes progressively
                        const nodes = container.querySelectorAll(".workflow-node");
                        let step = 0;
                        const interval = setInterval(() => {
                            if (step < nodes.length) {
                                nodes.forEach(n => n.classList.remove("active-stage"));
                                nodes[step].classList.add("active-stage");
                                updateStageDetailCard(data, step);
                                step++;
                            } else {
                                clearInterval(interval);
                                const tEnd = performance.now();
                                const duration = (tEnd - tStart).toFixed(1);

                                executeBtn.disabled = false;
                                executeBtn.innerHTML = `<i class="ph-bold ph-check-circle text-sm text-green-400"></i> AGENT PASS COMPLETE`;
                                if (diffStatusTag) diffStatusTag.innerText = "DIFF_VERIFIED_CLEAN";
                                if (latencyText) latencyText.innerText = `LATENCY: ${duration}ms (MEASURED VIA PERFORMANCE.NOW)`;

                                if (window.sound && typeof window.sound.playSuccess === "function") {
                                    window.sound.playSuccess();
                                }

                                setTimeout(() => {
                                    executeBtn.innerHTML = `<i class="ph-bold ph-lightning text-sm"></i> EXECUTE PRIME AGENT PASS`;
                                }, 2500);
                            }
                        }, 90);
                    });
                }
            }

            // Bind RewriteBot Mode Handlers
            if (key === "rewritebot") {
                const modeBtns = container.querySelectorAll(".rewrite-mode-btn");
                const inputText = document.getElementById("rewriteInputText");
                const outputText = document.getElementById("rewriteOutputText");

                modeBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const mIdx = parseInt(btn.getAttribute("data-mode"), 10);
                        if (!isNaN(mIdx)) {
                            activeRewriteModeIndex = mIdx;
                            modeBtns.forEach(b => {
                                b.classList.remove("bg-amber-400", "text-black", "font-black");
                                b.classList.add("bg-bg", "text-text");
                            });
                            btn.classList.add("bg-amber-400", "text-black", "font-black");
                            btn.classList.remove("bg-bg", "text-text");

                            const chosen = data.modes[mIdx];
                            if (inputText) inputText.innerText = chosen.original;
                            if (outputText) outputText.innerText = chosen.transformed;

                            if (window.sound && typeof window.sound.playClick === "function") {
                                window.sound.playClick();
                            }
                        }
                    });
                });
            }
        }

        function updateStageDetailCard(data, stageIdx) {
            const card = document.getElementById("stageDetailCard");
            const stage = data.stages[stageIdx] || data.stages[0];
            if (!card) return;

            card.innerHTML = `
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black bg-accent-1 text-black px-2 py-0.5">STAGE ${stage.num}</span>
                        <strong class="text-sm font-black text-text">${stage.name} // ${stage.sub}</strong>
                    </div>
                    <span class="text-[11px] text-slate-500 font-bold truncate">SOURCE: ${stage.files}</span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ${stage.description}
                </p>
            `;
        }

        // Initialize default view
        setSystem("simpleide");
    }


    /* ========================================================
       7. PROJECT DATA & DEEP-DIVE MODAL GALLERY
       ======================================================== */
    const projectsData = {
        hyperpure: {
            title: "Hyperpure UI/UX Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/hyperpure1.png",
                "images/hyperpurecheckout.png",
                "images/hyperpureorderplaced.png"
            ],
            desc: "A complete UI recreation of the Hyperpure platform built using HTML, CSS, JavaScript and Bootstrap. The project includes responsive layouts, product sections, cart UI and checkout page design. It focuses on modern UI patterns and realistic e-commerce interface behavior.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Hyperpure/",
            gitUrl: "https://github.com/lucky4-git1/Hyperpure",
            highlights: [
                "Complete UI recreation of Hyperpure website with product catalog and checkout flow",
                "Dynamic cart functionality with live quantity adjustments and price calculations",
                "Fully responsive design and realistic e-commerce interface behavior"
            ]
        },
        mutube: {
            title: "MuTube personal media player",
            category: "app",
            badge: "JavaScript App",
            images: [
                "images/mutube.png",
                "images/mutubemodal.jpg",
                "images/mutubevid.jpeg",
                "images/mutubeplaylist.jpeg",
                "images/mutubeupload.jpeg"
            ],
            desc: "A personal media player web app called MuTube built with HTML, CSS and JavaScript. It features a modern UI design with a dark theme, a responsive layout that works on all devices, and interactive controls for playing audio and video files. Users can create playlists, shuffle songs, and view media information. The app focuses on providing a sleek and user-friendly experience for managing and enjoying personal media collections, with persistent data storage using IndexedDB to save user playlists and preferences.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "IndexedDB"],
            liveUrl: "https://lucky4-git1.github.io/MuTube-media-player-v1.0/",
            gitUrl: "https://github.com/lucky4-git1/MuTube-media-player-v1.0.git",
            highlights: [
                "Offline MP3 & MP4 media player with custom player controls and equalizer themes",
                "Persistent client-side data storage using IndexedDB for playlists and user preferences",
                "Interactive playlist creation, drag-and-drop, track shuffle, and dark theme UI"
            ]
        },
        atherone: {
            title: "Atherone 3D scrollytelling web-app made with spline",
            category: "app",
            badge: "Experiments & 3D",
            images: [
                "images/atherone1.jpeg",
                "images/atherone2.jpeg",
                "images/atherone3.jpeg"
            ],
            desc: "Web product design and development project. A 3D scrollytelling web-app made with Spline, showcasing a fictional space exploration company called Atherone. The app features interactive 3D models, smooth scrolling animations, and a modern design aesthetic. It serves as a portfolio piece demonstrating skills in 3D web development, user experience design, and creative storytelling through web technologies.",
            tech: ["HTML", "React", "GSAP", "Spline", "TypeScript", "Tailwind CSS"],
            liveUrl: "https://atherone-scrolly-app.netlify.app/",
            gitUrl: "https://github.com/lucky4-git1/atherone.git",
            highlights: [
                "Interactive 3D models integrated into React using Spline 3D viewport canvas",
                "Smooth cinematic scrolling animations tied to GSAP ScrollTrigger",
                "Deployed live on Netlify showcasing creative storytelling and modern aesthetics"
            ]
        },
        district: {
            title: "District UI/UX Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/district (1).png",
                "images/district (2).png",
                "images/district3.jpeg",
                "images/district4.jpeg"
            ],
            desc: "UI/UX recreation of District home page UI clone using pure HTML, CSS and JavaScript. Fully responsive and interactive clone with modern design and animations.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/District-UI-clone/",
            gitUrl: "https://github.com/lucky4-git1/District-UI-clone.git",
            highlights: [
                "Recreation of District lifestyle and event platform with micro-interactions",
                "Fully responsive layout and navigation across mobile and desktop devices",
                "Pure front-end engineering with clean modern aesthetics"
            ]
        },
        youtube: {
            title: "YouTube UI/UX Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/yt1 (2).png",
                "images/yt1 (1).png"
            ],
            desc: "UI/UX recreation of YouTube home page UI clone using pure HTML, CSS and JavaScript. Fully responsive and interactive clone with modern design and animations. Features a collapsible sidebar, dynamic video browsing page with video player, and comments section.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Youtube-UI-clone-/",
            gitUrl: "https://github.com/lucky4-git1/Youtube-UI-clone-.git",
            highlights: [
                "Fully responsive YouTube video browsing layout with sticky glass navbar",
                "Collapsible dual-state sidebar and dynamic video viewing interface",
                "Hover video previews and search suggestion interactions"
            ]
        },
        blinkit: {
            title: "Blinkit Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/blinkit1.jpeg",
                "images/blinkit3.jpeg",
                "images/blinkit2.jpeg"
            ],
            desc: "UI recreation of Blinkit website using Bootstrap. Focus on responsive design and modern aesthetics. Fully optimized, easy to understand quick-commerce interface clone.",
            tech: ["HTML", "CSS", "Bootstrap", "JavaScript"],
            liveUrl: "https://lucky4-git1.github.io/Blinkit-UI-clone/",
            gitUrl: "https://github.com/lucky4-git1/Blinkit-UI-clone.git",
            highlights: [
                "Optimized responsive layout recreating Blinkit quick-commerce homepage",
                "Category carousels and quick-add product card interactions",
                "Fast loading and mobile-first responsive architecture"
            ]
        },
        tspsc: {
            title: "TSPSC Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/tspschome.jpeg",
                "images/tspsc landing pg.jpeg"
            ],
            desc: "This is a UI clone of the TSPSC website made by me as a front-end project. It is coded in HTML, CSS, and Bootstrap. Focus on responsive design and modern portal aesthetics.",
            tech: ["HTML", "CSS", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Tspsc-UI-clone-/",
            gitUrl: "https://github.com/lucky4-git1/Tspsc-UI-clone-.git",
            highlights: [
                "Government public service commission portal layout recreation",
                "Responsive navigation, announcements feed, and candidate portal UI",
                "Built with semantic HTML, CSS, and Bootstrap components"
            ]
        },
        amazon: {
            title: "Amazon UI Clone",
            category: "clone",
            badge: "UI/UX Clone",
            images: [
                "images/amazon2.jpeg",
                "images/Screenshot_6-2-2026_222837_lucky4-git1.github.io.jpeg"
            ],
            desc: "UI recreation of Amazon website UI clone using pure HTML and CSS. Featuring multi-tier mega header, delivery selector, category banners, and responsive product grids.",
            tech: ["HTML", "CSS"],
            liveUrl: "https://lucky4-git1.github.io/amazon-ui-clone/",
            gitUrl: "https://github.com/lucky4-git1/amazon-ui-clone.git",
            highlights: [
                "Pure HTML & CSS recreation of Amazon e-commerce layout without frameworks",
                "Complex header navigation, multi-column mega menu, and product grids",
                "Accurate responsive breakpoints and layout precision"
            ]
        },
        cricket: {
            title: "TOP INDIAN CRICKETERS",
            category: "app",
            badge: "Experiments",
            images: [
                "images/cricket.jpeg",
                "images/cricketcv.jpeg"
            ],
            desc: "A modern cards list of famous Indian Cricketers with changing gradient background and live Wikipedia page link, and an about me section.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/my-top-Indian-Cricketers-list/",
            gitUrl: "https://github.com/lucky4-git1/my-top-Indian-Cricketers-list",
            highlights: [
                "Interactive athlete cards with dynamic animated gradient backgrounds",
                "Live Wikipedia article links and profile information",
                "Responsive card grid built with Bootstrap and JavaScript"
            ]
        },
        simpleide: {
            title: "SimpleIDE",
            category: "ai",
            badge: "AI Desktop Tool",
            images: [],
            desc: "SimpleIDE is an open-source AI-powered desktop IDE built with Electron, React, and Vite. It features an integrated AI agent, lightweight modern UI, and developer-focused workflows for rapid prototyping and productivity.",
            tech: ["Electron", "React", "Vite", "JavaScript", "AI Agent"],
            liveUrl: "https://github.com/lucky4-git1/SimpleIDE",
            gitUrl: "https://github.com/lucky4-git1/SimpleIDE",
            highlights: [
                "Open-source AI-powered desktop code editor built on Electron & React",
                "Integrated autonomous coding agent for rapid local developer productivity",
                "Lightweight UI and modular developer workflow architecture"
            ]
        },
        rewritebot: {
            title: "RewriteBot",
            category: "ai",
            badge: "AI Web App (Vercel)",
            images: [],
            desc: "AI-powered writing and copy refactor tool deployed live on Vercel at rewritebot-client.vercel.app. Transforms text into clear, punchy, professional output.",
            tech: ["TypeScript", "React", "Next.js", "Vercel", "AI"],
            liveUrl: "https://rewritebot-client.vercel.app",
            gitUrl: "https://github.com/lucky4-git1/rewritebot",
            highlights: [
                "Deployed live in production on Vercel at rewritebot-client.vercel.app",
                "Instant AI text refactoring with tone adjustments and copy optimization",
                "Clean responsive interface built with TypeScript and Next.js"
            ]
        },
        gitdrop: {
            title: "Gitdrop",
            category: "ai",
            badge: "Web App (Vercel)",
            images: [],
            desc: "Web application built with TypeScript and deployed live on Vercel at gitdrop-three.vercel.app.",
            tech: ["TypeScript", "Next.js", "Vercel"],
            liveUrl: "https://gitdrop-three.vercel.app",
            gitUrl: "https://github.com/lucky4-git1/Gitdrop",
            highlights: [
                "Deployed live on Vercel at gitdrop-three.vercel.app",
                "Modern TypeScript web architecture with fast load times"
            ]
        },
        whatsappai: {
            title: "WhatsApp AI Automation",
            category: "ai",
            badge: "AI Automation",
            images: [],
            desc: "Automated WhatsApp workflow with AI integration for customer conversation and message handling. Built with TypeScript and Node.js.",
            tech: ["TypeScript", "Node.js", "WhatsApp API", "AI"],
            liveUrl: "https://github.com/lucky4-git1/whatsapp-ai-automation",
            gitUrl: "https://github.com/lucky4-git1/whatsapp-ai-automation",
            highlights: [
                "Autonomous WhatsApp message processing and customer conversation pipeline",
                "Webhook-driven integration connecting to AI models for intelligent replies"
            ]
        },
        ema: {
            title: "EMA (Email Market Automation)",
            category: "ai",
            badge: "Marketing Pipeline",
            images: [],
            desc: "Email marketing automation system built in TypeScript for campaign workflows and automated communications.",
            tech: ["TypeScript", "Node.js", "Automation"],
            liveUrl: "https://github.com/lucky4-git1/EMA-email-market-automation",
            gitUrl: "https://github.com/lucky4-git1/EMA-email-market-automation",
            highlights: [
                "Automated email marketing scheduling and campaign execution pipeline",
                "TypeScript backend structured for reliable queue processing"
            ]
        }
    };

    // Filter Logic
    const filterTabs = document.querySelectorAll(".filter-tab");
    const projectCards = document.querySelectorAll(".project-card-wrap");

    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            sound.playClick();
            filterTabs.forEach(t => {
                t.classList.remove("bg-a1", "text-black");
                t.classList.add("bg-card", "text-text");
            });
            tab.classList.add("bg-a1", "text-black");
            tab.classList.remove("bg-card", "text-text");

            const filter = tab.getAttribute("data-filter");

            projectCards.forEach(card => {
                const category = card.getAttribute("data-category");
                const shouldShow = filter === "all" || category === filter;
                
                if (shouldShow) {
                    card.style.display = "block";
                    gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // Modal Gallery State & Controls
    const projectModal = document.getElementById("projectModal");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
    const modalBadge = document.getElementById("modalBadge");
    const modalDesc = document.getElementById("modalDesc");
    const modalTech = document.getElementById("modalTech");
    const modalHighlights = document.getElementById("modalHighlights");
    const modalLive = document.getElementById("modalLive");
    const modalGit = document.getElementById("modalGit");
    const modalSliderImg = document.getElementById("modalSliderImg");
    const modalPrev = document.getElementById("modalPrev");
    const modalNext = document.getElementById("modalNext");
    const modalCounter = document.getElementById("modalCounter");

    let currentProject = null;
    let currentImageIndex = 0;

    function openProjectModal(key) {
        const p = projectsData[key];
        if (!p) return;
        currentProject = p;
        currentImageIndex = 0;

        sound.playClick();

        if (modalTitle) modalTitle.innerText = p.title;
        if (modalBadge) modalBadge.innerText = p.badge;
        if (modalDesc) modalDesc.innerText = p.desc;

        if (modalTech) {
            modalTech.innerHTML = p.tech.map(t => `<span class="brutal-badge badge-lime">${t}</span>`).join(" ");
        }

        if (modalHighlights) {
            modalHighlights.innerHTML = p.highlights.map(h => `<li class="flex items-start gap-2 mb-2"><i class="ph-bold ph-check-circle text-a4 mt-1"></i><span>${h}</span></li>`).join("");
        }

        if (modalLive) {
            modalLive.href = p.liveUrl;
            modalLive.style.display = p.liveUrl ? "inline-flex" : "none";
        }

        if (modalGit) {
            modalGit.href = p.gitUrl;
            modalGit.style.display = p.gitUrl ? "inline-flex" : "none";
        }

        updateModalImage();

        projectModal.classList.add("active");
        projectModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function updateModalImage() {
        if (!currentProject) return;
        const modalMediaWrap = modalSliderImg ? modalSliderImg.parentElement : null;
        let fallbackBanner = document.getElementById("modalFallbackBanner");

        if (!currentProject.images || !currentProject.images.length) {
            if (modalSliderImg) modalSliderImg.style.display = "none";
            if (modalCounter) modalCounter.innerText = "REPO ASSET";
            if (!fallbackBanner && modalMediaWrap) {
                fallbackBanner = document.createElement("div");
                fallbackBanner.id = "modalFallbackBanner";
                fallbackBanner.className = "w-full h-full flex flex-col items-center justify-center p-8 text-center font-mono";
                modalMediaWrap.appendChild(fallbackBanner);
            }
            if (fallbackBanner) {
                fallbackBanner.style.display = "flex";
                fallbackBanner.innerHTML = `
                    <div class="w-16 h-16 bg-a1 text-black brutal-border flex items-center justify-center text-3xl mb-4 font-black">
                        <i class="ph-bold ph-terminal-window"></i>
                    </div>
                    <div class="text-xl font-black text-white uppercase mb-2">${currentProject.title}</div>
                    <p class="text-xs text-slate-300 max-w-md">${currentProject.desc}</p>
                `;
            }
            if (modalPrev) modalPrev.style.display = "none";
            if (modalNext) modalNext.style.display = "none";
            return;
        }

        if (fallbackBanner) fallbackBanner.style.display = "none";
        if (modalSliderImg) {
            modalSliderImg.style.display = "block";
            modalSliderImg.src = currentProject.images[currentImageIndex];
            modalSliderImg.alt = `${currentProject.title} screenshot ${currentImageIndex + 1}`;
        }
        if (modalCounter) {
            modalCounter.innerText = `${currentImageIndex + 1} / ${currentProject.images.length}`;
        }
        if (modalPrev) modalPrev.style.display = currentProject.images.length > 1 ? "inline-flex" : "none";
        if (modalNext) modalNext.style.display = currentProject.images.length > 1 ? "inline-flex" : "none";
    }

    function prevModalImage() {
        if (!currentProject || !currentProject.images.length) return;
        sound.playClick();
        currentImageIndex = (currentImageIndex - 1 + currentProject.images.length) % currentProject.images.length;
        updateModalImage();
    }

    function nextModalImage() {
        if (!currentProject || !currentProject.images.length) return;
        sound.playClick();
        currentImageIndex = (currentImageIndex + 1) % currentProject.images.length;
        updateModalImage();
    }

    function closeProjectModal() {
        sound.playClick();
        projectModal.classList.remove("active");
        projectModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (modalPrev) modalPrev.addEventListener("click", prevModalImage);
    if (modalNext) modalNext.addEventListener("click", nextModalImage);
    if (modalClose) modalClose.addEventListener("click", closeProjectModal);

    projectModal.addEventListener("click", (e) => {
        if (e.target === projectModal) closeProjectModal();
    });

    document.addEventListener("keydown", (e) => {
        if (!projectModal.classList.contains("active")) return;
        if (e.key === "Escape") closeProjectModal();
        if (e.key === "ArrowLeft") prevModalImage();
        if (e.key === "ArrowRight") nextModalImage();
    });

    // Attach open triggers on all project cards
    document.querySelectorAll(".open-modal-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const projectKey = btn.getAttribute("data-project");
            openProjectModal(projectKey);
        });
    });


    /* ========================================================
       8. NUMBER COUNTERS (ScrollTrigger)
       ======================================================== */
    const counters = document.querySelectorAll(".number-counter");
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");

        ScrollTrigger.create({
            trigger: counter,
            start: "top 90%",
            once: true,
            onEnter: () => {
                if (!motionEnabled) {
                    counter.innerText = target + "+";
                    return;
                }
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: "power2.out",
                    onUpdate: () => {
                        counter.innerText = Math.floor(obj.val) + "+";
                    }
                });
            }
        });
    });


    
    /* ========================================================
       8b. ANIMATED SKILL BARS (ScrollTrigger)
       ======================================================== */
    const skillBars = document.querySelectorAll(".skill-bar-fill");
    if (skillBars.length) {
        ScrollTrigger.create({
            trigger: "#skills",
            start: "top 80%",
            once: true,
            onEnter: () => {
                skillBars.forEach((bar, idx) => {
                    const targetWidth = bar.getAttribute("data-width") || "80%";
                    const targetNum = parseInt(targetWidth, 10) || 80;
                    const row = bar.closest(".skill-row");
                    const pctEl = row ? row.querySelector(".skill-pct") : null;

                    // Animate the bar width with smooth spring-like ease
                    gsap.to(bar, {
                        width: targetWidth,
                        duration: 1.2,
                        delay: (idx % 4) * 0.1 + Math.floor(idx / 4) * 0.15,
                        ease: "power2.out"
                    });

                    // Animate the percentage number counting up
                    if (pctEl && motionEnabled) {
                        const counterObj = { val: 0 };
                        gsap.to(counterObj, {
                            val: targetNum,
                            duration: 1.2,
                            delay: (idx % 4) * 0.1 + Math.floor(idx / 4) * 0.15,
                            ease: "power2.out",
                            onUpdate: () => {
                                pctEl.innerText = `${Math.round(counterObj.val)}%`;
                            }
                        });
                    }
                });
            }
        });
    }

    /* ========================================================
       9. GSAP REVEALS & ENTRANCE ANIMATIONS
       ======================================================== */
    if (motionEnabled) {
        // .hero-anim reveal is handled by initCinematicHeroTransition scroll timeline

        gsap.utils.toArray(".gs-section-header").forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: "top 85%"
                },
                y: 40,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out"
            });
        });

        gsap.utils.toArray(".project-card-wrap").forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%"
                },
                y: 50,
                opacity: 0,
                duration: 0.65,
                ease: "power3.out"
            });
        });
    }


    /* ========================================================
       10. LIVE HYDERABAD CLOCK & TIMEZONE
       ======================================================== */
    const timeEl = document.getElementById("currentTime");
    if (timeEl) {
        const updateTime = () => {
            // Hyderabad is IST (UTC+5:30)
            const now = new Date();
            const options = { timeZone: "Asia/Kolkata", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" };
            const timeStr = now.toLocaleTimeString("en-US", options);
            if (timeEl) timeEl.innerText = timeStr;
            document.querySelectorAll(".currentTimeStream").forEach(el => el.innerText = timeStr);
        };
        updateTime();
        setInterval(updateTime, 1000);
    }


    /* ========================================================
       11. MOBILE MENU TOGGLE
       ======================================================== */
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");

    let menuOpen = false;
    function setMobileMenu(open) {
        menuOpen = open;
        mobileMenu.style.transform = open ? "translateY(0)" : "translateY(-100%)";
        mobileBtn.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
        sound.playClick();
    }

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener("click", () => setMobileMenu(!menuOpen));
        mobileLinks.forEach(l => l.addEventListener("click", () => setMobileMenu(false)));
    }


    /* ========================================================
       12. CONTACT FORM FEEDBACK & DIRECT COPY
       ======================================================== */
    const contactForm = document.getElementById("contactForm");
    const copyEmailBtn = document.getElementById("copyEmailBtn");

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", () => {
            sound.playClick();
            navigator.clipboard.writeText("sriyuthk122@gmail.com").then(() => {
                const originalText = copyEmailBtn.innerText;
                copyEmailBtn.innerText = "COPIED TO CLIPBOARD!";
                copyEmailBtn.classList.add("bg-a4", "text-black");
                sound.playSuccess();
                setTimeout(() => {
                    copyEmailBtn.innerText = originalText;
                    copyEmailBtn.classList.remove("bg-a4", "text-black");
                }, 2000);
            });
        });
    }

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sound.playSuccess();
            const btn = contactForm.querySelector("button[type='submit']");
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="ph-bold ph-check-circle text-xl"></i> TRANSMISSION DELIVERED!`;
            btn.classList.remove("brutal-btn-primary");
            btn.classList.add("brutal-btn-mint");

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.add("brutal-btn-primary");
                btn.classList.remove("brutal-btn-mint");
                contactForm.reset();
            }, 3000);
        });
    }

    // Auto-boot simulator on page load
    setTimeout(() => {
        initSignatureArchitectureExhibit();
    }, 1200);
});
