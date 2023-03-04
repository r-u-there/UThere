import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYLC48OPbTpa47nUrDklY9qwrMF7Wd6LW1mdBgrnCfPlDkyYqMFikGloYmFkmWSSnGJukJZtZWpoYGRpaGqRYGhinGRsk1cUypzQEMjLo+naxMDJAIIjPwpCbmJnHwAAAOUEd9A==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";