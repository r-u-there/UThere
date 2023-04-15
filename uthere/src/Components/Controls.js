import {useRef, useState} from "react";
import { useClient } from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5'
import {Link, useNavigate} from 'react-router-dom';
import ParticipantsPopup from "./ParticipantsPopup";
import {MdScreenShare, MdStopScreenShare} from "react-icons/md"

function Controls(props) {
	const client = useClient();
	const { tracks, setStart,  webgazer, users } = props;
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [trigger, setTrigger] = useState(false);
	const navigate = useNavigate();
	const videoRef = useRef()
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

	const leaveChannel = async () => {
		props.webgazer.pause();
		props.webgazer.end();
		window.localStorage.removeItem('webgazerGlobalData');
		window.localStorage.removeItem('webgazerUserdata');
		window.localStorage.removeItem('webgazerVideoContainer');
		console.log("closed")
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
	};

	return (
		<div>
			<video width={800} height={800} ref={videoRef} autoPlay/>
			<div className="meeting-controls">
				<div className="meeting-control">
					{screenSharing === 0 ? <button onClick={() => {shareScreen()}}><div><MdScreenShare size={30} /><br></br><label>Share Screen</label></div></button> :
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
					{/*
					The following line of code will be changed.
					For now, it directs the user to Dashboard page, but it should direct to MeetingEnding page.
					The participants list should be recorded to database in order to be able to retrieve the list and show on the screen.
				*/}
					<Link to="/Dashboard" state={{data: users}}><button onClick={() => {leaveChannel()}}><div><IoCloseCircleOutline size={30} /><br></br><label>Leave Meeting</label></div></button></Link>
				</div>
				<ParticipantsPopup trigger={trigger} users={users} setTrigger={setTrigger}></ParticipantsPopup>
			</div>
		</div>
	);
}

export default Controls;