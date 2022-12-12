import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYHj/qbTcKuJi7Ltpb5rupm56/cV8svTWuBsMj2f+XVl659QlBQaLVEMLAzPLJIvkFGOTtGQzS0sTI0NDS4MUSwPjNGODpGNLpic3BDIycLbbsjIyQCCIz8KQm5iZx8AAAKa6IzM=";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";