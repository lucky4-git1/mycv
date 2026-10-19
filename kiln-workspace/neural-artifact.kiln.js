const meta = { 
  name: 'Neural Artifact Node',
  role: 'wonder'
};

function build() {
  const root = createRoot('NeuralArtifact');

  // Materials
  const ceramicDark = gameMaterial(0x111317);
  const titanium = gameMaterial(0x6b7280);
  const chrome = gameMaterial(0xd1d5db);
  const neonLime = gameMaterial(0xe4ff00);

  // 1. Central Quantum Core Nucleus
  createPart('CoreNucleus', sphereGeo(0.38, 24, 16), neonLime, {
    position: [0, 0, 0],
    parent: root
  });

  // 2. Precision Machined Gimbal Rings
  // Ring 1 (Inner Pitch Track)
  const ring1 = createPivot('Ring1_Pivot', [0, 0, 0], root);
  ring1.rotation.x = 28 * (Math.PI / 180);
  ring1.rotation.z = 18 * (Math.PI / 180);
  createPart('GimbalRing_Inner', torusGeo(0.85, 0.032, 16, 48), titanium, {
    position: [0, 0, 0],
    parent: ring1
  });

  // Ring 2 (Outer Yaw Track)
  const ring2 = createPivot('Ring2_Pivot', [0, 0, 0], root);
  ring2.rotation.y = 45 * (Math.PI / 180);
  ring2.rotation.x = -32 * (Math.PI / 180);
  createPart('GimbalRing_Outer', torusGeo(1.15, 0.026, 16, 48), chrome, {
    position: [0, 0, 0],
    parent: ring2
  });

  // 3. Hexagonal Cryptographic Orbital Calipers (6 units around perimeter)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const rad = 0.75;
    const x = Math.cos(angle) * rad;
    const z = Math.sin(angle) * rad;
    const y = Math.sin(angle * 3) * 0.10;

    const bladePivot = createPivot(`BladePivot_${i+1}`, [x, y, z], root);
    bladePivot.rotation.y = angle;

    // Ceramic shield fin
    createPart(`Blade_${i+1}`, boxGeo(0.04, 0.26, 0.12), ceramicDark, {
      position: [0, 0, 0],
      parent: bladePivot
    });

    // Lime optical emitter
    createPart(`BladeEmitter_${i+1}`, cylinderGeo(0.015, 0.015, 0.08, 12), neonLime, {
      position: [0.025, 0, 0],
      parent: bladePivot
    });
  }

  // 4. Floating Orbital Satellites
  // Satellite Alpha (Top Right)
  const sat1 = createPivot('Satellite_Alpha', [0.85, 0.75, -0.65], root);
  createPart('Sat1_Body', sphereGeo(0.12, 16, 12), chrome, {
    position: [0, 0, 0],
    parent: sat1
  });
  createPart('Sat1_Core', sphereGeo(0.045, 12, 8), neonLime, {
    position: [0, 0, 0],
    parent: sat1
  });

  // Satellite Beta (Bottom Left)
  const sat2 = createPivot('Satellite_Beta', [-0.90, -0.65, 0.70], root);
  createPart('Sat2_Body', cylinderGeo(0.08, 0.08, 0.18, 16), titanium, {
    position: [0, 0, 0],
    parent: sat2
  });
  createPart('Sat2_Core', cylinderGeo(0.035, 0.035, 0.20, 16), neonLime, {
    position: [0, 0, 0],
    parent: sat2
  });

  return root;
}
