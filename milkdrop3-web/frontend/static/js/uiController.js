const UIController = (() => {
  let onPrevPreset = null;
  let onNextPreset = null;
  let onRandomPreset = null;
  let onFullscreen = null;
  let onMicStart = null;
  let onLoopbackStart = null;
  let onFileStart = null;
  let onSelectPreset = null;
  let onToggleSettings = null;

  function init() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const btnStart = document.getElementById('btn-start');

    btnStart.addEventListener('click', () => {
      welcomeScreen.classList.add('hidden');
      setTimeout(() => { welcomeScreen.style.display = 'none'; }, 400);
      document.dispatchEvent(new CustomEvent('appstart'));
    });

    bindButton('btn-mic', onMicStart);
    bindButton('btn-loopback', onLoopbackStart);
    bindButton('btn-file', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file && onFileStart) onFileStart(file);
      };
      input.click();
    });
    bindButton('btn-prev', () => { if (onPrevPreset) onPrevPreset(); });
    bindButton('btn-next', () => { if (onNextPreset) onNextPreset(); });
    bindButton('btn-random', () => { if (onRandomPreset) onRandomPreset(); });
    bindButton('btn-settings', () => { if (onToggleSettings) onToggleSettings(); });

    const select = document.getElementById('preset-list');
    const search = document.getElementById('preset-search');

    function extractAuthor(name) {
      const match = name.match(/^([^\-]+?)(?:\s*[-–—]|\s*$)/);
      if (!match) return 'Other';
      let author = match[1].replace(/[&+]/g, ',').replace(/\s+/g, ' ').trim();
      const parts = author.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) return 'Colaboraciones';
      if (parts.length === 1 && parts[0]) return parts[0];
      return 'Otros';
    }

    function getAuthorGroups(filter) {
      const all = PresetLoader.getAll();
      const groups = {};
      const lower = filter ? filter.toLowerCase() : '';
      all.forEach(p => {
        if (lower && !p.name.toLowerCase().includes(lower)) return;
        const author = extractAuthor(p.name);
        if (!groups[author]) groups[author] = [];
        groups[author].push(p);
      });
      const sorted = Object.keys(groups).sort((a, b) => {
        if (a === 'Colaboraciones') return 1;
        if (b === 'Colaboraciones') return -1;
        return a.localeCompare(b);
      });
      return sorted.map(a => ({ author: a, presets: groups[a] }));
    }

    function rebuildDropdown() {
      while (select.firstChild) select.removeChild(select.firstChild);
      const groups = getAuthorGroups(search ? search.value : '');
      groups.forEach(g => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = g.author;
        g.presets.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.name;
          opt.textContent = p.name.replace(g.author + ' - ', '');
          optgroup.appendChild(opt);
        });
        select.appendChild(optgroup);
      });
    }

    rebuildDropdown();

    let searchTimeout;
    if (search) {
      search.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(rebuildDropdown, 150);
      });
    }

    select.addEventListener('change', () => {
      if (onSelectPreset) onSelectPreset(select.value);
    });

    document.addEventListener('keydown', (e) => {
      if (!welcomeScreen.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btnStart.click();
        }
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          e.preventDefault(); if (onPrevPreset) onPrevPreset();
          break;
        case 'arrowright':
          e.preventDefault(); if (onNextPreset) onNextPreset();
          break;
        case 'r':
          if (onRandomPreset) onRandomPreset();
          break;
        case 'f':
          if (onFullscreen) onFullscreen();
          break;
        case 's':
          if (onToggleSettings) onToggleSettings();
          break;
        case ' ':
          e.preventDefault();
          break;
      }
    });
  }

  function bindButton(id, handler) {
    const el = document.getElementById(id);
    if (el && handler) el.addEventListener('click', handler);
  }

  function setPresetName(name) {
    const tp = document.getElementById('title-preset');
    const pn = document.getElementById('preset-name');
    if (tp) tp.textContent = name;
    if (pn) pn.textContent = name;
    const select = document.getElementById('preset-list');
    if (select) {
      try {
        select.value = name;
      } catch (_) {}
    }
  }

  function setSourceButton(type) {
    document.querySelectorAll('#toolbar button').forEach(b => b.classList.remove('active'));
    const map = { mic: 'btn-mic', loopback: 'btn-loopback', file: 'btn-file' };
    const el = document.getElementById(map[type]);
    if (el) el.classList.add('active');
  }

  function showError(msg) {
    const el = document.getElementById('error-message');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 5000);
  }

  return {
    init,
    setPresetName,
    setSourceButton,
    showError,
    rebuildPresetList: rebuildDropdown,
    on: (events) => {
      if (events.prevPreset) onPrevPreset = events.prevPreset;
      if (events.nextPreset) onNextPreset = events.nextPreset;
      if (events.randomPreset) onRandomPreset = events.randomPreset;
      if (events.fullscreen) onFullscreen = events.fullscreen;
      if (events.micStart) onMicStart = events.micStart;
      if (events.loopbackStart) onLoopbackStart = events.loopbackStart;
      if (events.fileStart) onFileStart = events.fileStart;
      if (events.selectPreset) onSelectPreset = events.selectPreset;
      if (events.toggleSettings) onToggleSettings = events.toggleSettings;
    },
  };
})();
