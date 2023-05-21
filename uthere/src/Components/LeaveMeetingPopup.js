import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Cookies } from "react-cookie";
import { config } from "../settings";
import axios from 'axios';
import MeetingEnding from './MeetingEnding';
import API from "./API";

function LeaveMeetingPopup(props) {
	const tracks = props.tracks
	const trackState = props.trackState
	const setTrackState = props.setTrackState
	const navigate = useNavigate();
	const token = localStorage.getItem('token');
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const is_Host = cookies.get("is_host")
	console.log(is_Host)
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
		props.setTrigger4(true)
	};
	//when end meeting for all, write end meeting time to the database
	const endMeeting = async () => {
		API.put(`end_meeting_table/`, {
			"channelId": channelId,
		}, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		window.location="/MeetingEnding"
		props.setTrigger5(true)
		
	}

	function insidePopup() {
		return (
			<div className="popup2">
				<div className="popup-inner2">
					<br></br>
					<center>
						<h2>Are you sure you want to leave the meeting? </h2>
					</center>
					<button type="button" onClick={() => props.setTrigger3(false)} className="popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<center>
						{is_Host == 1? <button onClick={() => {endMeeting()}} className="btn btn-primary">End Meeting For All</button>: 
						 <button onClick={() => {mute("video") }} className="btn btn-primary">Leave</button>
						 }
                        <button onClick={() => props.setTrigger3(false)} className="btn btn-primary"  style={{ marginLeft: '10px' }}>Return to Meeting</button>
					</center>			
				</div>
			</div>
		)
	}

	return (
		<div>
			{props.trigger3 === true ? insidePopup() : null}
		</div>
	);
}

export default LeaveMeetingPopup;