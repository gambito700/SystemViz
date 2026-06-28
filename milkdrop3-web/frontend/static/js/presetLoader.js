const PresetLoader = (() => {
  let presets = [];
  let currentIndex = 0;

  function init(presetList) {
    let allPresets;
    if (presetList) {
      allPresets = presetList;
    } else {
      allPresets = butterchurnPresets.getPresets();
    }
    const keys = Object.keys(allPresets).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    presets = keys.map(key => ({ name: key, data: allPresets[key] }));
    currentIndex = 0;
  }

  async function loadFromApi() {
    try {
      const res = await fetch('/api/presets/');
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (err) {
      console.error('Preset API failed, falling back to butterchurnPresets:', err);
      return butterchurnPresets.getPresets();
    }
  }

  function current() {
    return presets[currentIndex] || null;
  }

  function next() {
    if (presets.length === 0) return null;
    currentIndex = (currentIndex + 1) % presets.length;
    return current();
  }

  function prev() {
    if (presets.length === 0) return null;
    currentIndex = (currentIndex - 1 + presets.length) % presets.length;
    return current();
  }

  function random() {
    if (presets.length === 0) return null;
    currentIndex = Math.floor(Math.random() * presets.length);
    return current();
  }

  function getByName(name) {
    const idx = presets.findIndex(p => p.name === name);
    if (idx !== -1) {
      currentIndex = idx;
      return presets[idx];
    }
    return null;
  }

  function getAll() {
    return presets.map(p => ({ name: p.name }));
  }

  function count() {
    return presets.length;
  }

  return { init, loadFromApi, current, next, prev, random, getByName, getAll, count };
})();
