import bpy
import math
import os
import sys

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.collections:
        col = bpy.data.collections.new("Collection")
        bpy.context.scene.collection.children.link(col)

def create_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_out = nodes.new(type="ShaderNodeOutputMaterial")
    node_out.location = (300, 0)
    
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    
    if emission_color:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission_color
            bsdf.inputs["Emission Strength"].default_value = emission_strength
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = emission_color
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength

    mat.node_tree.links.new(bsdf.outputs["BSDF"], node_out.inputs["Surface"])
    return mat

def build_robot_mascot():
    # Materials
    mat_armor = create_pbr_mat("Mat_MascotArmor", (0.07, 0.07, 0.08, 1.0), metallic=0.85, roughness=0.25)
    mat_joints = create_pbr_mat("Mat_MascotJoints", (0.20, 0.22, 0.25, 1.0), metallic=0.95, roughness=0.15)
    mat_cyan_glow = create_pbr_mat("Mat_MascotCyan", (0.01, 0.02, 0.03, 1.0), emission_color=(0.0, 0.9, 1.0, 1.0), emission_strength=5.0)
    mat_violet_accent = create_pbr_mat("Mat_MascotViolet", (0.01, 0.02, 0.03, 1.0), emission_color=(0.68, 0.18, 1.0, 1.0), emission_strength=4.0)
    mat_visor = create_pbr_mat("Mat_MascotVisor", (0.02, 0.02, 0.03, 1.0), metallic=0.9, roughness=0.08)

    # 1. HEAD
    # Main Cranium
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.6, location=(0, 0, 2.2))
    head = bpy.context.active_object
    head.name = "Mascot_Head_Cranium"
    head.scale = (1.0, 0.9, 0.85)
    head.data.materials.append(mat_armor)
    bpy.ops.object.shade_smooth()

    # Visor (Curved glass front)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.55, location=(0, -0.22, 2.2))
    visor = bpy.context.active_object
    visor.name = "Mascot_Head_Visor"
    visor.scale = (0.85, 0.55, 0.5)
    visor.data.materials.append(mat_visor)
    bpy.ops.object.shade_smooth()

    # Visor Eye Apertures / Neural Optic Line (Glowing cyan)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.04, depth=0.5, location=(0, -0.48, 2.22))
    eye_strip = bpy.context.active_object
    eye_strip.name = "Mascot_Visor_OpticStrip"
    eye_strip.rotation_euler = (0, math.radians(90), 0)
    eye_strip.data.materials.append(mat_cyan_glow)

    # Ear Antennas / Sensor Fins
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.04, depth=0.45, location=(side * 0.65, 0, 2.45))
        fin = bpy.context.active_object
        fin.name = f"Mascot_Antenna_{'L' if side < 0 else 'R'}"
        fin.rotation_euler = (math.radians(-15), math.radians(side * 25), 0)
        fin.data.materials.append(mat_joints)

    # 2. NECK & COLLAR
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.22, depth=0.25, location=(0, 0, 1.65))
    neck = bpy.context.active_object
    neck.name = "Mascot_Neck_Joint"
    neck.data.materials.append(mat_joints)

    # 3. CHEST & TORSO
    # Main Chest Armor Plate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.15))
    chest = bpy.context.active_object
    chest.name = "Mascot_Torso_Chest"
    chest.scale = (0.75, 0.55, 0.65)
    chest.data.materials.append(mat_armor)
    
    # Bevel on chest
    bev = chest.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.08
    bev.segments = 3

    # Arc Reactor Core in Chest (Glowing Cyan)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.18, depth=0.12, location=(0, -0.52, 1.25))
    reactor = bpy.context.active_object
    reactor.name = "Mascot_Torso_ReactorCore"
    reactor.rotation_euler = (math.radians(90), 0, 0)
    reactor.data.materials.append(mat_cyan_glow)

    # Cooling Vents on Back/Sides (Violet accent)
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=0.15, location=(side * 0.42, 0.1, 1.25))
        vent = bpy.context.active_object
        vent.name = f"Mascot_Vent_{'L' if side < 0 else 'R'}"
        vent.scale = (0.2, 1.5, 0.8)
        vent.data.materials.append(mat_violet_accent)

    # Abdomen / Spine segment
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.26, depth=0.35, location=(0, 0, 0.65))
    spine = bpy.context.active_object
    spine.name = "Mascot_Torso_Spine"
    spine.data.materials.append(mat_joints)

    # 4. ARMS & SHOULDERS
    for side, side_name in [(-1, "L"), (1, "R")]:
        # Shoulder ball
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.18, location=(side * 0.72, 0, 1.35))
        shoulder = bpy.context.active_object
        shoulder.name = f"Mascot_ShoulderBall_{side_name}"
        shoulder.data.materials.append(mat_joints)
        bpy.ops.object.shade_smooth()

        # Shoulder Pauldron / Guard
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.24, location=(side * 0.76, 0, 1.45))
        guard = bpy.context.active_object
        guard.name = f"Mascot_ShoulderGuard_{side_name}"
        guard.scale = (0.9, 0.9, 0.7)
        guard.data.materials.append(mat_armor)

        # Bicep
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.11, depth=0.45, location=(side * 0.78, 0, 0.95))
        bicep = bpy.context.active_object
        bicep.name = f"Mascot_ArmBicep_{side_name}"
        bicep.rotation_euler = (math.radians(10), math.radians(side * -12), 0)
        bicep.data.materials.append(mat_armor)

        # Elbow Joint
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.12, location=(side * 0.83, 0.05, 0.68))
        elbow = bpy.context.active_object
        elbow.name = f"Mascot_ArmElbow_{side_name}"
        elbow.data.materials.append(mat_joints)

        # Forearm
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.12, depth=0.5, location=(side * 0.84, -0.1, 0.4))
        forearm = bpy.context.active_object
        forearm.name = f"Mascot_ArmForearm_{side_name}"
        forearm.rotation_euler = (math.radians(-25), math.radians(side * -8), 0)
        forearm.data.materials.append(mat_armor)

        # Hand / Gripper
        bpy.ops.mesh.primitive_cube_add(size=0.16, location=(side * 0.84, -0.25, 0.15))
        hand = bpy.context.active_object
        hand.name = f"Mascot_Hand_{side_name}"
        hand.scale = (0.9, 0.8, 1.2)
        hand.data.materials.append(mat_joints)

    # 5. LOWER CHASSIS: ANTI-GRAVITY REPULSOR POD
    # Repulsor ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.08, major_segments=32, minor_segments=16, location=(0, 0, 0.35))
    rep_ring = bpy.context.active_object
    rep_ring.name = "Mascot_Repulsor_Ring"
    rep_ring.data.materials.append(mat_armor)

    # Repulsor Thruster Core (Ionization glow)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.38, radius2=0.08, depth=0.35, location=(0, 0, 0.22))
    thruster = bpy.context.active_object
    thruster.name = "Mascot_Repulsor_IonThruster"
    thruster.rotation_euler = (math.radians(180), 0, 0)
    thruster.data.materials.append(mat_cyan_glow)

    # Outer Magnetic Stabilizer Fins (3 fins at 120 degrees)
    for i in range(3):
        angle = (i / 3.0) * math.pi * 2.0
        x = math.cos(angle) * 0.55
        y = math.sin(angle) * 0.55
        bpy.ops.mesh.primitive_cube_add(size=0.1, location=(x, y, 0.32))
        fin = bpy.context.active_object
        fin.name = f"Mascot_StabilizerFin_{i+1}"
        fin.scale = (0.4, 1.2, 1.5)
        fin.rotation_euler = (0, 0, angle)
        fin.data.materials.append(mat_joints)

    # Apply modifiers to ensure clean GLB export geometry
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    pass

def setup_studio_lighting():
    cam_data = bpy.data.cameras.new("MascotCamera")
    cam_data.lens = 60.0
    cam_obj = bpy.data.objects.new("MascotCamera", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (2.8, -3.8, 1.6)
    cam_obj.rotation_euler = (math.radians(78), 0, math.radians(36))

    # Key
    key = bpy.data.lights.new("Key", 'AREA')
    key.energy = 380.0
    key.color = (0.85, 0.95, 1.0)
    key.size = 2.0
    ko = bpy.data.objects.new("Key", key)
    ko.location = (2.5, -2.5, 3.2)
    bpy.context.scene.collection.objects.link(ko)

    # Rim (Violet)
    rim = bpy.data.lights.new("Rim", 'AREA')
    rim.energy = 500.0
    rim.color = (0.7, 0.2, 1.0)
    rim.size = 1.8
    ro = bpy.data.objects.new("Rim", rim)
    ro.location = (-2.8, 2.5, 2.0)
    bpy.context.scene.collection.objects.link(ro)

    # Fill
    fill = bpy.data.lights.new("Fill", 'AREA')
    fill.energy = 100.0
    fill.color = (0.4, 0.5, 0.7)
    fill.size = 3.0
    fo = bpy.data.objects.new("Fill", fill)
    fo.location = (-2.0, -2.0, 1.0)
    bpy.context.scene.collection.objects.link(fo)

    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("MascotWorld")
    if bpy.context.scene.world.node_tree:
        bg = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.015, 0.018, 0.024, 1.0)
            bg.inputs["Strength"].default_value = 0.5

def export_all():
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\mascot.blend"
    glb_path = r"d:\mycv-new-fullstack\portfolio-3d\public\models\mascot.glb"
    render_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\mascot-preview.png"

    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.filepath = render_path
    scene.render.image_settings.file_format = 'PNG'
    if hasattr(scene, "cycles"):
        scene.cycles.samples = 32
    if hasattr(scene, "eevee"):
        try:
            scene.eevee.taa_render_samples = 32
        except:
            pass

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved native .blend: {blend_path}")
    sys.stdout.flush()

    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered preview image: {render_path}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Render notice: {e}")

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
    print(f"Exported Mascot GLB: {glb_path}")
    print(f"Mascot Metrics: Meshes: {mesh_count}, Vertices: {verts}, Polygons: {tris}")
    if os.path.exists(glb_path):
        print(f"Mascot GLB Size: {os.path.getsize(glb_path)} bytes")
    sys.stdout.flush()

def main():
    print("=== CREATING ASSET B: ORIGINAL ROBOT MASCOT ===")
    sys.stdout.flush()
    clean_scene()
    build_robot_mascot()
    setup_studio_lighting()
    export_all()
    print("=== ASSET B COMPLETE ===")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
