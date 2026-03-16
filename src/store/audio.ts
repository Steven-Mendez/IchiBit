import { atom } from 'nanostores';

export const activeAudioSrc = atom<string | null>(null);

export function setActiveAudio(src: string | null) {
  activeAudioSrc.set(src);
}
