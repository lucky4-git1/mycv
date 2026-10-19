import bpy
import math
import os
import sys

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.collections:
        col = bpy.data.collections.new("Collection")
        bpy.context.scene.collection.children.link(col)

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0, transmission=0.0):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_output = nodes.new(type="ShaderNodeOutputMaterial")
    node_output.location = (300, 0)
    
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    
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

    mat.node_tree.links.new(bsdf.outputs["BSDF"], node_output.inputs["Surface"])
    return mat

def build_presentation_scene():
    mat_graphite = create_pbr_material("Mat_DarkGraphite", (0.05, 0.05, 0.06, 1.0), metallic=0.88, roughness=0.22)
    mat_titanium = create_pbr_material("Mat_BrushedTitanium", (0.22, 0.24, 0.27, 1.0), metallic=0.95, roughness=0.15)
    mat_cyan = create_pbr_material("Mat_CyanGlow", (0.02, 0.02, 0.03, 1.0), emission_color=(0.0, 0.88, 1.0, 1.0), emission_strength=5.0)
    mat_violet = create_pbr_material("Mat_VioletGlow", (0.02, 0.02, 0.03, 1.0), emission_color=(0.65, 0.15, 1.0, 1.0), emission_strength=4.5)

    # 1. Inner Core: Geodesic Quantum Node
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.95, location=(0, 0, 1.4))
    inner_core = bpy.context.active_object
    inner_core.name = "Hero_QuantumCore"
    inner_core.data.materials.append(mat_cyan)
    bpy.ops.object.shade_smooth()

    # Wireframe lattice over inner core
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.05, location=(0, 0, 1.4))
    lattice = bpy.context.active_object
    lattice.name = "Hero_CoreLattice"
    wire_mod = lattice.modifiers.new(name="Wireframe", type='WIREFRAME')
    wire_mod.thickness = 0.025
    wire_mod.use_replace = True
    lattice.data.materials.append(mat_titanium)

    # Outer Shield Shell: Precision Chamfered Dodecahedron
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.65, location=(0, 0, 1.4))
    outer_shell = bpy.context.active_object
    outer_shell.name = "Hero_ExoskeletonShell"
    mod_dec = outer_shell.modifiers.new(name="Bevel", type='BEVEL')
    mod_dec.width = 0.08
    mod_dec.segments = 3
    mod_dec.limit_method = 'ANGLE'
    mod_wire = outer_shell.modifiers.new(name="Wireframe", type='WIREFRAME')
    mod_wire.thickness = 0.065
    mod_wire.use_replace = True
    outer_shell.data.materials.append(mat_graphite)

    # Gimbal Rings
    bpy.ops.mesh.primitive_torus_add(major_radius=2.1, minor_radius=0.05, major_segments=64, minor_segments=16, location=(0, 0, 1.4))
    ring_yaw = bpy.context.active_object
    ring_yaw.name = "Hero_Gimbal_Yaw"
    ring_yaw.rotation_euler = (math.radians(25), math.radians(15), 0)
    ring_yaw.data.materials.append(mat_titanium)

    bpy.ops.mesh.primitive_torus_add(major_radius=2.35, minor_radius=0.045, major_segments=64, minor_segments=16, location=(0, 0, 1.4))
    ring_pitch = bpy.context.active_object
    ring_pitch.name = "Hero_Gimbal_Pitch"
    ring_pitch.rotation_euler = (math.radians(-35), math.radians(45), math.radians(20))
    ring_pitch.data.materials.append(mat_graphite)

    bpy.ops.mesh.primitive_torus_add(major_radius=2.6, minor_radius=0.035, major_segments=48, minor_segments=12, location=(0, 0, 1.4))
    ring_halo = bpy.context.active_object
    ring_halo.name = "Hero_OrbitalHalo"
    ring_halo.rotation_euler = (math.radians(65), math.radians(-20), math.radians(40))
    ring_halo.data.materials.append(mat_violet)

    # Floating Satellite Shards
    for i in range(6):
        angle = (i / 6.0) * math.pi * 2.0
        dist = 2.05
        x = math.cos(angle) * dist
        y = math.sin(angle) * dist
        z = 1.4 + math.sin(angle * 3.0) * 0.35
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.08, depth=0.45, location=(x, y, z))
        shard = bpy.context.active_object
        shard.name = f"Hero_DataNode_{i+1}"
        shard.rotation_euler = (math.radians(45), math.radians(angle * 30), angle)
        if i % 2 == 0:
            shard.data.materials.append(mat_cyan)
        else:
            shard.data.materials.append(mat_titanium)

    # 2. Studio Pedestal / Shadow Catcher Floor
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=4.5, fill_type='NGON', location=(0, 0, -1.2))
    floor = bpy.context.active_object
    floor.name = "Studio_ReflectivePedestal"
    mat_floor = create_pbr_material("Mat_StudioFloor", (0.015, 0.018, 0.024, 1.0), metallic=0.9, roughness=0.15)
    floor.data.materials.append(mat_floor)

    # Apply modifiers
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except:
                    pass

def setup_studio_lighting():
    # Cinematic Widescreen Camera (75mm focal length, angled for hero section)
    cam_data = bpy.data.cameras.new("HeroCameraWidescreen")
    cam_data.lens = 65.0
    cam_obj = bpy.data.objects.new("HeroCameraWidescreen", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (4.5, -6.5, 3.2)
    cam_obj.rotation_euler = (math.radians(68), 0, math.radians(35))

    # 1. Key Light: Soft Cyan-balanced studio fill
    key_data = bpy.data.lights.new("KeyLight", 'AREA')
    key_data.energy = 600.0
    key_data.color = (0.75, 0.92, 1.0)
    key_data.size = 3.5
    ko = bpy.data.objects.new("KeyLight", key_data)
    ko.location = (4.0, -4.5, 5.0)
    ko.rotation_euler = (math.radians(45), math.radians(15), math.radians(35))
    bpy.context.scene.collection.objects.link(ko)

    # 2. Rim Light: Striking electric violet accent
    rim_data = bpy.data.lights.new("RimLight", 'AREA')
    rim_data.energy = 850.0
    rim_data.color = (0.65, 0.15, 1.0)
    rim_data.size = 2.8
    ro = bpy.data.objects.new("RimLight", rim_data)
    ro.location = (-4.5, 4.5, 3.5)
    ro.rotation_euler = (math.radians(-45), math.radians(30), math.radians(-135))
    bpy.context.scene.collection.objects.link(ro)

    # 3. Soft Ambient Fill Light
    fill_data = bpy.data.lights.new("FillLight", 'AREA')
    fill_data.energy = 150.0
    fill_data.color = (0.35, 0.45, 0.65)
    fill_data.size = 5.0
    fo = bpy.data.objects.new("FillLight", fill_data)
    fo.location = (-4.0, -3.5, 1.5)
    bpy.context.scene.collection.objects.link(fo)

    # World background
    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("PresentationWorld")
    if bpy.context.scene.world.node_tree:
        bg = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.012, 0.015, 0.02, 1.0)
            bg.inputs["Strength"].default_value = 0.4

def export_presentation_scene():
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\hero-scene.blend"
    render_wide = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-scene-widescreen.png"
    render_showcase = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-scene-showcase.png"

    scene = bpy.context.scene
    if hasattr(scene, "cycles"):
        scene.cycles.samples = 32

    # Save Native editable .blend
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved native editable scene .blend: {blend_path}")
    sys.stdout.flush()

    # 1. Render Widescreen Hero (1920x1080)
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.filepath = render_wide
    scene.render.image_settings.file_format = 'PNG'
    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered widescreen hero render: {render_wide}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Widescreen render notice: {e}")

    # 2. Render Project Showcase (1200x800)
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 800
    scene.render.filepath = render_showcase
    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered showcase render: {render_showcase}")
        sys.stdout.flush()
    except Exception as e:
        print(f"Showcase render notice: {e}")

def main():
    print("=== CREATING ASSET D: PRESENTATION SCENE ===")
    sys.stdout.flush()
    clean_scene()
    build_presentation_scene()
    setup_studio_lighting()
    export_presentation_scene()
    print("=== ASSET D COMPLETE ===")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
