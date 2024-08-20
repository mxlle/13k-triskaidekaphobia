import { CPlayer } from "./small-player";
import { songWithDrums } from "./songs/chords-song-major-v3-with-drums";

let audioElem: HTMLAudioElement;

export async function initAudio(initializeMuted) {
  const player = new CPlayer();
  player.init(songWithDrums);

  await generateUntilDone(player);
  const wave = player.createWave();
  audioElem = document.createElement("audio");
  audioElem.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
  audioElem.loop = true;
  audioElem.volume = 0.1;
  audioElem.playbackRate = 1;

  if (!initializeMuted && !document.hidden) {
    void audioElem.play();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      audioElem.pause();
    } else {
      audioElem.play();
    }
  });
}

function generateUntilDone(player): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (player.generate() >= 1) {
        clearInterval(interval);
        resolve();
      }
    }, 0);
  });
}

export function togglePlayer(): boolean {
  const shouldPlay = audioElem.paused || audioElem.ended;
  shouldPlay ? audioElem.play() : audioElem.pause();
  return shouldPlay;
}
