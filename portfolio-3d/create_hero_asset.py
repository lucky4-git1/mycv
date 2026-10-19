import bpy
import bmesh
import math
import os

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Ensure a collection exists
    if not bpy.data.collections:
        col = bpy.data.collections.new("Collection")
        bpy.context.scene.collection.children.link(col)

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, emission_color=None, emission_strength=0.0, transmission=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    node_output = nodes.new(type="ShaderNodeOutputMaterial")
    node_output.location = (300, 0)
    
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    
    # Inputs on Principled BSDF
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

def build_hero_core():
    # Materials
    mat_graphite = create_pbr_material("Mat_DarkGraphite", (0.05, 0.05, 0.06, 1.0), metallic=0.88, roughness=0.22)
    mat_titanium = create_pbr_material("Mat_BrushedTitanium", (0.22, 0.24, 0.27, 1.0), metallic=0.95, roughness=0.15)
    mat_cyan = create_pbr_material("Mat_CyanGlow", (0.02, 0.02, 0.03, 1.0), emission_color=(0.0, 0.88, 1.0, 1.0), emission_strength=5.0)
    mat_violet = create_pbr_material("Mat_VioletGlow", (0.02, 0.02, 0.03, 1.0), emission_color=(0.65, 0.15, 1.0, 1.0), emission_strength=4.5)
    mat_glass = create_pbr_material("Mat_ObsidianGlass", (0.03, 0.04, 0.06, 1.0), metallic=0.1, roughness=0.08, transmission=0.85)

    root_coll = bpy.context.scene.collection

    # 1. Inner Core: Geodesic Quantum Node
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.95, location=(0, 0, 0))
    inner_core = bpy.context.active_object
    inner_core.name = "Hero_QuantumCore"
    inner_core.data.materials.append(mat_cyan)
    bpy.ops.object.shade_smooth()

    # Wireframe lattice over inner core
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.05, location=(0, 0, 0))
    lattice = bpy.context.active_object
    lattice.name = "Hero_CoreLattice"
    wire_mod = lattice.modifiers.new(name="Wireframe", type='WIREFRAME')
    wire_mod.thickness = 0.025
    wire_mod.use_replace = True
    lattice.data.materials.append(mat_titanium)

    # 2. Outer Shield Shell: Precision Chamfered Dodecahedron
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.65, location=(0, 0, 0))
    outer_shell = bpy.context.active_object
    outer_shell.name = "Hero_ExoskeletonShell"
    
    # Add wireframe / dual mesh cutout effect
    mod_dec = outer_shell.modifiers.new(name="Bevel", type='BEVEL')
    mod_dec.width = 0.08
    mod_dec.segments = 3
    mod_dec.limit_method = 'ANGLE'
    
    mod_wire = outer_shell.modifiers.new(name="Wireframe", type='WIREFRAME')
    mod_wire.thickness = 0.065
    mod_wire.use_replace = True
    outer_shell.data.materials.append(mat_graphite)

    # 3. Precision Gimbal Rings
    # Ring 1 (Yaw ring)
    bpy.ops.mesh.primitive_torus_add(major_radius=2.1, minor_radius=0.05, major_segments=64, minor_segments=16)
    ring_yaw = bpy.context.active_object
    ring_yaw.name = "Hero_Gimbal_Yaw"
    ring_yaw.rotation_euler = (math.radians(25), math.radians(15), 0)
    ring_yaw.data.materials.append(mat_titanium)

    # Ring 2 (Pitch ring)
    bpy.ops.mesh.primitive_torus_add(major_radius=2.35, minor_radius=0.045, major_segments=64, minor_segments=16)
    ring_pitch = bpy.context.active_object
    ring_pitch.name = "Hero_Gimbal_Pitch"
    ring_pitch.rotation_euler = (math.radians(-35), math.radians(45), math.radians(20))
    ring_pitch.data.materials.append(mat_graphite)

    # Ring 3 (Outer orbital halo with subtle segmented notches)
    bpy.ops.mesh.primitive_torus_add(major_radius=2.6, minor_radius=0.035, major_segments=48, minor_segments=12)
    ring_halo = bpy.context.active_object
    ring_halo.name = "Hero_OrbitalHalo"
    ring_halo.rotation_euler = (math.radians(65), math.radians(-20), math.radians(40))
    ring_halo.data.materials.append(mat_violet)

    # 4. Orbiting Data Shards / Satellite Prisms
    for i in range(6):
        angle = (i / 6.0) * math.pi * 2.0
        dist = 2.05
        x = math.cos(angle) * dist
        y = math.sin(angle) * dist
        z = math.sin(angle * 3.0) * 0.35
        
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.08, depth=0.45, location=(x, y, z))
        shard = bpy.context.active_object
        shard.name = f"Hero_DataNode_{i+1}"
        shard.rotation_euler = (math.radians(45), math.radians(angle * 30), angle)
        if i % 2 == 0:
            shard.data.materials.append(mat_cyan)
        else:
            shard.data.materials.append(mat_titanium)

    # Apply modifiers to ensure clean GLB export geometry
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    print(f"Could not apply modifier {mod.name} on {obj.name}: {e}")

def setup_studio_lighting_and_camera(is_widescreen=False):
    # Camera
    cam_data = bpy.data.cameras.new("StudioCamera")
    cam_data.lens = 70.0  # 70mm portrait/editorial
    cam_obj = bpy.data.objects.new("StudioCamera", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    if is_widescreen:
        cam_obj.location = (4.8, -5.2, 2.8)
        cam_obj.rotation_euler = (math.radians(68), 0, math.radians(42))
    else:
        cam_obj.location = (4.2, -4.6, 2.5)
        cam_obj.rotation_euler = (math.radians(70), 0, math.radians(42))

    # Lights
    # 1. Key Light (Soft Cyan/White)
    key_light_data = bpy.data.lights.new(name="KeyLight", type='AREA')
    key_light_data.energy = 450.0
    key_light_data.color = (0.75, 0.92, 1.0)
    key_light_data.size = 2.5
    key_obj = bpy.data.objects.new("KeyLight", key_light_data)
    key_obj.location = (3.5, -4.0, 4.5)
    key_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(40))
    bpy.context.scene.collection.objects.link(key_obj)

    # 2. Rim Light (Vivid Violet accent)
    rim_light_data = bpy.data.lights.new(name="RimLight", type='AREA')
    rim_light_data.energy = 550.0
    rim_light_data.color = (0.7, 0.2, 1.0)
    rim_light_data.size = 2.0
    rim_obj = bpy.data.objects.new("RimLight", rim_light_data)
    rim_obj.location = (-4.0, 4.0, 2.5)
    rim_obj.rotation_euler = (math.radians(-45), math.radians(30), math.radians(-140))
    bpy.context.scene.collection.objects.link(rim_obj)

    # 3. Fill Light (Subtle dark blue ambient)
    fill_light_data = bpy.data.lights.new(name="FillLight", type='AREA')
    fill_light_data.energy = 120.0
    fill_light_data.color = (0.35, 0.45, 0.65)
    fill_light_data.size = 4.0
    fill_obj = bpy.data.objects.new("FillLight", fill_light_data)
    fill_obj.location = (-3.5, -3.0, 1.0)
    bpy.context.scene.collection.objects.link(fill_obj)

    # World background: Deep neutral dark
    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("StudioWorld")
    if bpy.context.scene.world.node_tree:
        bg_node = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg_node:
            bg_node.inputs["Color"].default_value = (0.015, 0.018, 0.024, 1.0)
            bg_node.inputs["Strength"].default_value = 0.5

def render_and_export(blend_path, glb_path, render_path, resolution=(1920, 1080)):
    scene = bpy.context.scene
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.resolution_percentage = 100
    scene.render.filepath = render_path
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    # Save Native .blend
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved native .blend file: {blend_path}")

    # Render Preview PNG
    os.makedirs(os.path.dirname(render_path), exist_ok=True)
    try:
        bpy.ops.render.render(write_still=True)
        print(f"Rendered preview image: {render_path}")
    except Exception as e:
        print(f"Render notice: {e}")

    # Export Web-Ready GLB
    os.makedirs(os.path.dirname(glb_path), exist_ok=True)
    # Select all meshes
    bpy.ops.object.select_all(action='DESELECT')
    mesh_count = 0
    total_verts = 0
    total_tris = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            mesh_count += 1
            total_verts += len(obj.data.vertices)
            total_tris += len(obj.data.polygons)

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
        export_yup=True
    )
    print(f"Exported GLB: {glb_path}")
    print(f"Metrics: Meshes: {mesh_count}, Vertices: {total_verts}, Polygons: {total_tris}")
    if os.path.exists(glb_path):
        print(f"GLB File Size: {os.path.getsize(glb_path)} bytes")

def main():
    print("=== CREATING ASSET A: SIGNATURE HERO CORE ===")
    clean_scene()
    build_hero_core()
    setup_studio_lighting_and_camera(is_widescreen=False)
    
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\hero-asset.blend"
    glb_path = r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero.glb"
    render_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\hero-preview.png"
    
    render_and_export(blend_path, glb_path, render_path, resolution=(1200, 1200))
    print("=== ASSET A COMPLETE ===")

if __name__ == "__main__":
    main()
