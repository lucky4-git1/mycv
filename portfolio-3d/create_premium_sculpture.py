import bpy
import math
import os
import sys
import mathutils

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.collections:
        col = bpy.data.collections.new("SculptureCollection")
        bpy.context.scene.collection.children.link(col)
    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    if bpy.context.scene.world.node_tree:
        bg = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg:
            # Clean dark studio environment (#090b0e)
            bg.inputs["Color"].default_value = (0.015, 0.018, 0.024, 1.0)
            bg.inputs["Strength"].default_value = 0.35

def create_pbr_shader(name, base_color, metallic=0.0, roughness=0.5, ior=1.5, transmission=0.0, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    nodes.clear()
    links = mat.node_tree.links

    out_node = nodes.new("ShaderNodeOutputMaterial")
    out_node.location = (400, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["IOR"].default_value = ior

    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = transmission

    if emission_color:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            bsdf.inputs["Emission Strength"].default_value = emission_strength
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = emission_color
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength

    links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])
    return mat

def point_camera_at(cam_obj, target_vec):
    direction = target_vec - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

def build_signature_sculpture():
    print("Building architectural mechanical sculpture...")
    sys.stdout.flush()

    # --- PBR Materials ---
    mat_black_ceramic = create_pbr_shader(
        "PBR_BlackCeramic",
        base_color=(0.02, 0.022, 0.026, 1.0),
        metallic=0.15,
        roughness=0.18
    )

    mat_brushed_titanium = create_pbr_shader(
        "PBR_BrushedTitanium",
        base_color=(0.42, 0.45, 0.49, 1.0),
        metallic=0.92,
        roughness=0.28
    )

    mat_polished_chrome = create_pbr_shader(
        "PBR_PolishedChrome",
        base_color=(0.94, 0.95, 0.97, 1.0),
        metallic=1.0,
        roughness=0.04
    )

    mat_smoked_glass = create_pbr_shader(
        "PBR_SmokedGlass",
        base_color=(0.04, 0.05, 0.07, 1.0),
        metallic=0.1,
        roughness=0.08,
        transmission=0.85,
        ior=1.52
    )

    mat_neon_lime = create_pbr_shader(
        "PBR_NeonLimeEmissive",
        base_color=(0.08, 0.12, 0.01, 1.0),
        metallic=0.0,
        roughness=0.2,
        emission_color=(0.89, 1.0, 0.0, 1.0),
        emission_strength=3.5
    )

    # --- 1. LUMINOUS QUANTUM CORE & GEODESIC CAGE ---
    # Central radiant plasma nucleus (compact jewel)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.42, location=(0, 0, 0))
    core = bpy.context.active_object
    core.name = "Core_LuminousNucleus"
    core.data.materials.append(mat_neon_lime)
    bpy.ops.object.shade_smooth()

    # Dedicated core point light for realistic bounce onto surrounding metal
    core_light = bpy.data.lights.new("Core_NeonPointLight", 'POINT')
    core_light.energy = 28.0
    core_light.color = (0.89, 1.0, 0.0)
    core_light.shadow_soft_size = 0.15
    core_light_obj = bpy.data.objects.new("Core_NeonPointLight", core_light)
    core_light_obj.location = (0, 0, 0)
    bpy.context.scene.collection.objects.link(core_light_obj)

    # Inner Titanium Geodesic Lattice
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.58, location=(0, 0, 0))
    lattice = bpy.context.active_object
    lattice.name = "Core_GeodesicLattice"
    wire_mod = lattice.modifiers.new("Wireframe", 'WIREFRAME')
    wire_mod.thickness = 0.024
    wire_mod.use_replace = True
    lattice.data.materials.append(mat_brushed_titanium)

    # 4 Smoked Glass Aperture Plates (Curved Shields, not a sealed solid ball)
    for g_i in range(4):
        g_ang = (g_i / 4.0) * math.pi * 2.0 + 0.38
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.35, depth=0.06, location=(math.cos(g_ang) * 0.72, math.sin(g_ang) * 0.72, 0))
        glass_plate = bpy.context.active_object
        glass_plate.name = f"Core_GlassShield_{g_i+1}"
        glass_plate.scale = (0.8, 1.2, 0.3)
        glass_plate.rotation_euler = (math.radians(20) * math.sin(g_ang), math.radians(20) * math.cos(g_ang), g_ang)
        glass_plate.data.materials.append(mat_smoked_glass)
        bpy.ops.object.shade_smooth()

    # --- 2. ARTICULATED APERTURE IRIS BLADES (8 Sculpted Ceramic Blades with Chrome Bevels) ---
    for k in range(8):
        ang = (k / 8.0) * math.pi * 2.0
        r = 1.15
        z_pos = math.sin(ang * 2) * 0.12

        # Aerodynamic blade body
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(math.cos(ang) * r, math.sin(ang) * r, z_pos))
        blade = bpy.context.active_object
        blade.name = f"Iris_Blade_{k+1}"
        blade.scale = (0.28, 0.95, 0.055)
        blade.rotation_euler = (
            math.radians(22) * math.sin(ang),
            math.radians(22) * math.cos(ang),
            ang + math.radians(35)
        )
        bev = blade.modifiers.new("Bevel", 'BEVEL')
        bev.width = 0.02
        bev.segments = 2
        blade.data.materials.append(mat_black_ceramic)

        # Polished Chrome Leading-Edge Strip
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.016, depth=0.92, location=blade.location)
        strip = bpy.context.active_object
        strip.name = f"Iris_ChromeStrip_{k+1}"
        strip.rotation_euler = blade.rotation_euler
        strip.location.x += math.cos(ang + 0.4) * 0.10
        strip.location.y += math.sin(ang + 0.4) * 0.10
        strip.data.materials.append(mat_polished_chrome)

        # Titanium Pivot Hinge Fastener
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.045, depth=0.18, location=blade.location)
        pivot = bpy.context.active_object
        pivot.name = f"Iris_PivotPin_{k+1}"
        pivot.rotation_euler = blade.rotation_euler
        pivot.data.materials.append(mat_brushed_titanium)

    # --- 3. ARCHITECTURAL ASYMMETRIC CARAPACE PLATES (Sweeping Ventilated Cowls) ---
    cowl_params = [
        {"angle": 0.4, "radius": 1.70, "z": 0.42, "rot": (20, -15, 30), "scale": (0.9, 0.35, 1.25)},
        {"angle": 2.2, "radius": 1.82, "z": -0.28, "rot": (-25, 18, 130), "scale": (0.8, 0.32, 1.15)},
        {"angle": 4.1, "radius": 1.75, "z": 0.18, "rot": (15, 26, 240), "scale": (0.95, 0.30, 1.35)}
    ]

    for idx, cp in enumerate(cowl_params):
        ang = cp["angle"]
        x = math.cos(ang) * cp["radius"]
        y = math.sin(ang) * cp["radius"]
        z = cp["z"]

        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.6, depth=0.14, location=(x, y, z))
        cowl = bpy.context.active_object
        cowl.name = f"Sculpture_Carapace_{idx+1}"
        cowl.scale = cp["scale"]
        cowl.rotation_euler = (math.radians(cp["rot"][0]), math.radians(cp["rot"][1]), math.radians(cp["rot"][2]))
        
        c_bev = cowl.modifiers.new("Bevel", 'BEVEL')
        c_bev.width = 0.035
        c_bev.segments = 2
        cowl.data.materials.append(mat_black_ceramic)
        bpy.ops.object.shade_smooth()

        # Recessed Titanium Cooling Fin
        bpy.ops.mesh.primitive_cube_add(size=0.45, location=(x * 0.93, y * 0.93, z))
        fin = bpy.context.active_object
        fin.name = f"Sculpture_CoolingFin_{idx+1}"
        fin.scale = (cp["scale"][0] * 0.55, cp["scale"][1] * 0.75, cp["scale"][2] * 0.5)
        fin.rotation_euler = cowl.rotation_euler
        fin.data.materials.append(mat_brushed_titanium)

        # Subtle Neon-Lime Optical Fiber Seam
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.02, depth=1.05, location=(x * 1.05, y * 1.05, z))
        seam = bpy.context.active_object
        seam.name = f"Sculpture_NeonSeam_{idx+1}"
        seam.rotation_euler = cowl.rotation_euler
        seam.data.materials.append(mat_neon_lime)

    # --- 4. PRECISION MACHINED GIMBAL & CALIPER TRACKS ---
    # Inner Gimbal Ring (Brushed Titanium with chamfered rim)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=2.15,
        minor_radius=0.045,
        major_segments=64,
        minor_segments=16,
        location=(0, 0, 0)
    )
    gimbal_inner = bpy.context.active_object
    gimbal_inner.name = "Gimbal_Ring_Titanium"
    gimbal_inner.rotation_euler = (math.radians(32), math.radians(-12), math.radians(18))
    gimbal_inner.data.materials.append(mat_brushed_titanium)

    # Outer Gimbal Ring (Polished Chrome with Black Ceramic Calipers)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=2.52,
        minor_radius=0.038,
        major_segments=64,
        minor_segments=16,
        location=(0, 0, 0)
    )
    gimbal_outer = bpy.context.active_object
    gimbal_outer.name = "Gimbal_Ring_OuterChrome"
    gimbal_outer.rotation_euler = (math.radians(-35), math.radians(40), math.radians(-10))
    gimbal_outer.data.materials.append(mat_polished_chrome)

    # Asymmetric Caliper Bracket
    bpy.ops.mesh.primitive_cube_add(size=0.38, location=(-1.82, 1.42, 0.58))
    caliper = bpy.context.active_object
    caliper.name = "Gimbal_CaliperBracket"
    caliper.scale = (0.5, 1.1, 0.6)
    caliper.rotation_euler = gimbal_outer.rotation_euler
    cal_bev = caliper.modifiers.new("Bevel", 'BEVEL')
    cal_bev.width = 0.03
    cal_bev.segments = 2
    caliper.data.materials.append(mat_black_ceramic)

    # Caliper Chrome Fasteners
    for p in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.035, depth=0.48, location=(-1.82 + p * 0.09, 1.42, 0.58))
        bolt = bpy.context.active_object
        bolt.name = f"Caliper_Bolt_{'1' if p < 0 else '2'}"
        bolt.rotation_euler = gimbal_outer.rotation_euler
        bolt.data.materials.append(mat_polished_chrome)

    # --- 5. ORBITAL SATELLITE TOKENS ---
    # Satellite A: Hexagonal Cryptographic Node
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.17, depth=0.42, location=(1.90, -1.48, 0.70))
    sat_hex = bpy.context.active_object
    sat_hex.name = "Satellite_HexNode"
    sat_hex.rotation_euler = (math.radians(25), math.radians(45), math.radians(10))
    sat_hex.data.materials.append(mat_brushed_titanium)

    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.065, depth=0.46, location=sat_hex.location)
    sat_hex_glow = bpy.context.active_object
    sat_hex_glow.name = "Satellite_HexNode_Core"
    sat_hex_glow.rotation_euler = sat_hex.rotation_euler
    sat_hex_glow.data.materials.append(mat_neon_lime)

    # Satellite B: Octahedron Prism Cage
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.22, location=(-2.10, -0.82, -0.72))
    sat_octa = bpy.context.active_object
    sat_octa.name = "Satellite_Octahedron"
    sat_octa.rotation_euler = (math.radians(45), math.radians(15), math.radians(60))
    sat_octa_wire = sat_octa.modifiers.new("Wireframe", 'WIREFRAME')
    sat_octa_wire.thickness = 0.018
    sat_octa_wire.use_replace = True
    sat_octa.data.materials.append(mat_polished_chrome)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.075, location=sat_octa.location)
    sat_octa_glow = bpy.context.active_object
    sat_octa_glow.name = "Satellite_Octahedron_Kernel"
    sat_octa_glow.data.materials.append(mat_neon_lime)

    # Apply modifiers
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception:
                    pass

    print("Sculpture construction completed.")
    sys.stdout.flush()

def setup_studio_lighting():
    # 1. Main Hero Camera (52mm lens, wide 3/4 framing showing the complete silhouette)
    cam_data = bpy.data.cameras.new("HeroCamera")
    cam_data.lens = 52.0
    cam_obj = bpy.data.objects.new("HeroCamera", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (4.4, -5.6, 2.8)
    point_camera_at(cam_obj, mathutils.Vector((0.0, 0.0, 0.0)))

    # 2. Macro Close-Up Detail Camera (80mm lens, focused on aperture-core-blade interface)
    detail_cam_data = bpy.data.cameras.new("DetailCamera")
    detail_cam_data.lens = 80.0
    detail_cam_obj = bpy.data.objects.new("DetailCamera", detail_cam_data)
    bpy.context.scene.collection.objects.link(detail_cam_obj)
    detail_cam_obj.location = (2.2, -2.5, 1.2)
    point_camera_at(detail_cam_obj, mathutils.Vector((0.4, -0.3, 0.15)))

    # 3. Controlled Studio Lighting Setup
    # Key Light (Large softbox for clean gradient sheen on ceramic)
    key = bpy.data.lights.new("Key_Softbox", 'AREA')
    key.energy = 550.0
    key.size = 3.2
    key.color = (0.97, 0.98, 1.0)
    key_obj = bpy.data.objects.new("Key_Softbox", key)
    key_obj.location = (4.2, -4.0, 3.8)
    point_camera_at(key_obj, mathutils.Vector((0.0, 0.0, 0.0)))
    bpy.context.scene.collection.objects.link(key_obj)

    # Rim Light (Intense edge specular reflection carving the silhouette)
    rim = bpy.data.lights.new("Rim_SpecHighlight", 'AREA')
    rim.energy = 850.0
    rim.size = 2.4
    rim.color = (0.92, 0.96, 1.0)
    rim_obj = bpy.data.objects.new("Rim_SpecHighlight", rim)
    rim_obj.location = (-4.2, 4.0, 2.6)
    point_camera_at(rim_obj, mathutils.Vector((0.0, 0.0, 0.0)))
    bpy.context.scene.collection.objects.link(rim_obj)

    # Fill Light (Subtle cool slate bounce)
    fill = bpy.data.lights.new("Fill_SoftSlate", 'AREA')
    fill.energy = 140.0
    fill.size = 4.5
    fill.color = (0.42, 0.46, 0.55)
    fill_obj = bpy.data.objects.new("Fill_SoftSlate", fill)
    fill_obj.location = (-3.0, -3.2, 1.2)
    point_camera_at(fill_obj, mathutils.Vector((0.0, 0.0, 0.0)))
    bpy.context.scene.collection.objects.link(fill_obj)

def render_and_export():
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\hero-sculpture.blend"
    glb_path = r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-sculpture.glb"
    preview_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-preview.png"
    detail_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-detail.png"

    scene = bpy.context.scene
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    # Save Native .blend
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved native .blend file: {blend_path}")
    sys.stdout.flush()

    # 1. Render Hero Preview (1400x1400)
    scene.camera = bpy.data.objects["HeroCamera"]
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1400
    scene.render.filepath = preview_path
    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered Hero Preview: {preview_path}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Preview render notice: {e}")

    # 2. Render Close-Up Detail (1400x1400)
    scene.camera = bpy.data.objects["DetailCamera"]
    scene.render.filepath = detail_path
    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered Close-Up Detail: {detail_path}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Detail render notice: {e}")

    # 3. Export Web-Ready GLB
    os.makedirs(os.path.dirname(glb_path), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    mesh_count = 0
    verts = 0
    tris = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            mesh_count += 1
            verts += len(obj.data.vertices)
            tris += len(obj.data.polygons)

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
        export_yup=True
    )
    print(f"Exported Hero Sculpture GLB: {glb_path}")
    print(f"Geometry Metrics: {mesh_count} meshes, {verts} vertices, {tris} polygons")
    if os.path.exists(glb_path):
        print(f"GLB File Size: {os.path.getsize(glb_path)} bytes ({os.path.getsize(glb_path)/1024:.1f} KB)")
    sys.stdout.flush()

def main():
    print("=== EXECUTING REFINED SCULPTURE PIPELINE ===")
    clean_scene()
    build_signature_sculpture()
    setup_studio_lighting()
    render_and_export()
    print("=== REFINED SCULPTURE PIPELINE COMPLETE ===")

if __name__ == "__main__":
    main()
