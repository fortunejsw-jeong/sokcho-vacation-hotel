from PIL import Image
import os

def create_favicon():
    try:
        source_path = r"c:\Users\fortu\OneDrive\바탕 화면\antigravity\sokcho-vacation-hotel\images\logo.png"
        dest_path = r"c:\Users\fortu\OneDrive\바탕 화면\antigravity\sokcho-vacation-hotel\images\favicon.png"
        
        if not os.path.exists(source_path):
            print(f"Error: {source_path} not found.")
            return

        with Image.open(source_path) as img:
            # Resize to standard favicon size
            favicon = img.resize((32, 32), Image.Resampling.LANCZOS)
            favicon.save(dest_path, "PNG")
            print(f"Successfully created favicon at {dest_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    create_favicon()
