import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "a03bd0d8212b4278b6b96da3b9e2de62";
const token = "007eJxTYAh4LL/sgkJl2U7X6up5Fy9u4GvZe9V7tt778iP1K1ceOvlKgSHRwDgpxSDFwsjQKMnEyNwiySzJ0iwl0TjJMtUoJdXM6OSakJSGQEaG4I8ujIwMEAjiszGUlmSkFqUyMAAAcPMjew==";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"0bcfb44dfe3f43539ff747b573f9abc6" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";