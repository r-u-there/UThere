import { useState, useEffect } from "react";
import {
	config,
	useClient,
	useMicrophoneAndCameraTracks,
	channelName
} from "../settings";
import Videos from "./Videos";
import Controls from "./Controls";
import React from 'react';

function VideoCall(props) {
	const  setInCall  = props.setInCall;
	const ready = props.ready;
	const tracks = props.tracks;
	const webgazer = props.webgazer;
	const [users, setUsers] = useState([]);
	const [start, setStart] = useState(false);
	const client = useClient();
	console.log(" hereee tracks " + tracks)
	useEffect(() => { 
		let init = async (name) => {
			client.on("user-published", async (user, mediaType) => {
				await client.subscribe(user, mediaType);
				if (mediaType === "video") {
					setUsers((prevUsers) => {
						return [...prevUsers, user];
					});
				}
				if (mediaType === "audio") {
					user.audioTrack.play();
				}
			});

			client.on("user-unpublished", (user, mediaType) => {
				if (mediaType === "audio") {
					if (user.audioTrack) user.audioTrack.stop();
				}
				if (mediaType === "video") {
					setUsers((prevUsers) => {
						return prevUsers.filter((User) => User.uid !== user.uid);
					});
				}
			});

			client.on("user-left", (user) => {
				setUsers((prevUsers) => {
					return prevUsers.filter((User) => User.uid !== user.uid);
				});
			});

			try {
				let uid = await client.join(config.appId, name, config.token, null);
				console.log(uid); // The user id defined by Agora
			} catch (error) {
				console.log("error");
			}

			if (props.tracks) {
				await client.publish([tracks[0], tracks[1]]);
			}
			setStart(true);
			console.log("start is" + start);
		};

		if (ready && tracks) {
			console.log("ready is" + ready)
			try {
				init(channelName);
			} catch (error) {
				console.log(error);
			}
		}
		
	}, []);

	return (
		<div>
			<div>
				{ready && tracks && (<Controls tracks={tracks} setStart={setStart} setInCall={setInCall} webgazer={webgazer} />)}
			</div>
			<div>
				{start && tracks 
				 && <Videos  tracks={tracks} users={users} />
				}
			</div>
		</div>
	);
}

export default VideoCall;