const PresetLoader = (() => {
  let presets = [];
  let currentIndex = 0;

  function init(presetList) {
    let allPresets;
    if (presetList) {
      allPresets = presetList;
    } else {
      try {
        allPresets = butterchurnPresets.getPresets();
      } catch (e) {
        console.error('PresetLoader: butterchurnPresets.getPresets() failed:', e);
        allPresets = null;
      }
    }
    if (!allPresets) {
      presets = [];
      currentIndex = 0;
      return;
    }
    if (Array.isArray(allPresets)) {
      presets = allPresets.map(p => ({ name: p.name, data: p.json_data }));
      presets.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } else {
      const keys = Object.keys(allPresets).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );
      presets = keys.map(key => ({ name: key, data: allPresets[key] }));
    }
    currentIndex = 0;
  }

  async function loadFromApi() {
    try {
      const res = await fetch('/api/presets/');
      if (!res.ok) throw new Error('API error');
      const list = await res.json();
      init(list);
      return list;
    } catch (err) {
      console.error('Preset API failed:', err);
      return [];
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
