import { useState, useEffect, useCallback } from "react";
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

function MeetingWithoutCalibration() {
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const { tracks} = useMicrophoneAndCameraTracks();
	const ready =true;

	return (
		<div>
			<UThere notClickable={false}></UThere>
			<div className='page-background'>
				<div>
					<VideoCall webgazer={null} ready={ready} tracks={tracks}/>
				</div>
			</div>

		</div>
	);

}

export default MeetingWithoutCalibration;