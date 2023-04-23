import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "006dcef728fd51845709fc10a140ff1760fIAAghFui0PLiqJGxOqhxd+t2YPZ2mqvASIsAN6jkbulu/sw6no/TrYavIgDvlwcDZMlGZAQAAQBkyUZkAgBkyUZkAwBkyUZkBABkyUZk";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";