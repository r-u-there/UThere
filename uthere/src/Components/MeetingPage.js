import { useState} from "react";
import React from 'react';
import UThere from "./UThere";
import {Cookies} from "react-cookie";
import axios from "axios";
import { useLocation } from 'react-router-dom';

function MeetingPage() {
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	var response;

	async function isEyeTrackingHidden() {
		try {
			response = await axios.get(`http://127.0.0.1:8000/api/getsettings/${userId}/`)
		} catch(exception) {
			console.log(exception);
		};
		if (response.data.hide_eye_tracking) {
			window.location = "/MeetingWithoutCalibration";
		}
		else {
			window.location = "/Calibration"
		}
	}

	return (
		<div>
			<UThere notClickable={false}></UThere>
			<div className='page-background'></div>
			<div>{isEyeTrackingHidden()}</div>
		</div>
	);

}

export default MeetingPage;