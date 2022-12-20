import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYCj6dt6If3V7voaYzXaxMvm+u08iyo8+DAvQnPNua3gxr4ACg0WqoYWBmWWSRXKKsUlaspmlpYmRoaGlQYqlgXGasUFSU8zC5IZARoYvvvdZGRkgEMRnYchNzMxjYAAA+EEegQ==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";