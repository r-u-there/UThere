import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYLhsJX00+Ovq9uZf/2rKOH86CBgE3okXW24lsiRD0D1u8RsFBotUQwsDM8ski+QUY5O0ZDNLSxMjQ0NLgxRLA+M0Y4Okoh0cKQ2BjAwL1AQZGRkgEMRnYygtyUgtSmVgAABLfx5i";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";