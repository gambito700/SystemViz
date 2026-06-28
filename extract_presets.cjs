const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'milkdrop3-web', 'backend', 'presets.json');
const presetPath = path.join(__dirname, 'milkdrop3-web', 'frontend', 'static', 'js', 'butterchurnPresets.min.js');
const code = fs.readFileSync(presetPath, 'utf-8');

const m = { exports: {} };
const wrapper = new Function('module', 'exports', code);
wrapper(m, m.exports);

const presets = m.exports.getPresets();
console.log(`Extracted ${Object.keys(presets).length} presets`);

fs.writeFileSync(outputPath, JSON.stringify(presets, null, 2), 'utf-8');
console.log(`Written to ${outputPath}`);
