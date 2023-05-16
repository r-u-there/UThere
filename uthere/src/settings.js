import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "c3154f9b5b964dc8a4392eaa5f14e808";
const token = "007eJxTYPBr/ZeTx9PA5/c4/0Wp7rZLv+18rLJblbIkGGY2/7x7a4UCQ7KxoalJmmWSaZKlmUlKskWiibGlUWpiommaoUmqhYFF2LWklIZARob9bPrMjAwQCOKzMZSWZKQWpTIwAACD3x/s";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token, certificate:"93df7041203e44a2b1e60bf80dd4c8fa" };

export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "uthere";