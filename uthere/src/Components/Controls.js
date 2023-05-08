/*jshint esversion: 9 */

import {useEffect, useRef, useState} from "react";
import {useClient} from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5';
import {Cookies} from "react-cookie";
import {Link, useNavigate} from 'react-router-dom';
import ParticipantsPopup from "./ParticipantsPopup";
import ClipBoardPopup from "./ClipBoardPopup";
import AlertPopup from "./AlertPopup";
import LeaveMeetingPopup from "./LeaveMeetingPopup";
import {MdScreenShare, MdStopScreenShare,MdOutlineContentCopy} from "react-icons/md";
import axios from "axios";
import {
	config,
	channelName
} from "../settings";
import AgoraRTC from 'agora-rtc-react';
const token = localStorage.getItem('token');




function Controls(props) {
	const client = useClient();
	const { tracks, setStart,  webgazer, users } = props;
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [trigger, setTrigger] = useState(false);
	const [trigger2, setTrigger2] = useState(false);
	const [trigger3, setTrigger3] = useState(false);
	const [trigger4, setTrigger4] = useState(false);
	let alertNum = "0";
	const [triggerAlertPopup, setTriggerAlertPopup] = useState(false);
	
	const navigate = useNavigate();
	const videoRef = useRef();
	const cookies = new Cookies();
	const agora_token = cookies.get("token");
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const status = cookies.get("status");
	const [screenSharing, setScreenSharing] = useState(0);
	let stream;
	const channelName = cookies.get("channel_name");
	const [isSharingEnabled, setIsSharingEnabled] = useState(false);
	const [channelParameters, setChannelParameters] = useState({
		screenTrack: null,
		localVideoTrack: null,
	  });

	/*
	const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
	agoraClient.init(config.appId);
	agoraClient.join(agora_token, channelName, null, (uid) => {
	  const screenShareConfig = {
		audio: false,
		video: false,
		screen: true,
		// Change the extensionId to the extension installed on your browser.
		extensionId: 'yourextensionidhere'
	  };
	  const screenShareStream = AgoraRTC.createStream(screenShareConfig);
	  screenShareStream.init(() => {
		agoraClient.publish(screenShareStream, (err) => {
		  console.log('Failed to publish screen share stream', err);
		});
	  }, (err) => {
		console.log('Failed to initialize screen share stream', err);
	  });
	}, (err) => {
	  console.log('Failed to join channel', err);
	});
	*/

	const copyLink = () => {
		const channelId = cookies.get("channel_id");
		const text = "Channel Id: " + channelId + "\nToken: " + agora_token;
		navigator.clipboard.writeText(text);
		setTrigger2(true);
	};

	const mute = async (type) => {
		if (type === "audio") {
			await tracks[0].setEnabled(!trackState.audio);
			setTrackState((ps) => {
				return { ...ps, audio: !ps.audio };
			});
		} else if (type === "video") {
			await tracks[1].setEnabled(!trackState.video);
			setTrackState((ps) => {
				return { ...ps, video: !ps.video };
			});
		}
	};
	useEffect(() => {
		const leaveChannel = async () => {
			if(trigger4){
				if(props.webgazer !== null){
					props.webgazer.pause();
					props.webgazer.end();
					window.localStorage.removeItem('webgazerGlobalData');
					window.localStorage.removeItem('webgazerUserdata');
					window.localStorage.removeItem('webgazerVideoContainer');
					console.log("closed");
				}
				client.removeAllListeners();
				if (tracks) {
					tracks[0].stop();
					tracks[1].stop();
					// Get the camera device
					const cameras = await navigator.mediaDevices.enumerateDevices();
					const camera = cameras.find((device) => device.kind === "videoinput");
	
					// Turn off the camera by setting the deviceId to null
					await navigator.mediaDevices.getUserMedia({
						video: { deviceId: camera ? { exact: camera.deviceId } : undefined, enabled: false },
					});
				}
				tracks[0].close();
				tracks[1].close();
				setStart(false);
				//clean meeting related cookies
				cookies.remove("token");
				cookies.remove("channel_name");
				cookies.remove("channel_id");
				cookies.remove("status");
				window.location.href ="/Dashboard";
			}
		};
		if(trigger3 || trigger4){
			leaveChannel();
		}
	  }, [trigger3,trigger4]);
	  useEffect(() => {
		const checkRemovedValue = () => {
			console.log(token);
			axios.put('http://127.0.0.1:8000/api/user_meeting_get_info/', {
				"userId": userId,
				"channelId": channelId
			  }, {
				headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				console.log(response.data);
				if(response.data.is_removed === 1){
					setTrigger4(true);
				}
				if(response.data.is_presenter === 1){
					cookies.set("status","presenter");
				}
				if(response.data.is_presenter === 0){
					cookies.set("status","participant");
				}
				console.log(response.data.alert_num);
				console.log(alertNum);
				if(response.data.is_presenter === 0 && response.data.alert_num !== alertNum){
					console.log("burası");
					console.log(response.data.alert_num);
					console.log(typeof(alertNum));
					console.log(alertNum);
					alertNum =response.data.alert_num;
					console.log(alertNum);
					setTriggerAlertPopup(true);
				}
			}).catch((exception) => {
				console.log(exception);
			});
		};
	
		// Set the interval to check the value every 1 seconds
		const intervalId = setInterval(checkRemovedValue, 5000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
		
	}, []);
	const handleScreenShare = async () => {
    if (isSharingEnabled) {
      if (channelParameters.screenTrack) {
        await channelParameters.screenTrack.replaceTrack(channelParameters.localVideoTrack, true);
      }
      setIsSharingEnabled(false);
    } else {
      try {
				const client2 = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
				let uid = await client2.join(config.appId, channelName, agora_token, null);
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
				await client2.publish([screenTrack]);
				client2.on("user-published", async (user, mediaType) => {
      if (mediaType === "video" && user.videoTrack) {
        await client2.subscribe(user, "screen");
        const screenTrack = user.videoTrack;
		        // Play the remote screen track in the new div element
        screenTrack.play("");
      }
    });
        await channelParameters.localVideoTrack.replaceTrack(screenTrack, true);
        setChannelParameters({ ...channelParameters, screenTrack });
        setIsSharingEnabled(true);
      } catch (error) {
        console.error('Error creating screen track:', error);
      }
    }
  };



	return (
		<div>
			<video width={800} height={800} ref={videoRef} autoPlay/>
			<div className="meeting-controls">
				<div className="meeting-control">
					<button onClick={handleScreenShare}>Share Screen</button>
					<button onClick={() => {setTrigger(true)}}><div><IoPeople size={30} /><br></br><label>Participants ({users.length + 1})</label></div></button>
					<button onClick={() => mute("video")}>
						{trackState.video ? <div><BsCameraVideo size={30} /><br></br><label>Turn Off</label></div> :
							<div><BsCameraVideoOff size={30} /><br></br><label>Turn On</label></div>}
					</button>
					<button onClick={() => mute("audio")}>
						{trackState.audio ? <div><BsMic size={30} /><br></br><label>Mute</label></div> :
							<div><BsMicMute size={30} /><br></br><label>Unmute</label></div>}
					</button>
					<button onClick={() => {copyLink()}}><div><MdOutlineContentCopy size={30} /><br></br><label>Copy Link</label></div></button>

					{/*
					The following line of code will be changed.
					For now, it directs the user to Dashboard page, but it should direct to MeetingEnding page.
					The participants list should be recorded to database in order to be able to retrieve the list and show on the screen.
				*/}
					<button onClick={() => {setTrigger3(true)}}><div><IoCloseCircleOutline size={30} /><br></br><label>Leave Meeting</label></div></button>
				</div>
				<ParticipantsPopup trigger={trigger} users={users} setTrigger={setTrigger}></ParticipantsPopup>
				<AlertPopup triggerAlertPopup={triggerAlertPopup} setTriggerAlertPopup={setTriggerAlertPopup}></AlertPopup>
				<ClipBoardPopup trigger2={trigger2} setTrigger2={setTrigger2}></ClipBoardPopup>
				<LeaveMeetingPopup trigger3={trigger3} setTrigger3={setTrigger3} trigger4={trigger4} setTrigger4={setTrigger4}></LeaveMeetingPopup>
			</div>
		</div>
	);
}

export default Controls;