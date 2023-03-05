import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "007eJxTYJjy/gC787nsCzYSL/Jff7i7vCkqWUXr7xJ3LcNFvz7v1U1QYEhJTk0zN7JISzE1tDAxNTewTEs2NEg0NDFISzM0NzNI+3CVJaUhkJHhsuoyJkYGCATx2RhKSzJSi1IZGAAzziJW";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";