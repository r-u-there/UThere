import {useEffect, useRef, useState} from "react";
import { channelName, useClient } from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5'
import {Cookies} from "react-cookie";
import {Link, useNavigate} from 'react-router-dom';
import ParticipantsPopup from "./ParticipantsPopup";
import ClipBoardPopup from "./ClipBoardPopup";
import AlertPopup from "./AlertPopup";
import LeaveMeetingPopup from "./LeaveMeetingPopup";
import {MdScreenShare, MdStopScreenShare,MdOutlineContentCopy} from "react-icons/md"
import axios from "axios";
const token = localStorage.getItem('token');




function Controls(props) {
	const client = useClient();
	const { tracks, setStart,  webgazer, users } = props;
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [trigger, setTrigger] = useState(false);
	const [trigger2, setTrigger2] = useState(false);
	const [trigger3, setTrigger3] = useState(false);
	const [trigger4, setTrigger4] = useState(false);
	let alertNum = "0"
	const [triggerAlertPopup, setTriggerAlertPopup] = useState(false)
	
	const navigate = useNavigate();
	const videoRef = useRef()
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id")
	const status = cookies.get("status")
	const [screenSharing, setScreenSharing] = useState(0);
	let stream;

	const shareScreen = async () => {
		try {
			stream = await navigator.mediaDevices.getDisplayMedia({
				audio: true,
				video: {
					cursor: "always"
				}
			})
			setScreenSharing(1);
			console.log(stream.active)
			videoRef.current.srcObject = stream
		}
		catch (err) {
			setScreenSharing(0);
			console.log(err);
		}
	}

	const stopShareScreen = () => {
		setScreenSharing(0);
		let tracks = videoRef.current.srcObject.getTracks();
		tracks.forEach((t) => {t.stop();})
		videoRef.current.srcObject = null;
	}

	const copyLink = () => {
		const channelId = cookies.get("channel_id")
		const token = cookies.get("token")
		const text = "Channel Id: " + channelId + "\nToken: " + token
		navigator.clipboard.writeText(text);
		setTrigger2(true)
	}

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
				if(props.webgazer != null){
					props.webgazer.pause();
					props.webgazer.end();
					window.localStorage.removeItem('webgazerGlobalData');
					window.localStorage.removeItem('webgazerUserdata');
					window.localStorage.removeItem('webgazerVideoContainer');
					console.log("closed")
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
				cookies.remove("token")
				cookies.remove("channel_name")
				cookies.remove("channel_id")
				cookies.remove("status")
				window.location.href ="/Dashboard"
			}
		};
		if(trigger3 || trigger4){
			leaveChannel()
		}
	  }, [trigger3,trigger4]);
	  useEffect(() => {
		const checkRemovedValue = () => {
			console.log(token)
			axios.put('http://127.0.0.1:8000/api/user_meeting_get_info/', {
				"userId": userId,
				"channelId": channelId
			  }, {
				headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				console.log(response.data);
				if(response.data.is_removed == 1){
					setTrigger4(true)
				}
				if(response.data.is_presenter == 1){
					cookies.set("status","presenter")
				}
				if(response.data.is_presenter == 0){
					cookies.set("status","participant")
				}
				console.log(response.data.alert_num)
				console.log(alertNum)
				if(response.data.is_presenter == 0 && response.data.alert_num !== alertNum){
					console.log("burası")
					console.log(response.data.alert_num)
					console.log(typeof(alertNum))
					console.log(alertNum)
					alertNum =response.data.alert_num
					console.log(alertNum)
					setTriggerAlertPopup(true)
				}
			}).catch((exception) => {
				console.log(exception);
			});
		};
	
		// Set the interval to check the value every 1 seconds
		const intervalId = setInterval(checkRemovedValue, 5000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
		
	}, [])



	return (
		<div>
			<video width={800} height={800} ref={videoRef} autoPlay/>
			<div className="meeting-controls">
				<div className="meeting-control">
					{screenSharing === 0 ? 
					<button onClick={() => {shareScreen()}}><div><MdScreenShare size={30} /><br></br><label>Share Screen</label></div></button> :
					<button onClick={() => {stopShareScreen()}}><div><MdStopScreenShare size={30} /><br></br><label>Stop Sharing</label></div></button>}
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