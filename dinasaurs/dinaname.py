#!/usr/bin/env python3
import os
import glob
from pathlib import Path

def generate_image_gallery():
    # Get all image files in the current directory
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.webp', '*.svg']
    image_files = []
    
    for extension in image_extensions:
        image_files.extend(glob.glob(extension, recursive=False))
        image_files.extend(glob.glob(extension.upper(), recursive=False))
    
    # Sort files alphabetically
    image_files.sort()
    
    # Generate HTML content
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Gallery</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
            font-size: 1.5rem;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2rem;
        }}
        
        .image-links {{
            margin-bottom: 30px;
            text-align: center;
        }}
        
        details {{
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }}
        
        summary {{
            cursor: pointer;
            font-weight: bold;
            color: #555;
            font-size: 1.2rem;
            margin-bottom: 10px;
        }}
        
        .links-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }}
        
        .links-grid a {{
            display: block;
            padding: 8px 12px;
            background: #f8f9fa;
            color: #333;
            text-decoration: none;
            border-radius: 4px;
            border: 1px solid #e9ecef;
            font-size: 0.9rem;
        }}
        
        .links-grid a:hover {{
            background: #e9ecef;
        }}
        
        .gallery {{
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
        }}
        
        .image-card {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            flex: 1 1 300px;
            max-width: 400px;
            min-width: 280px;
        }}
        
        .image-container {{
            width: 100%;
            height: 250px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
        }}
        
        .image-container img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}
        
        .caption {{
            padding: 15px 20px;
            text-align: center;
            font-weight: 600;
            color: #333;
            font-size: 1.5rem;
            background: white;
        }}
        
        .no-images {{
            text-align: center;
            color: #666;
            font-size: 1.5rem;
            margin-top: 50px;
        }}
        
        /* Mobile-first responsive design */
        @media (max-width: 480px) {{
            body {{
                padding: 15px;
                font-size: 1.2rem;
            }}
            
            h1 {{
                font-size: 1.5rem;
                margin-bottom: 20px;
            }}
            
            .gallery {{
                gap: 15px;
            }}
            
            .image-card {{
                flex: 1 1 100%;
                min-width: unset;
            }}
            
            .image-container {{
                height: 200px;
            }}
            
            .caption {{
                padding: 12px 15px;
                font-size: 1.2rem;
            }}
            
            .links-grid {{
                grid-template-columns: 1fr;
            }}
        }}
        
        @media (min-width: 481px) and (max-width: 768px) {{
            .image-card {{
                flex: 1 1 calc(50% - 10px);
                min-width: 250px;
            }}
            
            .links-grid {{
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            }}
        }}
        
        @media (min-width: 769px) {{
            .image-card {{
                flex: 1 1 calc(33.333% - 14px);
            }}
        }}
        
        @media (min-width: 1200px) {{
            .image-card {{
                flex: 1 1 calc(25% - 15px);
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>People</h1>"""

    # Add image links section if there are images
    if image_files:
        html_content += f"""
        <div class="image-links">
            <details>
                <summary>Names! ({len(image_files)})</summary>
                <div class="links-grid">
"""
        for i, image_file in enumerate(image_files):
            filename = Path(image_file).stem
            html_content += f"""                    <a href="#image-{i}">{filename}</a>
"""
        
        html_content += """                </div>
            </details>
        </div>"""

    html_content += """
        <div class="gallery">
"""

    if image_files:
        for i, image_file in enumerate(image_files):
            # Get filename without extension for caption
            filename = Path(image_file).stem
            
            html_content += f"""            <div class="image-card" id="image-{i}">
                <div class="image-container">
                    <img src="{image_file}" alt="{filename}" loading="lazy">
                </div>
                <div class="caption">{filename}</div>
            </div>
"""
    else:
        html_content += """            <div class="no-images">
                <p>No images found in this directory.</p>
                <p>Add some .jpg, .png, .gif, or other image files to see them here!</p>
            </div>
"""

    html_content += """        </div>
    </div>
</body>
</html>"""

    # Write HTML file
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Gallery generated successfully!")
    print(f"Found {len(image_files)} images")
    print(f"Website saved as: index.html")
    if image_files:
        print(f"Images included: {', '.join(image_files)}")

if __name__ == "__main__":
    generate_image_gallery()