import { useState} from "react";
import React from 'react';
import UThere from "./UThere";
import {Cookies} from "react-cookie";
import axios from "axios";
import API from "./API";

function MeetingPage() {
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const token = localStorage.getItem('token');
	var response;

	async function isEyeTrackingHidden() {
		try {
			response = await API.get(`getsettings/${userId}/`, {
				  headers: { Authorization: `Token ${token}` }
			  });
		} catch(exception) {
			window.location = "/Login"
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