const PresetSettings = (() => {
  console.log('[PresetSettings] v3 loaded - shallow copy');
  let settingsVisible = false;
  let onChange = null;
  let settingsModified = false;
  let originalPresetVals = null;

  const sliders = [
    { id: 's-gamma', key: 'gammaadj', min: 0.5, max: 3, step: 0.01, def: 1.42, section: 'color' },
    { id: 's-wave-r', key: 'wave_r', min: 0, max: 1, step: 0.01, def: 1, section: 'color' },
    { id: 's-wave-g', key: 'wave_g', min: 0, max: 1, step: 0.01, def: 0.99, section: 'color' },
    { id: 's-wave-b', key: 'wave_b', min: 0, max: 1, step: 0.01, def: 0.65, section: 'color' },
    { id: 's-mv-r', key: 'mv_r', min: 0, max: 1, step: 0.01, def: 0.75, section: 'color' },
    { id: 's-mv-g', key: 'mv_g', min: 0, max: 1, step: 0.01, def: 1, section: 'color' },
    { id: 's-mv-b', key: 'mv_b', min: 0, max: 1, step: 0.01, def: 0.35, section: 'color' },
    { id: 's-decay', key: 'decay', min: 0.5, max: 1.5, step: 0.01, def: 0.96, section: 'speed' },
    { id: 's-zoom', key: 'zoom', min: 0.5, max: 2, step: 0.01, def: 1, section: 'speed' },
    { id: 's-zoomexp', key: 'zoomexp', min: 0.5, max: 2, step: 0.01, def: 1, section: 'speed' },
    { id: 's-warp-speed', key: 'warpanimspeed', min: 0.1, max: 5, step: 0.01, def: 1, section: 'speed' },
    { id: 's-warp-scale', key: 'warpscale', min: 0.1, max: 6, step: 0.01, def: 1, section: 'speed' },
    { id: 's-warp', key: 'warp', min: 0, max: 1, step: 0.01, def: 0.01, section: 'speed' },
    { id: 's-echo-zoom', key: 'echo_zoom', min: 0.5, max: 1.5, step: 0.001, def: 0.9998, section: 'speed' },
    { id: 's-echo-alpha', key: 'echo_alpha', min: 0, max: 1, step: 0.01, def: 0.5, section: 'speed' },
    { id: 's-wave-mode', key: 'wave_mode', min: 0, max: 7, step: 1, def: 5, section: 'wave' },
    { id: 's-wave-a', key: 'wave_a', min: 0, max: 2, step: 0.01, def: 0.5, section: 'wave' },
    { id: 's-wave-scale', key: 'wave_scale', min: 0, max: 2, step: 0.01, def: 0.5, section: 'wave' },
    { id: 's-wave-smooth', key: 'wave_smoothing', min: 0, max: 1, step: 0.01, def: 0.5, section: 'wave' },
    { id: 's-moda-start', key: 'modwavealphastart', min: 0, max: 2, step: 0.01, def: 0.5, section: 'wave' },
    { id: 's-moda-end', key: 'modwavealphaend', min: 0, max: 2, step: 0.01, def: 1, section: 'wave' },
    { id: 's-ob-size', key: 'ob_size', min: 0, max: 0.5, step: 0.01, def: 0.05, section: 'border' },
    { id: 's-ob-a', key: 'ob_a', min: 0, max: 1, step: 0.01, def: 0.5, section: 'border' },
    { id: 's-ob-r', key: 'ob_r', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-ob-g', key: 'ob_g', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-ob-b', key: 'ob_b', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-ib-size', key: 'ib_size', min: 0, max: 0.5, step: 0.01, def: 0.05, section: 'border' },
    { id: 's-ib-a', key: 'ib_a', min: 0, max: 1, step: 0.01, def: 0.1, section: 'border' },
    { id: 's-ib-r', key: 'ib_r', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-ib-g', key: 'ib_g', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-ib-b', key: 'ib_b', min: 0, max: 1, step: 0.01, def: 0, section: 'border' },
    { id: 's-mv-x', key: 'mv_x', min: 0, max: 12, step: 0.1, def: 6.4, section: 'motion' },
    { id: 's-mv-y', key: 'mv_y', min: 0, max: 12, step: 0.1, def: 4.8, section: 'motion' },
    { id: 's-mv-l', key: 'mv_l', min: 0, max: 12, step: 0.1, def: 5, section: 'motion' },
    { id: 's-mv-a', key: 'mv_a', min: 0, max: 1, step: 0.01, def: 0, section: 'motion' },
  ];

  const toggles = [
    { id: 's-brighten', key: 'wave_brighten' },
    { id: 's-darken', key: 'darken' },
    { id: 's-solarize', key: 'solarize' },
    { id: 's-invert', key: 'invert' },
    { id: 's-maxwave', key: 'maximize_wave_color' },
    { id: 's-wave-thick', key: 'wave_thick' },
    { id: 's-wave-dots', key: 'wave_dots' },
    { id: 's-additive', key: 'additive_waves' },
    { id: 's-texwrap', key: 'tex_wrap' },
    { id: 's-darkcenter', key: 'darken_center' },
    { id: 's-redblue', key: 'redblue_stereo' },
  ];

  function init(callback) {
    onChange = callback;

    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      const display = document.getElementById('sv-' + s.id.slice(2));
      if (!el || !display) return;
      el.addEventListener('input', () => {
        display.textContent = parseFloat(el.value).toFixed(el.step < 1 ? (s.step < 0.01 ? 4 : 2) : 0);
        settingsModified = true;
        if (onChange) onChange();
      });
    });

    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (!el) return;
      el.addEventListener('change', () => {
        settingsModified = true;
        if (onChange) onChange();
      });
    });

    const resetBtn = document.getElementById('btn-reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetToDefaults();
        if (onChange) onChange();
      });
    }
  }

  function resetToDefaults() {
    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      const display = document.getElementById('sv-' + s.id.slice(2));
      if (!el) return;
      el.value = s.def;
      if (display) {
        display.textContent = parseFloat(s.def).toFixed(el.step < 1 ? (s.step < 0.01 ? 4 : 2) : 0);
      }
    });
    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (!el) return;
      el.checked = false;
    });
    settingsModified = true;
  }

  function loadPresetDefaults(baseVals) {
    if (!baseVals) return;
    originalPresetVals = Object.assign({}, baseVals);
    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      const display = document.getElementById('sv-' + s.id.slice(2));
      if (!el) return;
      const val = baseVals[s.key] !== undefined ? baseVals[s.key] : s.def;
      el.value = val;
      if (display) {
        display.textContent = parseFloat(val).toFixed(el.step < 1 ? (s.step < 0.01 ? 4 : 2) : 0);
      }
    });
    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (!el) return;
      const val = baseVals[t.key];
      el.checked = val === 1 || val === true || val === '1';
    });
    settingsModified = false;
  }

  function toggle() {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    settingsVisible = !settingsVisible;
    panel.classList.toggle('visible', settingsVisible);
  }

  function hide() {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    settingsVisible = false;
    panel.classList.remove('visible');
  }

  function isVisible() {
    return settingsVisible;
  }

  function getOverrides() {
    const result = {};
    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) result[s.key] = parseFloat(el.value);
    });
    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) result[t.key] = el.checked ? 1 : 0;
    });
    return result;
  }

  function applyOverrides(presetData) {
    if (!presetData || !presetData.baseVals) return presetData;
    let data;
    try {
      data = JSON.parse(JSON.stringify(presetData));
    } catch (_) {
      data = Object.assign({}, presetData);
      data.baseVals = Object.assign({}, presetData.baseVals);
    }
    if (settingsModified) {
      const overrides = getOverrides();
      Object.keys(overrides).forEach(key => {
        data.baseVals[key] = overrides[key];
      });
    }
    return data;
  }

  function getModifiedState() { return settingsModified; }

  return {
    init,
    toggle,
    hide,
    isVisible,
    getOverrides,
    applyOverrides,
    loadPresetDefaults,
    resetToDefaults,
    getModifiedState,
  };
})();