import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYDjF++oyp2fRkR/c/uu665oncjzqKZefrPv/pS+XduvnRmYFBotUQwsDM8ski+QUY5O0ZDNLSxMjQ0NLgxRLA+M0Y4OkkkUTkhsCGRkyc4pYGRkgEMRnYchNzMxjYAAAK5oejA==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";