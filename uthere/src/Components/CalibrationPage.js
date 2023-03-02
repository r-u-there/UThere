import { useState, useEffect } from "react";
import VideoCall from "./VideoCall";
import React from 'react';
import UThere from "./UThere";
import {
	useMicrophoneAndCameraTracks,
} from "../settings";

function CalibrationPage() {
	const [ state, setState] = useState([])
	const [ videocallstate, setVideoCall] = useState(false)
	const [ webgazerstate, setWebGazerState ] = useState(true)
	const counts = [0,0,0,0,0,0,0,0,0]
	var sumBoolean = false
	const { tracks} = useMicrophoneAndCameraTracks();
	const ready =true;
    const webgazer = window.webgazer
	webgazer.videoStreams =  tracks
	useEffect(() => {
		if(webgazerstate){
			webgazer.setGazeListener((data,clock)=>{
				//console.log(data,clock)
			}).begin();
			console.log("webgazer is created in" + window.location)
		}
		setWebGazerState(false)
	  }, [webgazerstate]);
	
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
		var sum =  counts[1] + counts [2]
					+ counts[3] + counts[4] + counts [5]
					+ counts[6] + counts[7] + counts [8]
		sumBoolean = (sum == 40)
		if(sumBoolean)
			setState([...state,sumBoolean])
	};
	function videocall(){
			webgazer.params.showVideo= false
			webgazer.params.mirrorVideo= false
			webgazer.params.showFaceOverlay= false
			webgazer.params.showFaceFeedbackBox= false
			webgazer.params.showVideoPreview=false
			const videocontainer = document.getElementById("webgazerVideoContainer");
			const video = document.getElementById("webgazerVideoFeed");
			const faceOverlay = document.getElementById("webgazerFaceOverlay");
			const feedbackBox = document.getElementById("webgazerFaceFeedbackBox");
			videocontainer.style.display = "none"
			video.style.display = "none";
			faceOverlay.style.display = "none"
			feedbackBox.style.display = "none"
			webgazer.pause();
			webgazer.resume();
			console.log("show video"+webgazer.params.showVideo)
			setVideoCall(true)
	}
	return (
		<div>
			<div className='page-background'>
				<div>
					{
						videocallstate ? <VideoCall webgazer= {webgazer} ready={ready} tracks={tracks}/>:
						sumBoolean != state ? <button onClick={videocall}>Continue</button> :	
						<div class="grid-container">
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