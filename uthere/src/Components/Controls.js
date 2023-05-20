import { useEffect, useRef, useState } from "react";
import { useClient } from "../settings";
import React from 'react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { MdOutlinePoll } from "react-icons/md";
import { IoPeople } from 'react-icons/io5';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cookies } from "react-cookie";
import ParticipantsPopup from "./ParticipantsPopup";
import ClipBoardPopup from "./ClipBoardPopup";
import LeaveMeetingPopup from "./LeaveMeetingPopup";
import CreatePollPopup from "./CreatePollPopup";
import AnswerPollPopup from "./AnswerPollPopup";
import { MdScreenShare, MdStopScreenShare, MdOutlineContentCopy } from "react-icons/md";
import {
	config,
	channelName
} from "../settings";
import AgoraRTC from 'agora-rtc-react';
import API from "./API";
const token = localStorage.getItem('token');

function Controls(props) {
	const client = useClient();
	const { tracks, setStart, webgazer, users, trackState, setTrackState } = props;

	const [users_new, setUsersNew] = useState([]);
	const [trigger, setTrigger] = useState(false);
	const [trigger2, setTrigger2] = useState(false);
	const [trigger3, setTrigger3] = useState(false);
	const [trigger4, setTrigger4] = useState(false);
	const [trigger5, setTrigger5] = useState(false);
<<<<<<< HEAD
	const [pollTrigger, setPollTrigger] = useState(false);
	const [pollTrigger2, setPollTrigger2] = useState(false);
	const [polldata, setPollData] = useState({});
=======
	const [screenShareCount,setScreenShareCount] = useState(0);
	const [screenShareUid,setScreenShareUid] = useState(-1)
>>>>>>> 6c1e0c5cd77230ef9424b1563ed03bca6f59dacf
	let alertNum = "0";
	let latest_poll = "-1";
	const cookies = new Cookies();
	const agora_token = cookies.get("token");
	const agora_id = cookies.get("agora_uid")
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id");
	const status = cookies.get("status");
	const is_host = cookies.get("is_host")
	const channelName = cookies.get("channel_name");
	const [isSharingEnabled, setIsSharingEnabled] = useState(false);
	const [channelParameters, setChannelParameters] = useState({
		screenTrack: null,
		localVideoTrack: null,
	});
	const [client2, setClient2] = useState(null);

	const [isRemoved, setIsRemoved] = useState(false);
	let peopleLeft = -1
	let leftUserId = -1

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
	function getCountOfScreenshare(){
		//for the current meeting get the number of current screenshare
		API.put(`count_screenshare/`, {
			"channelId": channelId
		}, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			console.log(response);
			if(response.data === "Not Screenshare"){
				setScreenShareCount(0)
			}
			else{
				setScreenShareCount(response.data)
			}
		}).catch((exception) => {
			console.log(exception);
		});

	}
	useEffect(() => {

		const leaveChannel = async () => {
			//check whether the user is presenter currently, if it is change its
			//end time in presenter table
			if (status === "presenter") {
				//enter end time to the presenter table for this user
				API.put(`unset_presenter_meeting/`, {
					"userId": userId,
					"channelId": channelId,
					"agoraToken": agora_id
				}, {
					headers: { Authorization: `Token ${token}` }
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
				API.put(`end_time_presenter_table/`, {
					"userId": userId,
					"channelId": channelId,
					"id": 0
				}, {
					headers: { Authorization: `Token ${token}` },
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
			}
			if (trigger5) {
				//remove everyone from the meeting
				API.put(`remove_all_user/`, {
					"channelId": channelId
				}, {
					headers: { Authorization: `Token ${token}` }
				}).then(response => {
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
			}
			if (trigger4 || trigger5) {

				if (props.webgazer !== null) {
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
				if (!trigger5) {
					API.put(`user_left_meeting/`, {
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

				if (isRemoved) {
					toast("The host has removed you from the meeting. Please wait until you are redirected to dashboard!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 5000, // Time in milliseconds
						onClose: () => {
							window.location.href = "/Dashboard";
						}
					});
					
				}
				else {
					window.location.href = "/Dashboard";
				}
			}
		};
		if (trigger3 || trigger4 || trigger5) {
			leaveChannel();
		}
	}, [trigger3, trigger4, trigger5]);

	useEffect(async () => {
		const checkRemovedValue = async () => {
			getCountOfScreenshare()
			console.log(agora_token);
			API.put('user_meeting_get_info/', {
				"userId": userId,
				"channelId": channelId,
				"agoraToken": cookies.get("agora_uid")
			}, {
				headers: { Authorization: `Token ${token}` }
			}).then(response => {
				console.log(response.data);
				if (response.data.is_removed == 1) {
					setIsRemoved(true)
					setTrigger4(true);
				}

				if (response.data.is_presenter == 1) {
					cookies.set("status", "presenter");
					//check who left the meeting
					//check the settings of the presenter first
					API.get(`getsettings/${userId}/`, {
						headers: { Authorization: `Token ${token}` }
					}).then(responseA => {
						console.log("responseA: " + responseA);
						if (!responseA.data.hide_who_left) {
							//continue to check 
							API.get(`check_departures/${channelId}/`, {
								headers: { Authorization: `Token ${token}` }
							}).then(responseB => {

								if(responseB.length != 0){
									console.log("buraya giriyor")
									console.log(typeof responseB.data.user)
								leftUserId = responseB.data.user
								console.log("The users in the channel shown here: ")
								console.log(responseB)
								console.log(leftUserId)
								if (responseB.data.length != 0) {
									
									if (responseB.data.user !== peopleLeft) {
										//if the user left_time is before my presenter start time do not alert
										let user_left_time = responseB.data.left_time
										let left_people_id = responseB.data.user
										//get my presenter start_time
										API.put(`get_presenter_table/`,
											{
												"channelId": channelId,
												"userId": userId
											},
											{
												headers: { Authorization: `Token ${token}` }
											}).then(responseC => {
												const date_user_left = new Date(user_left_time)
												const date_presenter_start = new Date(responseC.data.start_time)

												if (date_presenter_start < date_user_left) {
													console.log("alert should appear")
													console.log("the id of the left user: " + leftUserId)
													API.get(`user/info2/${leftUserId}/`, {
														headers: {
															Authorization: `Token ${token}`
														}
													}).then(tempResponse => {
														console.log("ALL DATA OF THE LEFT USER:")
														console.log(tempResponse)
														toast(tempResponse.data.username + " left the meeting!", {
															position: toast.POSITION.TOP_RIGHT,
															autoClose: 5000 // Time in milliseconds
														});
														peopleLeft = left_people_id;
													}).catch((exception) => {
														console.log(exception);
													});
												}
											}).catch((exception) => {
												console.log(exception);
											});
									}
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
				if (response.data.is_presenter == 0) {
					cookies.set("status", "participant");
				}
				if (response.data.is_presenter == 0 && response.data.alert_num != alertNum) {

					console.log(response.data.alert_num);
					console.log(typeof (alertNum));
					console.log(alertNum);
					alertNum = response.data.alert_num;
					console.log(alertNum);
					toast("Presenter noticed that your attention rate has decreased. Please pay attention to the presentation.", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 5000 // Time in milliseconds
					});
				}
				if (response.data.is_presenter == 0 && response.data.latest_poll != latest_poll) {

					latest_poll = response.data.latest_poll;
					API.get(`get_poll/${response.data.latest_poll}/`, {
						headers: { Authorization: `Token ${token}` }
					}).then(response => {
						console.log(response);
						setPollData(response.data);
						setPollTrigger2(true);
					}).catch((exception) => {
						console.log(exception);
					});
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
				setIsSharingEnabled(true);
				await channelParameters.screenTrack.replaceTrack(channelParameters.localVideoTrack, true);
				
			}
			//setIsSharingEnabled(false);
		} else {
			try {
				setIsSharingEnabled(true);
				const client2 = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
				setClient2(client2)
				let uid = await client2.join(config.appId, channelName, agora_token, null);
				setScreenShareUid(uid)
				console.log("screenshare uid is " + uid)
				const screenTrack = await AgoraRTC.createScreenVideoTrack();
				//send screenshare to the backend
				const createScreenShare = await API.post('create_screenshare/', {
					"meeting": channelId,
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
				
			} catch (error) {
				console.error('Error creating screen track:', error);
			}
		}
	};
	async function stopSharing() {
		try {
		  await client2.unpublish(channelParameters.screenTrack);
		  await client2.leave();
		  console.log("Screen sharing stopped successfully");
		  setChannelParameters({ ...channelParameters, screenTrack: null });
		  setIsSharingEnabled(false);
		  //add end time to screen sharing
		  API.put('end_screen_share/', {
			"userId": userId,
			"channelId": channelId,
			"agoraToken": screenShareUid
		}, {
			headers: { Authorization: `Token ${token}` }
		})
		} catch (error) {
		  console.error('Error stopping screen sharing:', error);
		}
	  }


	return (

		<div>
			<div className="meeting-controls">
				<div className="meeting-control">

					{status === "presenter" ? !isSharingEnabled ? <button onClick={handleScreenShare}><div> <MdScreenShare size={20} /><br></br>Share Screen</div></button> :  <button onClick={stopSharing}><div> <MdStopScreenShare size={20} /><br></br>Share Screen</div></button> :<></>}
					<button onClick={() => { setTrigger(true); }}><div><IoPeople size={20} /><br></br>Participants ({users.length+ 1-screenShareCount})</div></button>
					<button onClick={() => mute("video")}>
						{trackState.video ? <div><BsCameraVideo size={20} /><br></br>Turn Off</div> :
							<div><BsCameraVideoOff size={20} /><br></br>Turn On</div>}
					</button>
					<button onClick={() => mute("audio")}>
						{trackState.audio ? <div><BsMic size={20} /><br></br>Mute</div> :
							<div><BsMicMute size={20} /><br></br>Unmute</div>}
					</button>
					{is_host == 1 ? <button onClick={() => { copyLink() }}><div><MdOutlineContentCopy size={20} /><br></br>Copy Link</div></button> : <></>}
					{status === "presenter" ? <button onClick={() => { setPollTrigger(true); }}><div><MdOutlinePoll size={20} /><br></br>Poll</div></button> : <></>}
					{/*
					The following line of code will be changed.
					For now, it directs the user to Dashboard page, but it should direct to MeetingEnding page.
					The participants list should be recorded to database in order to be able to retrieve the list and show on the screen.
				*/}
					<button onClick={() => { setTrigger3(true) }}><div><IoCloseCircleOutline size={20} /><br></br>Leave Meeting</div></button>
				</div>
				<ParticipantsPopup trigger={trigger} users={users} setTrigger={setTrigger}></ParticipantsPopup>
				<ClipBoardPopup trigger2={trigger2} setTrigger2={setTrigger2}></ClipBoardPopup>

				<LeaveMeetingPopup trigger3={trigger3} setTrigger3={setTrigger3} trigger4={trigger4} setTrigger4={setTrigger4} trigger5={trigger5} setTrigger5={setTrigger5} tracks={tracks} trackState={trackState} setTrackState={setTrackState}></LeaveMeetingPopup>
				<CreatePollPopup trigger={pollTrigger} setTrigger={setPollTrigger}></CreatePollPopup>
				<AnswerPollPopup trigger={pollTrigger2} setTrigger={setPollTrigger2} polldata ={polldata}></AnswerPollPopup>

				
			</div>
		</div>

	);
}

export default Controls;