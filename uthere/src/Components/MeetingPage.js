import { useState } from "react";
import VideoCall from "./VideoCall";
import React from 'react';
import UThere from "./UThere";

function MeetingPage() {
	const [inCall, setInCall] = useState(true);
	return (
		<div>
			<UThere notClickable={false}></UThere>
			<div className='page-background'></div>
			<VideoCall setInCall={setInCall} />
		</div>
	);
}

export default MeetingPage;