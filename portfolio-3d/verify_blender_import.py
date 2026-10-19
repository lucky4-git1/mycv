import bpy
import os
import sys

def test_import_glb(name, glb_path):
    print(f"\n--- Testing Import: {name} ---")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.collections:
        col = bpy.data.collections.new("TestCol")
        bpy.context.scene.collection.children.link(col)
        
    res = bpy.ops.import_scene.gltf(filepath=glb_path)
    if 'FINISHED' not in res:
        print(f"FAILED to import {glb_path}: {res}")
        return False
        
    imported_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    total_verts = sum(len(o.data.vertices) for o in imported_objects)
    total_polys = sum(len(o.data.polygons) for o in imported_objects)
    materials = list(set(mat.name for o in imported_objects for mat in o.data.materials if mat))
    
    print(f"PASS: Imported {len(imported_objects)} meshes, {total_verts} vertices, {total_polys} polygons")
    print(f"Materials ({len(materials)}): {materials}")
    return True

def main():
    print("=== BLENDER CLEAN-SCENE RE-IMPORT VALIDATION ===")
    models = {
        "Hero Sculpture (Signature Upgrade)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-sculpture.glb",
        "Hero Mascot (Premium Autonomous)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-mascot.glb",
        "Hero Core (Base)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero.glb",
        "Robot Mascot (Base)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\mascot.glb",
        "Interactive Tech Elements": r"d:\mycv-new-fullstack\portfolio-3d\public\models\tech-elements.glb",
    }
    
    success = True
    for name, path in models.items():
        if not test_import_glb(name, path):
            success = False
            
    if success:
        print("\nALL ASSETS SUCCESSFULLY VALIDATED IN BLENDER RE-IMPORT TEST!")
    else:
        print("\nVALIDATION FAILED ON ONE OR MORE ASSETS!")
        sys.exit(1)

if __name__ == "__main__":
    main()
