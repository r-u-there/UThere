import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "dcef728fd51845709fc10a140ff1760f";
const token = "007eJxTYIhoqeC/oWU4/7nGItssA0G364GW5x8wcj92yTIoPPqHuUGBISU5Nc3cyCItxdTQwsTU3MAyLdnQINHQxCAtzdDczCCNM589pSGQkUHT04qRkQECQXw2htKSjNSiVAYGALDFHHY=";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"f2421920c434440fa8faa63ca3107c3e" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";