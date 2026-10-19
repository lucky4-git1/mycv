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
       5. INTERACTIVE GENERATIVE TECH CANVAS & SPOTLIGHT
       ======================================================== */
    function initHeroGenerativeCanvas() {
        const canvas = document.getElementById("heroGenerativeCanvas");
        const spotlight = document.getElementById("heroSpotlight");
        const fpsMeter = document.getElementById("heroFpsMeter");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let width = 0, height = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }
        resize();
        window.addEventListener("resize", resize);

        let mouseX = width / 2;
        let mouseY = height / 2;
        let targetMouseX = width / 2;
        let targetMouseY = height / 2;
        let spotX = width / 2;
        let spotY = height / 2;
        let isPointerActive = false;

        window.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = e.clientX - rect.left;
            targetMouseY = e.clientY - rect.top;
            isPointerActive = true;
        });

        window.addEventListener("mouseleave", () => {
            isPointerActive = false;
        });

        const NODE_COUNT = Math.max(50, Math.min(100, Math.floor((width * height) / 12000)));
        const nodes = [];

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                radius: Math.random() * 2.2 + 1.2,
                baseAlpha: Math.random() * 0.45 + 0.35,
                hue: Math.random() > 0.8 ? "lime" : "slate"
            });
        }

        let frameCount = 0;
        let lastFpsUpdate = performance.now();

        function animateCanvas(now) {
            mouseX += (targetMouseX - mouseX) * 0.1;
            mouseY += (targetMouseY - mouseY) * 0.1;

            if (spotlight) {
                spotX += (targetMouseX - spotX) * 0.08;
                spotY += (targetMouseY - spotY) * 0.08;
                spotlight.style.left = `${spotX}px`;
                spotlight.style.top = `${spotY}px`;
                spotlight.style.opacity = isPointerActive ? "0.9" : "0.5";
            }

            frameCount++;
            if (now - lastFpsUpdate >= 1000) {
                const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
                if (fpsMeter) fpsMeter.textContent = `${fps} FPS`;
                frameCount = 0;
                lastFpsUpdate = now;
            }

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];

                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                const dx = n.x - mouseX;
                const dy = n.y - mouseY;
                const dist = Math.hypot(dx, dy);

                if (dist < 180 && dist > 0) {
                    const force = (180 - dist) / 180;
                    n.x += (dx / dist) * force * 2.5;
                    n.y += (dy / dist) * force * 2.5;
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                if (n.hue === "lime") {
                    ctx.fillStyle = `rgba(228, 255, 0, ${n.baseAlpha + (dist < 180 ? 0.4 : 0)})`;
                    ctx.shadowColor = "#e4ff00";
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = `rgba(148, 163, 184, ${n.baseAlpha})`;
                    ctx.shadowBlur = 0;
                }
                ctx.fill();

                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dist2 = Math.hypot(n.x - n2.x, n.y - n2.y);
                    const maxDist = 125;

                    if (dist2 < maxDist) {
                        const alpha = (1 - dist2 / maxDist) * 0.28;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(n2.x, n2.y);
                        if (n.hue === "lime" || n2.hue === "lime") {
                            ctx.strokeStyle = `rgba(228, 255, 0, ${alpha * 1.5})`;
                        } else {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        }
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateCanvas);
        }

        requestAnimationFrame(animateCanvas);

        // Magnetic Button Pull Effect
        const magneticBtns = document.querySelectorAll(".magnetic-btn");
        magneticBtns.forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "translate(0px, 0px)";
            });
        });
    }
    initHeroGenerativeCanvas();

    /* ========================================================
       6. INTERACTIVE AI AGENT ARCHITECTURE NODE GRAPH
       ======================================================== */
    function initInteractiveNodeGraph() {
        const stage = document.getElementById("nodeGraphStage");
        const svgLayer = document.getElementById("graphSvgLayer");
        const triggerPulseBtn = document.getElementById("triggerPulseBtn");
        const triggerPulseText = document.getElementById("triggerPulseText");
        const inspectToggleBtn = document.getElementById("inspectToggleBtn");
        const closeDrawerBtn = document.getElementById("closeDrawerBtn");
        const drawer = document.getElementById("nodeInspectDrawer");
        const testNodeBtn = document.getElementById("testNodeBtn");
        const presetBtns = document.querySelectorAll(".node-workflow-btn");

        const drawerNodeName = document.getElementById("drawerNodeName");
        const drawerNodeType = document.getElementById("drawerNodeType");
        const drawerLatency = document.getElementById("drawerLatency");
        const drawerStatus = document.getElementById("drawerStatus");
        const drawerInboundJson = document.getElementById("drawerInboundJson");
        const drawerLogicCode = document.getElementById("drawerLogicCode");
        const drawerOutboundJson = document.getElementById("drawerOutboundJson");

        if (!stage || !svgLayer) return;

        const workflowConfigs = {
            whatsapp: {
                name: "WhatsApp AI Bot",
                sequence: ["webhook", "auth", "router", "agent", "db", "dispatch"],
                connections: [
                    { from: "webhook", to: "auth" },
                    { from: "auth", to: "router" },
                    { from: "router", to: "agent" },
                    { from: "agent", to: "db" },
                    { from: "db", to: "dispatch" }
                ]
            },
            simpleide: {
                name: "SimpleIDE AST Agent",
                sequence: ["webhook", "auth", "ast", "agent", "db", "dispatch"],
                connections: [
                    { from: "webhook", to: "auth" },
                    { from: "auth", to: "ast" },
                    { from: "ast", to: "agent" },
                    { from: "agent", to: "db" },
                    { from: "db", to: "dispatch" }
                ]
            },
            ema: {
                name: "EMA Outreach Drip",
                sequence: ["webhook", "router", "agent", "db", "dispatch"],
                connections: [
                    { from: "webhook", to: "router" },
                    { from: "router", to: "agent" },
                    { from: "agent", to: "db" },
                    { from: "db", to: "dispatch" }
                ]
            }
        };

        const nodeTelemetry = {
            webhook: {
                name: "Inbound Webhook",
                type: "TRIGGER",
                latency: "0.4ms",
                status: "OPERATIONAL (HTTP 200)",
                inbound: `{\n  "source": "Meta Cloud API",\n  "event": "messages.received",\n  "sender": "+91-9876543210",\n  "text": "Enterprise license & AI automation setup inquiry"\n}`,
                code: `// Express / FastAPI Inbound Ingestion\napp.post("/webhook", async (req, res) => {\n  const payload = req.body;\n  return dispatchToSecurityGuard(payload);\n});`,
                outbound: `{\n  "status": "QUEUED_FOR_AUTH",\n  "rawBytes": 412,\n  "requestId": "req_881a94f"\n}`
            },
            auth: {
                name: "HMAC Auth Guard",
                type: "SECURITY",
                latency: "1.2ms",
                status: "VERIFIED (SHA-256)",
                inbound: `{\n  "header": "x-hub-signature-256: sha256=9a8b...",\n  "secretEnv": "VERIFIED_PRESENT"\n}`,
                code: `// HMAC-SHA256 Cryptographic Verification\nfunction verify(body, signature, secret) {\n  const hash = crypto.createHmac("sha256", secret)\n    .update(body).digest("hex");\n  return signature === \`sha256=\${hash}\`;\n}`,
                outbound: `{\n  "authenticated": true,\n  "identity": "verified_client",\n  "securityPassTime": "1.2ms"\n}`
            },
            router: {
                name: "Intent Router",
                type: "CLASSIFIER",
                latency: "18.4ms",
                status: "CONFIDENCE: 99.2%",
                inbound: `{\n  "userText": "Enterprise license & AI automation setup inquiry",\n  "language": "en-US"\n}`,
                code: `// Embedding Distance & Semantic Routing\nconst intent = await classifySemanticIntent(userText, [\n  "LEAD_ENTERPRISE", "SUPPORT_BUG", "BILLING_TIER"\n]);`,
                outbound: `{\n  "selectedIntent": "LEAD_ENTERPRISE_HIGH_PRIORITY",\n  "routedTarget": "agent_enterprise_closer",\n  "confidence": 0.992\n}`
            },
            agent: {
                name: "Autonomous Agent Engine",
                type: "AI REASONING",
                latency: "420ms",
                status: "ZERO SLOP (DETERMINISTIC)",
                inbound: `{\n  "model": "Claude 3.5 Sonnet",\n  "system": "Deterministic Enterprise Triage Agent",\n  "temperature": 0.1\n}`,
                code: `// Claude 3.5 Structured Tool Calling\nconst completion = await anthropic.messages.create({\n  model: "claude-3-5-sonnet-20241022",\n  max_tokens: 1024,\n  tools: [crmSyncTool, quoteGeneratorTool]\n});`,
                outbound: `{\n  "decision": "GENERATE_ENTERPRISE_PROPOSAL",\n  "arguments": { "tier": "scale", "seats": 25 },\n  "tokensSaved": "+34.2%"\n}`
            },
            ast: {
                name: "AST Diff Validator",
                type: "EXECUTION",
                latency: "14.1ms",
                status: "SYNTAX VALIDATED (AST OK)",
                inbound: `{\n  "file": "packages/core/src/state.ts",\n  "engine": "Babel / Tree-Sitter"\n}`,
                code: `// AST Code Transformation & Diff Checker\nconst ast = babelParser.parse(codeContent, { sourceType: "module" });\nconst diffPatch = diff.createPatch("state.ts", original, refactored);`,
                outbound: `{\n  "astValid": true,\n  "mutationsApplied": 12,\n  "lintErrors": 0,\n  "tokenCompression": "28%"\n}`
            },
            db: {
                name: "PostgreSQL & Redis Sync",
                type: "PERSISTENCE",
                latency: "3.5ms",
                status: "ACID COMMITTED",
                inbound: `{\n  "leadRecord": { "id": "lead_9941", "tier": "scale" },\n  "rateLimitBucket": "ok"\n}`,
                code: `// Redis Rate-Limiter + Postgres Mutation\nawait redis.decr(userRateLimitKey);\nawait db.insert(leadsTable).values(newLeadRecord);`,
                outbound: `{\n  "dbSyncStatus": "COMMITTED",\n  "transactionId": "tx_772183",\n  "latency": "3.5ms"\n}`
            },
            dispatch: {
                name: "Cloud Egress Dispatch",
                type: "EGRESS SINK",
                latency: "28.0ms",
                status: "HTTP 200 DELIVERED",
                inbound: `{\n  "target": "WhatsApp Cloud API / Graph v20.0",\n  "status": "DELIVERED_TO_RECIPIENT"\n}`,
                code: `// Meta Cloud API / Email Egress Dispatch\nawait fetch(\`https://graph.facebook.com/v20.0/\${PHONE_ID}/messages\`, {\n  method: "POST",\n  headers: { Authorization: \`Bearer \${TOKEN}\` },\n  body: JSON.stringify(outboundMessage)\n});`,
                outbound: `{\n  "statusCode": 200,\n  "messageId": "wamid.HBgL...",\n  "pipelineExecution": "COMPLETED_IN_485ms"\n}`
            }
        };

        let currentPreset = "whatsapp";
        let isPulsing = false;

        function drawCables() {
            const config = workflowConfigs[currentPreset];
            if (!config) return;

            const existingPaths = svgLayer.querySelectorAll("path.graph-cable");
            existingPaths.forEach(p => p.remove());

            const stageRect = stage.getBoundingClientRect();

            config.connections.forEach((conn) => {
                const fromEl = document.getElementById(`node-${conn.from}`);
                const toEl = document.getElementById(`node-${conn.to}`);
                if (!fromEl || !toEl) return;

                const fromPort = fromEl.querySelector(".node-port-out");
                const toPort = toEl.querySelector(".node-port-in");

                const fromRect = fromPort ? fromPort.getBoundingClientRect() : fromEl.getBoundingClientRect();
                const toRect = toPort ? toPort.getBoundingClientRect() : toEl.getBoundingClientRect();

                const x1 = fromRect.left - stageRect.left + fromRect.width / 2;
                const y1 = fromRect.top - stageRect.top + fromRect.height / 2;
                const x2 = toRect.left - stageRect.left + toRect.width / 2;
                const y2 = toRect.top - stageRect.top + toRect.height / 2;

                const dx = Math.abs(x2 - x1) * 0.5;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", pathD);
                path.setAttribute("class", "graph-cable");
                path.setAttribute("id", `cable-${conn.from}-${conn.to}`);
                svgLayer.appendChild(path);
            });
        }

        function triggerPulse() {
            if (isPulsing) return;
            isPulsing = true;
            sound.playClick();

            if (triggerPulseBtn) {
                triggerPulseBtn.classList.add("opacity-60");
                if (triggerPulseText) triggerPulseText.textContent = "EXECUTING PIPELINE...";
            }

            const config = workflowConfigs[currentPreset];
            const seq = config.sequence;

            document.querySelectorAll(".node-element").forEach(n => {
                n.classList.remove("pulsing");
            });

            document.querySelectorAll(".graph-cable").forEach(c => c.classList.remove("active"));

            let step = 0;

            function runStep() {
                if (step >= seq.length) {
                    isPulsing = false;
                    if (triggerPulseBtn) {
                        triggerPulseBtn.classList.remove("opacity-60");
                        if (triggerPulseText) triggerPulseText.textContent = "TRIGGER PIPELINE PULSE";
                    }
                    sound.playSuccess();
                    return;
                }

                const currentNodeKey = seq[step];
                const nodeEl = document.getElementById(`node-${currentNodeKey}`);

                if (nodeEl) {
                    nodeEl.classList.add("pulsing");
                    sound.playBlip();

                    selectNode(currentNodeKey);

                    if (step < seq.length - 1) {
                        const nextNodeKey = seq[step + 1];
                        const cable = document.getElementById(`cable-${currentNodeKey}-${nextNodeKey}`);
                        if (cable) cable.classList.add("active");
                    }

                    setTimeout(() => {
                        nodeEl.classList.remove("pulsing");
                        step++;
                        runStep();
                    }, 420);
                } else {
                    step++;
                    runStep();
                }
            }

            runStep();
        }

        function selectNode(nodeKey) {
            const data = nodeTelemetry[nodeKey];
            if (!data) return;

            document.querySelectorAll(".node-element").forEach(el => el.classList.remove("selected"));
            const currentEl = document.getElementById(`node-${nodeKey}`);
            if (currentEl) currentEl.classList.add("selected");

            if (drawerNodeName) drawerNodeName.textContent = data.name;
            if (drawerNodeType) drawerNodeType.textContent = data.type;
            if (drawerLatency) drawerLatency.textContent = data.latency;
            if (drawerStatus) drawerStatus.textContent = data.status;
            if (drawerInboundJson) drawerInboundJson.textContent = data.inbound;
            if (drawerLogicCode) drawerLogicCode.textContent = data.code;
            if (drawerOutboundJson) drawerOutboundJson.textContent = data.outbound;

            if (drawer) drawer.classList.add("open");
        }

        document.querySelectorAll(".node-element").forEach(node => {
            node.addEventListener("click", () => {
                const key = node.getAttribute("data-node");
                sound.playClick();
                selectNode(key);
            });
        });

        presetBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const preset = btn.getAttribute("data-preset");
                if (preset === currentPreset) return;
                sound.playClick();

                presetBtns.forEach(b => {
                    b.classList.remove("bg-[#e4ff00]", "text-black", "font-black");
                    b.classList.add("bg-[#141923]", "text-slate-300", "font-bold");
                });
                btn.classList.add("bg-[#e4ff00]", "text-black", "font-black");
                btn.classList.remove("bg-[#141923]", "text-slate-300", "font-bold");

                currentPreset = preset;
                drawCables();

                const firstNode = workflowConfigs[preset]?.sequence[0] || "webhook";
                selectNode(firstNode);
            });
        });

        if (triggerPulseBtn) {
            triggerPulseBtn.addEventListener("click", triggerPulse);
        }

        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener("click", () => {
                sound.playClick();
                if (drawer) drawer.classList.remove("open");
            });
        }

        if (inspectToggleBtn) {
            inspectToggleBtn.addEventListener("click", () => {
                sound.playClick();
                if (drawer) drawer.classList.toggle("open");
            });
        }

        if (testNodeBtn) {
            testNodeBtn.addEventListener("click", () => {
                sound.playBlip();
                const selected = document.querySelector(".node-element.selected");
                if (selected) {
                    selected.classList.add("pulsing");
                    setTimeout(() => {
                        selected.classList.remove("pulsing");
                        sound.playSuccess();
                    }, 500);
                }
            });
        }

        setTimeout(() => {
            drawCables();
            selectNode("webhook");
        }, 300);

        window.addEventListener("resize", () => {
            drawCables();
        });
    }
    initInteractiveNodeGraph();


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
