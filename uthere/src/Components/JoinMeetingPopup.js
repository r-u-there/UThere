import React from 'react';
import { useState } from 'react';
import ReminderPopup from './ReminderPopup';

function JoinMeetingPopup(props) {
	const [channelId, setChannelId]= useState("");
	const [agoraToken, setToken]= useState("");
	const [trigger2, setTrigger2] = useState(false);

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>Enter Meeting Info</h2><br></br>
					</center>
					<button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h5>Channel Name</h5>
					<input onChange={(e) => {setChannelId(e.target.value)}} className="form-control"/><br></br>
					<h5>Token</h5>
					<input onChange={(e) => {setToken(e.target.value)}} className="form-control"/><br></br>
					<center>
						<button onClick={() => {props.setTrigger(false); setTrigger2(true)}} className="btn btn-primary">Join</button>
					</center>	
				</div>
			</div>
		)
	}
	
	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
			<ReminderPopup channelId={channelId} agoraToken={agoraToken} trigger2={trigger2} setTrigger2={setTrigger2}></ReminderPopup>

		</div>
	);
}

export default JoinMeetingPopup;