(function () {
  const canvas = document.getElementById('visualizer');
  let visualizer = null;
  let running = false;

  function resizeCanvas() {
    const wrapper = document.getElementById('canvas-wrapper');
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    if (visualizer) {
      visualizer.setRendererSize(canvas.width, canvas.height);
    }
  }

  function applyCurrentPreset() {
    const p = PresetLoader.current();
    if (!visualizer || !p) return;
    const data = PresetSettings.applyOverrides(p.data);
    const t = PresetSettings.getModifiedState() ? 0.3 : 2.5;
    visualizer.loadPreset(data, t);
    UIController.setPresetName(p.name);
  }

  function loadPreset(preset) {
    if (!visualizer || !preset) return;
    PresetSettings.loadPresetDefaults(preset.data.baseVals);
    applyCurrentPreset();
  }

  function nextPreset() { loadPreset(PresetLoader.next()); }
  function prevPreset() { loadPreset(PresetLoader.prev()); }
  function randomPreset() { loadPreset(PresetLoader.random()); }

  function selectPreset(name) {
    const preset = PresetLoader.getByName(name);
    if (preset) loadPreset(preset);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function startWithMic() {
    UIController.setSourceButton('mic');
    AudioCapture.startMic().catch(err => {
      console.error('Mic error:', err);
      UIController.showError('No se pudo acceder al micrófono. Presiona el botón de micrófono para reintentar.');
      UIController.setSourceButton('');
    });
  }

  function startWithLoopback() {
    UIController.setSourceButton('loopback');
    AudioCapture.startLoopback().catch(err => {
      console.error('Loopback error:', err);
      UIController.showError('Captura de audio del sistema falló. Comparte una pestaña con audio.');
      UIController.setSourceButton('');
    });
  }

  function startWithFile(file) {
    UIController.setSourceButton('file');
    AudioCapture.startFile(file);
  }

  function boot() {
    try {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      if (typeof butterchurn === 'undefined') {
        UIController.showError('Butterchurn library not loaded');
        return;
      }

      let ctx;
      try {
        ctx = AudioCapture.getContext();
      } catch (err) {
        console.error('AudioContext error:', err);
        UIController.showError('Failed to get audio context');
        return;
      }

      const bc = butterchurn.default || butterchurn;
      let timeout = setTimeout(function () {
        console.error('createVisualizer timeout');
        UIController.showError('Visualizer creation timed out');
        running = false;
      }, 10000);
      try {
        visualizer = bc.createVisualizer(ctx, canvas, {
          width: canvas.width,
          height: canvas.height,
          meshWidth: 48,
          meshHeight: 36,
          pixelRatio: window.devicePixelRatio || 1,
          textureRatio: 1,
          outputFXAA: true,
        });
        clearTimeout(timeout);
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }

      AudioCapture.setAudioConnectHandler((analyserNode) => {
        visualizer.connectAudio(analyserNode);
      });

      loadPreset(PresetLoader.current());

      running = true;
      function frame() {
        if (!running) return;
        try {
          visualizer.render();
        } catch (err) {
          console.error('Render error:', err);
        }
        requestAnimationFrame(frame);
      }
      frame();
    } catch (err) {
      console.error('Boot failed:', err);
      UIController.showError('Failed to start: ' + err.message);
    }
  }

  PresetSettings.init(() => {
    applyCurrentPreset();
  });

  UIController.on({
    prevPreset, nextPreset, randomPreset, selectPreset,
    fullscreen: toggleFullscreen,
    micStart: startWithMic,
    loopbackStart: startWithLoopback,
    fileStart: startWithFile,
    toggleSettings: () => PresetSettings.toggle(),
  });

  UIController.init();

  document.addEventListener('appstart', () => {
    try {
      AudioCapture.getContext();
    } catch (err) {
      console.error('AudioContext error:', err);
      UIController.showError('Error al crear el contexto de audio. Recarga la página e intenta de nuevo.');
      return;
    }
    try {
      PresetLoader.init();
      UIController.rebuildPresetList();
    } catch (err) {
      console.error('PresetLoader error:', err);
      UIController.showError('Error al cargar presets: ' + err.message);
    }
    boot();
    startWithMic();
  });

  if (!window.isButterchurnSupported) {
    try {
      const bc = butterchurn.default || butterchurn;
      if (typeof bc !== 'undefined' && bc.isSupported) {
        window.isButterchurnSupported = bc.isSupported();
      } else {
        const testCanvas = document.createElement('canvas');
        window.isButterchurnSupported = !!testCanvas.getContext('webgl2');
      }
    } catch (_) {
      try {
        const testCanvas = document.createElement('canvas');
        window.isButterchurnSupported = !!testCanvas.getContext('webgl2');
      } catch (_) {
        window.isButterchurnSupported = false;
      }
    }
  }

  if (!window.isButterchurnSupported) {
    const ws = document.getElementById('welcome-screen');
    if (ws) {
      ws.querySelector('#welcome-title').textContent = 'WEBGL2 NO SOPORTADO';
      ws.querySelector('#welcome-sub').textContent = 'Usa Chrome, Firefox, Edge, o Safari 15+';
    }
  }
})();
