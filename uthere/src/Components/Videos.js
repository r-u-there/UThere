import { AgoraVideoPlayer } from "agora-rtc-react";
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";

function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const agorauid = props.agorauid
	const [name, setName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	async function getMeetingUser(arg) {
		try {
    	const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_participant/${arg}/`);
			let participant_user_id = response.data.user  
			axios.get(`http://127.0.0.1:8000/api/user/info/${participant_user_id}/`).then(response => {
				setParticipantName(response.data.username);
			}).catch((exception) => {
				console.log(exception);
			});
		} catch (error) {
			console.log("error", error);
		}
	}

	useEffect(() => {
		axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`).then(response => {
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
						console.log("here")
						if (user.videoTrack) {
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
						else {
							getMeetingUser(user.uid);
							return (
								<div key={user.uid} className='vid'>
									<div className='video-label-container'>
										<span className='video-label'>{participantName}</span>
									</div>
								</div>
							);
						}
					})}
			</div>
		</div>
	);
}

export default Videos;
