import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {Cookies} from "react-cookie";
import {config} from "../settings";
import axios from 'axios';

function JoinMeetingPopup(props) {
	const navigate = useNavigate(); 
	const [channelId, setChannelId]= useState("");
	const [agoraToken, setToken]= useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const token = localStorage.getItem('token');


 	function joinMeeting() {
		axios.get(`http://127.0.0.1:8000/api/get_meeting/${channelId}/`, {
			headers: {
				'Authorization': `Token ${token}`
			}
		}).then(response => {
			//write here
			console.log("token is:" ,response.data.agora_token);
			if(response.data.agora_token === agoraToken){
				cookies.set("token", agoraToken);
				cookies.set("channel_name",response.data.channel_name );
				cookies.set("channel_id",channelId);
				cookies.set("status","participant");
				navigate("/Meeting");
			}
			else{
				alert("Invalid Meeting ID");
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
						<h2>Enter Meeting Info</h2><br></br>
					</center>
					<button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h5>Channel Name</h5>
						<input onChange={(e) => {setChannelId(e.target.value)}} className="form-control"/><br></br>
						<h5>Token</h5>
						<input onChange={(e) => {setToken(e.target.value)}} className="form-control"/><br></br>
					<center>
						<button onClick={() => joinMeeting()} className="btn btn-primary">Join</button>
					</center>	
						
					
				</div>
			</div>
		)
	}
	
	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
	);
}

export default JoinMeetingPopup;