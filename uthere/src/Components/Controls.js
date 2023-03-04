import { useState } from "react";
import { useClient } from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5'
import { Link } from 'react-router-dom';
import ParticipantsPopup from "./ParticipantsPopup";
import MeetingEnding from "./MeetingEnding";

function Controls(props) {
	const client = useClient();
	const { tracks, setStart, setInCall, users } = props;
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [trigger, setTrigger] = useState(false);

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
		await client.leave();
		client.removeAllListeners();
		tracks[0].close();
		tracks[1].close();
		setStart(false);
		setInCall(false);
	};

	function showParticipantsList() {

	}

	return (
		<div className="meeting-control-panel">
			<div className="meeting-controls">
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
	);
}

export default Controls;