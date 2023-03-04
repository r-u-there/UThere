import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYGB75H7ta2WHucS+1MvSdx20yjW0orUctvMyq0Zv7r+7gkuBwSLV0MLAzDLJIjnF2CQt2czS0sTI0NDSIMXSwDjN2CDp3w3mlIZARob7Z4MYGKEQxGdjKC3JSC1KZWAAANT4Hjk=";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";