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
						<h4>Please replace your face in the rectangle and click all buttons until they all become black</h4>
						<button type="button" className="mt-3 btn btn-danger" onClick={() => props.setTrigger(false)}>OK</button>
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

export default CalibrationPopup;