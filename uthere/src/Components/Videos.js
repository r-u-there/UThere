import { AgoraVideoPlayer } from "agora-rtc-react";
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";

function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const [name, setName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	console.log("tracks " + tracks)

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
								<AgoraVideoPlayer videoTrack={user.videoTrack} key={user.uid} className='vid' />
							);
						}
						else {
							console.log(user.uid);
							return (
								<div key={user.uid} className='vid'>
									<center><h3 style={{color:"white"}}>{user.uid}</h3></center>
								</div>
							);
							console.log("no video");
						}
					})}
			</div>
		</div>
	);
}

export default Videos;