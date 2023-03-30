import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYKg5/vr8PxmWG1O5+jjSW55Pz0w1zJ/4eZdXqVDpwo0rM4oVGCxSDS0MzCyTLJJTjE3Sks0sLU2MDA0tDVIsDYzTjA2SDO+qpjQEMjI0yXQyMjJAIIjPxlBakpFalMrAAACn3h/O";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";