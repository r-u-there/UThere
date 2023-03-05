import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYBBRqg8+/fu10tsPk21iJ1l4LyvuSg+U0d8qlDS1/+n7NBsFBotUQwsDM8ski+QUY5O0ZDNLSxMjQ0NLgxRLA+M0Y4Oku09ZUhoCGRmmaXYxMTJAIIjPxlBakpFalMrAAABmCR+N";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";