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
import {config} from "../settings";
import * as ReactBootStrap from "react-bootstrap"

function Dashboard() {
	const [trigger, setTrigger] = useState(false);
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const [name, setName] = useState("");
	const [meetingId, setMeetingId] = useState("");

	const [loading, setLoading] = useState(false);

	async function createMeetingAndUser() {
		console.log(userId)
			try {
			  const createMeetingResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting/', {
				"appId" : config.appId,
				"certificate" : config.certificate,
				"uid": userId,
				"role": 2,
				"privilegeExpiredTs": 36000000
			  });
			  console.log(createMeetingResponse.data)
			  console.log(createMeetingResponse.data.agora_token)
			  console.log("channel name is " + createMeetingResponse.data.channel_name)
			  cookies.set("token",createMeetingResponse.data.agora_token)
			  cookies.set("channel_name",createMeetingResponse.data.channel_name)
			  cookies.set("channel_id", createMeetingResponse.data.id)
			  cookies.set("status","host")
			  setMeetingId(createMeetingResponse.data.id);
			  console.log("1- " + createMeetingResponse.data.id)
			
			  /*const createMeetingUserResponse = await axios.post('http://127.0.0.1:8000/api/create_meeting_user/', {
				"meeting" : createMeetingResponse.data.id,
				"user": userId,
				"is_host": 1
			  });
			  console.log("success");
			  console.log(createMeetingUserResponse);*/
			
			} catch (exception) {
			  console.log(exception);
			}
		  }
	
	useEffect(() => {
		function getUserInfo() {
			axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`).then(response => {
					setName(response.data.username);
					setLoading(true);
				}).catch((exception) => {
					console.log(exception);
				});
			}
			getUserInfo();
	  }, []);

	
	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			{loading ?
			<div className='dashboard' style={{"background-color": "white"}}>
				<center><h1>Welcome, {name}</h1></center>
				<hr></hr>
				<table className='dashboard-table-columns'>
					<tr>
						<td><Link to="/Meeting"><label onClick={createMeetingAndUser}><BsCameraVideo color="#6666ff" size={100}/></label></Link></td>
						<td><AiOutlinePlusCircle onClick={() => setTrigger(true)} color="#ffb3e6" size={100}/></td>
						<td><Link to="/Profile"><CgProfile color="gray" size={100}/></Link></td>
						<td><Link to="/Contact"><BsQuestionCircle color="orange" size={100}/></Link></td>
					</tr>
					<tr>
					<td><center><Link to="/Meeting"><label onClick={createMeetingAndUser}>New Meeting</label></Link></center></td>
						<td><center><label onClick={() => setTrigger(true)}>Join Meeting</label></center></td>
						<td><center><Link to="/Profile"><label style={{"color": "black"}}>Profile</label></Link></center></td>
						<td><center><Link to="/Contact"><label style={{"color": "black"}}>Contact Us</label></Link></center></td>
					</tr>
				</table>
			</div> : <div className="loading"><ReactBootStrap.Spinner style={{height:"100px", width:"100px"}} animation="border"/></div>}
			<JoinMeetingPopup trigger={trigger} setTrigger={setTrigger}></JoinMeetingPopup>
		</div>
	);
}

export default Dashboard;