import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYNh6rq+1MdesOmlefdjyAO7PvtrXAv8kPf2///cuR/EOSy0FBotUQwsDM8ski+QUY5O0ZDNLSxMjQ0NLgxRLA+M0Y4OktZ/dUxoCGRnWL5RkZGSAQBCfjaG0JCO1KJWBAQDWEyEC";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"e774cf41127045cc8332e0943611941e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";