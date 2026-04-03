
import os

file_path = r'c:\Users\Kortez\Desktop\DesktopSaas\studylayer-website\src\index.css'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Marker for the start of the clean added content
start_marker = "/* ========== TRUSTED PILL STYLES ========== */"
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Could not find start marker")
    exit(1)

# Marker for the end of the clean added content
# The last rule I added was .trusted-pill::after
end_marker_str = "box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255, 255, 255, 0.5);\n}"
end_idx = content.find(end_marker_str)

if end_idx == -1:
    print("Could not find end marker", end_marker_str)
    # Trying without newline just in case
    end_marker_str = "box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255, 255, 255, 0.5); }"
    end_idx = content.find(end_marker_str)
    
if end_idx != -1:
    # We want to keep up to the end of the marker
    cutoff = end_idx + len(end_marker_str)
    new_content = content[:cutoff]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully truncated file")
else:
    print("Could not find end marker to truncate")
