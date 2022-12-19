import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYNitcuGg5FJD71SvRqN5X6OEX22Ovi/zqF8gqf7xSouzN54pMBiamidaJpsZJKWZpJgkW5hamBqaWJglJhklm6UYJBsbFU6an9wQyMiwgHcVMyMDBIL4LAy5iZl5DAwAhYkgLw==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";