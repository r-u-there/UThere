import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "007eJxTYKg5/vr8PxmWG1O5+jjSW55Pz0w1zJ/4eZdXqVDpwo0rM4oVGCxSDS0MzCyTLJJTjE3Sks0sLU2MDA0tDVIsDYzTjA2SDO+qpjQEMjI0yXQyMjJAIIjPxlBakpFalMrAAACn3h/O";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";