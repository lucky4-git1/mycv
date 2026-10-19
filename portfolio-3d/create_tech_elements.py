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

def build_tech_elements():
    mat_graphite = create_pbr_mat("Mat_TechDark", (0.06, 0.06, 0.07, 1.0), metallic=0.9, roughness=0.2)
    mat_titanium = create_pbr_mat("Mat_TechSilver", (0.25, 0.26, 0.28, 1.0), metallic=0.96, roughness=0.12)
    mat_cyan = create_pbr_mat("Mat_TechCyan", (0.01, 0.02, 0.03, 1.0), emission_color=(0.0, 0.88, 1.0, 1.0), emission_strength=4.8)
    mat_violet = create_pbr_mat("Mat_TechViolet", (0.01, 0.02, 0.03, 1.0), emission_color=(0.65, 0.15, 1.0, 1.0), emission_strength=4.2)

    # ELEMENT 1: Hexagonal Data Prism Core (Left: x = -2.2, y = 0, z = 0)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.75, depth=1.2, location=(-2.2, 0, 0))
    hex_core = bpy.context.active_object
    hex_core.name = "Tech_HexDataNode_Body"
    hex_core.data.materials.append(mat_graphite)
    
    # Bevel on hex
    bev = hex_core.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.06
    bev.segments = 2

    # Glowing Circuit Inset
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.6, depth=1.25, location=(-2.2, 0, 0))
    hex_glow = bpy.context.active_object
    hex_glow.name = "Tech_HexDataNode_Circuits"
    wire = hex_glow.modifiers.new("Wireframe", 'WIREFRAME')
    wire.thickness = 0.02
    wire.use_replace = True
    hex_glow.data.materials.append(mat_cyan)

    # Orbiting micro data pins
    for i in range(3):
        ang = (i / 3.0) * math.pi * 2.0
        x = -2.2 + math.cos(ang) * 1.05
        y = math.sin(ang) * 1.05
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.06, depth=0.35, location=(x, y, 0))
        pin = bpy.context.active_object
        pin.name = f"Tech_HexPin_{i+1}"
        pin.data.materials.append(mat_titanium)

    # ELEMENT 2: Cryptographic Polyhedron Lattice (Center: x = 0, y = 0, z = 0)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.9, location=(0, 0, 0))
    crypto_inner = bpy.context.active_object
    crypto_inner.name = "Tech_CryptoKernel"
    crypto_inner.data.materials.append(mat_violet)

    # Outer faceted titanium cage
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.1, location=(0, 0, 0))
    crypto_cage = bpy.context.active_object
    crypto_cage.name = "Tech_CryptoCage"
    wire_mod = crypto_cage.modifiers.new("Wireframe", 'WIREFRAME')
    wire_mod.thickness = 0.04
    wire_mod.use_replace = True
    crypto_cage.data.materials.append(mat_titanium)

    # Floating corner nodes
    for i in range(4):
        ang = (i / 4.0) * math.pi * 2.0 + (math.pi / 4.0)
        x = math.cos(ang) * 1.35
        y = math.sin(ang) * 1.35
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.09, location=(x, y, 0.4 * (1 if i % 2 == 0 else -1)))
        node = bpy.context.active_object
        node.name = f"Tech_CryptoNode_{i+1}"
        node.data.materials.append(mat_cyan)

    # ELEMENT 3: Quantum Gyroscopic Token (Right: x = 2.2, y = 0, z = 0)
    # Inner glowing data pearl
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.45, location=(2.2, 0, 0))
    gyro_core = bpy.context.active_object
    gyro_core.name = "Tech_GyroCore"
    gyro_core.data.materials.append(mat_cyan)

    # Gimbal Ring 1
    bpy.ops.mesh.primitive_torus_add(major_radius=0.75, minor_radius=0.04, major_segments=48, minor_segments=12, location=(2.2, 0, 0))
    r1 = bpy.context.active_object
    r1.name = "Tech_GyroRing_Inner"
    r1.rotation_euler = (math.radians(30), math.radians(15), 0)
    r1.data.materials.append(mat_titanium)

    # Gimbal Ring 2
    bpy.ops.mesh.primitive_torus_add(major_radius=0.98, minor_radius=0.045, major_segments=48, minor_segments=12, location=(2.2, 0, 0))
    r2 = bpy.context.active_object
    r2.name = "Tech_GyroRing_Outer"
    r2.rotation_euler = (math.radians(-40), math.radians(45), math.radians(20))
    r2.data.materials.append(mat_graphite)

    # Micro sensor tabs on outer ring
    for i in range(4):
        ang = (i / 4.0) * math.pi * 2.0
        x = 2.2 + math.cos(ang) * 1.15
        y = math.sin(ang) * 1.15
        bpy.ops.mesh.primitive_cube_add(size=0.08, location=(x, y, 0))
        tab = bpy.context.active_object
        tab.name = f"Tech_GyroTab_{i+1}"
        tab.data.materials.append(mat_violet)

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
    cam_data = bpy.data.cameras.new("TechCamera")
    cam_data.lens = 55.0
    cam_obj = bpy.data.objects.new("TechCamera", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (0.0, -5.2, 2.2)
    cam_obj.rotation_euler = (math.radians(72), 0, 0)

    # Key light
    key = bpy.data.lights.new("Key", 'AREA')
    key.energy = 420.0
    key.color = (0.85, 0.95, 1.0)
    key.size = 3.5
    ko = bpy.data.objects.new("Key", key)
    ko.location = (2.0, -3.5, 3.5)
    bpy.context.scene.collection.objects.link(ko)

    # Rim light
    rim = bpy.data.lights.new("Rim", 'AREA')
    rim.energy = 480.0
    rim.color = (0.7, 0.2, 1.0)
    rim.size = 3.0
    ro = bpy.data.objects.new("Rim", rim)
    ro.location = (-2.5, 3.5, 2.5)
    bpy.context.scene.collection.objects.link(ro)

    # Fill
    fill = bpy.data.lights.new("Fill", 'AREA')
    fill.energy = 100.0
    fill.color = (0.4, 0.5, 0.7)
    fill.size = 4.0
    fo = bpy.data.objects.new("Fill", fill)
    fo.location = (-3.0, -2.5, 1.0)
    bpy.context.scene.collection.objects.link(fo)

    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("TechWorld")
    if bpy.context.scene.world.node_tree:
        bg = bpy.context.scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.015, 0.018, 0.024, 1.0)
            bg.inputs["Strength"].default_value = 0.5

def export_all():
    blend_path = r"d:\mycv-new-fullstack\portfolio-3d\blender\tech-elements.blend"
    glb_path = r"d:\mycv-new-fullstack\portfolio-3d\public\models\tech-elements.glb"
    render_path = r"d:\mycv-new-fullstack\portfolio-3d\renders\tech-elements-preview.png"

    scene = bpy.context.scene
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.filepath = render_path
    scene.render.image_settings.file_format = 'PNG'
    if hasattr(scene, "cycles"):
        scene.cycles.samples = 32

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
    print(f"Exported Tech Elements GLB: {glb_path}")
    print(f"Metrics: Meshes: {mesh_count}, Vertices: {verts}, Polygons: {tris}")
    if os.path.exists(glb_path):
        print(f"GLB Size: {os.path.getsize(glb_path)} bytes")
    sys.stdout.flush()

def main():
    print("=== CREATING ASSET C: INTERACTIVE TECH ELEMENTS ===")
    sys.stdout.flush()
    clean_scene()
    build_tech_elements()
    setup_studio_lighting()
    export_all()
    print("=== ASSET C COMPLETE ===")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
