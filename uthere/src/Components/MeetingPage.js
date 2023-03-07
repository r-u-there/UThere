import { useState, useEffect, useCallback } from "react";
import Calibration from "./CalibrationPage";
import React from 'react';
import UThere from "./UThere";
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';
import {Cookies} from "react-cookie";
import axios from "axios";
import {
	useMicrophoneAndCameraTracks,
} from "../settings";
import VideoCall from "./VideoCall";

function MeetingPage() {
	const [hideEyeTracking, setHideEyeTracking] = React.useState(false);
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	useEffect(() => {
		axios.get(`http://127.0.0.1:8000/api/getsettings/${userId}/`)
		  .then(response => {
			setHideEyeTracking(response.data.hide_eye_tracking);
		  })
		  .catch((exception) => {
			console.log(exception);
		  });
	  }, []);

		return (
			<div>
				<UThere notClickable={false}></UThere>
				<div className='page-background'></div>
				<div>	{
					hideEyeTracking ? window.location='/MeetingWithoutCalibration': window.location='/Calibration'
				}</div>
			
			</div>
		);

}

export default MeetingPage;