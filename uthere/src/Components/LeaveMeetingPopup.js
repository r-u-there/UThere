import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {Cookies} from "react-cookie";
import {config} from "../settings";
import axios from 'axios';

function LeaveMeetingPopup(props) {
	const navigate = useNavigate(); 
	const [token, setToken]= useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>Are you sure you want to leave the meeting? </h2><br></br>
					</center>
					<button type="button" onClick={() => props.setTrigger3(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<center>
						<button onClick={() => props.setTrigger4(true)} className="btn btn-primary">Leave</button>
                        <button onClick={() => props.setTrigger3(false)} className="btn btn-primary">Return to Meeting</button>
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