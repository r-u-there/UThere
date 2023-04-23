import { AgoraVideoPlayer } from "agora-rtc-react";
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";

function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const agorauid = props.agorauid
	const [name, setName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	console.log("tracks " + tracks)
	async function getMeetingUser(arg) {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_participant/${arg}/`);
			console.log(response)   
			let participant_user_id = response.data.user  
			axios.get(`http://127.0.0.1:8000/api/user/info/${participant_user_id}/`).then(response => {
				console.log("adı şu")
				console.log(response)
				return <div>{response.data.username}</div>
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
			<div>
				<AgoraVideoPlayer videoTrack={tracks[1]} className='vid' />
				<div className='video-label-container'>
					<span className='video-label'>{name}</span>
				</div>
				{
					users.length > 0 &&
					users.map((user) => {
						console.log("here")
						if (user.videoTrack) {
							return (
								<AgoraVideoPlayer id = "play" videoTrack={user.videoTrack} key={user.uid} className='vid' />
							);
						}
						else {
							return (
								<div key={user.uid} className='vid'>
									<center><h3 style={{color:"white"}}>{()=>getMeetingUser(user.uid)}</h3></center>
								</div>
							);
						}
					})}
			</div>
		</div>
	);
}

export default Videos;
