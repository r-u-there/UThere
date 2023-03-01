import { useState } from "react";
import { useClient } from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Controls(props) {
	const client = useClient();
	const { tracks, setStart, setInCall } = props;
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const navigate = useNavigate();
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
		tracks[0].stop();
		tracks[1].stop();
		tracks[0].close();
		tracks[1].close();
		setStart(false);
		setInCall(false);
	};

	return (
		<div className="meeting-control-panel">
			<div className="meeting-controls">
				<button onClick={() => mute("video")}>
					{trackState.video ? <div><BsCameraVideo size={30} /><br></br><label>Turn Off</label></div> :
						<div><BsCameraVideoOff size={30} /><br></br><label>Turn On</label></div>}
				</button>
				<button onClick={() => mute("audio")}>
					{trackState.audio ? <div><BsMic size={30} /><br></br><label>Mute</label></div> :
						<div><BsMicMute size={30} /><br></br><label>Unmute</label></div>}
				</button>
				{<Link to="/Dashboard"><button onClick={() => leaveChannel()}><div><IoCloseCircleOutline size={30} /><br></br><label>Leave Meeting</label></div></button></Link>}
			</div>
		</div>
	);
}

export default Controls;