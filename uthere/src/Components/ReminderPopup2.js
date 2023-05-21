import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Cookies} from "react-cookie";
import axios from 'axios';
import ErrorMessagePopup from './ErrorMessagePopup';
import API from "./API";
import {
	config,
} from "../settings";

function ReminderPopup2(props) {
    const cookies = new Cookies();
	const token = localStorage.getItem('token');
    const navigate = useNavigate(); 
    const [errorMessage, setErrorMessage] = useState("")
    const [trigger, setTrigger] = useState(false)
    const [meetingId, setMeetingId] = useState("");


    async function createMeetingAndUser() {
		try {
			  const createMeetingResponse = await API.post('create_meeting/', {
				"appId": config.appId,
				"certificate": config.certificate,
				"role": 2,
				"privilegeExpiredTs": 36000000
			  },
				  {
					headers: { Authorization: `Token ${token}` }
				});
			  // Handle the response data
			console.log(createMeetingResponse.data);
			console.log(createMeetingResponse.data);
			console.log(createMeetingResponse.data.agora_token);
			console.log("channel name is " + createMeetingResponse.data.channel_name);
			cookies.set("token", createMeetingResponse.data.agora_token);
			cookies.set("channel_name", createMeetingResponse.data.channel_name);
			cookies.set("channel_id", createMeetingResponse.data.id);
			cookies.set("is_host", 1);
			cookies.set("status", "presenter");
			setMeetingId(createMeetingResponse.data.id);
			console.log("1- " + createMeetingResponse.data.id);
            window.location="/Meeting";
            props.setTrigger2(false);
            
		} catch (exception) {
			console.log(exception);
		}
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
						<center><h5>You are about to create the meeting. Do you want to check your meeting preferences first?</h5></center>
					<center>
                        <button onClick={() => {createMeetingAndUser(); }} className="btn btn-primary">Create Anyway</button>&emsp;
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

export default ReminderPopup2;