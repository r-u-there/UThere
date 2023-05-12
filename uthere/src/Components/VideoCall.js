import { useState, useEffect, useRef } from "react";
import {
	config,
	useClient,
	channelName
} from "../settings";
import Videos from "./Videos";
import Controls from "./Controls";
import React from 'react';
import {Cookies} from "react-cookie";
import axios from 'axios';
import AttentionAnalysisPopup from "./AttentionAnalysisPopup";
import PresenterWarningPopup from "./PresenterWarningPopup";


function VideoCall(props) {
	const ready = props.ready;
	const tracks = props.tracks;
	const webgazer = props.webgazer;
	const cookies = new Cookies();
	const [users, setUsers] = useState([]);
	const [usersWithCam, setUsersWithCam] = useState([]);
	const [start, setStart] = useState(false);
	const [agorauid,setAgorauid] = useState(0);
	const client = useClient();
	console.log(client.remoteUsers);
	const token = localStorage.getItem("token");
	const agora_token = cookies.get("token");
	const channelName = cookies.get("channel_name")
	const status = cookies.get("status");
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id")
	const is_host = cookies.get("is_host")
	console.log(is_host)
	const [trackState, setTrackState] = useState({ video: true, audio: true });
	const [mediaStream, setMediaStream] = useState(null);
	const [mediaRecorder, setMediaRecorder] = useState(null);	
	const [intervalId, setIntervalId] = useState(null);	
	const [attentionScore, setAttentionScore] = useState(0)
	const [emotionStatus, setEmotion] = useState(0)
	const [hideRealTimeAnalysis,setHideRealTimeAnalysis] = useState(false)
	const [hideEmotionAnalysis,setHideEmotionAnalysis] = useState(false)
	const [hideAttentionAnalysis,setHideAttentionAnalysis] = useState(false)
	const [attentionLimitPresenter, setAttentionLimitPresenter] = useState(0)
	const [triggerPresenterWarningPopup, setTriggerPresenterWarningPopup] = useState(false)
	var attentionLimit = 0
	function checkAnalysisSettings(){
		axios.get(`http://127.0.0.1:8000/api/getsettings/${userId}/`, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
		console.log(response);
		setHideRealTimeAnalysis(response.data.hide_real_time_analysis)
		setHideAttentionAnalysis(response.data.hide_real_time_attention_analysis)
		setHideEmotionAnalysis(response.data.hide_real_time_emotion_analysis)
		setAttentionLimitPresenter(response.data.attention_limit)
		attentionLimit =response.data.attention_limit
		if(response.data.hide_real_time_attention_analysis && response.data.hide_real_time_emotion_analysis){
			setHideRealTimeAnalysis(true)
		}
		console.log(response.data.hide_real_time_emotion_analysis)
	}).catch((exception) => {
		console.log(exception);
	});
}

	async function getHostID() {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_user/${channelId}/`, {
				  headers: { Authorization: `Token ${token}` }
			  });
			console.log(response)
            return response.data.user;
        } catch (error) {
            console.log("error", error);
            return null;
        }
    }
	async function meetingUserCreate(arg){
		const createMeetingUserResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting_user/', {
				"meeting" : channelId,
				"user": userId,
				"is_host": is_host,
				"agora_id": arg ,
				"access_report": is_host
			  },
			{
					headers: { Authorization: `Token ${token}` }
				  }
				);
			  console.log("success");
			  console.log(createMeetingUserResponse);
			  //if it is host when created the meeting_user object, it is also presenter
			  if(is_host == 1){
				const createPresenterResponse = await axios.post('http://127.0.0.1:8000/api/create_presenter/', {
					"meeting" : channelId,
					"user": userId,
				},
				{
						headers: { Authorization: `Token ${token}` }
					}
					);
					console.log(createPresenterResponse);
					cookies.set("presenter_id",createPresenterResponse.data.id)
			  }
		}
	useEffect(() => {
		let init = async (name) => {
			client.on("user-published", async (user, mediaType) => {
				await client.subscribe(user, mediaType);
				console.log("bişi")
				if (mediaType === "video") {
					setUsersWithCam((prevUsers) => {
						return [...prevUsers, user];
					});
					user.videoTrack.play("play");
				}
				if (mediaType === "audio") {
					user.audioTrack.play();
				}
			});
			  
			client.on("user-unpublished", (user, mediaType) => {
				if (mediaType === "audio") {
					if (user.audioTrack) user.audioTrack.stop();
				}
				if (mediaType === "video") {
					setUsersWithCam((prevUsers) => {
						return prevUsers.filter((User) => User.uid !== user.uid);
					});
					if (user.videoTrack) user.videoTrack.stop();
				}
			});
			
			client.on("user-joined", (user) => {
				console.log("JOIN ALGILANDI " + user.uid)
				setUsers((prevUsers) => {
					return [...prevUsers, user];
				});
				console.log(users)
				setUsersWithCam((prevUsers) => {
					return [...prevUsers, user];
				});
			});

			client.on("user-left", (user) => {
				setUsers((prevUsers) => {
					return prevUsers.filter((User) => User.uid !== user.uid);
				});

			});
			try {
				console.log(name)
				if(is_host == 1){
					let new_userid= parseInt(userId)
					let uid = await client.join(config.appId, name, agora_token, 0);
					meetingUserCreate(uid)
					setAgorauid(uid)
					cookies.set("agora_uid",uid)
					console.log("agora user id"+uid); // The user id defined by Agora

					console.log(typeof(userId))
				}
				else if (status === "participant"){
					//get the host uid of the meeting
					let result = await getHostID(); 
					console.log(result)
					console.log(typeof(result))
					result = parseInt(result)
					let uid = await client.join(config.appId, name, agora_token, 0);
					meetingUserCreate(uid)
					setAgorauid(uid)
					cookies.set("agora_uid",uid)
					console.log("agora user id"+uid); // The user id defined by Agora
				
				}
			} catch (error) {
				console.log("error");
			}

			if (props.tracks) {
				await client.publish([tracks[0], tracks[1]]);
				console.log("bilgehan")
			}
			setStart(true);
			console.log("start is" + start);
		};

		if (ready && tracks) {
			console.log("ready is" + ready)
			try {
				console.log("channel name is: " + channelName)
				console.log("agora id is: " + agora_token)
				console.log("user id is: " +userId)
				init(channelName);
			} catch (error) {
				console.log(error);
			}
		}
		
	}, [channelName, client, ready, tracks]);

	useEffect(() => {
		checkAnalysisSettings()
		console.log(trackState)

		const stopMediaStream = () => {
			if (mediaRecorder) {
				if (mediaRecorder.state === "recording") {
					mediaRecorder.stop();
					setMediaRecorder(null);
				} 
			}
			if (mediaStream) {
				// Stop the media stream
				mediaStream.getTracks().forEach(track => track.stop());
				// Set the media stream state variable to null
				setMediaStream(null);
				clearInterval(intervalId);
			}
		}

		const startMediaStream = () => {
			let mstream
			if (mediaStream == null){
				navigator.mediaDevices.getUserMedia({ audio: false, video: true}
					).then((stream) => {
					mstream = stream;
					setMediaStream(stream);
	
				});
			}
			const interval = setInterval(() => {
				const recorder = new MediaRecorder(mstream, { videoBitsPerSecond: 2000000, mimeType: 'video/webm' });
				  recorder.ondataavailable = (e) => {
					if (typeof e.data === 'undefined') return;
					if (e.data.size === 0) return;
					console.log(e.data);
					const formData = new FormData();
					formData.append('file', e.data, 'recorded-video.webm');
					let cur_time = new Date();
					formData.append('timestamp', cur_time.toISOString());
					formData.append('user_id', userId);
					formData.append('meeting_id',channelId);
					console.log(formData);
					fetch('http://127.0.0.1:8008/upload-video/', {
					method: 'POST',
					body: formData,
					headers: {
						Accept: 'application/json',
					},
					});
				};
				setIntervalId(interval)
				setMediaRecorder(recorder);
				recorder.start();
			
				setTimeout(() => {
					if( recorder && recorder.state === "recording") {
						recorder.stop();
					}
				}, 10000);
			}, 10000);
		};

		if (mediaStream == null && trackState.video) {
			startMediaStream();
			console.log("camera on");
        }
		if(mediaStream != null && !trackState.video){
			stopMediaStream();
			console.log("camera off");
		}
		//check if mediaStream is not equal to null
	}, [trackState]);
	useEffect(()=>{
		//get the all attention scores of all of the user within the 60 minutes
		//add if it is the presenter
		const getscoreinterval = ()=>{
			axios.put(`http://127.0.0.1:8000/api/get_attention_emotion_score/`, {
					"channelId": channelId, 
					"time":new Date().toISOString()
				},{
					headers: { Authorization: `Token ${token}` }
				}).then(response => {
					console.log("attention_scoreeee")
					console.log(response);
					if(response.data.hasOwnProperty('status') && response.data.status==='Attention score not found'){
						setAttentionScore(0)
						setEmotion(0)
					}
					else{
						const totalScore = response.data.reduce((acc, curr) => acc + curr.attention_score, 0);
						const averageScore = totalScore / response.data.length;	
						console.log("average score is " + averageScore)
						setAttentionScore(averageScore)
						
						const emotionCounts = response.data.reduce((counts, { emotion }) => {
							counts[emotion] = (counts[emotion] || 0) + 1;
							return counts;
						}, {});
						console.log(emotionCounts)
						const maxCount = Object.values(emotionCounts).reduce((max, count) => Math.max(max, count), 0);

						const maxCountIndex = Object.entries(emotionCounts).findIndex(([emotion, count]) => count === maxCount);

						console.log('Emotion counts:', emotionCounts);
						console.log('Max count:', maxCount);
						console.log('Index of max count:', maxCountIndex);
						var maxCountKey = Object.entries(emotionCounts).reduce((max, [key, value]) => {
							return value > max.count ? { key, count: value } : max;
						  }, { key: null, count: 0 }).key;
						  console.log(typeof maxCountKey)
						maxCountKey = parseInt(maxCountKey)
						setEmotion(maxCountKey+1)
						var attentionLimitToCompare = 3 *attentionLimit / 100
						console.log("min attention limit for presenter is " + attentionLimitToCompare)
						console.log("actual attention limit " + averageScore)
						if(averageScore<=attentionLimitToCompare){
							setTriggerPresenterWarningPopup(true)
						}
					
					}
				}).catch((exception) => {
					console.log(exception);
				});

		};
		// Set the interval to check the value every 1 seconds
		const intervalscore = setInterval(getscoreinterval, 10000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalscore);
		

	},[])

	return (
		<div>
			<div>
				{ready && tracks && (<Controls tracks={tracks} setStart={setStart} webgazer={webgazer} users={users} trackState={trackState} setTrackState = {setTrackState}/>)}
			</div>
			<div>
				{start && tracks && <Videos style={{zIndex:1}} tracks={tracks} users={users} setUsers={setUsers} usersWithCam={usersWithCam} agorauid={agorauid} />}
			</div>
			{status==="presenter" && !hideRealTimeAnalysis? (
        		<AttentionAnalysisPopup attentionScore={attentionScore} emotionStatus={emotionStatus} hideEmotionAnalysis={hideEmotionAnalysis} hideAttentionAnalysis={hideAttentionAnalysis}/>
      			):<></>}
				{status==="presenter" && !hideRealTimeAnalysis? <PresenterWarningPopup triggerPresenterWarningPopup={triggerPresenterWarningPopup} setTriggerPresenterWarningPopup={setTriggerPresenterWarningPopup}></PresenterWarningPopup>: <></>}
		</div>
	);
}

export default VideoCall;