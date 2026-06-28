const AudioCapture = (() => {
  let audioContext = null;
  let sourceNode = null;
  let analyserNode = null;
  let onAudioConnect = null;
  let streamRef = null;

  function getContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function createAnalyser(ctx) {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;
    return analyser;
  }

  function disconnectSource() {
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (_) {}
      sourceNode = null;
    }
    if (streamRef) {
      try { streamRef.getTracks().forEach(t => t.stop()); } catch (_) {}
      streamRef = null;
    }
    const audio = document.getElementById('audio-file-input');
    audio.pause();
    audio.src = '';
    analyserNode = null;
  }

  async function startMic() {
    disconnectSource();
    const ctx = getContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef = stream;
    sourceNode = ctx.createMediaStreamSource(stream);
    analyserNode = createAnalyser(ctx);
    sourceNode.connect(analyserNode);
    if (onAudioConnect) onAudioConnect(analyserNode);
    return true;
  }

  async function startLoopback() {
    disconnectSource();
    if (!navigator.mediaDevices.getDisplayMedia) {
      throw new Error('getDisplayMedia not supported');
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.stop();
    }
    if (stream.getAudioTracks().length === 0) {
      throw new Error('No audio track in screen capture');
    }
    streamRef = stream;
    const ctx = getContext();
    sourceNode = ctx.createMediaStreamSource(stream);
    analyserNode = createAnalyser(ctx);
    sourceNode.connect(analyserNode);
    if (onAudioConnect) onAudioConnect(analyserNode);
    stream.getAudioTracks()[0].onended = () => stop();
    return true;
  }

  function startFile(file) {
    disconnectSource();
    const ctx = getContext();
    const audio = document.getElementById('audio-file-input');
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.loop = true;
    sourceNode = ctx.createMediaElementSource(audio);
    analyserNode = createAnalyser(ctx);
    sourceNode.connect(analyserNode);
    analyserNode.connect(ctx.destination);
    if (onAudioConnect) onAudioConnect(analyserNode);
    audio.play();
    return true;
  }

  function stop() {
    disconnectSource();
  }

  function setAudioConnectHandler(handler) {
    onAudioConnect = handler;
  }

  return {
    startMic,
    startLoopback,
    startFile,
    stop,
    setAudioConnectHandler,
    getContext,
  };
})();
