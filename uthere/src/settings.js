import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYMhu7QhYNbFy2dYp4gY2jptXtB/zUJh9k8/qg2rVuj3su8MUGCxSDS0MzCyTLJJTjE3Sks0sLU2MDA0tDVIsDYzTjA2SUrb7pjQEMjJkZ39lYmSAQBCfjaG0JCO1KJWBAQBJ8R9b";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"e774cf41127045cc8332e0943611941e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";