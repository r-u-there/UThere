import { AgoraVideoPlayer } from "agora-rtc-react";
import React, {useEffect, useState} from 'react';
import {Cookies} from "react-cookie";
import API from "./API";
import { toast } from 'react-toastify';

function Videos(props) {
	const users = props.users;
	const tracks = props.tracks;
	const agorauid = props.agorauid;
	const setUsers = props.serUsers;
	const [name, setName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const token = localStorage.getItem("token");
	const status = cookies.get("status");
	const [trigger, setTrigger] = useState(true);
	const [isScreenShare,setIsScreenShare] = useState(false)
	const [showPopup, setShowPopup] = useState(true);
	const [usersData, setUsersData] = useState([]);
	console.log(users);
	
	async function checkUserIsScreenShare(arg) {
		try {
			const response = await API.put(`get_screenshare_table/`, {
				"channelId": channelId,
				"agora_id": arg
			}, {
				headers: { Authorization: `Token ${token}` }
			});
			if (response.data.hasOwnProperty('status') && response.data.status === 'Not Screenshare') {
				console.log('false');
				return false;
			} else {
				console.log('true');
				return true;
			}
		} catch (exception) {
			console.log(exception);
			return false; // or throw the error if you want to handle it elsewhere
		}
	}
	

	async function getMeetingUser(arg) {
		try {
		  console.log("arg is " + arg);
		  const response = await API.get(`get_meeting_participant/${arg}/`, {
			headers: { Authorization: `Token ${token}` }
		  });
		  console.log(response);
		  const participant_user_id = response.data.user;
		  console.log(participant_user_id);
		  const userResponse = await API.get(`http://127.0.0.1:8000/api/get_user_info/${participant_user_id}/`, {
			headers: { Authorization: `Token ${token}` }
		  })
		  console.log(userResponse.data.username);
		  setParticipantName(userResponse.data.username);
		  return userResponse.data.username;
		} catch (error) {
		  console.log("error", error);
		}
	  }
	  
	useEffect(() =>{
		if(status === "presenter"){
			//trigger attention popup
			setTrigger(true);
		}

	},[status])
	useEffect(() => {
		const fetchData = async () => {
			const newData = [];
			for (const user of users) {
				if (user.videoTrack) {
					const isScreenShare = await checkUserIsScreenShare(user.uid);
					console.log(isScreenShare + " " + user.uid)
					if (!isScreenShare) {
						const participantName = await getMeetingUser(user.uid);
						console.log(participantName + " " + user.uid)
						console.log(participantName)
						newData.push({ uid: user.uid, participantName:participantName, isScreenShare, video:user.videoTrack });
					} else {
						newData.push({ uid: user.uid, participantName: "ScreenShare", isScreenShare,video:user.videoTrack });
					}
				} else {
					const isScreenShare = await checkUserIsScreenShare(user.uid);
					if (!isScreenShare) {
						const participantName = await getMeetingUser(user.uid);
						console.log(user);
						//api to check left or not
						/*const response = await API.put(`is_user_left/`, {
							"channelId": channelId,
							"agora_id": user.uid
						}, {
							headers: { Authorization: `Token ${token}` }
						});
						if(!response.data.status){*/
							newData.push({ uid: user.uid, participantName: participantName, isScreenShare: false });
						//}
	
					} else {
						newData.push({ uid: user.uid, participantName: "ScreenShare", isScreenShare:true});
					}	
				}
			}
			
			setUsersData(newData);
			console.log(newData);
		};
		fetchData();
	}, [users,users.map(user => user.videoTrack).join(),users.map(user => user.uid).join()]);
	
	useEffect(()=>{
		setShowPopup(status==="presenter")
		console.log(status);
	},[status])
	useEffect(() => {
		API.get(`user/info/${userId}/`, {
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
					usersData.length > 0 &&
					usersData.map((userData) => {
						console.log(users);
						const { uid, participantName, isScreenShare, video } = userData;
						if (video) {
							console.log(isScreenShare);
							if(!isScreenShare){
								console.log(1 +" "+ uid)
								return (
									<div className="vid">
										<AgoraVideoPlayer className="vid" id = "play" videoTrack={video} key={uid}/>
										<div className='video-label-container'>
											<span className='video-label'>{participantName}</span>
										</div>
									</div>
								);
								
							}
							else {
								console.log(2 +" "+ uid);
								return (
									<div>
										<AgoraVideoPlayer className="vid2" id = "play" videoTrack={video} key={uid}/>
									</div>
								);	
							}
						}
						else {
							if (!isScreenShare) {
								console.log(3 +" "+ uid);
								return (
									<div key={uid} className='vid'>
										<div className='video-label-container'>
											<span className='video-label'>{participantName}</span>
										</div>
									</div>
								);
							}
							else {
								console.log(4 +" "+ uid)
								console.log("kapadın")
								return(<div></div>);
							}	
						}
					})}
			</div> 		
		</div>
	);
}

export default Videos;