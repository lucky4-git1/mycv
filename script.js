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
    document.querySelectorAll(".brutal-btn, .icon-btn, .cmd-item, .filter-tab, .sim-tab, .contact-channel-card").forEach(el => {
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

    function updateGitHubStatsTheme(isDark) {
        const gitStats = document.getElementById("githubStatsImg");
        const gitLangs = document.getElementById("githubLangsImg");
        if (gitStats) {
            gitStats.src = isDark
                ? `https://github-readme-stats-eight-theta.vercel.app/api?username=lucky4-git1&show_icons=true&title_color=E4FF00&icon_color=00FF96&text_color=FFFFFF&bg_color=00000000&hide_border=true`
                : `https://github-readme-stats-eight-theta.vercel.app/api?username=lucky4-git1&show_icons=true&title_color=DE1A45&icon_color=008050&text_color=121316&bg_color=00000000&hide_border=true`;
        }
        if (gitLangs) {
            gitLangs.src = isDark
                ? `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=lucky4-git1&layout=compact&title_color=E4FF00&text_color=FFFFFF&bg_color=00000000&hide_border=true`
                : `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=lucky4-git1&layout=compact&title_color=DE1A45&text_color=121316&bg_color=00000000&hide_border=true`;
        }
    }

    const savedTheme = localStorage.getItem("sriyuth_theme");
    const initialIsDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (initialIsDark) {
        html.classList.add("dark");
    } else {
        html.classList.remove("dark");
    }
    updateGitHubStatsTheme(initialIsDark);

    function toggleTheme() {
        sound.playClick();
        html.classList.toggle("dark");
        const isDark = html.classList.contains("dark");
        localStorage.setItem("sriyuth_theme", isDark ? "dark" : "light");
        updateGitHubStatsTheme(isDark);
    }

    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);


    /* ========================================================
       4. COMMAND PALETTE (CTRL + K / Launcher)
       ======================================================== */
    const cmdPalette = document.getElementById("cmdPalette");
    const cmdInput = document.getElementById("cmdInput");
    const cmdItems = document.querySelectorAll(".cmd-item");
    const cmdTrigger = document.getElementById("cmdTrigger");

    
    // Background media optimization during modal/overlay open (zero GPU lag)
    function pauseBackgroundMedia() {
        const video = document.getElementById("heroVideo");
        if (video && !video.paused) {
            video.pause();
            video.dataset.pausedByModal = "true";
        }
    }

    function resumeBackgroundMedia() {
        const video = document.getElementById("heroVideo");
        if (video && video.dataset.pausedByModal === "true") {
            video.play().catch(() => {});
            video.dataset.pausedByModal = "false";
        }
    }

    function openCmdPalette() {
        sound.playClick();
        pauseBackgroundMedia();
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
        resumeBackgroundMedia();
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
       Resilient hardware video playback watchdog, bulletproof metrics
       caching (prevents offscreen corruption on scroll up), and
       instant robot poster fallback.
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
        const videoEl = document.getElementById("heroVideo");

        if (!stageContainer || !pinnedViewport || !videoShell || !destWrapper) return;

        // Video playback watchdog - ensures video NEVER stays paused or stalled
        function ensureHeroVideoPlayback() {
            if (!videoEl) return;
            if (videoEl.paused || videoEl.ended) {
                const playPromise = videoEl.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Handled: background poster guarantees visuals
                    });
                }
            }
        }

        if (videoEl) {
            ensureHeroVideoPlayback();

            videoEl.addEventListener("ended", () => {
                videoEl.currentTime = 0;
                ensureHeroVideoPlayback();
            });

            videoEl.addEventListener("suspend", () => {
                if (window.scrollY < 1400) {
                    ensureHeroVideoPlayback();
                }
            });

            videoEl.addEventListener("stalled", () => {
                ensureHeroVideoPlayback();
            });

            videoEl.onerror = () => {
                console.warn("Hero video encountered an error, falling back to robot.mp4.");
                if (videoEl.currentSrc && !videoEl.currentSrc.includes("robot.mp4")) {
                    videoEl.src = "images/robot.mp4";
                    videoEl.load();
                    ensureHeroVideoPlayback();
                }
            };
        }

        // Rock-solid metrics caching to prevent offscreen measurement corruption
        let cachedDestMetrics = null;

        function measureDestMetrics() {
            const dRect = destWrapper.getBoundingClientRect();
            const pRect = pinnedViewport.getBoundingClientRect();
            if (dRect.width > 0 && dRect.height > 0) {
                cachedDestMetrics = {
                    x: Math.round(dRect.left - pRect.left),
                    y: Math.round(dRect.top - pRect.top),
                    width: Math.round(dRect.width),
                    height: Math.round(dRect.height)
                };
            }
            return cachedDestMetrics;
        }

        // Measure immediately and on load
        measureDestMetrics();
        window.addEventListener("load", measureDestMetrics);
        window.addEventListener("resize", () => {
            measureDestMetrics();
            if (typeof ScrollTrigger !== "undefined") {
                ScrollTrigger.refresh();
            }
        }, { passive: true });

        function getDestMetrics() {
            if (window.scrollY < 100 || !cachedDestMetrics) {
                measureDestMetrics();
            }
            return cachedDestMetrics || {
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        }

        if (!motionEnabled) {
            const metrics = getDestMetrics();
            gsap.set(videoShell, {
                x: metrics.x,
                y: metrics.y,
                width: metrics.width,
                height: metrics.height,
                borderWidth: "0px",
                borderColor: "transparent",
                boxShadow: "none"
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
                scrub: isMobile ? 0.3 : 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: false,
                onEnter: () => ensureHeroVideoPlayback(),
                onEnterBack: () => ensureHeroVideoPlayback(),
                onLeaveBack: () => {
                    ensureHeroVideoPlayback();
                    heroTl.progress(0);
                    gsap.set(videoShell, {
                        x: 0,
                        y: 0,
                        width: "100vw",
                        height: "100vh",
                        borderWidth: "0px",
                        borderColor: "transparent",
                        boxShadow: "none"
                    });
                },
                onUpdate: (self) => {
                    if (self.direction === -1) {
                        ensureHeroVideoPlayback();
                    }
                    if (self.progress <= 0.01) {
                        ensureHeroVideoPlayback();
                    }
                }
            }
        });

        heroTl.to(videoShell, {
            x: () => getDestMetrics().x,
            y: () => getDestMetrics().y,
            width: () => getDestMetrics().width,
            height: () => getDestMetrics().height,
            borderWidth: "0px",
            borderColor: "transparent",
            boxShadow: "0px 0px 0px transparent",
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

        // Global scroll watchdog: wake video whenever in or near hero viewport
        window.addEventListener("scroll", () => {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            if (st < pinScrollDistance + 400) {
                ensureHeroVideoPlayback();
            }
        }, { passive: true });

        // Tab visibility and mobile touch wakeups
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && (window.pageYOffset || document.documentElement.scrollTop) < pinScrollDistance + 400) {
                ensureHeroVideoPlayback();
            }
        });

        window.addEventListener("touchstart", () => {
            if ((window.pageYOffset || document.documentElement.scrollTop) < pinScrollDistance + 400) {
                ensureHeroVideoPlayback();
            }
        }, { passive: true });
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
            summary: "A high-performance, self-hostable alternative to commercial paraphrase tools with zero subscriptions, BYO-AI flexibility, and lexical originality auditing. Architected with Fastify, React 18, and Redis queues, RewriteBot provides sub-50ms lexical tokenization and streaming semantic transformations.",
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
                <div class="p-4 sm:p-5 bg-card brutal-border brutal-shadow">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-border ${data.tagClass}">${data.tag}</span>
                            ${data.badges.map(b => `<span class="brutal-badge ${b.class}">${b.text}</span>`).join("")}
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="brutal-btn brutal-btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5">
                                <i class="ph-bold ph-github-logo text-sm"></i>
                                <span>INSPECT REPO</span>
                            </a>
                            ${data.liveUrl ? `
                                <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="brutal-btn brutal-btn-mint text-xs py-1 px-2.5 flex items-center gap-1.5">
                                    <i class="ph-bold ph-arrow-square-out text-sm"></i>
                                    <span>LIVE APP</span>
                                </a>
                            ` : ""}
                            ${data.auditDoc ? `
                                <a href="${data.auditDoc}" target="_blank" rel="noopener noreferrer" class="brutal-btn text-xs py-1 px-2.5 flex items-center gap-1.5 bg-card hover:bg-slate-200 dark:hover:bg-slate-800">
                                    <i class="ph-bold ph-file-text text-sm"></i>
                                    <span>AUDIT</span>
                                </a>
                            ` : ""}
                        </div>
                    </div>

                    <h3 class="text-xl sm:text-2xl md:text-3xl font-black mb-2 text-text">${data.title}</h3>
                    <p class="font-mono-label text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-5xl mb-4">
                        ${data.summary}
                    </p>

                    <!-- Interactive Workflow Explorer -->
                    <div class="mt-4 pt-3 border-t-2 border-border">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div class="font-mono text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2">
                                <span class="w-2.5 h-2.5 bg-accent-1 rounded-none border border-black inline-block"></span>
                                <span>${data.diagramHeadline}</span>
                            </div>
                            <span class="font-mono text-[10px] text-slate-400">CLICK STAGE NODE TO INSPECT SUBSYSTEM</span>
                        </div>

                        <!-- Conduits & Nodes Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5" id="workflowNodesGrid">
                            ${data.stages.map((st, idx) => `
                                <div class="workflow-node p-2.5 sm:p-3 font-mono ${idx === activeStageIndex ? "active-stage" : ""}" data-stage="${idx}">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-[11px] font-black opacity-60">STAGE ${st.num}</span>
                                        <span class="text-[9px] font-bold px-1.5 py-0.5 bg-white/20 uppercase tracking-widest">${st.metric}</span>
                                    </div>
                                    <div class="font-black text-xs sm:text-sm text-text leading-tight mb-0.5">${st.name}</div>
                                    <div class="text-[10px] opacity-70 font-bold truncate">${st.sub}</div>
                                </div>
                            `).join("")}
                        </div>

                        <!-- Active Stage Telemetry Detail Card -->
                        <div class="p-3 bg-bg brutal-border mt-2.5 font-mono" id="stageDetailCard">
                            <!-- Populated dynamically via updateStageDetailCard() -->
                        </div>
                    </div>
                </div>
            `;

            // 2. Interactive Bounded Demonstration Card
            if (key === "simpleide") {
                const sc = data.scenarios[activeScenarioIndex];
                html += `
                    <div class="p-4 sm:p-5 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-lime">BOUNDED SANDBOX</span>
                                    <span class="font-mono text-[10px] text-slate-400 font-bold">[ DETERMINISTIC AST REFACTOR ENGINE ]</span>
                                </div>
                                <h4 class="text-lg sm:text-xl font-black text-text">Prime AI Interactive Code Refactor & Diff Inspector</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-2.5 py-1 brutal-border">
                                <i class="ph-bold ph-shield-check text-green-500 mr-1.5"></i>SAFE BOUNDED EXECUTION
                            </div>
                        </div>

                        <!-- Scenario Selector Pills -->
                        <div class="flex flex-wrap items-center gap-1.5 mb-3">
                            <span class="font-mono text-xs font-bold uppercase text-slate-500 mr-1">SCENARIO:</span>
                            ${data.scenarios.map((s, sIdx) => `
                                <button class="scenario-btn font-mono text-xs font-bold px-2.5 py-1 brutal-border transition-all ${sIdx === activeScenarioIndex ? "bg-a1 text-black font-black" : "bg-bg text-text hover:bg-slate-200 dark:hover:bg-slate-800"}" data-scenario="${sIdx}">
                                    ${s.name}
                                </button>
                            `).join("")}
                        </div>

                        <p class="font-mono text-xs text-slate-500 mb-3" id="scenarioDescText">
                            ${sc.desc}
                        </p>

                        <!-- Code Workbench Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                            <!-- Left: Editable Code Buffer -->
                            <div class="lg:col-span-6 flex flex-col code-workbench brutal-border">
                                <div class="flex items-center justify-between p-2 bg-[#171922] border-b border-[#252836] text-xs">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-bold ph-file-code text-accent-1"></i>
                                        <span class="font-bold text-white">workspace/activeBuffer.js</span>
                                    </div>
                                    <span class="text-[10px] text-slate-400 font-mono" id="charCountDisplay">Tokens ~54</span>
                                </div>
                                <textarea id="sandboxCodeInput" class="code-editor-area p-2.5 w-full h-[140px] focus:outline-none" spellcheck="false">${sc.inputCode}</textarea>
                                <div class="p-2.5 bg-[#13151D] border-t border-[#252836] flex flex-wrap items-center justify-between gap-2">
                                    <span class="telemetry-bar-pill text-[11px]">
                                        <i class="ph-bold ph-cpu text-accent-1"></i><strong id="currentDirectiveText">${sc.directive}</strong>
                                    </span>
                                    <button id="executeRefactorBtn" class="brutal-btn brutal-btn-primary text-xs py-1 px-3 font-mono font-bold flex items-center gap-1.5">
                                        <i class="ph-bold ph-lightning text-sm"></i>
                                        <span>EXECUTE AGENT PASS</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Right: Unified Diff Inspector -->
                            <div class="lg:col-span-6 flex flex-col code-workbench brutal-border">
                                <div class="flex items-center justify-between p-2 bg-[#171922] border-b border-[#252836] text-xs">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-bold ph-git-diff text-green-400"></i>
                                        <span class="font-bold text-white">Unified AST Diff Review</span>
                                    </div>
                                    <span class="text-[10px] text-accent-1 font-mono font-bold" id="diffStatusTag">IPC_READY</span>
                                </div>
                                <div class="diff-viewer p-2 h-[140px] overflow-y-auto" id="sandboxDiffViewer">
                                    ${sc.diffLines.map(dl => `
                                        <div class="diff-line diff-line-${dl.type}">
                                            <span class="diff-line-num">${dl.num}</span>
                                            <code>${dl.text}</code>
                                        </div>
                                    `).join("")}
                                </div>
                                <div class="p-2.5 bg-[#13151D] border-t border-[#252836] flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
                                    <div class="flex items-center gap-3">
                                        <span class="text-green-400 font-bold" id="diffStatsAdd">+${sc.stats.added} additions</span>
                                        <span class="text-red-400 font-bold" id="diffStatsDel">-${sc.stats.removed} deletions</span>
                                    </div>
                                    <span class="text-[10px] text-slate-400" id="measuredLatencyText">LATENCY: 14.8ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (key === "rewritebot") {
                const md = data.modes[activeRewriteModeIndex];
                html += `
                    <div class="p-4 sm:p-5 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-amber">LIVE DEMO REPRODUCIBLE</span>
                                    <span class="font-mono text-[10px] text-slate-400 font-bold">[ CLIENT-SIDE SEMANTIC ENGINE ]</span>
                                </div>
                                <h4 class="text-lg sm:text-xl font-black text-text">RewriteBot Semantic Paraphrase & Tone Transformer</h4>
                            </div>
                            <a href="https://rewritebot-client.vercel.app/" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-amber-500 hover:underline flex items-center gap-1 font-bold">
                                <span>OPEN PRODUCTION APP</span>
                                <i class="ph-bold ph-arrow-up-right"></i>
                            </a>
                        </div>

                        <!-- Mode Selector Pills -->
                        <div class="flex flex-wrap items-center gap-1.5 mb-3">
                            <span class="font-mono text-xs font-bold uppercase text-slate-500 mr-1">TONE:</span>
                            ${data.modes.map((m, mIdx) => `
                                <button class="rewrite-mode-btn font-mono text-xs font-bold px-2.5 py-1 brutal-border transition-all ${mIdx === activeRewriteModeIndex ? "bg-amber-400 text-black font-black" : "bg-bg text-text hover:bg-slate-200 dark:hover:bg-slate-800"}" data-mode="${mIdx}">
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
                    <div class="p-4 sm:p-5 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-mint">WEBHOOK PAYLOAD INSPECTOR</span>
                                    <span class="font-mono text-[10px] text-slate-400 font-bold">[ VERIFIED META GRAPH API SCHEMA ]</span>
                                </div>
                                <h4 class="text-lg sm:text-xl font-black text-text">Meta WhatsApp Business Cloud API Inbound Pipeline</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-2.5 py-1 brutal-border">
                                <i class="ph-bold ph-key text-amber-500 mr-1.5"></i>HMAC-SHA256 AUTHENTICATED
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                            <div class="lg:col-span-7 code-workbench p-3 brutal-border">
                                <div class="flex justify-between items-center text-xs text-slate-400 mb-1.5 border-b border-white/10 pb-1.5">
                                    <span class="text-green-400 font-bold">POST /api/whatsapp/webhook</span>
                                    <span>HEADER: X-Hub-Signature-256</span>
                                </div>
                                <pre class="text-[10px] font-mono overflow-x-auto text-slate-300 leading-relaxed max-h-[160px]">${JSON.stringify(data.payloadSample, null, 2)}</pre>
                            </div>
                            <div class="lg:col-span-5 p-3 bg-bg brutal-border flex flex-col justify-between font-mono">
                                <div>
                                    <span class="text-[11px] font-bold uppercase text-slate-500 mb-1.5 block">INTENT CLASSIFIER TELEMETRY:</span>
                                    <div class="space-y-1.5 text-xs">
                                        <div class="p-1.5 bg-card brutal-border">
                                            <span class="text-slate-500 text-[9px] block">DETECTED INTENT</span>
                                            <strong class="text-green-600 dark:text-green-400 text-xs">COMMERCIAL_INQUIRY [HIGH_PRIORITY]</strong>
                                        </div>
                                        <div class="p-1.5 bg-card brutal-border">
                                            <span class="text-slate-500 text-[9px] block">ROUTING TARGET</span>
                                            <strong class="text-text text-xs">Enterprise Sales Tier-1</strong>
                                        </div>
                                        <div class="p-1.5 bg-card brutal-border">
                                            <span class="text-slate-500 text-[9px] block">DISPATCH ACTION</span>
                                            <strong class="text-accent-3 text-xs">Meta Graph API v19.0 Template Response</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2 border-t border-border text-[10px] text-slate-500 flex justify-between">
                                    <span>STATUS: HTTP 200</span>
                                    <span>DB: PRISMA / POSTGRES</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (key === "ema") {
                html += `
                    <div class="p-4 sm:p-5 bg-card brutal-border brutal-shadow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="brutal-badge badge-cobalt">QUEUE TELEMETRY</span>
                                    <span class="font-mono text-[10px] text-slate-400 font-bold">[ TYPESCRIPT CRON & WORKER POOL ]</span>
                                </div>
                                <h4 class="text-lg sm:text-xl font-black text-text">EMA Campaign Queue & Deliverability Pipeline</h4>
                            </div>
                            <div class="font-mono text-xs text-slate-400 bg-bg px-2.5 py-1 brutal-border">
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
            badge: "UI Architecture",
            images: [
                "images/hyperpure1.png",
                "images/hyperpurecheckout.png",
                "images/hyperpureorderplaced.png"
            ],
            desc: "An architectural reproduction of Zomato's Hyperpure B2B platform. Built to master complex e-commerce layouts, dynamic multi-item cart state flows, and responsive desktop/mobile catalog views from scratch.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Hyperpure/",
            gitUrl: "https://github.com/lucky4-git1/Hyperpure",
            highlights: [
                "Architectural reproduction of Hyperpure B2B e-commerce platform with catalog & checkout flow",
                "Client-side cart state management with real-time quantity mutations and price calculations",
                "Fully responsive multi-breakpoint layout developed without UI component libraries"
            ]
        },
        mutube: {
            title: "MuTube Media Player",
            category: "app",
            badge: "Offline-First App",
            images: [
                "images/mutube.png",
                "images/mutubemodal.jpg",
                "images/mutubevid.jpeg",
                "images/mutubeplaylist.jpeg",
                "images/mutubeupload.jpeg"
            ],
            desc: "A client-side media player engineered with vanilla JavaScript and the HTML5 Media API. Features zero-server offline playback, audio visualization themes, and persistent playlist storage using the browser's native IndexedDB.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "IndexedDB"],
            liveUrl: "https://lucky4-git1.github.io/MuTube-media-player-v1.0/",
            gitUrl: "https://github.com/lucky4-git1/MuTube-media-player-v1.0.git",
            highlights: [
                "Zero-server client-side media player with HTML5 audio/video decoding and custom playback UI",
                "Client-side persistence using native IndexedDB for playlists, media metadata, and user preferences",
                "Interactive drag-and-drop playlist reordering, track shuffle, and responsive dark theme"
            ]
        },
        atherone: {
            title: "Atherone 3D Web-App",
            category: "app",
            badge: "Creative Web & 3D",
            images: [
                "images/atherone1.jpeg",
                "images/atherone2.jpeg",
                "images/atherone3.jpeg"
            ],
            desc: "An interactive 3D scrollytelling web experience built with React, GSAP ScrollTrigger, and Spline 3D. Explores fluid camera transitions, smooth physics-driven timeline animations, and modern digital brand storytelling.",
            tech: ["HTML", "React", "GSAP", "Spline", "TypeScript", "Tailwind CSS"],
            liveUrl: "https://atherone-scrolly-app.netlify.app/",
            gitUrl: "https://github.com/lucky4-git1/atherone.git",
            highlights: [
                "Interactive 3D model canvas integrated into React using Spline 3D runtime",
                "Cinematic camera trajectories and scrollytelling physics driven by GSAP ScrollTrigger",
                "Production deployment on Netlify demonstrating creative development and spatial storytelling"
            ]
        },
        district: {
            title: "District UI/UX Clone",
            category: "clone",
            badge: "UI Architecture",
            images: [
                "images/district (1).png",
                "images/district (2).png",
                "images/district3.jpeg",
                "images/district4.jpeg"
            ],
            desc: "Responsive event and nightlife portal interface. Engineered to study asymmetric card layout grids, CSS transitions, modal flows, and responsive breakpoint ergonomics.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/District-UI-clone/",
            gitUrl: "https://github.com/lucky4-git1/District-UI-clone.git",
            highlights: [
                "Lifestyle and ticketing portal interface recreation featuring asymmetric layout grids",
                "Responsive card micro-interactions, modal overlays, and clean state handling",
                "Fluid layout adaptability across mobile, tablet, and desktop viewports"
            ]
        },
        youtube: {
            title: "YouTube UI/UX Clone",
            category: "clone",
            badge: "UI Architecture",
            images: [
                "images/yt1 (2).png",
                "images/yt1 (1).png"
            ],
            desc: "Recreation of YouTube's content feed and player UI. Features a collapsible dual-state sidebar, sticky glassmorphic navigation header, video grid hierarchy, and fluid search bar interactions.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Youtube-UI-clone-/",
            gitUrl: "https://github.com/lucky4-git1/Youtube-UI-clone-.git",
            highlights: [
                "Responsive YouTube feed architecture with sticky glassmorphic navigation header",
                "Collapsible dual-state sidebar navigation and responsive video card grid",
                "Interactive search suggestions, hover preview states, and media player layout"
            ]
        },
        blinkit: {
            title: "Blinkit Clone",
            category: "clone",
            badge: "UI Architecture",
            images: [
                "images/blinkit1.jpeg",
                "images/blinkit3.jpeg",
                "images/blinkit2.jpeg"
            ],
            desc: "Study in high-density instant commerce user interfaces. Built to replicate category navigation carousels, responsive item-card states, and fast checkout ergonomics with pure CSS and Bootstrap.",
            tech: ["HTML", "CSS", "Bootstrap", "JavaScript"],
            liveUrl: "https://lucky4-git1.github.io/Blinkit-UI-clone/",
            gitUrl: "https://github.com/lucky4-git1/Blinkit-UI-clone.git",
            highlights: [
                "High-density quick-commerce catalog layout with category carousel navigation",
                "Interactive item counter states, instant cart drawer, and responsive product cards",
                "Mobile-first responsive architecture optimized for minimal render overhead"
            ]
        },
        tspsc: {
            title: "TSPSC Clone",
            category: "clone",
            badge: "UI Architecture",
            images: [
                "images/tspschome.jpeg",
                "images/tspsc landing pg.jpeg"
            ],
            desc: "Public service commission portal interface reproduction. Focused on accessible information architecture, structured table grids, and high-contrast design compliance.",
            tech: ["HTML", "CSS", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/Tspsc-UI-clone-/",
            gitUrl: "https://github.com/lucky4-git1/Tspsc-UI-clone-.git",
            highlights: [
                "Public service commission portal reproduction focused on structured information architecture",
                "Accessible navigation tables, alert tickers, and candidate examination feeds",
                "Semantic HTML markup and clean CSS layout structure"
            ]
        },
        amazon: {
            title: "Amazon UI Clone",
            category: "clone",
            badge: "UI Architecture",
            images: [
                "images/amazon2.jpeg",
                "images/Screenshot_6-2-2026_222837_lucky4-git1.github.io.jpeg"
            ],
            desc: "Pure CSS and semantic HTML recreation of Amazon's desktop interface. Reverse-engineered to master complex multi-tier dropdowns, delivery pickers, and responsive product grids without frameworks.",
            tech: ["HTML", "CSS"],
            liveUrl: "https://lucky4-git1.github.io/amazon-ui-clone/",
            gitUrl: "https://github.com/lucky4-git1/amazon-ui-clone.git",
            highlights: [
                "Framework-free HTML and CSS recreation of Amazon's multi-tier mega header and sub-navigation",
                "Complex nested CSS hover menus, delivery location modals, and responsive layout math",
                "Strict attention to semantic markup, spacing rhythm, and layout density"
            ]
        },
        cricket: {
            title: "TOP INDIAN CRICKETERS",
            category: "app",
            badge: "Interactive Web",
            images: [
                "images/cricket.jpeg",
                "images/cricketcv.jpeg"
            ],
            desc: "Interactive profile card interface exploring dynamic animated gradient backgrounds, external reference deep-linking, and responsive component hierarchy.",
            tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://lucky4-git1.github.io/my-top-Indian-Cricketers-list/",
            gitUrl: "https://github.com/lucky4-git1/my-top-Indian-Cricketers-list",
            highlights: [
                "Dynamic profile cards with interactive animated gradient backgrounds",
                "Integrated encyclopedia reference deep-links and player statistics",
                "Responsive card grid system built with clean modern front-end fundamentals"
            ]
        },
        simpleide: {
            title: "SimpleIDE",
            category: "ai",
            badge: "Desktop AI Agent",
            images: [],
            desc: "SimpleIDE is an open-source desktop code editor and autonomous coding agent built with Electron, React, and Vite. Implements a secure contextBridge IPC conduit, AST diff inspection, automated unit tests, and human-in-the-loop file writes.",
            tech: ["Electron", "React", "Vite", "JavaScript", "AI Agent"],
            liveUrl: "https://github.com/lucky4-git1/SimpleIDE",
            gitUrl: "https://github.com/lucky4-git1/SimpleIDE",
            highlights: [
                "Open-source desktop code editor built on Electron 28, React 18, and Vite with 161 unit tests",
                "Embedded 'Prime AI' autonomous agent running multi-step code plans through secure contextBridge IPC",
                "Unified AST diff inspection, syntax lint validation, and safeStorage credential encryption"
            ]
        },
        rewritebot: {
            title: "RewriteBot",
            category: "ai",
            badge: "Production AI SaaS",
            images: [],
            desc: "Privacy-first AI writing and semantic refactoring suite deployed in production on Vercel at rewritebot-client.vercel.app. Engineered with Fastify, React, and Redis for streaming lexical transforms, Flesch-Kincaid scoring, and originality auditing.",
            tech: ["TypeScript", "React", "Next.js", "Vercel", "AI"],
            liveUrl: "https://rewritebot-client.vercel.app",
            gitUrl: "https://github.com/lucky4-git1/rewritebot",
            highlights: [
                "Production deployment on Vercel backed by Fastify and Redis streaming pipelines",
                "Streaming semantic text refactoring with multi-mode tone adjustments and zero data retention",
                "Flesch-Kincaid readability scoring and word-level Levenshtein similarity diffing"
            ]
        },
        gitdrop: {
            title: "Gitdrop",
            category: "ai",
            badge: "Web Application",
            images: [],
            desc: "Modern web application built with TypeScript and deployed in production on Vercel at gitdrop-three.vercel.app.",
            tech: ["TypeScript", "Next.js", "Vercel"],
            liveUrl: "https://gitdrop-three.vercel.app",
            gitUrl: "https://github.com/lucky4-git1/Gitdrop",
            highlights: [
                "Production deployment on Vercel with automated CI/CD pipeline",
                "TypeScript architecture built for speed, responsiveness, and clean component state"
            ]
        },
        whatsappai: {
            title: "WhatsApp AI Automation",
            category: "ai",
            badge: "Intelligent Pipeline",
            images: [],
            desc: "Enterprise WhatsApp automation infrastructure built in TypeScript and Node.js. Integrates with the official Meta WhatsApp Cloud API with cryptographic HMAC-SHA256 signature verification, multi-language intent classification, and CRM routing.",
            tech: ["TypeScript", "Node.js", "WhatsApp API", "AI"],
            liveUrl: "https://github.com/lucky4-git1/whatsapp-ai-automation",
            gitUrl: "https://github.com/lucky4-git1/whatsapp-ai-automation",
            highlights: [
                "Meta WhatsApp Business Cloud API integration with cryptographic HMAC-SHA256 payload verification",
                "Multi-language intent classification engine and PostgreSQL CRM lead synchronization",
                "Resilient webhook architecture with human takeover fallbacks and automated response templates"
            ]
        },
        ema: {
            title: "EMA (Email Market Automation)",
            category: "ai",
            badge: "Queue Pipeline",
            images: [],
            desc: "High-throughput email marketing automation system written in TypeScript. Features scheduled batch workers, dynamic contact audience segmentation, and DNS deliverability monitoring (DKIM, SPF, DMARC).",
            tech: ["TypeScript", "Node.js", "Automation"],
            liveUrl: "https://github.com/lucky4-git1/EMA-email-market-automation",
            gitUrl: "https://github.com/lucky4-git1/EMA-email-market-automation",
            highlights: [
                "TypeScript queue processing backend designed for reliable campaign scheduling and delivery",
                "Dynamic audience segmentation engine with personalized template injection",
                "Pre-flight DNS deliverability auditing verifying SPF, DKIM, and domain reputation"
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

        pauseBackgroundMedia();
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
        resumeBackgroundMedia();
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
        const target = +counter.getAttribute("data-target") || 0;
        const suffix = counter.getAttribute("data-suffix") !== null 
            ? counter.getAttribute("data-suffix") 
            : (counter.innerText.includes("+") ? "+" : (counter.innerText.includes("%") ? "%" : ""));

        ScrollTrigger.create({
            trigger: counter,
            start: "top 90%",
            once: true,
            onEnter: () => {
                if (!motionEnabled) {
                    counter.innerText = target + suffix;
                    return;
                }
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: "power2.out",
                    onUpdate: () => {
                        counter.innerText = Math.floor(obj.val) + suffix;
                    }
                });
            }
        });
    });


    
    /* ========================================================
       8b. ANIMATED SKILL BARS & ENTRANCE (ScrollTrigger)
       Subtle, performant viewport-triggered staggered reveals
       with animated skill progress bars and counter animation.
       Respects motionEnabled and triggers once without restarting.
       ======================================================== */
    const skillCards = document.querySelectorAll("#skills .skill-card");
    const skillBars = document.querySelectorAll("#skills .skill-bar-fill");

    if (skillCards.length) {
        if (!motionEnabled) {
            // Respect reduced-motion: set bars and counts directly
            skillBars.forEach(bar => {
                const w = bar.getAttribute("data-width") || "85%";
                bar.style.width = w;
                const row = bar.closest(".skill-row");
                const pct = row ? row.querySelector(".skill-pct") : null;
                if (pct) pct.innerText = w;
            });
        } else {
            // Subtle, performant staggered entrance reveal for the 4 bento cards
            gsap.fromTo(skillCards,
                { opacity: 0, y: 22 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#skills",
                        start: "top 78%",
                        once: true
                    }
                }
            );

            // Animate skill bars and count up numbers smoothly when entering view
            ScrollTrigger.create({
                trigger: "#skills",
                start: "top 72%",
                once: true,
                onEnter: () => {
                    skillBars.forEach((bar, idx) => {
                        const targetWidth = bar.getAttribute("data-width") || "80%";
                        const targetNum = parseInt(targetWidth, 10) || 80;
                        const row = bar.closest(".skill-row");
                        const pctEl = row ? row.querySelector(".skill-pct") : null;

                        gsap.to(bar, {
                            width: targetWidth,
                            duration: 1.1,
                            delay: (idx % 4) * 0.06 + Math.floor(idx / 4) * 0.1,
                            ease: "power2.out"
                        });

                        if (pctEl) {
                            const counterObj = { val: 0 };
                            gsap.to(counterObj, {
                                val: targetNum,
                                duration: 1.1,
                                delay: (idx % 4) * 0.06 + Math.floor(idx / 4) * 0.1,
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
    }

    /* ========================================================
       7b. CMATRIX DIGITAL RAIN (Signature Red & Site Accents)
       Authentic falling terminal matrix code in #about background.
       Styled in the portfolio's signature Coral Red (#FF4757) with
       glowing electric white and acid lime accents.
       Throttled to 30fps and auto-paused offscreen for 0% CPU overhead.
       ======================================================== */
    function initAboutMatrixCanvas() {
        const canvas = document.getElementById("aboutMatrixCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId = null;
        let isVisible = false;
        let lastTime = 0;
        const fps = 30;
        const interval = 1000 / fps;

        // Katakana, Binary, Hex, & Tech glyphs
        const glyphs = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEF{}[]<>$~#!*+=/AI.TS.AST.MCA.DEV.DOM.GIT";
        const glyphArray = glyphs.split("");

        let fontSize = window.innerWidth < 640 ? 12 : 15;
        let columns = 0;
        let drops = [];
        let speeds = [];
        let mouseX = -9999;
        let mouseY = -9999;

        function resizeCanvas() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            columns = Math.max(10, Math.floor(canvas.width / fontSize));
            drops = [];
            speeds = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.floor(Math.random() * -60);
                speeds[i] = 0.85 + Math.random() * 0.65; // Natural staggered column velocities
            }
        }

        window.addEventListener("resize", resizeCanvas, { passive: true });
        resizeCanvas();

        const aboutSec = document.getElementById("about");
        if (aboutSec) {
            aboutSec.addEventListener("mousemove", (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            }, { passive: true });
            aboutSec.addEventListener("mouseleave", () => {
                mouseX = -9999;
                mouseY = -9999;
            });
        }

        function draw(timestamp) {
            if (!isVisible) return;
            animationFrameId = requestAnimationFrame(draw);

            if (timestamp - lastTime < interval) return;
            lastTime = timestamp;

            const isDark = document.documentElement.classList.contains("dark");
            
            // Fading trail clear: gentle fade for subtle, non-distracting background atmosphere
            ctx.fillStyle = isDark ? "rgba(10, 11, 14, 0.16)" : "rgba(244, 240, 230, 0.22)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = glyphArray[Math.floor(Math.random() * glyphArray.length)];
                const x = i * fontSize;
                const y = Math.floor(drops[i]) * fontSize;

                const distToMouse = Math.hypot(x - mouseX, y - mouseY);
                const nearMouse = distToMouse < 85;

                // Color system: Signature Red (#FF4757) with white & acid-lime highlights
                if (nearMouse) {
                    ctx.fillStyle = "#E4FF00"; // Electric acid-lime near cursor
                } else if (Math.random() > 0.88) {
                    // Leading head character: bright glowing white or electric lime
                    ctx.fillStyle = isDark ? (Math.random() > 0.5 ? "#FFFFFF" : "#E4FF00") : "#1E293B";
                } else if (Math.random() > 0.4) {
                    // Primary body: Vibrant Signal Red (#FF4757 / #FF2A3D)
                    ctx.fillStyle = isDark ? "#FF4757" : "#DC2626";
                } else {
                    // Trail glow: Deep Coral (#FF6B81 / #E83845)
                    ctx.fillStyle = isDark ? "#FF6B81" : "#B91C1C";
                }

                ctx.fillText(text, x, y);

                // Reset drop to top with random delay once past bottom
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                    speeds[i] = 0.85 + Math.random() * 0.65;
                }
                drops[i] += speeds[i];
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    lastTime = performance.now();
                    animationFrameId = requestAnimationFrame(draw);
                } else {
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                }
            });
        }, { threshold: 0.05 });

        observer.observe(canvas.parentElement);
    }
    initAboutMatrixCanvas();

    /* ========================================================
       8c. NEON HELIX DRIFT — 3D CYBERNETIC BACKGROUND (#skills)
       Originkit dual-helix perspective projection with dynamic glyph atlas,
       depth-of-field blur, radiant hot glow, and interactive parallax.
       Auto-paused via IntersectionObserver for 0% offscreen CPU overhead.
       ======================================================== */
    function initSkillsHelixBackground() {
        const root = document.getElementById("skills");
        const canvas = document.getElementById("skillsHelixCanvas");
        if (!root || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const ADVANCED_DEFAULTS = {
            halfTurnMs: 6000,
            radius: 224,
            halfPitch: 900,
            rungsPerHalf: 24,
            glyphSize: 12,
            charShare: 100,
            outlineShare: 20,
            axisX: 50,
            axisY: 50,
            axisAngle: -24,
            axisBend: 0,
            depthTilt: 45,
            cameraDistance: 1800,
            focusDepth: 50,
            focusBand: 15,
            blurPx: 6,
            cyanColor: "#FFD800",
            warmColor: "#FF7000",
            coolStop: 40,
            warmStop: 78,
            glyphOpacity: 95,
            farOpacity: 45,
            hotGlow: 70,
            hotGlowStart: 88,
            nodeShare: 4,
            nodeSize: 34,
            strandWidth: 3,
            strandColor: "#00FF96",
            haloColor: "#00FF57",
            haloWidth: 16,
            haloOpacity: 40,
            hazeColor: "#1E3F6A",
            haze: 22,
            dustCount: 26,
            seed: 7,
            lightRadius: 170,
            parallax: 10,
            hover: 50,
            grain: 0,
            vignette: 0,
        };

        const CELL = 80;
        const G = 16;
        const LEVELS = [0, 1.5, 3, 5, 7.5, 10];
        const NL = LEVELS.length;
        const CHARS = ["2", "5", "7", "0", "8", "3", "Z", "S", "F", "L"];
        const NT = 2 + CHARS.length;
        const NC = 10;
        const GAP = 0.12;
        const STEEL = [142, 172, 176, 1];

        function parseColor(input) {
            if (typeof input !== "string") return [0, 0, 0, 1];
            let s = input.trim();
            const v = s.match(/^var\([^,]+,\s*(.+)\)$/);
            if (v) s = v[1].trim();
            if (s[0] === "#") {
                let h = s.slice(1);
                if (h.length === 3 || h.length === 4)
                    h = h
                        .split("")
                        .map((x) => x + x)
                        .join("");
                const n = parseInt(h.slice(0, 6), 16);
                if (isNaN(n)) return [0, 0, 0, 1];
                const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
                return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
            }
            const m = s.match(/rgba?\(([^)]+)\)/i);
            if (m) {
                const p = m[1]
                    .split(/[\s,\/]+/)
                    .filter(Boolean)
                    .map((x) => parseFloat(x));
                return [p[0] || 0, p[1] || 0, p[2] || 0, p.length > 3 && !isNaN(p[3]) ? p[3] : 1];
            }
            return [0, 0, 0, 1];
        }

        function mix(a, b, t) {
            const k = Math.max(0, Math.min(1, t));
            return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, 1];
        }

        function rgba(c, a) {
            return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
        }

        function ramp(t, far, cyan, warm, hot, cs, ws) {
            if (t <= cs) return mix(far, cyan, t / Math.max(1e-4, cs));
            if (t <= ws) return mix(cyan, warm, (t - cs) / Math.max(1e-4, ws - cs));
            return mix(warm, hot, (t - ws) / Math.max(1e-4, 1 - ws));
        }

        function hash3(a, b, c) {
            let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
            h = Math.imul(h ^ (h >>> 13), 1274126177);
            h ^= h >>> 16;
            h = Math.imul(h, 2246822519);
            h ^= h >>> 13;
            return (h >>> 0) / 4294967296;
        }

        function vnoise(x, seed) {
            const i = Math.floor(x);
            const f = x - i;
            const u = f * f * (3 - 2 * f);
            return hash3(i, 11, seed) * (1 - u) + hash3(i + 1, 11, seed) * u;
        }

        function drawGlyphShape(g, type, x, y) {
            if (type === 0) {
                const w = 14;
                const r = 2;
                const x0 = x - w / 2;
                const y0 = y - w / 2;
                g.beginPath();
                g.moveTo(x0 + r, y0);
                g.arcTo(x0 + w, y0, x0 + w, y0 + w, r);
                g.arcTo(x0 + w, y0 + w, x0, y0 + w, r);
                g.arcTo(x0, y0 + w, x0, y0, r);
                g.arcTo(x0, y0, x0 + w, y0, r);
                g.closePath();
                g.fill();
            } else if (type === 1) {
                g.lineWidth = 2.2;
                g.strokeRect(x - 6.5, y - 6.5, 13, 13);
            } else {
                g.fillText(CHARS[type - 2], x, y + 1);
            }
        }

        function buildWhite() {
            const c = document.createElement("canvas");
            c.width = NT * NL * CELL;
            c.height = CELL;
            const g = c.getContext("2d");
            if (!g) return c;
            g.fillStyle = "#ffffff";
            g.strokeStyle = "#ffffff";
            g.font = `700 ${G + 3}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
            g.textAlign = "center";
            g.textBaseline = "middle";
            for (let t = 0; t < NT; t++) {
                for (let l = 0; l < NL; l++) {
                    const cx = (t * NL + l) * CELL + CELL / 2;
                    const cy = CELL / 2;
                    if (LEVELS[l] === 0) {
                        drawGlyphShape(g, t, cx, cy);
                    } else {
                        g.save();
                        g.shadowColor = "#ffffff";
                        g.shadowBlur = LEVELS[l] * 2;
                        g.shadowOffsetX = 10000;
                        drawGlyphShape(g, t, cx - 10000, cy);
                        g.restore();
                    }
                }
            }
            return c;
        }

        function buildAtlas(white, colors) {
            const c = document.createElement("canvas");
            c.width = white.width;
            c.height = CELL * colors.length;
            const g = c.getContext("2d");
            if (!g) return c;
            for (let r = 0; r < colors.length; r++) {
                g.globalCompositeOperation = "source-over";
                g.drawImage(white, 0, r * CELL);
                g.globalCompositeOperation = "source-atop";
                g.fillStyle = colors[r];
                g.fillRect(0, r * CELL, c.width, CELL);
            }
            g.globalCompositeOperation = "source-over";
            return c;
        }

        function buildGlow(hot) {
            const c = document.createElement("canvas");
            c.width = c.height = 64;
            const g = c.getContext("2d");
            if (!g) return c;
            const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
            gr.addColorStop(0, rgba(hot, 1));
            gr.addColorStop(0.35, rgba(hot, 0.4));
            gr.addColorStop(1, rgba(hot, 0));
            g.fillStyle = gr;
            g.fillRect(0, 0, 64, 64);
            return c;
        }

        function buildNode(hot) {
            const c = document.createElement("canvas");
            c.width = c.height = 128;
            const g = c.getContext("2d");
            if (!g) return c;
            const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
            gr.addColorStop(0, "rgba(255,226,204,1)");
            gr.addColorStop(0.14, rgba(hot, 1));
            gr.addColorStop(0.3, rgba(hot, 0.55));
            gr.addColorStop(0.6, rgba(hot, 0.15));
            gr.addColorStop(1, rgba(hot, 0));
            g.fillStyle = gr;
            g.fillRect(0, 0, 128, 128);
            return c;
        }

        function buildGrain() {
            const c = document.createElement("canvas");
            c.width = c.height = 128;
            const g = c.getContext("2d");
            if (!g) return c;
            const img = g.createImageData(128, 128);
            for (let i = 0; i < img.data.length; i += 4) {
                const val = Math.random() * 255;
                img.data[i] = val;
                img.data[i + 1] = val;
                img.data[i + 2] = val;
                img.data[i + 3] = 255;
            }
            g.putImageData(img, 0, 0);
            return c;
        }

        const v = {
            speed: 85,
            scale: 79,
            density: 16,
            hotColor: "#FF2600",
            coolColor: "#00FF25",
            focusBlur: 41,
            background: "#030408",
        };
        const adv = { ...ADVANCED_DEFAULTS };

        let W = 0;
        let H = 0;
        let dpr = 1;

        const resize = () => {
            const rect = root.getBoundingClientRect();
            W = Math.round(root.offsetWidth || rect.width || window.innerWidth);
            H = Math.round(root.offsetHeight || rect.height || 800);
            dpr = Math.min(1.25, window.devicePixelRatio || 1);
            if (W > 0 && H > 0) {
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
            }
        };
        resize();

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(resize);
            ro.observe(root);
        } else {
            window.addEventListener("resize", resize, { passive: true });
        }

        const white = buildWhite();
        let atlas = null;
        let glow = null;
        let node = null;
        let atlasKey = "";
        const grainCanvas = buildGrain();
        const grainPattern = ctx.createPattern(grainCanvas, "repeat");

        const pointer = { x: 0, y: 0, over: 0, overT: 0, down: 0, downT: 0 };
        const onMove = (e) => {
            const rect = root.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
            pointer.overT = 1;
        };
        const onLeave = () => {
            pointer.overT = 0;
        };
        const onDown = (e) => {
            onMove(e);
            pointer.downT = 1;
        };
        const onUp = () => {
            pointer.downT = 0;
        };

        root.addEventListener("pointerenter", onMove, { passive: true });
        root.addEventListener("pointermove", onMove, { passive: true });
        root.addEventListener("pointerleave", onLeave, { passive: true });
        root.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
        window.addEventListener("pointercancel", onUp, { passive: true });

        const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

        let sX = new Float32Array(0);
        let sY = new Float32Array(0);
        let sT = new Float32Array(0);
        let sS = new Float32Array(0);
        let sP = new Float32Array(0);

        let phi = 0;
        let time = 0;
        let last = -1;
        let raf = 0;
        let isVisible = false;

        const frame = (now) => {
            if (!isVisible) return;
            raf = requestAnimationFrame(frame);
            let dt = last < 0 ? 0 : (now - last) / 1000;
            last = now;
            if (dt > 0.05) dt = 0.05;
            if (dt < 0) dt = 0;
            if (W < 2 || H < 2) return;

            const reduce = !!(mq && mq.matches);
            const hk = reduce ? 0 : Math.max(0, adv.hover) / 50;

            pointer.over += (pointer.overT - pointer.over) * (1 - Math.exp(-dt * 4));
            pointer.down += (pointer.downT - pointer.down) * (1 - Math.exp(-dt * 6));

            if (!reduce) {
                const spinMul = 1 + pointer.down * hk * 1.5;
                phi += ((dt * Math.PI) / Math.max(0.2, adv.halfTurnMs / 1000)) * (Math.max(0, v.speed) / 50) * spinMul;
                if (phi > Math.PI * 2) phi -= Math.PI * 2;
                time += dt;
            }

            const far = parseColor(v.coolColor);
            const cyan = parseColor(adv.cyanColor);
            const warm = parseColor(adv.warmColor);
            const hot = parseColor(v.hotColor);
            const cs = Math.max(0.02, Math.min(0.97, adv.coolStop / 100));
            const ws = Math.max(cs + 0.01, Math.min(0.99, adv.warmStop / 100));
            const key = [v.coolColor, adv.cyanColor, adv.warmColor, v.hotColor, cs, ws].join("|");
            if (key !== atlasKey || !atlas || !glow || !node) {
                const cols = [];
                for (let r = 0; r < NC; r++) cols.push(rgba(ramp(r / (NC - 1), far, cyan, warm, hot, cs, ws), 1));
                atlas = buildAtlas(white, cols);
                glow = buildGlow(hot);
                node = buildNode(hot);
                atlasKey = key;
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = v.background;
            ctx.fillRect(0, 0, W, H);

            const u800 = Math.min(H / 800, Math.max(0.55, W / 900));
            const f = u800 * (Math.max(10, v.scale) / 100);
            const R = Math.max(4, adv.radius * f);
            const half = Math.max(20, adv.halfPitch * f);
            const pitch = half * 2;
            const spacing = half / Math.max(2, adv.rungsPerHalf);
            const n = Math.max(2, Math.round(v.density));
            const cx = (W * adv.axisX) / 100;
            const cy = (H * adv.axisY) / 100;
            const a0 = (adv.axisAngle * Math.PI) / 180;
            const diag = Math.hypot(W, H);
            const kappa = (adv.axisBend * Math.PI) / 180 / Math.max(1, diag);
            const tilt = adv.depthTilt / 100;
            const F = Math.max(100, adv.cameraDistance * u800);
            const vx = W / 2;
            const vy = H / 2;
            const focusZ = (R * adv.focusDepth) / 100;
            const band = adv.focusBand / 100;
            const blurK = (Math.max(0, v.focusBlur) / 50) * adv.blurPx * u800;
            const gBase = adv.glyphSize * f;
            const Smax = diag * 0.8;

            const pk = pointer.over * hk;
            const pnx = (pointer.x / W - 0.5) * 2;
            const pny = (pointer.y / H - 0.5) * 2;
            const parX = (pnx * adv.parallax * u800 * pk) / R;
            const parY = (pny * adv.parallax * u800 * pk) / R;
            const lightR2 = Math.pow(Math.max(1, adv.lightRadius * u800), 2);
            const lightK = pk * 0.45;

            let ax = 0;
            let ay = 0;
            let nx = 0;
            let ny = 0;
            const axisAt = (s) => {
                const a = a0 + kappa * s;
                if (Math.abs(kappa) < 1e-7) {
                    ax = cx + Math.cos(a0) * s;
                    ay = cy - Math.sin(a0) * s;
                } else {
                    ax = cx + (Math.sin(a) - Math.sin(a0)) / kappa;
                    ay = cy + (Math.cos(a) - Math.cos(a0)) / kappa;
                }
                nx = Math.sin(a);
                ny = Math.cos(a);
            };
            const sigmaAt = (z) => blurK * Math.max(0, Math.abs(z - focusZ) / R - band);

            ctx.globalCompositeOperation = "lighter";

            const dustN = Math.max(0, Math.round(adv.dustCount));
            for (let d = 0; d < dustN; d++) {
                const hx = hash3(d, 1, adv.seed + 90);
                const hy = hash3(d, 2, adv.seed + 90);
                const hs = hash3(d, 3, adv.seed + 90);
                const hb = hash3(d, 4, adv.seed + 90);
                const zd = (hash3(d, 5, adv.seed + 90) - 0.5) * 2 * R;
                const x = hx * W + Math.sin(time * 0.07 + hs * 6.28) * 4 * u800 + parX * zd;
                const y = hy * H + Math.cos(time * 0.05 + hb * 6.28) * 3 * u800 + parY * zd;
                const r = (0.6 + hs * 0.9) * u800;
                const col = hb > 0.5 ? cyan : STEEL;
                const tw = 0.75 + 0.25 * Math.sin(time * 0.8 + hs * 20);
                const a = (0.3 + 0.3 * hash3(d, 6, adv.seed + 90)) * tw;
                if (hb > 0.45) {
                    ctx.fillStyle = rgba(col, a * 0.35);
                    ctx.beginPath();
                    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = rgba(col, a * 0.7);
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            const i0 = Math.ceil(-Smax / spacing);
            const i1 = Math.floor(Smax / spacing);
            if (adv.haze > 0) {
                const hazeC = parseColor(adv.hazeColor);
                const hs = spacing / 3;
                ctx.beginPath();
                for (let i = i0 * 3; i <= i1 * 3; i++) {
                    const s = i * hs;
                    axisAt(s);
                    const za = -s * tilt;
                    const th = (2 * Math.PI * s) / pitch + phi;
                    const c = Math.cos(th);
                    const sn = Math.sin(th);
                    const z0 = za + R * sn;
                    const z1 = za - R * sn;
                    const p0 = F / Math.max(1, F - z0);
                    const p1 = F / Math.max(1, F - z1);
                    const x0 = vx + (ax + R * c * nx - vx) * p0 + parX * z0;
                    const y0 = vy + (ay + R * c * ny - vy) * p0 + parY * z0;
                    const x1 = vx + (ax - R * c * nx - vx) * p1 + parX * z1;
                    const y1 = vy + (ay - R * c * ny - vy) * p1 + parY * z1;
                    if (Math.max(x0, x1) < -R || Math.min(x0, x1) > W + R || Math.max(y0, y1) < -R || Math.min(y0, y1) > H + R) continue;
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                }
                ctx.lineCap = "butt";
                ctx.strokeStyle = rgba(hazeC, (adv.haze / 100) * 0.3);
                ctx.lineWidth = hs * 2.6 + 8 * f;
                ctx.stroke();
                ctx.strokeStyle = rgba(hazeC, (adv.haze / 100) * 0.5);
                ctx.lineWidth = hs * 1.4;
                ctx.stroke();
            }

            const step = Math.max(3, half / 64);
            const ns = Math.floor((2 * Smax) / step) + 1;
            if (sX.length < ns) {
                sX = new Float32Array(ns);
                sY = new Float32Array(ns);
                sT = new Float32Array(ns);
                sS = new Float32Array(ns);
                sP = new Float32Array(ns);
            }
            const haloC = parseColor(adv.haloColor);
            const strandC = parseColor(adv.strandColor);
            const whiteC = [255, 255, 255, 1];
            const CH = 5;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            for (let k = 0; k < 2; k++) {
                for (let q = 0; q < ns; q++) {
                    const s = -Smax + q * step;
                    axisAt(s);
                    const za = -s * tilt;
                    const th = (2 * Math.PI * s) / pitch + phi + k * Math.PI;
                    const c = Math.cos(th);
                    const sn = Math.sin(th);
                    const z = za + R * sn;
                    const p = F / Math.max(1, F - z);
                    sX[q] = vx + (ax + R * c * nx - vx) * p + parX * z;
                    sY[q] = vy + (ay + R * c * ny - vy) * p + parY * z;
                    sT[q] = (sn + 1) / 2;
                    sS[q] = sigmaAt(z);
                    sP[q] = p;
                }
                for (let q0 = 0; q0 < ns - 1; q0 += CH) {
                    const q1 = Math.min(ns - 1, q0 + CH);
                    const mid = (q0 + q1) >> 1;
                    if (sX[mid] < -80 || sX[mid] > W + 80 || sY[mid] < -80 || sY[mid] > H + 80) continue;
                    const t = sT[mid];
                    const sg = sS[mid];
                    const p = sP[mid];
                    ctx.beginPath();
                    ctx.moveTo(sX[q0], sY[q0]);
                    for (let q = q0 + 1; q <= q1; q++) ctx.lineTo(sX[q], sY[q]);
                    if (adv.haloOpacity > 0 && adv.haloWidth > 0) {
                        ctx.lineWidth = (adv.haloWidth * f + sg * 4) * p;
                        ctx.strokeStyle = rgba(haloC, ((adv.haloOpacity / 100) * (0.55 + 0.45 * t)) / (1 + sg * 0.12));
                        ctx.stroke();
                    }
                    ctx.lineWidth = (adv.strandWidth * f + sg * 2.2) * p;
                    ctx.strokeStyle = rgba(mix(strandC, whiteC, 0.2 * Math.max(0, (t - 0.5) * 2)), (0.4 + 0.6 * t) / (1 + sg * 0.35));
                    ctx.stroke();
                }
            }

            const op = adv.glyphOpacity / 100;
            const farOp = adv.farOpacity / 100;
            const charP = adv.charShare / 100;
            const outP = adv.outlineShare / 100;
            const hs = Math.max(0.5, Math.min(0.99, adv.hotGlowStart / 100));
            const hotA = adv.hotGlow / 100;
            const nodeP = adv.nodeShare / 100;
            const seed = adv.seed;
            const at = atlas;
            const gl = glow;
            const nd = node;
            const lastLevel = LEVELS[NL - 1];

            for (let i = i0; i <= i1; i++) {
                const s = i * spacing;
                axisAt(s);
                const za = -s * tilt;
                const th = (2 * Math.PI * s) / pitch + phi;
                const c = Math.cos(th);
                const sn = Math.sin(th);
                const ex = R * c * nx;
                const ey = R * c * ny;
                const ez = R * sn;
                const pa = F / Math.max(1, F - (za + ez));
                const pb = F / Math.max(1, F - (za - ez));
                const xa = vx + (ax + ex - vx) * pa;
                const ya = vy + (ay + ey - vy) * pa;
                const xb = vx + (ax - ex - vx) * pb;
                const yb = vy + (ay - ey - vy) * pb;
                const m = 60 * u800;
                if (Math.max(xa, xb) < -m || Math.min(xa, xb) > W + m || Math.max(ya, yb) < -m || Math.min(ya, yb) > H + m) continue;

                const centre = Math.exp(-Math.pow(s / (1.5 * half), 2));
                const wr = 0.55 * vnoise(i / 5 + 0.37, seed) + 0.45 * centre;

                for (let j = 0; j < n; j++) {
                    if (hash3(i, j, seed + 1) < GAP) continue;
                    const u = 0.05 + (0.9 * j) / (n - 1);
                    const w = 1 - 2 * u;
                    const z = za + ez * w;
                    const p = F / Math.max(1, F - z);
                    const X = vx + (ax + ex * w - vx) * p + parX * z;
                    const Y = vy + (ay + ey * w - vy) * p + parY * z;
                    if (X < -m || X > W + m || Y < -m || Y > H + m) continue;
                    const front = (sn * w + 1) / 2;

                    const dx = X - pointer.x;
                    const dy = Y - pointer.y;
                    const lit = lightK > 0 ? lightK * Math.exp(-(dx * dx + dy * dy) / lightR2) : 0;

                    const hj = hash3(i, j, seed + 2);
                    let cv = 0.12 + wr * 0.85 + (hj - 0.5) * 0.45 + lit * 0.3;
                    if (wr > 0.55 && hash3(i, j, seed + 5) > 0.9) cv = 0.92 + 0.08 * hj;
                    cv = Math.max(0, Math.min(1, cv));
                    const row = Math.round(cv * (NC - 1));

                    const ht = hash3(i, j, seed + 3);
                    const type = ht < charP ? 2 + Math.floor((ht / Math.max(1e-4, charP)) * CHARS.length) % CHARS.length : ht < charP + outP ? 1 : 0;

                    const sg = sigmaAt(z);
                    const size = gBase * p;
                    const k = size / G;
                    const sa = Math.min(lastLevel, sg / Math.max(0.05, k));
                    let lv = 0;
                    let best = 1e9;
                    for (let l = 0; l < NL; l++) {
                        const d = Math.abs(LEVELS[l] - sa);
                        if (d < best) {
                            best = d;
                            lv = l;
                        }
                    }

                    ctx.globalAlpha = Math.max(0, Math.min(1, op * (farOp + (1 - farOp) * front) * (1 + lit * 1.5)));
                    const dw = CELL * k;
                    ctx.drawImage(at, (type * NL + lv) * CELL, row * CELL, CELL, CELL, X - dw / 2, Y - dw / 2, dw, dw);

                    if (cv > hs && hotA > 0) {
                        const gs = size * (3.2 + sg * 0.15);
                        ctx.globalAlpha = Math.min(1, (hotA * (cv - hs)) / (1 - hs)) * (0.5 + 0.5 * front);
                        ctx.drawImage(gl, X - gs / 2, Y - gs / 2, gs, gs);
                    }
                }

                for (let e = 0; e < 2; e++) {
                    if (hash3(i, 70 + e, seed) >= nodeP) continue;
                    const w = e === 0 ? 1 : -1;
                    const z = za + ez * w;
                    const p = F / Math.max(1, F - z);
                    const X = vx + (ax + ex * w - vx) * p + parX * z;
                    const Y = vy + (ay + ey * w - vy) * p + parY * z;
                    const sg = sigmaAt(z);
                    const ns2 = adv.nodeSize * f * p * (1 + sg * 0.08);
                    ctx.globalAlpha = 0.95 / (1 + sg * 0.15);
                    ctx.drawImage(nd, X - ns2 / 2, Y - ns2 / 2, ns2, ns2);
                }
            }
            ctx.globalAlpha = 1;

            if (adv.grain > 0 && grainPattern) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = (adv.grain / 100) * 0.12;
                ctx.translate(Math.random() * 128, Math.random() * 128);
                ctx.fillStyle = grainPattern;
                ctx.fillRect(-128, -128, W + 256, H + 256);
                ctx.restore();
            }

            if (adv.vignette > 0) {
                ctx.globalCompositeOperation = "source-over";
                const vg = ctx.createRadialGradient(W / 2, H / 2, diag * 0.18, W / 2, H / 2, diag * 0.55);
                vg.addColorStop(0, "rgba(0,0,0,0)");
                vg.addColorStop(1, `rgba(0,0,0,${(adv.vignette / 100).toFixed(3)})`);
                ctx.fillStyle = vg;
                ctx.fillRect(0, 0, W, H);
            }
            ctx.globalCompositeOperation = "source-over";
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    resize();
                    last = -1;
                    raf = requestAnimationFrame(frame);
                } else {
                    if (raf) cancelAnimationFrame(raf);
                }
            });
        }, { threshold: 0.02 });

        observer.observe(root);
    }
    initSkillsHelixBackground();

    /* ========================================================
       8d. SPIDER WEB — INTERACTIVE PHYSICS BACKGROUND (#contact)
       Originkit Spring-Mass Web lattice with cursor repulsion,
       sagging quadratic curves, and auto-sleep physics loop.
       ======================================================== */
    function initContactSpiderWeb() {
        const root = document.getElementById("contact");
        const canvas = document.getElementById("contactWebCanvas");
        if (!root || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const DEFAULTS = {
            color: "#DCE6FF",
            opacity: 60,
            segments: 26,
            rings: 12,
            thickness: 2.2,
            sag: 20,
            irregularity: 2,
            hoverIntensity: 20,
            nodes: true,
            nodeColor: "#00FF96",
            nodeSize: 3,
        };

        const STIFFNESS = 460;
        const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.05;
        const REACH = 370;
        const PUSH = 90;

        function clamp(v, lo, hi, fallback) {
            const n = typeof v === "number" && isFinite(v) ? v : fallback;
            return Math.max(lo, Math.min(hi, n));
        }

        function hash(a, b) {
            const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
            return s - Math.floor(s);
        }

        const S = {
            color: DEFAULTS.color,
            opacity: clamp(DEFAULTS.opacity, 0, 100, 60) / 100,
            segments: Math.round(clamp(DEFAULTS.segments, 5, 28, 26)),
            rings: Math.round(clamp(DEFAULTS.rings, 3, 14, 12)),
            thickness: 0.3 + clamp(DEFAULTS.thickness, 1, 10, 2.2) * 0.22,
            sag: clamp(DEFAULTS.sag, 0, 20, 20) * 0.011,
            irregularity: clamp(DEFAULTS.irregularity, 0, 20, 2) * 0.02,
            push: (PUSH * clamp(DEFAULTS.hoverIntensity, 0, 20, 20)) / 10,
            nodes: !!DEFAULTS.nodes,
            nodeColor: DEFAULTS.nodeColor,
            nodeSize: 0.4 + clamp(DEFAULTS.nodeSize, 1, 10, 3) * 0.18,
        };

        let grid = [];
        let width = 0;
        let height = 0;
        let dpr = 1;

        let pointerX = 0;
        let pointerY = 0;
        let pointerIn = false;

        let frameId = 0;
        let lastT = 0;
        let running = false;
        let isVisible = false;

        function build() {
            const cx = width / 2;
            const cy = height / 2;
            const outer = Math.hypot(width, height) * 0.58;

            grid = [];
            for (let i = 0; i < S.rings; i++) {
                const row = [];
                const t = (i + 1) / S.rings;
                const radius = outer * Math.pow(t, 1.35);
                for (let j = 0; j < S.segments; j++) {
                    const wobbleA = (hash(i, j) - 0.5) * S.irregularity;
                    const wobbleR = 1 + (hash(j, i) - 0.5) * S.irregularity;
                    const angle = (j / S.segments) * Math.PI * 2 + wobbleA;
                    const r = radius * wobbleR;
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    row.push({
                        restX: x,
                        restY: y,
                        x,
                        y,
                        vx: 0,
                        vy: 0,
                        pinned: i === S.rings - 1,
                    });
                }
                grid.push(row);
            }
        }

        function setSize() {
            const rect = root.getBoundingClientRect();
            width = Math.round(root.offsetWidth || rect.width || window.innerWidth);
            height = Math.round(root.offsetHeight || rect.height || 700);
            if (width <= 0 || height <= 0) return;
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build();
            wake();
        }

        function wake() {
            if (running || !isVisible) return;
            running = true;
            lastT = performance.now();
            frameId = requestAnimationFrame(loop);
        }

        function step() {
            const now = performance.now();
            let dt = (now - lastT) / 1000;
            lastT = now;
            if (!isFinite(dt) || dt < 0) dt = 0;
            if (dt > 0.033) dt = 0.033;

            const reach2 = REACH * REACH;
            let energy = 0;

            for (const row of grid) {
                for (const n of row) {
                    if (n.pinned) continue;

                    let ax = (n.restX - n.x) * STIFFNESS - n.vx * DAMPING;
                    let ay = (n.restY - n.y) * STIFFNESS - n.vy * DAMPING;

                    if (pointerIn && S.push > 0) {
                        const dx = n.x - pointerX;
                        const dy = n.y - pointerY;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < reach2) {
                            const d = Math.sqrt(d2) || 0.0001;
                            const fall = 1 - d / REACH;
                            const f = (S.push * fall * fall * STIFFNESS) / 40;
                            ax += (dx / d) * f;
                            ay += (dy / d) * f;
                        }
                    }

                    n.vx += ax * dt;
                    n.vy += ay * dt;
                    n.x += n.vx * dt;
                    n.y += n.vy * dt;
                    energy += Math.abs(n.vx) + Math.abs(n.vy);
                }
            }

            draw();

            if ((!pointerIn || S.push <= 0) && energy < 0.5) {
                running = false;
                cancelAnimationFrame(frameId);
            }
        }

        function draw() {
            const cx = width / 2;
            const cy = height / 2;
            ctx.clearRect(0, 0, width, height);
            if (!grid.length) return;

            ctx.strokeStyle = S.color;
            ctx.globalAlpha = S.opacity;
            ctx.lineWidth = S.thickness;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const rings = grid.length;
            const segments = grid[0].length;

            for (let j = 0; j < segments; j++) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                for (let i = 0; i < rings; i++) {
                    const n = grid[i][j];
                    ctx.lineTo(n.x, n.y);
                }
                ctx.stroke();
            }

            for (let i = 0; i < rings; i++) {
                const row = grid[i];
                ctx.beginPath();
                for (let j = 0; j < segments; j++) {
                    const a = row[j];
                    const b = row[(j + 1) % segments];
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    const cxp = mx + (cx - mx) * S.sag;
                    const cyp = my + (cy - my) * S.sag;
                    if (j === 0) ctx.moveTo(a.x, a.y);
                    ctx.quadraticCurveTo(cxp, cyp, b.x, b.y);
                }
                ctx.stroke();
            }

            if (S.nodes) {
                ctx.fillStyle = S.nodeColor;
                for (const row of grid) {
                    for (const n of row) {
                        ctx.beginPath();
                        ctx.arc(n.x, n.y, S.nodeSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            ctx.globalAlpha = 1;
        }

        function loop() {
            if (!running) return;
            frameId = requestAnimationFrame(loop);
            step();
        }

        const move = (e) => {
            const rect = root.getBoundingClientRect();
            pointerX = e.clientX - rect.left;
            pointerY = e.clientY - rect.top;
            pointerIn = true;
            wake();
        };

        const leave = () => {
            pointerIn = false;
            wake();
        };

        root.addEventListener("pointermove", move, { passive: true });
        root.addEventListener("pointerleave", leave, { passive: true });
        root.addEventListener("pointercancel", leave, { passive: true });

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(setSize);
            ro.observe(root);
        } else {
            window.addEventListener("resize", setSize, { passive: true });
        }
        setSize();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    setSize();
                    wake();
                } else {
                    running = false;
                    if (frameId) cancelAnimationFrame(frameId);
                }
            });
        }, { threshold: 0.05 });

        observer.observe(root);
    }
    initContactSpiderWeb();

    /* ========================================================
       7c. ABOUT 3D PHOTO CARD TILT INTERACTION
       Tactile neo-brutalist 3D tilt tracking with smooth damping
       ======================================================== */
    function initAboutCardTilt() {
        const tiltWrap = document.querySelector(".about-card-tilt-wrap");
        if (!tiltWrap) return;
        let bounds;

        function rotateToMouse(e) {
            bounds = tiltWrap.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const leftX = mouseX - bounds.x;
            const topY = mouseY - bounds.y;
            const center = {
                x: leftX - bounds.width / 2,
                y: topY - bounds.height / 2
            };
            const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

            tiltWrap.style.transform = `
                perspective(1000px)
                rotateX(${-(center.y / 18).toFixed(2)}deg)
                rotateY(${(center.x / 18).toFixed(2)}deg)
                scale3d(1.02, 1.02, 1.02)
            `;
        }

        tiltWrap.addEventListener("mouseenter", () => {
            bounds = tiltWrap.getBoundingClientRect();
            tiltWrap.style.transition = "transform 0.1s ease-out";
        });

        tiltWrap.addEventListener("mousemove", rotateToMouse);

        tiltWrap.addEventListener("mouseleave", () => {
            tiltWrap.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
            tiltWrap.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        });
    }
    initAboutCardTilt();

    /* ========================================================
       9. AWWWARDS-LEVEL SILKY SMOOTH ON-SCROLL REVEALS
       Cinematic, organic decelerations with cubic-bezier / power3 easing
       and subtle 24-36px translational glides across all sections.
       ======================================================== */
    if (motionEnabled) {
        // Section Headers Entrance
        gsap.utils.toArray(".gs-section-header").forEach(header => {
            gsap.fromTo(header, 
                { y: 28, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: header,
                        start: "top 85%",
                        once: true
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.1,
                    ease: "power3.out"
                }
            );
        });

        // About Section Reveals (Smooth picture from left, narrative from right)
        const aboutPhoto = document.getElementById("aboutPhotoCard");
        const aboutText = document.getElementById("aboutTextCol");
        if (aboutPhoto && aboutText) {
            gsap.fromTo(aboutPhoto,
                { opacity: 0, x: -45, y: 15 },
                {
                    scrollTrigger: {
                        trigger: "#about",
                        start: "top 80%",
                        once: true
                    },
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out"
                }
            );
            gsap.fromTo(aboutText,
                { opacity: 0, x: 45, y: 15 },
                {
                    scrollTrigger: {
                        trigger: "#about",
                        start: "top 80%",
                        once: true
                    },
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    delay: 0.08,
                    ease: "power3.out"
                }
            );
        }

        // About Section 4 Metrics Cards Stagger
        gsap.fromTo(".about-metric-card",
            { opacity: 0, y: 25, scale: 0.98 },
            {
                scrollTrigger: {
                    trigger: "#about",
                    start: "top 75%",
                    once: true
                },
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                stagger: 0.08,
                ease: "power3.out"
            }
        );

        // AI Automations Console Exhibit Reveal
        const autoTabs = document.querySelector("#automations .overflow-x-auto");
        const autoCard = document.querySelector("#automations .bg-card.brutal-border");
        if (autoTabs) {
            gsap.fromTo(autoTabs,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: { trigger: "#automations", start: "top 80%", once: true }
                }
            );
        }
        if (autoCard) {
            gsap.fromTo(autoCard,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    delay: 0.08,
                    ease: "power3.out",
                    scrollTrigger: { trigger: "#automations", start: "top 75%", once: true }
                }
            );
        }

        // Curated Project Cards Stagger
        gsap.utils.toArray(".project-card-wrap").forEach((card, idx) => {
            gsap.fromTo(card,
                { opacity: 0, y: 32, scale: 0.98 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.0,
                    ease: "power3.out"
                }
            );
        });

        // Skills Bento Grid Cards Reveal
        gsap.utils.toArray("#skills .grid > div").forEach((bentoCard, idx) => {
            gsap.fromTo(bentoCard,
                { opacity: 0, y: 26, scale: 0.98 },
                {
                    scrollTrigger: {
                        trigger: bentoCard,
                        start: "top 85%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.9,
                    delay: (idx % 3) * 0.07,
                    ease: "power3.out"
                }
            );
        });

        // Journey Timeline Animated Line Draw & Glowing Bead Trajectory
        const timelineProgress = document.getElementById("timelineProgressLine");
        const timelineHead = document.getElementById("timelineProgressHead");
        const timelineSpine = document.getElementById("timelineSpine");

        if (timelineProgress && timelineSpine) {
            gsap.set(timelineProgress, { scaleY: 0, transformOrigin: "top center" });
            if (timelineHead) gsap.set(timelineHead, { top: "0%" });

            gsap.to(timelineProgress, {
                scaleY: 1,
                ease: "none",
                transformOrigin: "top center",
                scrollTrigger: {
                    trigger: timelineSpine,
                    start: "top 72%",
                    end: "bottom 75%",
                    scrub: 0.25,
                    onUpdate: (self) => {
                        if (timelineHead) {
                            timelineHead.style.top = `${self.progress * 100}%`;
                        }
                    }
                }
            });
        }

        // Animate each Journey milestone level with buttery-smooth glide
        gsap.utils.toArray(".timeline-step").forEach((step, idx) => {
            const leftCol = step.querySelector(".timeline-left-col");
            const rightCol = step.querySelector(".timeline-right-col");
            const node = step.querySelector(".timeline-node");

            // Set initial offscreen states
            if (leftCol) gsap.set(leftCol, { opacity: 0, x: -35, y: 15 });
            if (rightCol) gsap.set(rightCol, { opacity: 0, x: 35, y: 15 });
            if (node) gsap.set(node, { opacity: 0, scale: 0.3, xPercent: -50, yPercent: -50 });

            ScrollTrigger.create({
                trigger: step,
                start: "top 72%",
                onEnter: () => {
                    if (leftCol) gsap.to(leftCol, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out" });
                    if (rightCol) gsap.to(rightCol, { opacity: 1, x: 0, y: 0, duration: 0.8, delay: 0.08, ease: "power3.out" });
                    if (node) gsap.to(node, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, duration: 0.7, delay: 0.04, ease: "back.out(1.8)" });
                },
                onLeaveBack: () => {
                    if (leftCol) gsap.to(leftCol, { opacity: 0, x: -35, y: 15, duration: 0.5, ease: "power2.in" });
                    if (rightCol) gsap.to(rightCol, { opacity: 0, x: 35, y: 15, duration: 0.5, ease: "power2.in" });
                    if (node) gsap.to(node, { opacity: 0, scale: 0.3, xPercent: -50, yPercent: -50, duration: 0.4, ease: "power2.in" });
                }
            });

            // Smooth tactile hover on milestone card scaling node while locking exact center
            step.addEventListener("mouseenter", () => {
                if (node) gsap.to(node, { scale: 1.25, xPercent: -50, yPercent: -50, duration: 0.25, ease: "power2.out" });
            });
            step.addEventListener("mouseleave", () => {
                if (node) gsap.to(node, { scale: 1, xPercent: -50, yPercent: -50, duration: 0.25, ease: "power2.out" });
            });
        });

        // GitHub Verification Activity & Repos Reveal
        gsap.utils.toArray("#github .grid > div").forEach((ghCard, idx) => {
            gsap.fromTo(ghCard,
                { opacity: 0, y: 26 },
                {
                    scrollTrigger: {
                        trigger: ghCard,
                        start: "top 88%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    delay: (idx % 3) * 0.07,
                    ease: "power3.out"
                }
            );
        });

        // Contact Section Channels & Transmission Card Reveal
        gsap.utils.toArray("#contact .grid > div, #contact .grid > a").forEach((contactCard, idx) => {
            gsap.fromTo(contactCard,
                { opacity: 0, y: 24, scale: 0.97 },
                {
                    scrollTrigger: {
                        trigger: "#contact",
                        start: "top 80%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.85,
                    delay: idx * 0.05,
                    ease: "power3.out"
                }
            );
        });

        const contactMsgForm = document.querySelector("#contact .bg-card.brutal-border.brutal-shadow.p-8");
        if (contactMsgForm) {
            gsap.fromTo(contactMsgForm,
                { opacity: 0, y: 30 },
                {
                    scrollTrigger: {
                        trigger: contactMsgForm,
                        start: "top 85%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    delay: 0.1,
                    ease: "power3.out"
                }
            );
        }
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
    const mobileCloseBtn = document.getElementById("mobileMenuCloseBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");

    let menuOpen = false;
    function setMobileMenu(open) {
        menuOpen = open;
        mobileMenu.style.transform = open ? "translateY(0)" : "translateY(-100%)";
        mobileBtn.setAttribute("aria-expanded", String(open));
        mobileMenu.setAttribute("aria-hidden", String(!open));
        document.body.style.overflow = open ? "hidden" : "";
        if (sound && typeof sound.playClick === "function") sound.playClick();
    }

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener("click", () => setMobileMenu(!menuOpen));
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener("click", () => setMobileMenu(false));
        }
        mobileLinks.forEach(l => l.addEventListener("click", () => setMobileMenu(false)));
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && menuOpen) setMobileMenu(false);
        });
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
