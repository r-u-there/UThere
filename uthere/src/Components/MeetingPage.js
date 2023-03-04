import { useState, useEffect } from "react";
import Calibration from "./CalibrationPage";
import React from 'react';
import UThere from "./UThere";
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';
function MeetingPage() {
	const navigate = useNavigate();
	const [eyeTracking, setEyeTracking] = useState(true);
	if(eyeTracking){
		window.location = "/Calibration"
	}
	else{
		window.location = "/VideoCall"
	}
	
	return (
		<div>
			<UThere notClickable={false}></UThere>
			<div className='page-background'></div>
		</div>
	);
}

export default MeetingPage;