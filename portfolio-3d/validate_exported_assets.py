import os
import sys
import json
import struct

def validate_glb_header(filepath):
    if not os.path.exists(filepath):
        return False, f"File does not exist: {filepath}"
    size = os.path.getsize(filepath)
    if size < 20:
        return False, f"File too small ({size} bytes): {filepath}"
    
    with open(filepath, "rb") as f:
        header = f.read(12)
        magic, version, length = struct.unpack("<4sII", header)
        if magic != b"glTF":
            return False, f"Invalid magic header {magic}, expected b'glTF'"
        if version != 2:
            return False, f"Unsupported glTF version {version}, expected 2"
        if length != size:
            return False, f"Length header {length} differs from file size {size}"
            
    return True, f"Valid GLB v2 binary, size: {size} bytes ({size / 1024:.1f} KB)"

def main():
    print("=== RUNNING GLB INTEGRITY VALIDATION ===")
    models = {
        "Hero Sculpture (Signature Upgrade)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-sculpture.glb",
        "Hero Mascot (Premium Autonomous)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero-mascot.glb",
        "Neural Artifact (Kiln 1.3 Procedural)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\neural-artifact.glb",
        "Hero Core (Base)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\hero.glb",
        "Robot Mascot (Base)": r"d:\mycv-new-fullstack\portfolio-3d\public\models\mascot.glb",
        "Interactive Tech Elements": r"d:\mycv-new-fullstack\portfolio-3d\public\models\tech-elements.glb",
    }
    
    all_valid = True
    for name, path in models.items():
        valid, msg = validate_glb_header(path)
        print(f"[{'PASS' if valid else 'FAIL'}] {name}: {msg}")
        if not valid:
            all_valid = False
            
    if not all_valid:
        print("\nOne or more GLB files failed binary header validation!")
        sys.exit(1)
        
    print("\nALL GLB binary headers are structurally sound.")

if __name__ == "__main__":
    main()
