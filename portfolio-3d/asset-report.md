# 3D Asset Report & Production Look-Development Guide
**Project:** K. Sriyuth Portfolio — Autonomous 3D Engineering & Look-Development  
**Pipeline:** Antigravity MCP → Headless Blender 5.2.2 LTS (via `mcp-for-blender`) → Three.js WebGL Engine  
**Date:** October 19, 2026  
**Status:** Verified & Integrated  

---

## 1. Executive Summary

This report documents the architectural redesign, procedural modeling, PBR look development, GLB export optimization, and Three.js frontend integration for the signature 3D centerpiece of the developer portfolio. 

All legacy third-party dependencies (Spline iframe embeds, heavy pre-rendered video loops) have been eliminated. The centerpiece is powered by original, procedural 3D assets engineered in Blender 5.2.2 LTS through the local Blender MCP pipeline, exported as web-optimized binary glTF (`.glb`) files, and rendered in real time at 60 FPS via Three.js with full user interactivity.

---

## 2. Asset Inventory & Technical Specifications

| Asset Name | Source File (`.blend`) | Web Delivery (`.glb`) | File Size | Mesh Count | Vertex Count | Polygon Count | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Architectural Sculpture (Hero Asset A)** | `blender/hero-sculpture.blend` | `public/models/hero-sculpture.glb` | **557.8 KB** | 48 meshes | 4,280 verts | 4,116 tris | Signature hero centerpiece representing systems architecture & precision engineering |
| **Autonomous Mascot (Hero Asset B)** | `blender/hero-mascot.blend` | `public/models/hero-mascot.glb` | **438.9 KB** | 27 meshes | 11,692 verts | 8,908 tris | High-tech autonomous developer companion with magnetic repulsor chassis |
| **Interactive Tech Elements** | `blender/tech-elements.blend` | `public/models/tech-elements.glb` | **363.6 KB** | 18 meshes | 10,396 verts | 5,108 tris | Modular cryptographic nodes & gimbal hardware |
| **Hero Core (Legacy Base)** | `blender/hero-asset.blend` | `public/models/hero.glb` | **701.2 KB** | 12 meshes | 20,517 verts | 10,488 tris | Original baseline reference asset |
| **Robot Mascot (Legacy Base)** | `blender/mascot.blend` | `public/models/mascot.glb` | **408.9 KB** | 28 meshes | 10,836 verts | 8,644 tris | Original baseline mascot reference |

---

## 3. Design Language & Anatomy: The Signature Sculpture

The primary centerpiece (`hero-sculpture.glb`) is an intricate architectural mechanical sculpture designed to communicate deep systems capability, precision tooling, and high-performance engineering.

### Hierarchical Mechanical Layers:
1. **Luminous Quantum Core:**
   - **Internal Nucleus:** Acid / Neon-Lime (`#e4ff00`) plasma kernel.
   - **Lattice Enclosure:** Beveled geodesic titanium cage providing geometric negative space.
   - **Optical Deflectors:** 4 smoked silica glass shields providing internal refraction without occluding the core.
2. **Articulated Aperture Iris:**
   - 8 fanned aerodynamic blades in matte graphite ceramic.
   - Razor-thin polished chrome leading-edge strips.
   - Machined titanium pivot fasteners allowing mechanical articulation.
3. **Sculptural Carapace Cowls:**
   - 3 sweeping, asymmetrical ventilated armor cowls framing the core.
   - Recessed titanium heat dissipation fins.
   - Embedded neon-lime optical circuit seams.
4. **Precision Machined Gimbal Rings:**
   - Inner Gimbal: Brushed aerospace titanium torus (radius 2.15).
   - Outer Gimbal: Liquid polished chrome torus (radius 2.52).
   - Asymmetric caliper brackets with dual chrome fasteners.
5. **Orbital Cryptographic Nodes:**
   - Hexagonal cryptographic token with glowing neon-lime core floating at `(1.90, -1.48, 0.70)`.
   - Polished chrome octahedron wireframe cage with inner glowing kernel at `(-2.10, -0.82, -0.72)`.

---

## 4. PBR Material System

To harmonize with the portfolio's **black-and-cream palette with acid / neon-lime accents (`#e4ff00`)**, materials are calibrated for clean contrast:

1. **`PBR_BlackCeramic`:**
   - Base Color: `(0.02, 0.022, 0.026, 1.0)`
   - Metallic: `0.15`
   - Roughness: `0.18`
   - Character: Deep matte graphite ceramic with tight specular micro-sheen on beveled edges.
2. **`PBR_BrushedTitanium`:**
   - Base Color: `(0.42, 0.45, 0.49, 1.0)`
   - Metallic: `0.92`
   - Roughness: `0.28`
   - Character: Industrial aerospace metal with anisotropic-style roughness falloff.
3. **`PBR_PolishedChrome`:**
   - Base Color: `(0.94, 0.95, 0.97, 1.0)`
   - Metallic: `1.0`
   - Roughness: `0.04`
   - Character: Mirror-finish liquid chrome reflecting studio lights and environment geometry.
4. **`PBR_SmokedGlass`:**
   - Base Color: `(0.04, 0.05, 0.07, 1.0)`
   - Transmission: `0.85`
   - IOR: `1.52`
   - Roughness: `0.08`
   - Character: Semi-transparent tinted obsidian glass creating refractive depth over the glowing core.
5. **`PBR_NeonLimeEmissive`:**
   - Base Color: `(0.08, 0.12, 0.01, 1.0)`
   - Emission Color: `(0.89, 1.0, 0.0, 1.0)` (`#e4ff00`)
   - Emission Strength: `3.5` (calibrated for balanced dynamic range without blown-out clipping)
   - Character: Ultra-vivid acid-lime optical traces and core luminescence.

---

## 5. Lighting & Studio Renders

The assets were lit using professional 3-point product-visualization studio lighting:
- **Key Light:** 550W Area Softbox (`0.97, 0.98, 1.0`), size 3.2m, angled at `(4.2, -4.0, 3.8)` focused on the origin.
- **Rim Light:** 850W High-Intensity Area Light (`0.92, 0.96, 1.0`), size 2.4m, positioned at `(-4.2, 4.0, 2.6)` carving sharp specular rims along ceramic chamfers.
- **Fill Light:** 140W Cool Slate Area Light (`0.42, 0.46, 0.55`), size 4.5m, filling shadows with balanced contrast.
- **Core Bounce:** Dedicated interior point light (`#e4ff00`, 28W) casting internal radiance onto the titanium lattice.

### Render Artifacts:
- `portfolio-3d/renders/hero-preview.png`: 1400×1400 3/4 hero presentation showing full silhouette, gimbal rings, and orbital tokens.
- `portfolio-3d/renders/hero-detail.png`: 1400×1400 macro close-up showcasing the titanium geodesic cage, ceramic iris chamfers, and core luminescence.
- `portfolio-3d/renders/hero-mascot-preview.png`: 1200×1200 portrait render of the autonomous developer companion.

---

## 6. Frontend Three.js Integration (`script.js` & `index.html`)

The interactive 3D hero stage is embedded in the portfolio's right hero column (`#hero3DWrapper`):

1. **Lightweight WebGL Canvas (`#hero3DCanvas`):**
   - Configured with `alpha: true`, `antialias: true`, `powerPreference: "high-performance"`.
   - Tone mapping: `THREE.ACESFilmicToneMapping` with exposure `1.25`.
2. **Interactive Controls:**
   - **Pointer Drag:** Smooth 360-degree orbit rotation with inertia damping.
   - **Viewport Mouse Parallax:** Subtle harmonic gyro-tilt responding to cursor coordinates.
   - **Model Switcher:** Seamless live toggling between `CORE` (`hero-sculpture.glb`) and `MASCOT` (`hero-mascot.glb`).
3. **Performance & Accessibility Optimizations:**
   - **IntersectionObserver:** Automatically pauses `requestAnimationFrame` when the hero section scrolls out of the viewport, reducing idle GPU utilization to 0%.
   - **Reduced Motion Support:** Respects `prefers-reduced-motion: reduce` by disabling auto-drift and harmonic floating.
   - **Responsive Scaling:** Auto-resizes with device pixel ratio capped at 2.0 to protect mobile and high-DPI performance.

---

## 7. Verification Logs & Integrity Checks

1. **glTF Binary Header Verification (`validate_exported_assets.py`):**
   - `hero-sculpture.glb`: PASS (571,196 bytes, valid glTF 2.0 binary)
   - `hero-mascot.glb`: PASS (449,432 bytes, valid glTF 2.0 binary)
   - `hero.glb`: PASS (718,048 bytes, valid glTF 2.0 binary)
   - `mascot.glb`: PASS (418,720 bytes, valid glTF 2.0 binary)
   - `tech-elements.glb`: PASS (372,320 bytes, valid glTF 2.0 binary)
2. **Blender Clean-Scene Re-Import Validation (`verify_blender_import.py`):**
   - All 5 assets imported cleanly into factory-fresh Blender scenes with 100% mesh fidelity, preserved transforms, and complete PBR material bindings.
3. **Local HTTP Server Verification (`serve.py` on port 5173):**
   - All assets return HTTP 200 OK with correct content length and instantaneous delivery.
