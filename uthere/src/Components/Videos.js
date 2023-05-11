import { AgoraVideoPlayer } from "agora-rtc-react";
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";
import AttentionAnalysisPopup from "./AttentionAnalysisPopup";

function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const agorauid = props.agorauid
	const [name, setName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const token = localStorage.getItem("token");
	const status = cookies.get("status")
	const [trigger, setTrigger] = useState(true)
	const [isScreenShare,setIsScreenShare] = useState(false)
	const [showPopup, setShowPopup] = useState(true);

	async function checkUserIsScreenShare(arg){
		const response = await axios.put(`http://127.0.0.1:8000/api/get_screenshare_table/`,
		{
			"channelId": channelId,
			"agora_id": arg
		},
		{
			headers: { Authorization: `Token ${token}` }
		})
		.then(response=>{
			console.log(response)
			if(response.data.hasOwnProperty('status') && response.data.status==='Not Screenshare'){
				//it is a user
				console.log('not screenshare ' + arg)
				setIsScreenShare(false)
			}
			else{
				//it is a screenshare
				console.log('screenshare  ' +arg)
				setIsScreenShare(true)
			}
		}).catch((exception) => {
			console.log(exception);
		});
	}

	async function getMeetingUser(arg) {
        try {
			console.log("arg is " + arg)
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_participant/${arg}/`, {
				  headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				console.log(response)
			}).catch((exception) => {
				console.log(exception);
			});
			let participant_user_id = response.data.user  
			axios.get(`http://127.0.0.1:8000/api/user/info/${participant_user_id}/`, {
				  headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				setParticipantName(response.data.username);
			}).catch((exception) => {
				console.log(exception);
			});
        } catch (error) {
            console.log("error", error);
        }
    }
	useEffect(() =>{
		if(status === "presenter"){
			//trigger attention popup
			setTrigger(true)
		}

	},[status])

	useEffect(()=>{
		setShowPopup(status==="presenter")
		console.log(status)
	},[status])
	useEffect(() => {
		axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`, {
				  headers: { Authorization: `Token ${token}` }
			  }).then(response => {
			setName(response.data.username);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [])

	return (
		<div>
			<div >
				<div>
					<AgoraVideoPlayer id={userId} videoTrack={tracks[1]} className="vid"/>
					<div className='video-label-container'>
						<span className='video-label'>{name}</span>
					</div>
				</div>
				{
					users.length > 0 &&
					users.map((user) => {
					
						if (user.videoTrack) {
							checkUserIsScreenShare(user.uid)
							console.log(isScreenShare)
							if(!isScreenShare){
								getMeetingUser(user.uid);
								return (
									<div className="vid">
										<AgoraVideoPlayer className="vid" id = "play" videoTrack={user.videoTrack} key={user.uid}/>
										<div className='video-label-container'>
											<span className='video-label'>{participantName}</span>
										</div>
									</div>
								);
								
							}
							else{
								return (
									<div className="vid">
										<AgoraVideoPlayer className="vid" id = "play" videoTrack={user.videoTrack} key={user.uid}/>
										<div className='video-label-container'>
											<span className='video-label'>ScreenShare</span>
										</div>
									</div>
								);
								
							}
						
						}
						else {
							checkUserIsScreenShare(user.uid)
							if(!isScreenShare){
								getMeetingUser(user.uid);
								return (
									<div key={user.uid} className='vid'>
										<div className='video-label-container'>
											<span className='video-label'>{participantName}</span>
										</div>
									</div>
								);
							}
							else{
								console.log("kapadın")
								return<div></div>;
							}
							
						}
					})}
			</div> 		
		</div>
	);
}

export default Videos;