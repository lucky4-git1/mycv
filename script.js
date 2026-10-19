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
       0. LENIS SMOOTH SCROLL INTEGRATION (GSAP ScrollTrigger Sync)
       ======================================================== */
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

        // Synchronize Lenis scroll with GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // Intercept native anchor clicks for smooth Lenis scrolling
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                const targetId = this.getAttribute("href");
                if (targetId && targetId !== "#" && targetId.length > 1) {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        lenis.scrollTo(targetEl, { offset: -70 });
                    }
                }
            });
        });

        window.lenis = lenis;
    }

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
       2. FLUID DUAL-LAYER CUSTOM CURSOR
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

            this.x = window.innerWidth / 2;
            this.y = window.innerHeight / 2;
            this.targetX = this.x;
            this.targetY = this.y;
            this.visible = false;
            this.lerp = 0.24;

            this.INTERACTIVE = "a, button, input, textarea, select, [role='button'], .hover-target, .cmd-item, .project-card, .filter-tab, .sim-tab";

            this.bindEvents();
            this.tick();
        }

        bindEvents() {
            document.addEventListener("mousemove", (e) => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;
                if (!this.visible) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.visible = true;
                    this.el.classList.add("is-visible");
                }
            }, { passive: true });

            document.addEventListener("mousedown", () => this.el.classList.add("is-clicking"));
            document.addEventListener("mouseup", () => this.el.classList.remove("is-clicking"));

            document.addEventListener("mouseover", (e) => {
                if (e.target.closest(this.INTERACTIVE)) {
                    this.el.classList.add("is-hover");
                }
            });

            document.addEventListener("mouseout", (e) => {
                if (e.target.closest(this.INTERACTIVE)) {
                    const to = e.relatedTarget;
                    if (!to || !to.closest || !to.closest(this.INTERACTIVE)) {
                        this.el.classList.remove("is-hover");
                    }
                }
            });

            document.addEventListener("mouseleave", () => this.el.classList.remove("is-visible"));
            document.addEventListener("mouseenter", () => {
                if (this.visible) this.el.classList.add("is-visible");
            });
        }

        tick() {
            this.x += (this.targetX - this.x) * this.lerp;
            this.y += (this.targetY - this.y) * this.lerp;
            this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
            requestAnimationFrame(this.tick.bind(this));
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
       5. NATIVE INTERACTIVE 3D HERO STAGE (Blender MCP Assets)
       ======================================================== */
    function initHero3DStage() {
        const canvas = document.getElementById("hero3DCanvas");
        const container = document.getElementById("hero3DWrapper");
        const loadingEl = document.getElementById("hero3DLoading");
        const modelNameEl = document.getElementById("hero3DModelName");
        const btnHero = document.getElementById("switchModelHeroBtn");
        const btnMascot = document.getElementById("switchModelMascotBtn");
        const btnKiln = document.getElementById("switchModelKilnBtn");

        if (!canvas || !container || typeof THREE === "undefined") {
            return;
        }

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x07090e);

        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 5.2);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        // 2. Cinematic Studio Lighting (Calibrated for Black Ceramic & Titanium)
        const ambientLight = new THREE.AmbientLight(0x0a0c10, 1.2);
        scene.add(ambientLight);

        // Key Light: Crisp neutral white studio softbox
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
        keyLight.position.set(4, 5, 5);
        scene.add(keyLight);

        // Rim Light: Cool titanium specular rim carving the silhouette
        const rimLight = new THREE.DirectionalLight(0x94a3b8, 4.2);
        rimLight.position.set(-5, 4, -4);
        scene.add(rimLight);

        // Acid / Neon-Lime Accent Point Light (#e4ff00)
        const neonPointLight = new THREE.PointLight(0xe4ff00, 2.2, 8);
        neonPointLight.position.set(0, 0, 1.2);
        scene.add(neonPointLight);

        // 3. Floating Cyber Particle Field (Restrained Acid-Lime & Titanium Stardust)
        const particleCount = 90;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorLime = new THREE.Color(0xe4ff00);
        const colorTitanium = new THREE.Color(0x94a3b8);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

            const c = (i % 3 === 0) ? colorLime : colorTitanium;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // 4. Model Group & Loader
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);

        const loader = new THREE.GLTFLoader();
        let activeModel = null;
        let isMascot = false;

        const modelConfigs = {
            hero: {
                url: "portfolio-3d/public/models/hero-sculpture.glb",
                name: "MECHANICAL SCULPTURE // ASSET A",
                subtitle: "BLACK CERAMIC, TITANIUM & NEON-LIME CORE",
                scale: 0.88,
                yOffset: 0
            },
            mascot: {
                url: "portfolio-3d/public/models/hero-mascot.glb",
                name: "AUTONOMOUS MASCOT // ASSET B",
                subtitle: "MAGNETIC REPULSOR CHASSIS & OPTIC VISOR",
                scale: 0.95,
                yOffset: -0.2
            },
            kiln: {
                url: "portfolio-3d/public/models/neural-artifact.glb",
                name: "NEURAL ARTIFACT // KILN 1.3",
                subtitle: "PROCEDURAL COMPUTATIONAL NODE & ORBITAL SATELLITES",
                scale: 1.15,
                yOffset: 0
            }
        };

        const subtitleEl = container.querySelector(".text-\\[9px\\]");

        function loadModel(type) {
            if (loadingEl) loadingEl.style.opacity = "1";
            const config = modelConfigs[type];

            loader.load(
                config.url,
                (gltf) => {
                    if (activeModel) {
                        modelGroup.remove(activeModel);
                    }

                    activeModel = gltf.scene;
                    activeModel.scale.setScalar(config.scale);

                    // Center mesh geometry
                    const box = new THREE.Box3().setFromObject(activeModel);
                    const center = box.getCenter(new THREE.Vector3());
                    activeModel.position.sub(center);
                    activeModel.position.y += config.yOffset;

                    modelGroup.add(activeModel);

                    if (modelNameEl) modelNameEl.innerText = config.name;
                    if (subtitleEl && config.subtitle) subtitleEl.innerText = config.subtitle;
                    if (loadingEl) loadingEl.style.opacity = "0";
                },
                undefined,
                (err) => {
                    console.warn("Could not load model:", config.url, err);
                    if (loadingEl) loadingEl.style.opacity = "0";
                }
            );
        }

        // Initial Load
        loadModel("hero");

        // 3-Way Switcher Buttons (Core, Mascot, Kiln Artifact)
        const buttons = [
            { el: btnHero, type: "hero" },
            { el: btnMascot, type: "mascot" },
            { el: btnKiln, type: "kiln" }
        ];

        function setActiveButton(activeType) {
            buttons.forEach(({ el, type }) => {
                if (!el) return;
                if (type === activeType) {
                    el.classList.add("bg-a1", "text-black");
                    el.classList.remove("bg-black/80", "text-white");
                } else {
                    el.classList.remove("bg-a1", "text-black");
                    el.classList.add("bg-black/80", "text-white");
                }
            });
        }

        buttons.forEach(({ el, type }) => {
            if (el) {
                el.addEventListener("click", () => {
                    sound.playClick();
                    setActiveButton(type);
                    loadModel(type);
                });
            }
        });

        // 5. Interaction: Mouse Tilt & Orbit Drag
        let targetRotationX = 0;
        let targetRotationY = 0;
        let currentRotationX = 0;
        let currentRotationY = 0;

        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        let dragVelocityX = 0;
        let dragVelocityY = 0;

        // Mouse Parallax across viewport
        window.addEventListener("mousemove", (e) => {
            if (!isDragging && motionEnabled) {
                const nx = (e.clientX / window.innerWidth) * 2 - 1;
                const ny = (e.clientY / window.innerHeight) * 2 - 1;
                targetRotationY = nx * 0.45;
                targetRotationX = -ny * 0.35;
            }
        });

        // Direct Drag on 3D Container
        container.addEventListener("pointerdown", (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
            dragVelocityX = 0;
            dragVelocityY = 0;
        });

        window.addEventListener("pointermove", (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMouseX;
                const deltaY = e.clientY - previousMouseY;

                dragVelocityX = deltaX * 0.006;
                dragVelocityY = deltaY * 0.006;

                targetRotationY += dragVelocityX;
                targetRotationX += dragVelocityY;

                previousMouseX = e.clientX;
                previousMouseY = e.clientY;
            }
        });

        window.addEventListener("pointerup", () => {
            isDragging = false;
        });

        // 6. Resize Handling
        window.addEventListener("resize", () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        // 7. Render Loop with Viewport Visibility Observer
        let clock = new THREE.Clock();
        let isVisible = true;
        let animationFrameId = null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible && !animationFrameId) {
                    animate();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(container);

        function animate() {
            if (!isVisible) {
                animationFrameId = null;
                return;
            }
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (motionEnabled) {
                // Organic breathing float
                modelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

                // Auto-yaw drift when not dragging
                if (!isDragging) {
                    targetRotationY += 0.0025;
                }

                // Smooth interpolation (lerp)
                currentRotationX += (targetRotationX - currentRotationX) * 0.06;
                currentRotationY += (targetRotationY - currentRotationY) * 0.06;

                modelGroup.rotation.x = currentRotationX;
                modelGroup.rotation.y = currentRotationY;

                // Subtle particle drift
                particles.rotation.y = elapsedTime * 0.02;
                particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
            } else {
                modelGroup.rotation.y = targetRotationY;
                modelGroup.rotation.x = targetRotationX;
            }

            renderer.render(scene, camera);
        }

        animate();

        // 8. Cinematic Scroll Spatial Hand-off (Hero to Content transition)
        if (typeof ScrollTrigger !== "undefined" && motionEnabled) {
            ScrollTrigger.create({
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 1.2,
                onUpdate: (self) => {
                    if (modelGroup) {
                        modelGroup.rotation.z = self.progress * 0.35;
                        modelGroup.position.z = -self.progress * 1.1;
                    }
                }
            });
        }
    }

    initHero3DStage();


    /* ========================================================
       6. INTERACTIVE AI AUTOMATION TERMINAL SIMULATOR
       ======================================================== */
    const automationWorkflows = {
        simpleide: {
            title: "SimpleIDE - AI Agent Desktop Workflow",
            desc: "Electron & Vite environment dispatching local AI reasoning to parse code, run AST diffs, and generate unit tests.",
            steps: [
                { delay: 300, text: "[INIT] Starting SimpleIDE Agent Core v2.4 (Electron IPC Bridge)..." },
                { delay: 700, text: "[AST_SCAN] Parsing workspace AST: 32 files mapped. Resolving dependencies..." },
                { delay: 1200, text: "[AGENT] Context window loaded: React 18, Vite, Tailwind CSS config." },
                { delay: 1800, text: "[AI_REASONING] Generating intelligent refactor proposal for state synchronization..." },
                { delay: 2400, text: "[DIFF_CHECK] 14 lines added, 3 redundant re-renders pruned. Linting PASSED." },
                { delay: 3000, text: "[SUCCESS] Workspace updated cleanly. Latency: 420ms. Ready for user preview." }
            ]
        },
        whatsapp: {
            title: "WhatsApp AI Autonomous Bot Pipeline",
            desc: "Webhook listener receiving inbound customer messages, running LLM intent classification, and routing responses.",
            steps: [
                { delay: 300, text: "[WEBHOOK_IN] POST /api/whatsapp/webhook received from client +91-XXXXXXXXXX" },
                { delay: 800, text: "[INTENT_CLASSIFIER] Message: 'Need pricing and integration timeline for inventory portal.'" },
                { delay: 1400, text: "[NLP_ENGINE] Detected intent: LEAD_INQUIRY_HIGH_PRIORITY (Confidence: 98.4%)" },
                { delay: 2100, text: "[AGENT_ACTION] Synthesizing context-aware personalized quote & booking link..." },
                { delay: 2700, text: "[CRM_SYNC] Created lead record #8491 in database with tag: 'Commercial Quote'" },
                { delay: 3200, text: "[DISPATCH] WhatsApp Cloud API message transmitted successfully (HTTP 200 OK)." }
            ]
        },
        ema: {
            title: "EMA - Email Marketing Automation Engine",
            desc: "TypeScript automation pipeline executing cold outreach segmentation, dynamic content injection, and webhook scheduling.",
            steps: [
                { delay: 300, text: "[CRON_TRIGGER] Executing batch cycle 'Q4 Developer Outreach Pipeline'..." },
                { delay: 800, text: "[SEGMENTATION] Filtered 4,200 leads down to 350 active tech founders." },
                { delay: 1500, text: "[DYNAMIC_GEN] Injecting custom GitHub portfolio references into template body..." },
                { delay: 2200, text: "[DKIM_SPF] Validating DNS deliverability scores... Sender score: 99.8/100." },
                { delay: 2800, text: "[QUEUE_DISPATCH] 350 personalized emails queued across 10 rolling worker threads." },
                { delay: 3300, text: "[METRIC] Predicted open rate: 46.2%. Webhook tracking listeners live." }
            ]
        },
        rewritebot: {
            title: "RewriteBot - AI Semantic Rewrite Engine",
            desc: "Next.js & Vercel deployment optimizing drafts into crisp, brutalist, high-converting copy.",
            steps: [
                { delay: 300, text: "[INGEST] Ingesting source draft: 480 words, Flesch Reading Ease: 42." },
                { delay: 800, text: "[SEMANTIC_MAP] Detecting passive voice and redundant corporate filler..." },
                { delay: 1500, text: "[AI_PASS] Transforming into punchy, active, developer-first communication." },
                { delay: 2300, text: "[DIFF] Word count reduced: 480 -> 210. Readability score improved: +38%." },
                { delay: 3000, text: "[EXPORT] Deployed to https://rewritebot-client.vercel.app with instant copy." }
            ]
        }
    };

    let activeSimTimeout = null;

    function startSimulatedWorkflow(key) {
        const wf = automationWorkflows[key] || automationWorkflows.simpleide;
        const terminalOutput = document.getElementById("terminalOutput");
        const simMetaTitle = document.getElementById("simMetaTitle");
        const simMetaDesc = document.getElementById("simMetaDesc");

        if (simMetaTitle) simMetaTitle.innerText = wf.title;
        if (simMetaDesc) simMetaDesc.innerText = wf.desc;

        // Clear existing running scripts
        if (activeSimTimeout) {
            clearTimeout(activeSimTimeout);
            activeSimTimeout = null;
        }

        if (terminalOutput) {
            terminalOutput.innerHTML = `
                <div class="terminal-log-line text-slate-400 font-mono text-xs">
                    [${new Date().toLocaleTimeString()}] INITIATING: ${wf.title}
                </div>
            `;

            wf.steps.forEach((step, idx) => {
                setTimeout(() => {
                    const isLast = idx === wf.steps.length - 1;
                    const colorClass = isLast ? "text-a4 font-bold" : "text-slate-200";
                    const line = document.createElement("div");
                    line.className = `terminal-log-line ${colorClass}`;
                    line.innerHTML = `<span class="opacity-40">[${new Date().toLocaleTimeString()}]</span> ${step.text}`;
                    terminalOutput.appendChild(line);
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    sound.playBlip();

                    if (isLast) sound.playSuccess();
                }, step.delay);
            });
        }
    }

    // Bind tab clicks in simulator
    document.querySelectorAll(".sim-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".sim-tab").forEach(t => {
                t.classList.remove("bg-a1", "text-black");
                t.classList.add("bg-card", "text-text");
            });
            tab.classList.add("bg-a1", "text-black");
            tab.classList.remove("bg-card", "text-text");

            const workflowKey = tab.getAttribute("data-workflow");
            startSimulatedWorkflow(workflowKey);
        });
    });

    const runSimBtn = document.getElementById("runSimBtn");
    if (runSimBtn) {
        runSimBtn.addEventListener("click", () => {
            sound.playClick();
            const activeTab = document.querySelector(".sim-tab.bg-a1");
            const key = activeTab ? activeTab.getAttribute("data-workflow") : "simpleide";
            startSimulatedWorkflow(key);
        });
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
       9. GSAP CINEMATIC CHAPTER STORYTELLING (Chapters A - G)
       ======================================================== */
    if (motionEnabled) {
        // Chapter A: Opening Hero Entrance
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        heroTl
            .from(".hero-badge", { y: 24, opacity: 0, duration: 0.6, delay: 0.15 })
            .from(".hero-title-main", { y: 40, opacity: 0, duration: 0.8 }, "-=0.35")
            .from(".hero-status-pill", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.4")
            .from(".hero-desc", { y: 24, opacity: 0, duration: 0.6 }, "-=0.3")
            .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
            .from(".stage-container", { scale: 0.96, y: 30, opacity: 0, duration: 0.9 }, "-=0.6");

        // Section Headers (Unified Editorial Title Reveal)
        gsap.utils.toArray(".gs-section-header").forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: "top 86%"
                },
                y: 35,
                opacity: 0,
                duration: 0.75,
                ease: "power3.out"
            });
        });

        // Chapter C: About & Identity Reveal
        const aboutCards = document.querySelectorAll("#about .hover-target");
        if (aboutCards.length > 0) {
            gsap.from(aboutCards, {
                scrollTrigger: {
                    trigger: "#about",
                    start: "top 78%"
                },
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.14,
                ease: "power3.out"
            });
        }

        // Chapter D: Curated Projects Showcase (Staggered Cards)
        gsap.utils.toArray(".project-card-wrap").forEach((card, idx) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%"
                },
                y: 45,
                opacity: 0,
                duration: 0.65,
                delay: (idx % 2) * 0.1,
                ease: "power3.out"
            });
        });

        // Chapter E: AI Automations Terminal Reveal
        const simTerminal = document.querySelector(".sim-terminal");
        if (simTerminal) {
            gsap.from(simTerminal, {
                scrollTrigger: {
                    trigger: "#automations",
                    start: "top 75%"
                },
                scale: 0.97,
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
        }

        // Chapter F: Journey & Milestones (Timeline Node Stagger)
        const journeyNodes = document.querySelectorAll("#journey .relative.pl-8");
        if (journeyNodes.length > 0) {
            gsap.from(journeyNodes, {
                scrollTrigger: {
                    trigger: "#journey",
                    start: "top 80%"
                },
                x: -30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power2.out"
            });
        }

        // Chapter G: Contact Finale Transition
        const contactBox = document.querySelector("#contact .brutal-shadow-lg");
        if (contactBox) {
            gsap.from(contactBox, {
                scrollTrigger: {
                    trigger: "#contact",
                    start: "top 82%"
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            });
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
            timeEl.innerText = now.toLocaleTimeString("en-US", options);
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
        startSimulatedWorkflow("simpleide");
    }, 1200);
});
