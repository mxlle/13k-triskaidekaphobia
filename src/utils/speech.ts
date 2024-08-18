import { getDefaultLanguage } from "../utils/language-util";

const synth = window.speechSynthesis;

export function getAvailableVoices() {
  return new Promise((resolve) => {
    synth.onvoiceschanged = () => {
      resolve(synth.getVoices());
    };
  });
}

export function speak(text: string, rate?: number, pitch?: number) {
  const utterThis = new SpeechSynthesisUtterance();
  utterThis.lang = getDefaultLanguage(true);
  utterThis.text = text;
  utterThis.rate = rate ?? 1;
  utterThis.pitch = pitch ? pitch : Math.sqrt(utterThis.rate);
  utterThis.volume = 0.5;

  return new Promise((resolve) => {
    utterThis.onend = () => {
      resolve(true);
    };
    synth.speak(utterThis);
  });
}
