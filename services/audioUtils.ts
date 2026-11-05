/**
 * Decodes a base64 string into a Uint8Array
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a WAV file header for the PCM data.
 * Assumes 16-bit PCM, Mono, 24kHz (Standard for Gemini TTS)
 */
export async function enhanceAudio(pcmData: Uint8Array, sampleRate: number = 24000): Promise<Uint8Array> {
  try {
    const OfflineAudioCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!OfflineAudioCtx) {
      console.warn("OfflineAudioContext not supported, skipping audio enhancement");
      return pcmData;
    }

    const numSamples = pcmData.length / 2;
    const float32Data = new Float32Array(numSamples);
    const dataView = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
    
    // Convert 16-bit PCM to Float32 [-1, 1]
    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32Data[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
    }

    // --- Advanced Adaptive Noise Reduction Implementation ---
    // Dynamically tracks the noise floor and applies a soft noise gate
    const gateAttackTime = 0.002; // 2ms
    const gateReleaseTime = 0.200; // 200ms
    const attackCoef = Math.exp(-1.0 / (sampleRate * gateAttackTime));
    const releaseCoef = Math.exp(-1.0 / (sampleRate * gateReleaseTime));
    
    let envelope = 0;
    let noiseFloor = 0.001; // Initial noise floor guess
    const noiseFloorAlpha = 0.00005; // Very slow tracking to avoid tracking speech

    for (let i = 0; i < numSamples; i++) {
      const absSample = Math.abs(float32Data[i]);
      
      // Compute envelope
      if (absSample > envelope) {
        envelope = attackCoef * envelope + (1.0 - attackCoef) * absSample;
      } else {
        envelope = releaseCoef * envelope + (1.0 - releaseCoef) * absSample;
      }
      
      // Update adaptive noise floor
      if (envelope < noiseFloor) {
        // Fast drop when envelope is lower than noise floor
        noiseFloor = envelope;
      } else {
        // Slow rise to track slowly increasing background noise
        noiseFloor = noiseFloor * (1 - noiseFloorAlpha) + envelope * noiseFloorAlpha;
      }
      
      // Cap noise floor to prevent speech gating
      const maxNoiseFloor = 0.015;
      const adaptiveThreshold = Math.min(Math.max(noiseFloor * 2.5, 0.003), maxNoiseFloor);

      let gain = 1.0;
      if (envelope < adaptiveThreshold) {
        // Soft gate
        gain = Math.max(0.001, envelope / adaptiveThreshold);
        gain = Math.pow(gain, 1.5); // Exponential curve
      }
      float32Data[i] *= gain;
    }
    // ----------------------------------------------

    const offlineCtx = new OfflineAudioCtx(1, numSamples, sampleRate);
    const audioBuffer = offlineCtx.createBuffer(1, numSamples, sampleRate);
    audioBuffer.copyToChannel(float32Data, 0);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // 1. High-pass filter to remove low-end rumble (improves clarity)
    const highpass = offlineCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 85; 

    // 2. Low-pass filter to remove high-frequency hiss/noise
    const lowpass = offlineCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 9000; 

    // 3. Peaking filter to cut muddiness/boxiness
    const peakingCut = offlineCtx.createBiquadFilter();
    peakingCut.type = 'peaking';
    peakingCut.frequency.value = 250; 
    peakingCut.Q.value = 1.0;
    peakingCut.gain.value = -3; 

    // 4. Peaking filter to boost presence/intelligibility
    const peakingBoost = offlineCtx.createBiquadFilter();
    peakingBoost.type = 'peaking';
    peakingBoost.frequency.value = 3500; 
    peakingBoost.Q.value = 1.0;
    peakingBoost.gain.value = 2; 

    // 5. De-esser (reduces harsh 's' sounds that might be boosted by presence peak)
    const deEsser = offlineCtx.createBiquadFilter();
    deEsser.type = 'peaking';
    deEsser.frequency.value = 6500;
    deEsser.Q.value = 2.0;
    deEsser.gain.value = -4;

    // 6. Peak Compressor (Dynamic Range Compression - Stage 1)
    // Catches and tames sharp transients quickly
    const peakCompressor = offlineCtx.createDynamicsCompressor();
    peakCompressor.threshold.value = -12; 
    peakCompressor.knee.value = 5; 
    peakCompressor.ratio.value = 8; 
    peakCompressor.attack.value = 0.002; // 2ms fast attack
    peakCompressor.release.value = 0.050; // 50ms fast release

    // 7. Leveling Compressor (Dynamic Range Compression - Stage 2)
    // Smooths out the overall volume and makes voice highly stable and present
    const levelingCompressor = offlineCtx.createDynamicsCompressor();
    levelingCompressor.threshold.value = -28; 
    levelingCompressor.knee.value = 15; 
    levelingCompressor.ratio.value = 4; 
    levelingCompressor.attack.value = 0.015; // 15ms medium attack
    levelingCompressor.release.value = 0.250; // 250ms smooth release

    // Connect the processing chain
    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(peakingCut);
    peakingCut.connect(peakingBoost);
    peakingBoost.connect(deEsser);
    deEsser.connect(peakCompressor);
    peakCompressor.connect(levelingCompressor);
    levelingCompressor.connect(offlineCtx.destination);

    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();
    const renderedData = renderedBuffer.getChannelData(0);

    // Normalize audio (make it as loud as possible without clipping)
    let maxAmplitude = 0;
    for (let i = 0; i < renderedData.length; i++) {
      const abs = Math.abs(renderedData[i]);
      if (abs > maxAmplitude) maxAmplitude = abs;
    }
    
    // Target -1 dBFS (approx 0.891 amplitude) for broadcast readiness without clipping
    const targetAmplitude = Math.pow(10, -1 / 20);
    const gain = maxAmplitude > 0 ? targetAmplitude / maxAmplitude : 1;

    // Convert back to 16-bit PCM
    const outPcmData = new Uint8Array(renderedData.length * 2);
    const outDataView = new DataView(outPcmData.buffer);

    for (let i = 0; i < renderedData.length; i++) {
      let sample = renderedData[i] * gain;
      
      // Hard clipping protection
      if (sample > 1) sample = 1;
      if (sample < -1) sample = -1;
      
      const int16 = sample < 0 ? sample * 32768 : sample * 32767;
      outDataView.setInt16(i * 2, int16, true);
    }

    return outPcmData;
  } catch (error) {
    console.error("Error enhancing audio:", error);
    return pcmData; // Fallback to original data if processing fails
  }
}

export function createWavUrl(pcmData: Uint8Array, sampleRate: number = 24000): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}