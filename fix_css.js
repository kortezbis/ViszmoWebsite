
const fs = require('fs');
const path = 'c:\\Users\\Kortez\\Desktop\\DesktopSaas\\studylayer-website\\src\\index.css';

try {
    let content = fs.readFileSync(path, 'utf8');

    const startMarker = "/* ========== TRUSTED PILL STYLES ========== */";
    const startIdx = content.indexOf(startMarker);

    if (startIdx === -1) {
        console.log("Could not find start marker");
        process.exit(1);
    }

    // The end marker logic. We know the file SHOULD change.
    // We want to find the LAST occurrence of the closing brace for the last rule we added? 
    // No, we want to find the occurrence that belongs to the clean block.
    // The corrupted text is AT THE END.
    // So if we search for the END MARKER, we should find it.

    const endMarker = "box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255, 255, 255, 0.5);";
    const lastIndex = content.lastIndexOf(endMarker);

    if (lastIndex !== -1) {
        // Find the closing brace after this
        const closingBrace = content.indexOf('}', lastIndex);
        if (closingBrace !== -1) {
            const newContent = content.substring(0, closingBrace + 1);
            fs.writeFileSync(path, newContent, 'utf8');
            console.log("Successfully truncated file");
        } else {
            console.log("Could not find closing brace");
        }
    } else {
        console.log("Could not find end marker text");
    }

} catch (err) {
    console.error(err);
}
