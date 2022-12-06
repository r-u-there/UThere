import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYLDTnBicvT566Y/7njknmXS2XrpQv23uTc0G+SQpZ9a+dgsFBotUQwsDM8ski+QUY5O0ZDNLSxMjQ0NLgxRLA+M0Y4Okt439yQ2BjAwNC8+yMjJAIIjPwpCbmJnHwAAAEqwe4g==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";