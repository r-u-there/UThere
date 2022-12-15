import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "157a9c60bf4d4c85851486ab2c6d0c32";
const token = "007eJxTYNjj5bJpQbbh3Syr+HnJJe++Z8tpZYcXf/KO680Sf3n+rY0Cg6GpeaJlsplBUppJikmyhamFqaGJhVliklGyWYpBsrFR2IIpyQ2BjAz32dIYGRkgEMRnYchNzMxjYAAATqkfPQ==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";