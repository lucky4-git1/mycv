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
            } else if (action === "simulator") {
                const el = document.querySelector("#automations");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                const triggerBtn = document.getElementById("triggerPulseBtn");
                if (triggerBtn) triggerBtn.click();
            }
        });
    });

    /* ========================================================
       5. THRINE 3D ASSET ENGINE (thrine.app WebGL Stage)
       ======================================================== */
    function initHeroThrine3DStage() {
        const canvas = document.getElementById("heroThrineCanvas");
        const fpsMeter = document.getElementById("thrineFpsMeter");
        const modelLabel = document.getElementById("thrineModelLabel");
        const modelBtns = document.querySelectorAll(".thrine-model-btn");
        if (!canvas || typeof THREE === "undefined") return;

        const container = canvas.parentElement;
        let width = container.clientWidth || 400;
        let height = container.clientHeight || 540;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        if (renderer.outputEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }

        // Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
        scene.add(ambientLight);

        // Key light (Cool white)
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
        keyLight.position.set(4, 6, 4);
        scene.add(keyLight);

        // Rim light (Neon lime accent)
        const rimLight = new THREE.DirectionalLight(0xe4ff00, 3.4);
        rimLight.position.set(-5, -2, -3);
        scene.add(rimLight);

        // Fill light (Cobalt blue)
        const fillLight = new THREE.PointLight(0x2e5bff, 2.2, 20);
        fillLight.position.set(2, -3, 3);
        scene.add(fillLight);

        // Models configuration from Thrine
        const modelsConfig = {
            "robotic-hand": {
                name: "THRINE // ROBOTIC HAND",
                path: "models/thrine-robotic-hand.glb",
                scale: 1.85,
                rotY: 0.2,
                rotX: 0.1,
                offsetY: -0.2
            },
            "obsidian-walker": {
                name: "THRINE // OBSIDIAN WALKER",
                path: "models/obsidian-walker.glb",
                scale: 1.5,
                rotY: -0.4,
                rotX: 0.15,
                offsetY: -0.3
            },
            "data-sphere": {
                name: "THRINE // DATA SPHERE",
                path: "models/data-sphere.glb",
                scale: 1.6,
                rotY: 0,
                rotX: 0,
                offsetY: 0
            }
        };

        const loader = new THREE.GLTFLoader();
        let currentModel = null;
        let currentModelKey = "robotic-hand";
        let targetRotationY = 0;
        let targetRotationX = 0;
        let mouseX = 0;
        let mouseY = 0;
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;

        function loadModel(key) {
            const config = modelsConfig[key];
            if (!config) return;

            if (modelLabel) modelLabel.textContent = config.name;

            // Remove previous model
            if (currentModel) {
                scene.remove(currentModel);
                currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                            else child.material.dispose();
                        }
                    }
                });
                currentModel = null;
            }

            loader.load(
                config.path,
                (gltf) => {
                    currentModel = gltf.scene;

                    // Center & normalize
                    const box = new THREE.Box3().setFromObject(currentModel);
                    const center = box.getCenter(new THREE.Vector3());
                    currentModel.position.sub(center);
                    currentModel.position.y += config.offsetY || 0;

                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const normScale = (config.scale || 1.5) / (maxDim || 1);
                    currentModel.scale.set(normScale, normScale, normScale);

                    // Material enhancements
                    currentModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) {
                                child.material.roughness = Math.min(child.material.roughness || 0.35, 0.5);
                                child.material.metalness = Math.max(child.material.metalness || 0.65, 0.4);
                                if (child.material.isMeshStandardMaterial) {
                                    child.material.envMapIntensity = 1.2;
                                }
                            }
                        }
                    });

                    currentModel.rotation.y = config.rotY || 0;
                    currentModel.rotation.x = config.rotX || 0;
                    targetRotationY = currentModel.rotation.y;
                    targetRotationX = currentModel.rotation.x;

                    scene.add(currentModel);

                    // Smooth entrance scale
                    currentModel.scale.set(0.01, 0.01, 0.01);
                    gsap.to(currentModel.scale, {
                        x: normScale,
                        y: normScale,
                        z: normScale,
                        duration: 1.0,
                        ease: "power3.out"
                    });
                },
                undefined,
                (error) => {
                    console.warn("Could not load GLB model, using procedural fallback sculpture", error);
                    createFallbackMesh(config);
                }
            );
        }

        function createFallbackMesh(config) {
            const group = new THREE.Group();
            const geom = new THREE.IcosahedronGeometry(1.2, 3);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x111624,
                roughness: 0.25,
                metalness: 0.85,
                wireframe: true
            });
            const core = new THREE.Mesh(geom, mat);
            group.add(core);

            const innerGeom = new THREE.SphereGeometry(0.8, 32, 32);
            const innerMat = new THREE.MeshStandardMaterial({
                color: 0xe4ff00,
                emissive: 0xe4ff00,
                emissiveIntensity: 0.6,
                roughness: 0.2
            });
            const innerSphere = new THREE.Mesh(innerGeom, innerMat);
            group.add(innerSphere);

            currentModel = group;
            scene.add(currentModel);
        }

        // Initial model load
        loadModel("robotic-hand");

        // Model Switcher button events
        modelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-model");
                if (key === currentModelKey) return;
                sound.playClick();
                modelBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentModelKey = key;
                loadModel(key);
            });
        });

        // Mouse Parallax & Drag interaction
        window.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
                mouseX = x;
                mouseY = y;
            }
        });

        canvas.addEventListener("mousedown", (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

        window.addEventListener("mousemove", (e) => {
            if (isDragging && currentModel) {
                const deltaX = e.clientX - previousMouseX;
                const deltaY = e.clientY - previousMouseY;
                targetRotationY += deltaX * 0.012;
                targetRotationX += deltaY * 0.012;
                previousMouseX = e.clientX;
                previousMouseY = e.clientY;
            }
        });

        // Resize handler
        function resize() {
            width = container.clientWidth || 400;
            height = container.clientHeight || 540;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
        window.addEventListener("resize", resize);

        // Animation Loop
        let frameCount = 0;
        let lastFpsTime = performance.now();
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            if (currentModel) {
                if (!isDragging) {
                    // Gentle idle oscillation & mouse parallax
                    currentModel.rotation.y += (targetRotationY + mouseX * 0.45 - currentModel.rotation.y) * 0.06;
                    currentModel.rotation.x += (targetRotationX - mouseY * 0.3 - currentModel.rotation.x) * 0.06;
                    currentModel.position.y += (Math.sin(elapsedTime * 1.5) * 0.08 - currentModel.position.y) * 0.05;
                } else {
                    currentModel.rotation.y += (targetRotationY - currentModel.rotation.y) * 0.15;
                    currentModel.rotation.x += (targetRotationX - currentModel.rotation.x) * 0.15;
                }
            }

            // Update FPS
            frameCount++;
            const now = performance.now();
            if (now - lastFpsTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
                if (fpsMeter) fpsMeter.textContent = `${fps} FPS`;
                frameCount = 0;
                lastFpsTime = now;
            }

            renderer.render(scene, camera);
        }

        animate();
    }
    initHeroThrine3DStage();


    /* ========================================================
       6. KOKONUT UI AI ACTION CONSOLE & LIVE DIFF SUITE
       ======================================================== */
    function initKokonutAIConsole() {
        const modelBtns = document.querySelectorAll(".kokonut-model-pill");
        const presetBtns = document.querySelectorAll(".kokonut-prompt-preset");
        const promptInput = document.getElementById("kokonutPromptInput");
        const runBtn = document.getElementById("kokonutRunBtn");
        const runText = document.getElementById("kokonutRunText");
        const diffCardTitle = document.getElementById("diffCardTitle");
        const diffRemovedStat = document.getElementById("diffRemovedStat");
        const diffAddedStat = document.getElementById("diffAddedStat");
        const diffContainer = document.getElementById("diffContainer");
        const telemetryLogStream = document.getElementById("telemetryLogStream");

        const statBundle = document.getElementById("statBundle");
        const statLatency = document.getElementById("statLatency");
        const statDeterminism = document.getElementById("statDeterminism");

        if (!diffContainer) return;

        let activeModel = "claude";
        let activePipeline = "ast";

        const pipelineDatasets = {
            ast: {
                title: "AST DIFF // SLOP ELIMINATION & TYPE SAFETY",
                prompt: "Refactor AST: Strip redundant AI boilerplate and enforce strict type safety in SimpleIDE.",
                removedText: "-18 lines (bloat)",
                addedText: "+7 lines (deterministic)",
                bundle: "-46.2%",
                latency: "18.4ms",
                determinism: "99.8%",
                logs: [
                    { time: "0.00ms", text: "Inbound payload received: AST refactor request.", color: "text-slate-400" },
                    { time: "1.20ms", text: "Babel AST parser generated lexical token tree.", color: "text-blue-400" },
                    { time: "4.80ms", text: "Detected 4 redundant async locks & 2 memory-leaking closures.", color: "text-purple-400" },
                    { time: "12.4ms", text: "Pruning unused synthetic polyfills & memoizing event listeners.", color: "text-[#e4ff00]" },
                    { time: "18.4ms", text: "Deterministic AST compiled. Zero slop verified. Status: OK.", color: "text-emerald-400" }
                ],
                diff: [
                    { type: "removed", num: 1, code: "// [AI SLOP]: Redundant unmemoized state lock" },
                    { type: "removed", num: 2, code: "export async function handleFileStream(file: any) {" },
                    { type: "removed", num: 3, code: "    let buffer = new Array();" },
                    { type: "removed", num: 4, code: "    await new Promise(r => setTimeout(r, 100)); // synthetic delay" },
                    { type: "removed", num: 5, code: "    return JSON.parse(JSON.stringify(buffer));" },
                    { type: "context", num: 6, code: "}" },
                    { type: "added", num: 1, code: "// [SRIYUTH DETERMINISTIC AST]: Zero-copy Typed Array" },
                    { type: "added", num: 2, code: "export function handleFileStream(file: FileDescriptor): Readonly<Uint8Array> {" },
                    { type: "added", num: 3, code: "    const buffer = new Uint8Array(file.size);" },
                    { type: "added", num: 4, code: "    file.readSync(buffer);" },
                    { type: "added", num: 5, code: "    return Object.freeze(buffer);" },
                    { type: "added", num: 6, code: "}" }
                ]
            },
            whatsapp: {
                title: "SECURITY // HMAC SHA-256 SIGNATURE VERIFICATION",
                prompt: "Verify WhatsApp webhook signature & parse inbound inquiry into intent action.",
                removedText: "-12 lines (insecure)",
                addedText: "+8 lines (crypto-safe)",
                bundle: "-38.0%",
                latency: "4.2ms",
                determinism: "100.0%",
                logs: [
                    { time: "0.00ms", text: "Meta Cloud API POST /api/webhook/whatsapp (Payload: 512B)", color: "text-slate-400" },
                    { time: "0.80ms", text: "Header extracted: x-hub-signature-256: sha256=9f2c...88a", color: "text-blue-400" },
                    { time: "2.10ms", text: "Computing HMAC-SHA256 digest with process.env.WHATSAPP_SECRET", color: "text-purple-400" },
                    { time: "3.40ms", text: "Cryptographic constant-time comparison matched. No timing attacks.", color: "text-[#e4ff00]" },
                    { time: "4.20ms", text: "Inbound payload verified. Enqueued for semantic triage.", color: "text-emerald-400" }
                ],
                diff: [
                    { type: "removed", num: 1, code: "// [INSECURE]: Direct string equality leaks timing" },
                    { type: "removed", num: 2, code: "if (req.headers['x-hub-signature-256'] == mySecret) {" },
                    { type: "removed", num: 3, code: "    processIncomingMessage(req.body);" },
                    { type: "removed", num: 4, code: "}" },
                    { type: "added", num: 1, code: "// [CRYPTOGRAPHICALLY SECURE]: Timing-safe HMAC verification" },
                    { type: "added", num: 2, code: "const computed = crypto.createHmac('sha256', env.SECRET).update(rawBody).digest('hex');" },
                    { type: "added", num: 3, code: "const isValid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed));" },
                    { type: "added", num: 4, code: "if (!isValid) return res.status(403).json({ error: 'UNAUTHORIZED_DIGEST' });" },
                    { type: "added", num: 5, code: "await enqueueDeterministicTask(req.body);" }
                ]
            },
            ema: {
                title: "QUEUE WORKER // EMA EMAIL OUTREACH PIPELINE",
                prompt: "Trigger EMA outreach drip queue with rate-limited exponential backoff.",
                removedText: "-15 lines (unbounded)",
                addedText: "+9 lines (rate-throttled)",
                bundle: "-29.5%",
                latency: "12.8ms",
                determinism: "99.9%",
                logs: [
                    { time: "0.00ms", text: "EMA Queue Manager activated. Batch size: 50 prospects.", color: "text-slate-400" },
                    { time: "1.50ms", text: "Validating MX DNS records & deliverability scores...", color: "text-blue-400" },
                    { time: "4.80ms", text: "Throttling dispatch: 1 message per 1,200ms per IP pool.", color: "text-purple-400" },
                    { time: "9.10ms", text: "Injecting personalized AST macro variables into email body.", color: "text-[#e4ff00]" },
                    { time: "12.8ms", text: "50/50 queued successfully. Delivery rate: 99.4%.", color: "text-emerald-400" }
                ],
                diff: [
                    { type: "removed", num: 1, code: "// [UNBOUNDED BURST]: Blacklists domain immediately" },
                    { type: "removed", num: 2, code: "prospects.forEach(p => {" },
                    { type: "removed", num: 3, code: "    sendgrid.send({ to: p.email, html: template });" },
                    { type: "removed", num: 4, code: "});" },
                    { type: "added", num: 1, code: "// [EMA LEAK-PROOF QUEUE]: Rate-limited Token Bucket" },
                    { type: "added", num: 2, code: "const bucket = new TokenBucket({ rate: 10, capacity: 50 });" },
                    { type: "added", num: 3, code: "for (const prospect of prospects) {" },
                    { type: "added", num: 4, code: "    await bucket.take(1);" },
                    { type: "added", num: 5, code: "    await mailQueue.push({ to: prospect.email, retry: 3 });" },
                    { type: "added", num: 6, code: "}" }
                ]
            },
            simpleide: {
                title: "AGENT COPILOT // SIMPLEIDE LOCAL AST TRIAGE",
                prompt: "Dispatch SimpleIDE local agent copilot to lint active workspace code without remote telemetry.",
                removedText: "-22 lines (telemetry bloat)",
                addedText: "+11 lines (local IndexedDB)",
                bundle: "-52.1%",
                latency: "8.6ms",
                determinism: "100.0%",
                logs: [
                    { time: "0.00ms", text: "SimpleIDE Editor keystroke hook invoked in renderer thread.", color: "text-slate-400" },
                    { time: "0.90ms", text: "Inter-Process Communication (IPC) bridge: main <-> renderer.", color: "text-blue-400" },
                    { time: "3.20ms", text: "Local tree-sitter syntax validation executed in memory.", color: "text-purple-400" },
                    { time: "6.50ms", text: "No cloud telemetry leaked. Local IndexedDB cache updated.", color: "text-[#e4ff00]" },
                    { time: "8.60ms", text: "Copilot suggestions ready in 8.6ms. Zero latency lag.", color: "text-emerald-400" }
                ],
                diff: [
                    { type: "removed", num: 1, code: "// [AI TELEMETRY BLOAT]: Sends developer code to remote server" },
                    { type: "removed", num: 2, code: "fetch('https://remote-ai-logger.com/telemetry', {" },
                    { type: "removed", num: 3, code: "    method: 'POST', body: JSON.stringify(window.editorCode)" },
                    { type: "removed", num: 4, code: "});" },
                    { type: "added", num: 1, code: "// [SIMPLEIDE PRIVATE]: Local IndexedDB Cache & Offline AST" },
                    { type: "added", num: 2, code: "const astTree = localTreeSitter.parse(activeBuffer);" },
                    { type: "added", num: 3, code: "await offlineVault.save('ast_snapshot', astTree);" },
                    { type: "added", num: 4, code: "return astTree.getDiagnostics();" }
                ]
            }
        };

        function renderDiff(data) {
            if (!diffContainer) return;
            diffContainer.innerHTML = "";

            data.diff.forEach((item, idx) => {
                const row = document.createElement("div");
                row.className = `diff-line ${item.type}`;
                
                const numSpan = document.createElement("span");
                numSpan.className = "diff-num";
                numSpan.textContent = item.num;

                const codeSpan = document.createElement("span");
                codeSpan.className = "diff-code flex-1";
                codeSpan.textContent = item.code;

                row.appendChild(numSpan);
                row.appendChild(codeSpan);
                diffContainer.appendChild(row);
            });

            if (diffCardTitle) diffCardTitle.textContent = data.title;
            if (diffRemovedStat) diffRemovedStat.textContent = data.removedText;
            if (diffAddedStat) diffAddedStat.textContent = data.addedText;
            if (statBundle) statBundle.textContent = data.bundle;
            if (statLatency) statLatency.textContent = data.latency;
            if (statDeterminism) statDeterminism.textContent = data.determinism;
        }

        function streamLogs(logs) {
            if (!telemetryLogStream) return;
            telemetryLogStream.innerHTML = "";
            let idx = 0;

            function nextLog() {
                if (idx >= logs.length) return;
                const log = logs[idx];
                const div = document.createElement("div");
                div.className = log.color;
                div.textContent = `[${log.time}] ${log.text}`;
                telemetryLogStream.appendChild(div);
                telemetryLogStream.scrollTop = telemetryLogStream.scrollHeight;
                sound.playBlip();
                idx++;
                setTimeout(nextLog, 120);
            }

            nextLog();
        }

        function executePipeline(pipeKey) {
            const data = pipelineDatasets[pipeKey];
            if (!data) return;

            sound.playClick();
            if (runBtn) {
                runBtn.classList.add("opacity-70");
                if (runText) runText.textContent = "EXECUTING...";
            }

            if (promptInput) promptInput.value = data.prompt;
            renderDiff(data);
            streamLogs(data.logs);

            setTimeout(() => {
                if (runBtn) {
                    runBtn.classList.remove("opacity-70");
                    if (runText) runText.textContent = "EXECUTE PIPELINE";
                }
                sound.playSuccess();
            }, 800);
        }

        // Preset button click
        presetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const pipe = btn.getAttribute("data-pipeline");
                presetBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activePipeline = pipe;
                executePipeline(pipe);
            });
        });

        // Model selector click
        modelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const model = btn.getAttribute("data-model");
                modelBtns.forEach(b => {
                    b.classList.remove("active");
                    const dot = b.querySelector("span:first-child");
                    if (dot) dot.className = "w-2 h-2 rounded-full bg-slate-400";
                });
                btn.classList.add("active");
                const activeDot = btn.querySelector("span:first-child");
                if (activeDot) activeDot.className = "w-2 h-2 rounded-full bg-[#e4ff00]";
                sound.playClick();
                activeModel = model;

                // Stream notification log
                const div = document.createElement("div");
                div.className = "text-[#e4ff00] font-bold";
                div.textContent = `[SYS] Switched active LLM provider to: ${btn.querySelector('span:nth-child(2)').textContent}`;
                if (telemetryLogStream) {
                    telemetryLogStream.appendChild(div);
                    telemetryLogStream.scrollTop = telemetryLogStream.scrollHeight;
                }
            });
        });

        // Run button click
        if (runBtn) {
            runBtn.addEventListener("click", () => {
                executePipeline(activePipeline);
            });
        }

        // Ctrl + Enter shortcut
        if (promptInput) {
            promptInput.addEventListener("keydown", (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    executePipeline(activePipeline);
                }
            });
        }

        // Initial render
        renderDiff(pipelineDatasets.ast);
    }
    initKokonutAIConsole();

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
