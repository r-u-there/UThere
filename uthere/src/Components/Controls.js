/*jshint esversion: 9 */

import {useEffect, useRef, useState} from "react";
import {useClient} from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5';
import {Cookies} from "react-cookie";
import {Link, useNavigate} from 'react-router-dom';
import ParticipantsPopup from "./ParticipantsPopup";
import ClipBoardPopup from "./ClipBoardPopup";
import AlertPopup from "./AlertPopup";
import LeaveMeetingPopup from "./LeaveMeetingPopup";
import {MdScreenShare, MdStopScreenShare,MdOutlineContentCopy} from "react-icons/md";
import axios from "axios";
import {
	config,
	channelName
} from "../settings";
import AgoraRTC from 'agora-rtc-react';
import AttentionAnalysisPopup from "./AttentionAnalysisPopup";
const token = localStorage.getItem('token');

function Controls(props) {
	const client = useClient();
	const { tracks, setStart,  webgazer, users, trackState, setTrackState } = props;
	const [trigger, setTrigger] = useState(false);
	const [trigger2, setTrigger2] = useState(false);
	const [trigger3, setTrigger3] = useState(false);
	const [trigger4, setTrigger4] = useState(false);
	const [trigger5, setTrigger5] = useState(false);
	let alertNum = "0";
	const [triggerAlertPopup, setTriggerAlertPopup] = useState(false);
	const navigate = useNavigate();
	const videoRef = useRef();
	const cookies = new Cookies();
	const agora_token = cookies.get("token");
	const agora_id = cookies.get("agora_uid")
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const status = cookies.get("status");
	const [screenSharing, setScreenSharing] = useState(0);
	let stream;
	const is_host = cookies.get("is_host")
	const channelName = cookies.get("channel_name");
	const [isSharingEnabled, setIsSharingEnabled] = useState(false);
	const [channelParameters, setChannelParameters] = useState({
		screenTrack: null,
		localVideoTrack: null,
	  });
	const [toggle1, setToggle1] = useState();
	const [toggle2, setToggle2] = useState();
	const [toggle3, setToggle3] = useState();
	const [toggle4, setToggle4] = useState();
	const [toggle5, setToggle5] = useState();
	const [toggle6, setToggle6] = useState();
	const [attentionRatingLimit, setAttentionRatingLimit] = useState("");
	//const [peopleLeft,setPeopleLeft] = useState(-1)
	//const [notified, setNotified] = useState(false)
	let peopleLeft = -1

	const copyLink = () => {
		const channelId = cookies.get("channel_id");
		const text = "Channel Id: " + channelId + "\nToken: " + agora_token;
		navigator.clipboard.writeText(text);
		setTrigger2(true);
	};

	const mute = async (type) => {
		if (type === "audio") {
			await tracks[0].setEnabled(!trackState.audio);
			setTrackState((ps) => {
				return { ...ps, audio: !ps.audio };
			});
		} else if (type === "video") {
			await tracks[1].setEnabled(!trackState.video);
			setTrackState((ps) => {
				return { ...ps, video: !ps.video };
			});
		}
	};
	useEffect(() => {
		
		const leaveChannel = async () => {
			//check whether the user is presenter currently, if it is change its
			//end time in presenter table
			if(status==="presenter"){
				//enter end time to the presenter table for this user
				axios.put(`http://127.0.0.1:8000/api/unset_presenter_meeting/`, {
					"userId": userId,
					"channelId": channelId, 
					"agoraToken":agora_id
				},{
					headers: { Authorization: `Token ${token}` }
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
				axios.put(`http://127.0.0.1:8000/api/end_time_presenter_table/`, {
					"userId": userId,
					"channelId": channelId,
					"id":0
				},{
					headers: { Authorization: `Token ${token}` },
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
			}
			if(trigger5){
				//remove everyone from the meeting
				axios.put(`http://127.0.0.1:8000/api/remove_all_user/`, {
				  "channelId": channelId
				}, {
				  headers: { Authorization: `Token ${token}` }
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
			}
			if(trigger4||trigger5){
		
				if(props.webgazer !== null){
					props.webgazer.pause();
					props.webgazer.end();
					window.localStorage.removeItem('webgazerGlobalData');
					window.localStorage.removeItem('webgazerUserdata');
					window.localStorage.removeItem('webgazerVideoContainer');
					console.log("closed");
				}
		
				client.removeAllListeners();
				if (tracks) {
			
					console.log(tracks[0])
					tracks[0].stop();
					tracks[1].stop();
					// Get the camera device
					const cameras = await navigator.mediaDevices.enumerateDevices();
					const camera = cameras.find((device) => device.kind === "videoinput");
	
					// Turn off the camera by setting the deviceId to null
					await navigator.mediaDevices.getUserMedia({
						video: { deviceId: camera ? { exact: camera.deviceId } : undefined, enabled: false },
					});
			
				}
				tracks[0].close();
				tracks[1].close();
				setStart(false);
				//clean meeting related cookies
		
				//add the left meeting info in database
				if(!trigger5){
					axios.put(`http://127.0.0.1:8000/api/user_left_meeting/`, {
						"userId": userId,
						"channelId": channelId,
						"agoraId": agora_id
						}, {
						headers: { Authorization: `Token ${token}` }
						}).then(response => {
							console.log(response);
						}).catch((exception) => {
							console.log(exception);
						});
				
					}
					cookies.remove("agora_uid");
					cookies.remove("token");
					cookies.remove("channel_name");
					cookies.remove("channel_id");
					cookies.remove("status");

				window.location.href ="/Dashboard";
			}
		};
		if(trigger3 || trigger4|| trigger5){
			leaveChannel();
		}
	  }, [trigger3,trigger4,trigger5]);
	  useEffect(async () => {
		const checkRemovedValue = async () => {
			console.log(agora_token);
			axios.put('http://127.0.0.1:8000/api/user_meeting_get_info/', {
				"userId": userId,
				"channelId": channelId,
				"agoraToken": cookies.get("agora_uid")
			  }, {
				headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				console.log(response.data);
				if(response.data.is_removed == 1){
					setTrigger4(true);
				}

				if(response.data.is_presenter == 1){
					cookies.set("status","presenter");
					//check who left the meeting
					//check the settings of the presenter first
					axios.get(`http://127.0.0.1:8000/api/getsettings/${userId}/`, {
							headers: { Authorization: `Token ${token}` }
						}).then(response => {
						console.log(response);
						if(!response.data.hide_who_left){
							//continue to check 
							axios.get(`http://127.0.0.1:8000/api/check_departures/${channelId}/`, {
								headers: { Authorization: `Token ${token}` }
									}).then(response => {
								if(response.data.length != 0){
									if(response.data.user !== peopleLeft){
										//if the user left_time is before my presenter start time do not alert
										let user_left_time= response.data.left_time
										let left_people_id = response.data.user
										//get my presenter start_time
										axios.put(`http://127.0.0.1:8000/api/get_presenter_table/`,
										{
											"channelId": channelId,
											"userId":userId
										},
										{
											headers: { Authorization: `Token ${token}` }
										}).then(response=>{
											const date_user_left = new Date(user_left_time)
											const date_presenter_start = new Date(response.data.start_time)
											if(date_presenter_start < date_user_left){
												alert("user " +response.data.user+ "left")
												peopleLeft= left_people_id;	
											}
										}).catch((exception) => {
											console.log(exception);
										});
									}
								}
							}).catch((exception) => {
								console.log(exception);
							});
						}
					
					}).catch((exception) => {
						console.log(exception);
					});
				}
				if(response.data.is_presenter == 0){
					cookies.set("status","participant");
				}
				if(response.data.is_presenter == 0 && response.data.alert_num != alertNum){
			
					console.log(response.data.alert_num);
					console.log(typeof(alertNum));
					console.log(alertNum);
					alertNum =response.data.alert_num;
					console.log(alertNum);
					setTriggerAlertPopup(true);
				}

			}).catch((exception) => {
				console.log(exception);
			});
		};
	
	
		// Set the interval to check the value every 1 seconds
		const intervalId = setInterval(checkRemovedValue, 2000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
		
	}, []);
	const handleScreenShare = async () => {
		if (isSharingEnabled) {
		  if (channelParameters.screenTrack) {
			await channelParameters.screenTrack.replaceTrack(channelParameters.localVideoTrack, true);
		  }
		  setIsSharingEnabled(false);
		} else {
		  try {
					const client2 = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
					let uid = await client2.join(config.appId, channelName, agora_token, null);
					console.log("screenshare uid is " + uid)
					const screenTrack = await AgoraRTC.createScreenVideoTrack();
					//send screenshare to the backend
					const createScreenShare = await axios.post('http://127.0.0.1:8000/api/create_screenshare/', {
						"meeting" : channelId,
						"user": userId,
						"agora_id": uid
					  },
					{
							headers: { Authorization: `Token ${token}` }
						  }
					);
					console.log(createScreenShare)
					await client2.publish([screenTrack]);
					client2.on("user-published", async (user, mediaType) => {
					if (mediaType === "video" && user.videoTrack) {
						await client2.subscribe(user, "screen");
						const screenTrack = user.videoTrack;
						// Play the remote screen track in the new div element
						screenTrack.play("yyy");
					}
					});
			setChannelParameters({ ...channelParameters, screenTrack });
			setIsSharingEnabled(true);
		  } catch (error) {
			console.error('Error creating screen track:', error);
		  }
		}
	  };
	  

	return (
		
		<div>
			<div className="meeting-controls">
				<div className="meeting-control">
				
					{status==="presenter" ? <button onClick={handleScreenShare}><div>{!isSharingEnabled ? <MdScreenShare size={20} /> : <MdStopScreenShare size={20}/>}<br></br>Share Screen</div></button>:<></>}
					<button onClick={() => {setTrigger(true);}}><div><IoPeople size={20} /><br></br>Participants ({users.length + 1})</div></button>
					<button onClick={() => mute("video")}>
						{trackState.video ? <div><BsCameraVideo size={20} /><br></br>Turn Off</div> :
							<div><BsCameraVideoOff size={20} /><br></br>Turn On</div>}
					</button>
					<button onClick={() => mute("audio")}>
						{trackState.audio ? <div><BsMic size={20} /><br></br>Mute</div> :
							<div><BsMicMute size={20} /><br></br>Unmute</div>}
					</button>
					{is_host==1? <button onClick={() => {copyLink()}}><div><MdOutlineContentCopy size={20} /><br></br>Copy Link</div></button>:<></>}

					{/*
					The following line of code will be changed.
					For now, it directs the user to Dashboard page, but it should direct to MeetingEnding page.
					The participants list should be recorded to database in order to be able to retrieve the list and show on the screen.
				*/}
					<button onClick={() => {setTrigger3(true)}}><div><IoCloseCircleOutline size={20} /><br></br>Leave Meeting</div></button>
				</div>
				<ParticipantsPopup trigger={trigger} users={users} setTrigger={setTrigger}></ParticipantsPopup>
				<AlertPopup triggerAlertPopup={triggerAlertPopup} setTriggerAlertPopup={setTriggerAlertPopup}></AlertPopup>
				<ClipBoardPopup trigger2={trigger2} setTrigger2={setTrigger2}></ClipBoardPopup>
				<LeaveMeetingPopup trigger3={trigger3} setTrigger3={setTrigger3} trigger4={trigger4} setTrigger4={setTrigger4} trigger5={trigger5} setTrigger5={setTrigger5}></LeaveMeetingPopup>
				
			</div>
		</div>
		
	);
}

export default Controls;