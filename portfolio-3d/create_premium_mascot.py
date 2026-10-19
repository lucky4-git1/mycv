import bpy
import math
import os
import sys

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.collections:
        col = bpy.data.collections.new("MascotCollection")
        bpy.context.scene.collection.children.link(col)
    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    if bpy.context.scene.world.node_tree:
        bg = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.015, 0.017, 0.022, 1.0)
            bg.inputs["Strength"].default_value = 0.5

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

def build_premium_mascot():
    print("Building premium developer mascot...")
    sys.stdout.flush()

    # Materials
    mat_ceramic = create_pbr_shader("PBR_MascotCeramic", (0.02, 0.022, 0.026, 1.0), metallic=0.18, roughness=0.12)
    mat_titanium = create_pbr_shader("PBR_MascotTitanium", (0.35, 0.38, 0.42, 1.0), metallic=0.95, roughness=0.22)
    mat_chrome = create_pbr_shader("PBR_MascotChrome", (0.92, 0.94, 0.96, 1.0), metallic=1.0, roughness=0.04)
    mat_visor = create_pbr_shader("PBR_MascotVisor", (0.015, 0.018, 0.022, 1.0), metallic=0.9, roughness=0.06)
    mat_lime = create_pbr_shader("PBR_MascotNeonLime", (0.05, 0.08, 0.01, 1.0), emission_color=(0.89, 1.0, 0.0, 1.0), emission_strength=7.5)

    # 1. CRANIUM & HEAD
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.6, location=(0, 0, 2.1))
    head = bpy.context.active_object
    head.name = "Mascot_Head_Cranium"
    head.scale = (1.0, 0.92, 0.88)
    head.data.materials.append(mat_ceramic)
    bpy.ops.object.shade_smooth()

    # Visor Glass
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.54, location=(0, -0.25, 2.1))
    visor = bpy.context.active_object
    visor.name = "Mascot_Head_Visor"
    visor.scale = (0.84, 0.52, 0.48)
    visor.data.materials.append(mat_visor)
    bpy.ops.object.shade_smooth()

    # Acid Lime Optic Sensor Bar
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.035, depth=0.48, location=(0, -0.48, 2.12))
    optic = bpy.context.active_object
    optic.name = "Mascot_Head_OpticSensor"
    optic.rotation_euler = (0, math.radians(90), 0)
    optic.data.materials.append(mat_lime)

    # Side Communications Fins
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.035, depth=0.42, location=(side * 0.62, 0, 2.35))
        fin = bpy.context.active_object
        fin.name = f"Mascot_Antenna_{'L' if side < 0 else 'R'}"
        fin.rotation_euler = (math.radians(-15), math.radians(side * 22), 0)
        fin.data.materials.append(mat_titanium)

    # 2. SEGMENTED NECK & COLLAR
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.22, depth=0.26, location=(0, 0, 1.58))
    neck = bpy.context.active_object
    neck.name = "Mascot_Neck_Collar"
    neck.data.materials.append(mat_titanium)

    # 3. CHEST & ARC REACTOR TORSO
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.1))
    chest = bpy.context.active_object
    chest.name = "Mascot_Torso_Armor"
    chest.scale = (0.78, 0.52, 0.62)
    c_bev = chest.modifiers.new("Bevel", 'BEVEL')
    c_bev.width = 0.08
    c_bev.segments = 3
    chest.data.materials.append(mat_ceramic)

    # Acid-Lime Arc Reactor Core
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.18, depth=0.14, location=(0, -0.50, 1.2))
    arc = bpy.context.active_object
    arc.name = "Mascot_ArcReactor_Core"
    arc.rotation_euler = (math.radians(90), 0, 0)
    arc.data.materials.append(mat_lime)

    # Chrome Arc Bezel Ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.20, minor_radius=0.03, major_segments=32, minor_segments=12, location=(0, -0.50, 1.2))
    bezel = bpy.context.active_object
    bezel.name = "Mascot_ArcReactor_Bezel"
    bezel.rotation_euler = (math.radians(90), 0, 0)
    bezel.data.materials.append(mat_chrome)

    # Titanium Spine Column
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.25, depth=0.38, location=(0, 0, 0.62))
    spine = bpy.context.active_object
    spine.name = "Mascot_Torso_Spine"
    spine.data.materials.append(mat_titanium)

    # 4. ARTICULATED ARMS
    for s_idx, (side, s_name) in enumerate([(-1, "L"), (1, "R")]):
        # Shoulder Ball (Chrome)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.16, location=(side * 0.70, 0, 1.28))
        sh_ball = bpy.context.active_object
        sh_ball.name = f"Mascot_ShoulderBall_{s_name}"
        sh_ball.data.materials.append(mat_chrome)
        bpy.ops.object.shade_smooth()

        # Shoulder Pauldron (Ceramic)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.23, location=(side * 0.74, 0, 1.36))
        sh_guard = bpy.context.active_object
        sh_guard.name = f"Mascot_ShoulderGuard_{s_name}"
        sh_guard.scale = (0.9, 0.88, 0.72)
        sh_guard.data.materials.append(mat_ceramic)

        # Bicep Armor Plate
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.10, depth=0.42, location=(side * 0.76, 0, 0.92))
        bicep = bpy.context.active_object
        bicep.name = f"Mascot_Bicep_{s_name}"
        bicep.rotation_euler = (math.radians(10), math.radians(side * -12), 0)
        bicep.data.materials.append(mat_ceramic)

        # Elbow Hinge
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.11, location=(side * 0.80, 0.04, 0.68))
        elbow = bpy.context.active_object
        elbow.name = f"Mascot_Elbow_{s_name}"
        elbow.data.materials.append(mat_chrome)

        # Forearm
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.11, depth=0.46, location=(side * 0.82, -0.08, 0.42))
        forearm = bpy.context.active_object
        forearm.name = f"Mascot_Forearm_{s_name}"
        forearm.rotation_euler = (math.radians(-22), math.radians(side * -6), 0)
        forearm.data.materials.append(mat_titanium)

        # Gripper Hands
        bpy.ops.mesh.primitive_cube_add(size=0.15, location=(side * 0.83, -0.22, 0.18))
        hand = bpy.context.active_object
        hand.name = f"Mascot_Hand_{s_name}"
        hand.scale = (0.9, 0.8, 1.2)
        hand.data.materials.append(mat_ceramic)

    # 5. ANTI-GRAVITY REPULSOR POD
    bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.075, major_segments=32, minor_segments=16, location=(0, 0, 0.32))
    rep_ring = bpy.context.active_object
    rep_ring.name = "Mascot_Repulsor_MagneticRing"
    rep_ring.data.materials.append(mat_ceramic)

    # Ionization Thruster Cone (Acid Lime)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.36, radius2=0.08, depth=0.32, location=(0, 0, 0.20))
    ion = bpy.context.active_object
    ion.name = "Mascot_Repulsor_IonCone"
    ion.rotation_euler = (math.radians(180), 0, 0)
    ion.data.materials.append(mat_lime)

    # 3 Stabilizer Caliper Fins (120 deg apart)
    for f_i in range(3):
        f_ang = (f_i / 3.0) * math.pi * 2.0
        fx = math.cos(f_ang) * 0.52
        fy = math.sin(f_ang) * 0.52
        bpy.ops.mesh.primitive_cube_add(size=0.09, location=(fx, fy, 0.30))
        fin_obj = bpy.context.active_object
        fin_obj.name = f"Mascot_Stabilizer_{f_i+1}"
        fin_obj.scale = (0.4, 1.2, 1.5)
        fin_obj.rotation_euler = (0, 0, f_ang)
        fin_obj.data.materials.append(mat_titanium)

    # Apply modifiers
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception:
                    pass

import mathutils

def point_camera_at(cam_obj, target_vec):
    direction = target_vec - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

def setup_mascot_lighting():
    cam_data = bpy.data.cameras.new("MascotCam")
    cam_data.lens = 55.0
    cam_obj = bpy.data.objects.new("MascotCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (2.8, -4.2, 1.6)
    point_camera_at(cam_obj, mathutils.Vector((0, 0, 1.15)))

    key = bpy.data.lights.new("Key", 'AREA')
    key.energy = 450.0
    key.size = 2.5
    key.color = (0.95, 0.98, 1.0)
    ko = bpy.data.objects.new("Key", key)
    ko.location = (3.0, -3.0, 3.5)
    point_camera_at(ko, mathutils.Vector((0, 0, 1.15)))
    bpy.context.scene.collection.objects.link(ko)

    rim = bpy.data.lights.new("Rim", 'AREA')
    rim.energy = 650.0
    rim.size = 2.0
    rim.color = (0.85, 0.92, 1.0)
    ro = bpy.data.objects.new("Rim", rim)
    ro.location = (-3.2, 3.0, 2.2)
    point_camera_at(ro, mathutils.Vector((0, 0, 1.15)))
    bpy.context.scene.collection.objects.link(ro)

    lime_kick = bpy.data.lights.new("LimeKick", 'POINT')
    lime_kick.energy = 35.0
    lime_kick.color = (0.89, 1.0, 0.0)
    lko = bpy.data.objects.new("LimeKick", lime_kick)
    lko.location = (0, -1.8, 0.4)
    bpy.context.scene.collection.objects.link(lko)

def export_mascot():
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\hero-mascot.blend"
    glb_path = r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-mascot.glb"
    preview_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-mascot-preview.png"

    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.filepath = preview_path
    scene.render.image_settings.file_format = 'PNG'
    if hasattr(scene, "cycles"):
        scene.cycles.samples = 32

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved native mascot blend: {blend_path}")
    sys.stdout.flush()

    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered mascot preview: {preview_path}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Render notice: {e}")

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
        export_yup=True
    )
    print(f"Exported Hero Mascot GLB: {glb_path}")
    if os.path.exists(glb_path):
        print(f"Mascot GLB Size: {os.path.getsize(glb_path)} bytes ({os.path.getsize(glb_path)/1024:.1f} KB)")
    sys.stdout.flush()

def main():
    print("=== EXECUTING HERO MASCOT PIPELINE ===")
    clean_scene()
    build_premium_mascot()
    setup_mascot_lighting()
    export_mascot()
    print("=== HERO MASCOT PIPELINE COMPLETE ===")

if __name__ == "__main__":
    main()
