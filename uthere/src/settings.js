import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "a03bd0d8212b4278b6b96da3b9e2de62";
const token = "007eJxTYDjwM7TfJutboICq2a4VD57WnMg99pDFtGTDjzjZVs1D+vsVGBINjJNSDFIsjAyNkkyMzC2SzJIszVISjZMsU41SUs2M7nUFpzQEMjI8WqnLyMgAgSA+G0NpSUZqUSoDAwD9wSHc";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"0bcfb44dfe3f43539ff747b573f9abc6" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";