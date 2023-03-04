import React from 'react';
import UThere from './UThere';
import {BsCameraVideo} from 'react-icons/bs';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {CgProfile} from 'react-icons/cg';
import {BsQuestionCircle} from 'react-icons/bs';
import {Link} from 'react-router-dom';
import Logout from './Logout';
import JoinMeetingPopup from './JoinMeetingPopup';
import {Cookies} from "react-cookie";
import axios from 'axios';
import {useState, useEffect} from "react";
import {
	config,
	useClient,
	useMicrophoneAndCameraTracks,
	channelName
} from "../settings";

function Dashboard() {
	const [trigger, setTrigger] = React.useState(false);
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const [name, setName] = React.useState("");
	const [meetingId, setMeetingId] = React.useState("");
	async function createMeetingAndUser() {
		try {
		  const createMeetingResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting/', {
			"agora_token" : config.token,
		  });
		  console.log("success");
		  console.log("bir bakk" + createMeetingResponse.data.id);
		  setMeetingId(createMeetingResponse.data.id);
	  
		  const createMeetingUserResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting_user/', {
			"meeting_id" : createMeetingResponse.data.id,
			"user_id": userId
		  });
		  console.log("success");
		  console.log(createMeetingUserResponse);
		} catch (exception) {
		  console.log(exception);
		}
	  }
	
	useEffect(() => {
		function getUserInfo() {
			axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`).then(response => {
					setName(response.data.username)
				}).catch((exception) => {
					console.log(exception);
				});
			}
			getUserInfo()
	  }, []);

	
	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			<div className='dashboard' style={{"background-color": "white"}}>
				<center><h1>Welcome, {name}</h1></center>
				<hr></hr>
				<table className='dashboard-table-columns'>
					<tr>
						<td><Link><BsCameraVideo color="#6666ff" size={100}/></Link></td>
						<td><AiOutlinePlusCircle onClick={() => setTrigger(true)} color="#ffb3e6" size={100}/></td>
						<td><Link to="/Profile"><CgProfile color="gray" size={100}/></Link></td>
						<td><Link to="/Contact"><BsQuestionCircle color="orange" size={100}/></Link></td>
					</tr>
					<tr>
						<td><center><Link><label onClick={() =>{createMeetingAndUser();}}>New Meeting</label></Link></center></td>
						<td><center><label onClick={() => setTrigger(true)}>Join Meeting</label></center></td>
						<td><center><Link to="/Profile"><label style={{"color": "black"}}>Profile</label></Link></center></td>
						<td><center><Link to="/Contact"><label style={{"color": "black"}}>Contact Us</label></Link></center></td>
					</tr>
				</table>
			</div>
			<JoinMeetingPopup trigger={trigger} setTrigger={setTrigger}></JoinMeetingPopup>
		</div>
	);
}

export default Dashboard;