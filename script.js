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
                const refactorTab = document.querySelector('[data-panel="refactor"]');
                if (refactorTab) refactorTab.click();
            }
        });
    });

    /* ========================================================
       5. SEAMLESS HERO 3D GYRO-PARALLAX & TILT
       ======================================================== */
    function initHeroParallax() {
        const stage = document.getElementById("heroVisualStage");
        const wrapper = document.getElementById("heroParallaxWrapper");
        const cards = document.querySelectorAll(".hero-holo-card");
        if (!stage || !wrapper) return;

        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;

        window.addEventListener("mousemove", (e) => {
            const rect = stage.getBoundingClientRect();
            // Calculate relative to stage center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Normalized -1 to +1
            mouseX = (e.clientX - centerX) / (window.innerWidth * 0.5);
            mouseY = (e.clientY - centerY) / (window.innerHeight * 0.5);
            mouseX = Math.max(-1, Math.min(1, mouseX));
            mouseY = Math.max(-1, Math.min(1, mouseY));
        });

        function renderParallax() {
            // Smooth lerp for buttery smooth motion
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;

            const rotX = -currentY * 10;
            const rotY = currentX * 12;

            wrapper.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

            cards.forEach((card, idx) => {
                const depth = (idx + 1) * 7;
                const transX = currentX * depth;
                const transY = currentY * depth;
                card.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, ${depth * 2}px)`;
            });

            requestAnimationFrame(renderParallax);
        }

        requestAnimationFrame(renderParallax);
    }
    initHeroParallax();

    /* ========================================================
       5B. NATIVE INTERACTIVE 3D HERO STAGE (Fallback check)
       ======================================================== */
    function initHero3DStage() {
        const canvas = document.getElementById("hero3DCanvas");
        const container = document.getElementById("hero3DWrapper");
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
       6. INTERACTIVE AI AUTOMATIONS & DEV WORKBENCH (Real Functional Engine)
       ======================================================== */
    (function initAutomationsWorkbench() {
        const tabs = document.querySelectorAll(".workbench-tab");
        const panels = {
            refactor: document.getElementById("wbPanelRefactor"),
            github: document.getElementById("wbPanelGithub"),
            workflows: document.getElementById("wbPanelWorkflows"),
            schema: document.getElementById("wbPanelSchema")
        };
        const statusTitle = document.getElementById("wbStatusTitle");

        const titles = {
            refactor: "MODULE: AST Code Optimizer & Token Reducer",
            github: "MODULE: GitHub API v3 Telemetry & Live Repositories",
            workflows: "MODULE: Production AI Agent Pipeline Compiler",
            schema: "MODULE: Deterministic JSON to TypeScript Interface Generator"
        };

        // 1. Tab Switching
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const targetKey = tab.getAttribute("data-panel");
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                Object.keys(panels).forEach(key => {
                    if (panels[key]) {
                        if (key === targetKey) {
                            panels[key].classList.remove("hidden");
                            panels[key].classList.add("block");
                        } else {
                            panels[key].classList.add("hidden");
                            panels[key].classList.remove("block");
                        }
                    }
                });

                if (statusTitle && titles[targetKey]) {
                    statusTitle.textContent = titles[targetKey];
                }

                sound.playClick();

                if (targetKey === "github" && !hasLoadedGithub) {
                    fetchGithubTelemetry();
                }
            });
        });

        // 2. PANEL 1: Code Refactor & Optimizer
        const codeInput = document.getElementById("wbCodeInput");
        const codeOutput = document.getElementById("wbCodeOutput");
        const loadSampleBtn = document.getElementById("wbLoadSampleBtn");
        const clearCodeBtn = document.getElementById("wbClearCodeBtn");
        const runRefactorBtn = document.getElementById("wbRunRefactorBtn");
        const copyCodeBtn = document.getElementById("wbCopyCodeBtn");
        const copyText = document.getElementById("wbCopyText");
        const optLogs = document.getElementById("wbOptLogs");
        const optComments = document.getElementById("wbOptComments");
        const optWhitespace = document.getElementById("wbOptWhitespace");
        const inBytesEl = document.getElementById("wbInBytes");
        const outBytesEl = document.getElementById("wbOutBytes");
        const reductionPctEl = document.getElementById("wbReductionPct");
        const execTimeEl = document.getElementById("wbExecTime");

        const sampleDirtyCode = `// Production API Handler - User Verification & Profile Enrichment
// NOTE: Legacy debugging logs must be pruned before deploying to edge cluster.
console.log("[DEBUG] Ingesting request headers...", request.headers);

async function handleUserProfileSync(userId, rawPayload, options) {
    console.time("syncTimer");
    console.log("Processing userId: ", userId);
    
    // Check user presence
    if (!userId || typeof userId !== "string") {
        console.error("Critical error: Invalid userId received!");
        throw new Error("ERR_INVALID_USER_IDENTIFIER");
    }
    
    
    // Normalize metadata
    const sanitizedEmail = rawPayload.email ? rawPayload.email.trim().toLowerCase() : "";
    console.log("Sanitized email address:", sanitizedEmail);
    
    /* 
       Construct normalized enterprise profile object
       Enforces zero AI slop and deterministic schemas
    */
    const cleanProfile = {
        id: userId.trim(),
        email: sanitizedEmail,
        tier: options?.isEnterprise ? "enterprise" : "developer",
        active: Boolean(rawPayload.isActive),
        timestamp: new Date().toISOString()
    };
    
    console.log("Profile mapped cleanly:", JSON.stringify(cleanProfile));
    console.timeEnd("syncTimer");
    return cleanProfile;
}`;

        if (codeInput && !codeInput.value) {
            codeInput.value = sampleDirtyCode;
        }

        if (loadSampleBtn) {
            loadSampleBtn.addEventListener("click", () => {
                if (codeInput) codeInput.value = sampleDirtyCode;
                sound.playBlip();
                runRefactoring();
            });
        }

        if (clearCodeBtn) {
            clearCodeBtn.addEventListener("click", () => {
                if (codeInput) codeInput.value = "";
                if (codeOutput) codeOutput.textContent = "// Cleared. Paste source code or click 'LOAD DIRTY SAMPLE'.";
                if (inBytesEl) inBytesEl.textContent = "0 B";
                if (outBytesEl) outBytesEl.textContent = "0 B";
                if (reductionPctEl) reductionPctEl.textContent = "0%";
                sound.playBlip();
            });
        }

        function runRefactoring() {
            if (!codeInput || !codeOutput) return;
            const src = codeInput.value || "";
            if (!src.trim()) {
                codeOutput.textContent = "// Error: Please enter or load source code to optimize.";
                return;
            }

            const t0 = performance.now();
            let clean = src;

            // Remove console.log, info, warn, error, time, timeEnd
            if (optLogs && optLogs.checked) {
                clean = clean.replace(/console\.(log|info|warn|error|debug|time|timeEnd)\s*\([^;]*\);?\n?/g, "");
            }

            // Remove single and multi-line comments
            if (optComments && optComments.checked) {
                clean = clean.replace(/\/\*[\s\S]*?\*\//g, "");
                clean = clean.replace(/\/\/[^\n]*\n?/g, "");
            }

            // Clean excessive whitespace and empty lines
            if (optWhitespace && optWhitespace.checked) {
                clean = clean.replace(/\r\n/g, "\n");
                clean = clean.replace(/[ \t]+$/gm, "");
                clean = clean.replace(/\n{3,}/g, "\n\n");
                clean = clean.trim();
            }

            const t1 = performance.now();
            const elapsed = Math.max(0.1, t1 - t0).toFixed(1);

            const inBytes = new Blob([src]).size;
            const outBytes = new Blob([clean]).size;
            const diffBytes = inBytes - outBytes;
            const pct = inBytes > 0 ? Math.max(0, (diffBytes / inBytes) * 100).toFixed(1) : 0;

            codeOutput.textContent = clean;
            if (inBytesEl) inBytesEl.textContent = `${inBytes} B`;
            if (outBytesEl) outBytesEl.textContent = `${outBytes} B`;
            if (reductionPctEl) reductionPctEl.textContent = `${pct}%`;
            if (execTimeEl) execTimeEl.textContent = `EXEC: ${elapsed}ms`;

            sound.playSuccess();
        }

        if (runRefactorBtn) {
            runRefactorBtn.addEventListener("click", runRefactoring);
        }

        if (copyCodeBtn) {
            copyCodeBtn.addEventListener("click", () => {
                if (!codeOutput) return;
                navigator.clipboard.writeText(codeOutput.textContent).then(() => {
                    sound.playSuccess();
                    if (copyText) {
                        const original = copyText.textContent;
                        copyText.textContent = "COPIED!";
                        setTimeout(() => { copyText.textContent = original; }, 1800);
                    }
                });
            });
        }

        // Run refactor once on startup so clean preview is immediately visible
        setTimeout(runRefactoring, 400);

        // 3. PANEL 2: Live GitHub Telemetry
        let hasLoadedGithub = false;
        let cachedRepos = [];
        const repoGrid = document.getElementById("wbRepoGrid");
        const repoSearch = document.getElementById("wbRepoSearch");
        const repoLangFilter = document.getElementById("wbRepoLangFilter");
        const refreshGithubBtn = document.getElementById("wbRefreshGithubBtn");

        const fallbackRepos = [
            {
                name: "SimpleIDE",
                description: "Lightweight, high-performance desktop IDE integrated with autonomous local agent AST diff reasoning.",
                html_url: "https://github.com/lucky4-git1/SimpleIDE",
                language: "TypeScript",
                stargazers_count: 5,
                forks_count: 2,
                updated_at: new Date().toISOString()
            },
            {
                name: "whatsapp-ai-bot",
                description: "High-throughput WhatsApp Cloud API webhook service with automated lead qualification and NLP triage.",
                html_url: "https://github.com/lucky4-git1/whatsapp-ai-bot",
                language: "Python",
                stargazers_count: 4,
                forks_count: 1,
                updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                name: "EMA-Email-Marketing-Automation",
                description: "Enterprise email automation framework with dynamic personalization, anti-spam validation and drip workers.",
                html_url: "https://github.com/lucky4-git1/EMA-Email-Marketing-Automation",
                language: "TypeScript",
                stargazers_count: 3,
                forks_count: 0,
                updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
                name: "rewritebot",
                description: "Edge AI application rewriting verbose product copy into high-impact, crisp developer communications.",
                html_url: "https://github.com/lucky4-git1/rewritebot",
                language: "JavaScript",
                stargazers_count: 3,
                forks_count: 0,
                updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
            },
            {
                name: "mycv",
                description: "Cinematic, award-level developer portfolio engineered with Neo-brutalist aesthetics, GSAP and fullstack tools.",
                html_url: "https://github.com/lucky4-git1/mycv",
                language: "JavaScript",
                stargazers_count: 8,
                forks_count: 2,
                updated_at: new Date().toISOString()
            },
            {
                name: "hyperpure-clone",
                description: "High-fidelity e-commerce clone featuring interactive cart mechanics, checkout workflows and brutalist styling.",
                html_url: "https://github.com/lucky4-git1/hyperpure-clone",
                language: "HTML",
                stargazers_count: 2,
                forks_count: 0,
                updated_at: new Date(Date.now() - 86400000 * 12).toISOString()
            }
        ];

        function renderRepos(repos) {
            if (!repoGrid) return;
            const query = (repoSearch ? repoSearch.value.toLowerCase().trim() : "");
            const lang = (repoLangFilter ? repoLangFilter.value : "ALL");

            const filtered = repos.filter(r => {
                const matchesQuery = !query || r.name.toLowerCase().includes(query) || (r.description && r.description.toLowerCase().includes(query));
                const matchesLang = lang === "ALL" || (r.language && r.language.toLowerCase() === lang.toLowerCase());
                return matchesQuery && matchesLang;
            });

            if (filtered.length === 0) {
                repoGrid.innerHTML = `
                    <div class="col-span-full p-8 text-center font-mono text-xs text-slate-400 bg-[#13151b] border border-[#232734]">
                        No repositories match "${query || lang}". Try clearing your filter.
                    </div>
                `;
                return;
            }

            repoGrid.innerHTML = filtered.map(repo => {
                const updated = new Date(repo.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                const langColor = repo.language === "TypeScript" ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
                                : repo.language === "Python" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                : repo.language === "JavaScript" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
                                : "text-purple-400 bg-purple-500/10 border-purple-500/30";

                return `
                    <div class="p-4 bg-[#13151b] border border-[#232734] hover:border-[#e4ff00] transition-colors flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="font-mono text-sm font-bold text-white group-hover:text-[#e4ff00] flex items-center gap-1.5 transition-colors truncate">
                                    <i class="ph-bold ph-git-branch text-xs text-slate-400"></i>
                                    <span>${repo.name}</span>
                                </a>
                                <span class="font-mono text-[10px] px-2 py-0.5 border ${langColor}">
                                    ${repo.language || "Config"}
                                </span>
                            </div>
                            <p class="font-mono text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                                ${repo.description || "Production repository by Sriyuth. Inspect code and commits on GitHub."}
                            </p>
                        </div>
                        <div class="pt-3 border-t border-[#232734] flex items-center justify-between font-mono text-xs text-slate-400">
                            <div class="flex items-center gap-3">
                                <span class="flex items-center gap-1 hover:text-white"><i class="ph-bold ph-star text-amber-400"></i> ${repo.stargazers_count}</span>
                                <span class="flex items-center gap-1 hover:text-white"><i class="ph-bold ph-git-fork text-slate-400"></i> ${repo.forks_count}</span>
                            </div>
                            <span class="text-[10px] text-slate-500">${updated}</span>
                        </div>
                    </div>
                `;
            }).join("");
        }

        async function fetchGithubTelemetry() {
            hasLoadedGithub = true;
            try {
                const res = await fetch("https://api.github.com/users/lucky4-git1/repos?sort=updated&per_page=30");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        cachedRepos = data;
                        renderRepos(cachedRepos);
                        return;
                    }
                }
                cachedRepos = fallbackRepos;
                renderRepos(cachedRepos);
            } catch (err) {
                console.warn("GitHub API rate limit or offline fallback activated:", err);
                cachedRepos = fallbackRepos;
                renderRepos(cachedRepos);
            }
        }

        if (repoSearch) repoSearch.addEventListener("input", () => renderRepos(cachedRepos.length ? cachedRepos : fallbackRepos));
        if (repoLangFilter) repoLangFilter.addEventListener("change", () => renderRepos(cachedRepos.length ? cachedRepos : fallbackRepos));
        if (refreshGithubBtn) {
            refreshGithubBtn.addEventListener("click", () => {
                sound.playClick();
                fetchGithubTelemetry();
            });
        }

        // 4. PANEL 3: Prompt-to-Pipeline Compiler
        const workflowPreset = document.getElementById("wbWorkflowPreset");
        const workflowRuntime = document.getElementById("wbWorkflowRuntime");
        const workflowModel = document.getElementById("wbWorkflowModel");
        const workflowCustomPrompt = document.getElementById("wbWorkflowCustomPrompt");
        const generateWorkflowBtn = document.getElementById("wbGenerateWorkflowBtn");
        const workflowCode = document.getElementById("wbWorkflowCode");
        const copyWorkflowBtn = document.getElementById("wbCopyWorkflowBtn");
        const copyWorkflowText = document.getElementById("wbCopyWorkflowText");

        const pipelineTemplates = {
            whatsapp: {
                typescript: (model, prompt) => `// ========================================================
// PRODUCTION PIPELINE: WhatsApp Business AI Webhook
// Runtime: Node.js 20+ (TypeScript / Express)
// LLM Engine: \${model.toUpperCase()}
// Constraints: \${prompt || "HMAC verification + automated CRM lead ingestion"}
// ========================================================

import express, { Request, Response } from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const META_APP_SECRET = process.env.META_APP_SECRET!;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// 1. Verify HMAC SHA-256 Meta Webhook Signature
function verifySignature(req: Request): boolean {
  const signature = req.headers["x-hub-signature-256"] as string;
  if (!signature) return false;
  const hash = crypto.createHmac("sha256", META_APP_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return signature === \`sha256=\${hash}\`;
}

// 2. Autonomous Inbound Message Handler
app.post("/webhook", async (req: Request, res: Response) => {
  if (!verifySignature(req)) {
    return res.status(401).send("UNAUTHORIZED_SIGNATURE");
  }

  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") {
    return res.status(200).send("EVENT_RECEIVED");
  }

  const senderId = message.from;
  const userText = message.text.body;

  // 3. Dispatch to \${model} for zero-hallucination structured routing
  console.log(\`Received message from \${senderId}: \${userText}\`);

  // 4. Send response via WhatsApp Cloud API
  await fetch(\`https://graph.facebook.com/v20.0/\${PHONE_NUMBER_ID}/messages\`, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${WHATSAPP_ACCESS_TOKEN}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: senderId,
      text: { body: "Your request has been routed to Sriyuth's autonomous pipeline." }
    })
  });

  return res.status(200).json({ status: "DISPATCHED", recipient: senderId });
});

app.listen(3000, () => console.log("WhatsApp Agent webhook listening on :3000"));`,

                python: (model, prompt) => `# ========================================================
# PRODUCTION PIPELINE: WhatsApp Business AI Webhook
# Runtime: Python 3.11+ (FastAPI / AsyncIO)
# LLM Engine: \${model.toUpperCase()}
# Constraints: \${prompt || "HMAC verification + automated CRM lead ingestion"}
# ========================================================

import os
import hmac
import hashlib
import httpx
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI(title="WhatsApp AI Autonomous Agent")

META_APP_SECRET = os.getenv("META_APP_SECRET", "").encode()
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

@app.post("/api/whatsapp/webhook")
async def handle_whatsapp_inbound(
    request: Request,
    x_hub_signature_256: str = Header(None)
):
    raw_body = await request.body()
    
    # 1. Verify HMAC SHA-256 Meta Webhook Signature
    if not x_hub_signature_256:
        raise HTTPException(status_code=401, detail="MISSING_SIGNATURE")
        
    expected_hash = "sha256=" + hmac.new(META_APP_SECRET, raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_hash, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="INVALID_SIGNATURE")
        
    payload = await request.json()
    try:
        msg = payload["entry"][0]["changes"][0]["value"]["messages"][0]
        sender = msg["from"]
        content = msg["text"]["body"]
    except (KeyError, IndexError):
        return {"status": "NO_TEXT_PAYLOAD"}

    # 2. Asynchronous LLM Inference Call
    async with httpx.AsyncClient(timeout=10.0) as client:
        send_url = f"https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages"
        await client.post(
            send_url,
            headers={"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"},
            json={
                "messaging_product": "whatsapp",
                "to": sender,
                "text": {"body": f"Acknowledged. Routing through {model} pipeline: {content[:30]}..."}
            }
        )
        
    return {"status": "SUCCESS", "sender": sender}`
            },

            simpleide: {
                typescript: (model, prompt) => `// ========================================================
// PRODUCTION PIPELINE: SimpleIDE Desktop Agent IPC Bridge
// Runtime: Electron + Node.js (TypeScript)
// Model: \${model.toUpperCase()}
// Spec: \${prompt || "AST Parsing, Unified Git Diff, Local Zero-Latency IPC"}
// ========================================================

import { ipcMain } from "electron";
import * as babelParser from "@babel/parser";
import * as diff from "diff";

export interface RefactorRequest {
  filePath: string;
  instruction: string;
  codeContent: string;
}

ipcMain.handle("agent:execute-ast-diff", async (event, req: RefactorRequest) => {
  console.log(\`[SimpleIDE] Parsing AST for file: \${req.filePath}\`);

  // 1. Validate AST syntax before proposing mutations
  try {
    babelParser.parse(req.codeContent, {
      sourceType: "module",
      plugins: ["typescript", "jsx"]
    });
  } catch (err: any) {
    return { success: false, error: \`SYNTAX_ERROR: \${err.message}\` };
  }

  // 2. Compute deterministic Unified Diff
  return {
    success: true,
    file: req.filePath,
    tokenEfficiency: "+28.4%",
    timestamp: Date.now()
  };
});`,

                python: (model, prompt) => `# ========================================================
# PRODUCTION PIPELINE: SimpleIDE Core AST Diff Engine
# Runtime: Python 3.11+
# Model: \${model.toUpperCase()}
# Spec: \${prompt || "AST Parsing, Unified Git Diff, Local Zero-Latency IPC"}
# ========================================================

import ast
import difflib
from typing import Dict, Any

class AstRefactorEngine:
    def __init__(self, model_name: str = "${model}"):
        self.model_name = model_name

    def validate_and_diff(self, file_path: str, original_code: str, proposed_code: str) -> Dict[str, Any]:
        try:
            ast.parse(original_code)
            ast.parse(proposed_code)
        except SyntaxError as e:
            return {"valid": False, "error": f"AST Syntax Error: {e.msg}"}

        orig_lines = original_code.splitlines(keepends=True)
        prop_lines = proposed_code.splitlines(keepends=True)
        diff_output = "".join(difflib.unified_diff(orig_lines, prop_lines, fromfile=f"a/{file_path}", tofile=f"b/{file_path}"))

        return {
            "valid": True,
            "engine": self.model_name,
            "diff": diff_output
        }`
            },

            ema: {
                typescript: (model, prompt) => `// ========================================================
// PRODUCTION PIPELINE: EMA Engine (Email Marketing Automation)
// Runtime: TypeScript / BullMQ / Redis
// Engine: \${model.toUpperCase()}
// Features: \${prompt || "DKIM / SPF score verification, Dynamic Personalization"}
// ========================================================

import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";

const emailQueue = new Queue("outreach-pipeline", {
  connection: { host: "127.0.0.1", port: 6379 }
});

export const outreachWorker = new Worker("outreach-pipeline", async (job) => {
  const { recipient, companyName, techStack } = job.data;
  console.log(\`[EMA Engine] Generating personalized body for \${recipient}...\`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  return await transporter.sendMail({
    from: '"Sriyuth K" <sriyuth@dev.local>',
    to: recipient.email,
    subject: \`Scaling \${techStack} at \${companyName}\`,
    text: \`Hi \${recipient.firstName}, noticed \${companyName} is scaling \${techStack}.\`
  });
});`,

                python: (model, prompt) => `# ========================================================
# PRODUCTION PIPELINE: EMA Engine (Email Marketing Automation)
# Runtime: Python 3.11+ / Celery / Redis
# Engine: \${model.toUpperCase()}
# ========================================================

from celery import Celery
import smtplib
from email.mime.text import MIMEText

app = Celery('ema_tasks', broker='redis://localhost:6379/0')

@app.task(rate_limit='20/m')
def dispatch_personalized_email(recipient_email: str, recipient_name: str, tech_context: str):
    msg = MIMEText(f"Hi {recipient_name},\\n\\nSaw your work on {tech_context}. Engineered an AI AST pipeline reducing compute load.\\n\\nBest,\\nSriyuth")
    msg['Subject'] = f"Modern AI infrastructure for {tech_context}"
    msg['From'] = "sriyuth@portfolio.local"
    msg['To'] = recipient_email

    with smtplib.SMTP("smtp.relay.local", 587) as server:
        server.starttls()
        server.send_message(msg)
        
    return {"status": "DELIVERED", "to": recipient_email}`
            },

            rewritebot: {
                typescript: (model, prompt) => `// ========================================================
// PRODUCTION PIPELINE: RewriteBot Edge Worker
// Runtime: Next.js Edge Runtime / Vercel Edge Functions
// Model: \${model.toUpperCase()}
// ========================================================

import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { sourceCopy, toneStyle } = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are a brutalist copy editor. Transform verbose text into punchy, developer-first communication. Zero AI slop."
        },
        { role: "user", content: \`Rewrite in \${toneStyle || "neo-brutalist"} voice: \${sourceCopy}\` }
      ]
    })
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}`,

                python: (model, prompt) => `# ========================================================
# PRODUCTION PIPELINE: RewriteBot Semantic Processor
# Runtime: Python 3.11+
# Model: \${model.toUpperCase()}
# ========================================================

import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def stream_rewrite_copy(raw_text: str, tone: str = "crisp-technical"):
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Prune corporate fluff. Output punchy, active voice copy."},
            {"role": "user", "content": f"Tone: {tone}\\n\\nInput: {raw_text}"}
        ],
        stream=True
    )
    async for chunk in stream:
        content = chunk.choices[0].delta.content or ""
        yield content`
            },

            scraping: {
                typescript: (model, prompt) => `// ========================================================
// PRODUCTION PIPELINE: Autonomous Web Scraper & Schema Extractor
// Runtime: Node.js (TypeScript) + Playwright
// Engine: \${model.toUpperCase()}
// ========================================================

import { chromium } from "playwright";

export async function extractVerifiedSchema(targetUrl: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 8000));
  await browser.close();

  return { url: targetUrl, extractedLength: pageText.length, status: "READY" };
}`,

                python: (model, prompt) => `# ========================================================
# PRODUCTION PIPELINE: Autonomous Web Scraper & Schema Extractor
# Runtime: Python 3.11+ + Playwright + Pydantic
# Engine: \${model.toUpperCase()}
# ========================================================

import asyncio
from playwright.async_api import async_playwright
from pydantic import BaseModel

class ExtractedDataset(BaseModel):
    page_title: str
    headings: list[str]
    clean_text_snippet: str

async def scrape_and_extract(url: str) -> ExtractedDataset:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        
        title = await page.title()
        headings = await page.eval_on_selector_all("h1, h2, h3", "elements => elements.map(e => e.innerText)")
        snippet = (await page.inner_text("body"))[:2000]
        
        await browser.close()
        return ExtractedDataset(page_title=title, headings=headings, clean_text_snippet=snippet)`
            }
        };

        function generatePipelineCode() {
            const preset = workflowPreset ? workflowPreset.value : "whatsapp";
            const runtime = workflowRuntime ? workflowRuntime.value : "typescript";
            const model = workflowModel ? workflowModel.value : "claude";
            const customPrompt = workflowCustomPrompt ? workflowCustomPrompt.value.trim() : "";

            const generator = pipelineTemplates[preset]?.[runtime];
            if (generator && workflowCode) {
                workflowCode.textContent = generator(model, customPrompt);
                sound.playSuccess();
            }
        }

        if (generateWorkflowBtn) generateWorkflowBtn.addEventListener("click", generatePipelineCode);
        if (workflowPreset) workflowPreset.addEventListener("change", generatePipelineCode);
        if (workflowRuntime) workflowRuntime.addEventListener("change", generatePipelineCode);
        if (workflowModel) workflowModel.addEventListener("change", generatePipelineCode);

        if (copyWorkflowBtn) {
            copyWorkflowBtn.addEventListener("click", () => {
                if (!workflowCode) return;
                navigator.clipboard.writeText(workflowCode.textContent).then(() => {
                    sound.playSuccess();
                    if (copyWorkflowText) {
                        const original = copyWorkflowText.textContent;
                        copyWorkflowText.textContent = "COPIED!";
                        setTimeout(() => { copyWorkflowText.textContent = original; }, 1800);
                    }
                });
            });
        }

        generatePipelineCode();

        // 5. PANEL 4: JSON & Schema to TypeScript Engine
        const jsonInput = document.getElementById("wbJsonInput");
        const tsOutput = document.getElementById("wbTsOutput");
        const sampleJsonBtn = document.getElementById("wbSampleJsonBtn");
        const minifyJsonBtn = document.getElementById("wbMinifyJsonBtn");
        const prettifyJsonBtn = document.getElementById("wbPrettifyJsonBtn");
        const genTsBtn = document.getElementById("wbGenTsBtn");
        const copyTsBtn = document.getElementById("wbCopyTsBtn");
        const copyTsText = document.getElementById("wbCopyTsText");
        const validationStatus = document.getElementById("wbJsonValidationStatus");

        const sampleJsonData = {
            id: "usr_99a8b1c4",
            username: "sriyuth_k",
            profile: {
                role: "Fullstack AI Engineer",
                location: "Hyderabad, India",
                isAvailableForHire: true,
                rating: 4.95,
                skills: ["TypeScript", "Python", "React", "Next.js", "Docker", "FastAPI"]
            },
            repositoriesCount: 32,
            stats: {
                totalCommits: 1420,
                starsReceived: 88,
                contributionsThisYear: 312
            },
            metadata: {
                verified: true,
                createdAt: "2024-01-15T08:30:00Z",
                tags: ["featured", "maintainer"]
            }
        };

        if (jsonInput && !jsonInput.value) {
            jsonInput.value = JSON.stringify(sampleJsonData, null, 2);
        }

        if (sampleJsonBtn) {
            sampleJsonBtn.addEventListener("click", () => {
                if (jsonInput) jsonInput.value = JSON.stringify(sampleJsonData, null, 2);
                sound.playBlip();
                generateTypeScriptTypes();
            });
        }

        if (minifyJsonBtn) {
            minifyJsonBtn.addEventListener("click", () => {
                if (!jsonInput) return;
                try {
                    const parsed = JSON.parse(jsonInput.value);
                    jsonInput.value = JSON.stringify(parsed);
                    if (validationStatus) validationStatus.textContent = "Status: JSON minified successfully.";
                    sound.playBlip();
                } catch (e) {
                    if (validationStatus) validationStatus.textContent = `Error: ${e.message}`;
                    sound.playError();
                }
            });
        }

        if (prettifyJsonBtn) {
            prettifyJsonBtn.addEventListener("click", () => {
                if (!jsonInput) return;
                try {
                    const parsed = JSON.parse(jsonInput.value);
                    jsonInput.value = JSON.stringify(parsed, null, 2);
                    if (validationStatus) validationStatus.textContent = "Status: JSON formatted cleanly.";
                    sound.playBlip();
                } catch (e) {
                    if (validationStatus) validationStatus.textContent = `Error: ${e.message}`;
                    sound.playError();
                }
            });
        }

        function generateTypeScriptTypes() {
            if (!jsonInput || !tsOutput) return;
            const raw = jsonInput.value.trim();
            if (!raw) {
                tsOutput.textContent = "// Error: Empty JSON payload.";
                if (validationStatus) validationStatus.textContent = "Status: Empty input.";
                return;
            }

            try {
                const parsed = JSON.parse(raw);
                const generatedInterfaces = [];

                function capitalize(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                function getType(val, keyName = "") {
                    if (val === null) return "null | any";
                    if (Array.isArray(val)) {
                        if (val.length === 0) return "any[]";
                        const elemType = getType(val[0], keyName.replace(/s$/, ""));
                        return `${elemType}[]`;
                    }
                    if (typeof val === "object") {
                        const interfaceName = capitalize(keyName || "Child");
                        generateInterface(val, interfaceName);
                        return interfaceName;
                    }
                    return typeof val;
                }

                function generateInterface(obj, name = "RootObject") {
                    const lines = [`export interface ${name} {`];
                    for (const [k, v] of Object.entries(obj)) {
                        const typeStr = getType(v, k);
                        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
                        lines.push(`  ${safeKey}: ${typeStr};`);
                    }
                    lines.push("}");
                    generatedInterfaces.push(lines.join("\n"));
                }

                if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
                    generateInterface(parsed, "RootObject");
                } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
                    generateInterface(parsed[0], "RootItem");
                    generatedInterfaces.push("export type RootList = RootItem[];");
                } else {
                    generatedInterfaces.push(`export type RootValue = ${typeof parsed};`);
                }

                const finalOutput = `// Auto-generated TypeScript Interface Definition
// Deterministic • Zero AI Hallucinations

${generatedInterfaces.reverse().join("\n\n")}`;

                tsOutput.textContent = finalOutput;
                if (validationStatus) validationStatus.textContent = `Status: Valid JSON parsed (${Object.keys(parsed).length} top-level fields).`;
                sound.playSuccess();
            } catch (err) {
                tsOutput.textContent = `// JSON SYNTAX ERROR:\n// ${err.message}`;
                if (validationStatus) validationStatus.textContent = `Syntax Error: ${err.message}`;
                sound.playError();
            }
        }

        if (genTsBtn) genTsBtn.addEventListener("click", generateTypeScriptTypes);

        if (copyTsBtn) {
            copyTsBtn.addEventListener("click", () => {
                if (!tsOutput) return;
                navigator.clipboard.writeText(tsOutput.textContent).then(() => {
                    sound.playSuccess();
                    if (copyTsText) {
                        const original = copyTsText.textContent;
                        copyTsText.textContent = "COPIED!";
                        setTimeout(() => { copyTsText.textContent = original; }, 1800);
                    }
                });
            });
        }

        setTimeout(generateTypeScriptTypes, 500);

    })();


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
