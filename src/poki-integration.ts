import { PubSubEvent, pubSubService } from "./utils/pub-sub-service";

interface PokiSDK {
  init: () => Promise<void>;
  gameLoadingFinished: () => void;
  gameplayStart: () => void;
  gameplayStop: () => void;
  commercialBreak: (callback: () => void) => Promise<void>;
}

declare const PokiSDK: PokiSDK;

const fallbackPokiSdk: PokiSDK = {
  init: () => Promise.resolve(),
  gameLoadingFinished: () => {},
  gameplayStart: () => {},
  gameplayStop: () => {},
  commercialBreak: () => Promise.resolve(),
};

export let pokiSdk: PokiSDK | undefined;
let isFallback = false;

try {
  pokiSdk = PokiSDK;
} catch (error) {
  console.log("Failed to load Poki SDK", error);
}

if (!pokiSdk) {
  console.log("Poki SDK not found, using fallback");
  pokiSdk = fallbackPokiSdk;
  isFallback = true;
}

export function initPoki(continueToGame: () => Promise<void>) {
  pokiSdk
    .init()
    .then(() => {
      if (!isFallback) {
        console.log("Poki SDK successfully initialized");
      }

      return continueToGame();
    })
    .then(() => {
      pokiSdk.gameLoadingFinished();
    })
    .catch(() => {
      console.log("Initialized, something went wrong, load you game anyway");
      // fire your function to continue to game
      return continueToGame();
    });
}

export function handlePokiCommercial(): Promise<void> {
  // pause your game here if it isn't already
  return pokiSdk
    .commercialBreak(() => {
      // you can pause any background music or other audio here
      pubSubService.publish(PubSubEvent.MUTE_MUSIC);
    })
    .then(() => {
      console.log("Commercial break finished, proceeding to game");
      // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
      // continue your game here
      pubSubService.publish(PubSubEvent.UNMUTE_MUSIC);
    })
    .catch((error: Error) => {
      console.error("Commercial break failed", error);
    });
}
