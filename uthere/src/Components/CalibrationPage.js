import { useState } from "react";
import VideoCall from "./VideoCall";
import React from 'react';
import UThere from "./UThere";
import {
	useMicrophoneAndCameraTracks,
} from "../settings";

function CalibrationPage(props) {
	const [ state, setState] = useState([])
	const [ videocallstate, setVideoCall] = useState(false)
	const counts = [0,0,0,0,0,0,0,0,0]
	var sumBoolean = false
	const { ready, tracks} = useMicrophoneAndCameraTracks();
	const webgazer = window.webgazer
	webgazer.videoStreams =  tracks
	webgazer.params.showVideo= false
	webgazer.params.mirrorVideo= false
	webgazer.params.showFaceOverlay= false
	webgazer.params.showFaceFeedbackBox= false
	webgazer.params.showVideoPreview=false
	webgazer.setGazeListener((data,clock)=>{
		//console.log(data,clock)
	}).begin();
	const  setInCall = props;
	const buttonChange = async (buttonNum) => {
		var button = document.getElementById(buttonNum.toString());
		if(counts[buttonNum-1] < 5 && !button.style.disabled){ //change the color of the button
			switch(counts[buttonNum-1]) {
				case 0:
					button.style.backgroundColor = "#ffe2ae"
					break;
				case 1:
					button.style.backgroundColor = "#ffd079"
					break;
				case 2:
					button.style.backgroundColor = "#ffbb3c"
					break;
				case 3:
					button.style.backgroundColor = "#ffa500"
					break;
				default:
					button.style.backgroundColor = "#ffa500"
					break;
			  }
			counts[buttonNum-1] = counts[buttonNum-1] + 1
		}
		else{ //disabled the button
			button = document.getElementById(buttonNum.toString());
			button.style.backgroundColor = "#ffa500"
			button.style.disabled=true
			button.style.backgroundColor = "#000000"
		}
		var sum = counts[0] + counts[1] + counts [2]
					+ counts[3] + counts[4] + counts [5]
					+ counts[6] + counts[7] + counts [8]
		sumBoolean = (sum == 45)
		if(sumBoolean)
			setState([...state,sumBoolean])
	};
	function videocall(){
		setVideoCall(true)
	}
	return (
		<div>
			<div className='page-background'>
				<div>
					{
						videocallstate ? <VideoCall setInCall={setInCall} webgazer={webgazer} ready={ready} tracks={tracks}/>:
						sumBoolean != state ? <button onClick={videocall}>Continue</button> :	
						<div class="grid-container">
							<div class="grid-item">
								<button id= "1" class="calibration-button-1" onClick={() => buttonChange(1)}></button>
							</div>
							<div class="grid-item">
								<button id="2" class="calibration-button-2" onClick={() => buttonChange(2)}></button>
							</div>
							<div class="grid-item">
								<button id="3" class="calibration-button-3"  onClick={() => buttonChange(3)}></button>
							</div>
							<div class="grid-item">
								<button id="4" class="calibration-button-4"  onClick={() => buttonChange(4)}></button>
							</div>
							<div class="grid-item">
								<button id="5" class="calibration-button-5"  onClick={() => buttonChange(5)}></button>
							</div>
							<div class="grid-item">
								<button id="6" class="calibration-button-6"  onClick={() => buttonChange(6)}></button>
							</div> 
							<div class="grid-item">
								<button id="7" class="calibration-button-7"  onClick={() => buttonChange(7)}></button>
							</div>  
							<div class="grid-item">
								<button id="8" class="calibration-button-8"  onClick={() => buttonChange(8)}></button>
							</div>  
							<div class="grid-item">
								<button id="9" class="calibration-button-9"  onClick={() => buttonChange(9)}></button>
							</div>  
						</div>
					}
				</ div>
			</div>
			<UThere></UThere>
		</div>
	);
}

export default CalibrationPage;