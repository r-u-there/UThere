import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {Cookies} from "react-cookie";
import {config} from "../settings";
import axios from 'axios';

function CalibrationPopup(props) {
	const navigate = useNavigate(); 
	const cookies = new Cookies();
	const userId = cookies.get("userId");

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner-calibration">
					<br></br>
					<center>
						<h4>Please replace your face in the rectangle and click all buttons until they become black</h4><br></br>
					</center>
					<button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>			
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

export default CalibrationPopup;