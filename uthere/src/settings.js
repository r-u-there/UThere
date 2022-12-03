import {createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "8e18069b8cd34fc699421190d903f30b";
const token = "007eJxTYODInTTvqdq/tVl/TuZUHf7fbXivYt4HzmM5b6rdzQ+IuoooMFikGloYmFkmWSSnGJukJZtZWpoYGRpaGqRYGhinGRskyZd2JTcEMjLozIphYWSAQBCfhSE3MTOPgQEAra4fkw==";
export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";