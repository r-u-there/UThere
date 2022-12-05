import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYGC8r7OVo/5T4sW+xP/fJv2/9/+0ewtXVtYn/q/Ho6xuVCkoMFikGloYmFkmWSSnGJukJZtZWpoYGRpaGqRYGhinGRskLTnZndwQyMjwO+QSMyMDBIL4LAy5iZl5DAwAFGMiQA==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";