import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYPhsNOfY5gvLxC1KBNsncW549er5b+6iH7sVIk2fzubjFfurwGCRamhhYGaZZJGcYmySlmxmaWliZGhoaZBiaWCcZmyQVLyRJaUhkJFBvPMeAyMUgvhsDKUlGalFqQwMAMecIFg=";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";