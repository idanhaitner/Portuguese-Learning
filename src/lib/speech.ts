const LOCALE = "pt-BR";

export function speakPortuguese(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const run = () => {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE;
    utterance.rate = 0.92;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    const voices = synth.getVoices();
    const voice = voices.find((item) => item.lang.toLowerCase() === "pt-br" || item.lang.toLowerCase().startsWith("pt-br"));
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  };
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", run, { once: true });
    return;
  }
  run();
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
