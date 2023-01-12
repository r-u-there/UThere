import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "007eJxTYJCo+m2nPtvv6W2n1l0Gk68+WK6roaes98Aw9PqG2k0RhlcVGFKSU9PMjSzSUkwNLUxMzQ0s05INDRINTQzS0gzNzQzS1lQcSG4IZGTYVlnIwAiFID4HQ3JGYl5eao4hAwMA3UshLw==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "channel1";