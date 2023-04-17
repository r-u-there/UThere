import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "007eJxTYKhv6nBcVPd3QbZPm5hnP5fI6Uchl1VkJ5pZvK8xmq/CdFeBISU5Nc3cyCItxdTQwsTU3MAyLdnQINHQxCAtzdDczCBtl4NtSkMgI8Mn2xpGRgYIBPHZGEpLMlKLUhkYABxHHqo=";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";