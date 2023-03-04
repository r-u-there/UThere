import { AgoraVideoPlayer } from "agora-rtc-react";
import React from 'react';
import useEffect from 'react';


function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	console.log("tracks " + tracks)
	return (
		<div>
			<div>
				<AgoraVideoPlayer videoTrack={tracks[1]} className='vid' />
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