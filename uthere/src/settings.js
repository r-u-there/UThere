import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "a03bd0d8212b4278b6b96da3b9e2de62";
const token = "007eJxTYJBQetYv+8gzVuTgOXfmKJkdda/Xr9wf/Kvh7gSNI+pLzoQoMCQaGCelGKRYGBkaJZkYmVskmSVZmqUkGidZphqlpJoZPZ6bktIQyMjA3sTKzMgAgSA+G0NpSUZqUSoDAwCU5SA7";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"0bcfb44dfe3f43539ff747b573f9abc6" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";