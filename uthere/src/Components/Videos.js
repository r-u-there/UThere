import { AgoraVideoPlayer } from "agora-rtc-react";
import React from 'react';
import useEffect from 'react';


function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const webgazer = props.webgazer;
	console.log("tracks " + tracks)
	return (
		<div>
			<div className="meeting-window ">
				<AgoraVideoPlayer videoTrack={tracks[1]} className='vid' />
				{               
					users.length > 0 &&
					users.map((user) => {
						console.log("here")
						if (user.videoTrack) {
							return (
								<AgoraVideoPlayer videoTrack={user.videoTrack} key={user.uid} className='vid' />
							);
						} else return null;
					})}
			</div>
		</div>
	);
}

export default Videos;