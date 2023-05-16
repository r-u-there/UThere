import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Cookies} from "react-cookie";
import axios from 'axios';
import ErrorMessagePopup from './ErrorMessagePopup';
import API from "./API";

function ReminderPopup(props) {
    const cookies = new Cookies();
	const token = localStorage.getItem('token');
    const navigate = useNavigate(); 
    const [errorMessage, setErrorMessage] = useState("")
    const [trigger, setTrigger] = useState(false)

    function joinMeeting() {
		API.get(`get_meeting/${props.channelId}/`, {
			headers: {
				'Authorization': `Token ${token}`
			}
		}).then(response => {
			console.log("token is:" , response.data.agora_token);
			if (response.data.agora_token === props.agoraToken){
				cookies.set("token", props.agoraToken);
				cookies.set("channel_name", response.data.channel_name );
				cookies.set("channel_id", props.channelId);
				cookies.set("is_host", 0)
				cookies.set("status","participant");
				navigate("/Meeting");
			}
			else {
                props.setTrigger2(false)
                setErrorMessage("Invalid Meeting ID")
                setTrigger(true)
			}
		}).catch((exception) => {
			console.log(exception);
		});
	}

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>REMINDER!</h2>
					</center>
					<button type="button" onClick={() => props.setTrigger2(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<center><h5>You are about to join the meeting. Do you want to check your meeting preferences first?</h5></center>
					<center>
						<button onClick={() => joinMeeting()} className="btn btn-primary">Join Anyway</button>&emsp;
                        <button onClick={() => {props.setTrigger2(false); window.location="/Profile"}} className="btn btn-primary">Review Meeting Preferences</button>
					</center>	
				</div>
			</div>
		)
	}
	
	return (
		<div>
			{props.trigger2 === true ? insidePopup() : null}
            <ErrorMessagePopup errorMessage={errorMessage} setErrorMessage={setErrorMessage} trigger={trigger} setTrigger={setTrigger}></ErrorMessagePopup>
		</div>
	);
}

export default ReminderPopup;