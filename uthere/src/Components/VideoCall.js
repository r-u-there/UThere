import { useState, useEffect, useRef } from "react";
import {
	config,
	useClient,
	channelName
} from "../settings";
import Videos from "./Videos";
import Controls from "./Controls";
import React from 'react';
import {Cookies} from "react-cookie";
import axios from 'axios';


function VideoCall(props) {
	const ready = props.ready;
	const tracks = props.tracks;
	const webgazer = props.webgazer;
	const cookies = new Cookies();
	const [users, setUsers] = useState([]);
	const [usersWithCam, setUsersWithCam] = useState([]);
	const [start, setStart] = useState(false);
	const [agorauid,setAgorauid] = useState(0);
	const client = useClient();
	console.log(client.remoteUsers)
	const [token, setToken] = useState('');
	const agora_token = cookies.get("token");
	const channelName = cookies.get("channel_name")
	const status = cookies.get("status")
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id")
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [mediaStream, setMediaStream] = useState(null);
	const [mediaRecorder, setMediaRecorder] = useState(null);	

	const startMediaStream = () => {
		navigator.mediaDevices.getUserMedia({ audio: false, video: true}
			).then((stream) => {
			setMediaStream(stream);
			const options = {
				videoBitsPerSecond: 2000000,
				mimeType: 'video/webm',
			  };
			const mediaRecorder = new MediaRecorder(stream, options);
			mediaRecorder.start(10000);
			mediaRecorder.ondataavailable = (e) => {
				if (typeof e.data === "undefined") return;
				if (e.data.size === 0) return;
				console.log(e.data);
				const formData = new FormData();
				const blob = new Blob([e.data], { type: "video/webm" });	
				formData.append('file', blob, 'recorded-video.webm');
				let cur_time = new Date().toLocaleTimeString()
				formData.append('timestamp', cur_time);
				formData.append('user_id', userId);
				console.log(formData)
				fetch("http://0.0.0.0:8008/upload-video/", {
					method: 'POST',
					body: formData,
					headers: {
						'Accept': 'application/json'
					}
				});
			setMediaRecorder(mediaRecorder);
		};
		  })
		  .catch((error) => {
			console.error('Error accessing webcam:', error);
		});	
	}

	const stopMediaStream = () => {
		if (mediaRecorder.state === "recording") {
			mediaRecorder.stop();
		} 
		else {
			console.log("MediaRecorder is not recording");
		}
		if (mediaStream) {
		  // Stop the media stream
		  mediaStream.getTracks().forEach(track => track.stop());
		  // Set the media stream state variable to null
		  setMediaStream(null);
		}
		setMediaRecorder(null);
	}

	async function getHostID() {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_user/${channelId}/`);
			console.log(response)
            return response.data.user;
        } catch (error) {
            console.log("error", error);
            return null;
        }
    }
	async function meetingUserCreate(arg){
		let host_var = 0
		if(status === "host"){
			host_var=1
		}
		const createMeetingUserResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting_user/', {
				"meeting" : channelId,
				"user": userId,
				"is_host": host_var,
				"agora_id": arg 
			  });
			  console.log("success");
			  console.log(createMeetingUserResponse);
	}
	useEffect(() => {
		let init = async (name) => {
			client.on("user-published", async (user, mediaType) => {
				await client.subscribe(user, mediaType);
				console.log("bişi")
				if (mediaType === "video") {
					setUsersWithCam((prevUsers) => {
						return [...prevUsers, user];
					});
					user.videoTrack.play("play");
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
					setUsersWithCam((prevUsers) => {
						return prevUsers.filter((User) => User.uid !== user.uid);
					});
					if (user.videoTrack) user.videoTrack.stop();
				}
			});
			
			client.on("user-joined", (user) => {
				console.log("JOIN ALGILANDI " + user.uid)
				setUsers((prevUsers) => {
					return [...prevUsers, user];
				});
				setUsersWithCam((prevUsers) => {
					return [...prevUsers, user];
				});
			});

			client.on("user-left", (user) => {
				setUsers((prevUsers) => {
					return prevUsers.filter((User) => User.uid !== user.uid);
				});

			});
			try {
				console.log(name)
				if(status === "host"){
					let new_userid= parseInt(userId)
					let uid = await client.join(config.appId, name, agora_token, 0);
					meetingUserCreate(uid)
					setAgorauid(uid)
					console.log("agora user id"+uid); // The user id defined by Agora

					console.log(typeof(userId))
				}
				else if (status === "participant"){
					//get the host uid of the meeting
					let result = await getHostID(); 
					console.log(result)
					console.log(typeof(result))
					result = parseInt(result)
					let uid = await client.join(config.appId, name, agora_token, 0);
					meetingUserCreate(uid)
					setAgorauid(uid)
					console.log("agora user id"+uid); // The user id defined by Agora
				
				}
			} catch (error) {
				console.log("error");
			}

			if (props.tracks) {
				await client.publish([tracks[0], tracks[1]]);
				console.log("bilgehan")
			}
			setStart(true);
			console.log("start is" + start);
		};

		if (ready && tracks) {
			console.log("ready is" + ready)
			try {
				console.log("channel name is: " + channelName)
				console.log("agora id is: " + agora_token)
				console.log("user id is: " +userId)
				init(channelName);
			} catch (error) {
				console.log(error);
			}
		}
		
	}, [channelName, client, ready, tracks]);

	useEffect(() => { 	
		console.log(trackState)
		if (mediaStream == null && trackState.video) {
			startMediaStream();
			console.log("camera on");
        }
		if(mediaStream != null && !trackState.video){
			stopMediaStream();
			console.log("camera off");
		}
		//check if mediaStream is not equal to null

	}, [trackState]);

	return (
		<div>
			<div>
				{ready && tracks && (<Controls tracks={tracks} setStart={setStart} webgazer={webgazer} users={users} trackState={trackState} setTrackState = {setTrackState}/>)}
			</div>
			<div>
			{start && tracks && <Videos tracks={tracks} users={users} usersWithCam={usersWithCam} agorauid={agorauid} />}
			</div>
		</div>
	);
}

export default VideoCall;