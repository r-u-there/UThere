import React from 'react';
import UThere from './UThere';
import { BsCameraVideo } from 'react-icons/bs';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import { BsQuestionCircle } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Logout from './Logout';
import JoinMeetingPopup from './JoinMeetingPopup';
import { Cookies } from "react-cookie";
import axios from 'axios';
import { useState, useEffect } from "react";
import { config } from "../settings";
import * as ReactBootStrap from "react-bootstrap"
import API from "./API";
import ReminderPopup2 from './ReminderPopup2';
import {BsBook} from "react-icons/bs"
import UserManual from './UserManual.pdf'

function Dashboard() {
	const [trigger, setTrigger] = useState(false);
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const [name, setName] = useState("");
	const token = localStorage.getItem('token');
	const [loading, setLoading] = useState(false);
	const [trigger2, setTrigger2] = useState(false);

	

	useEffect(() => {
		console.log(token);
		function getUserInfo() {
			API.get(`user/info/${userId}/`, {
				headers: {
					Authorization: `Token ${token}`
				}
			}).then(response => {
				setName(response.data.username);
				setLoading(true);
			}).catch((exception) => {
				window.location = "/Login";
				console.log(exception);
			});

		}

		getUserInfo();
	}, []);


	return (
		<div>
			{loading ?
				<div>
					<UThere></UThere>
					<div className='page-background'></div>
					<Logout></Logout>
					<div className='dashboard' style={{ "background-color": "white" }}>
						<center><h1>Welcome, {name}</h1></center>
						<hr></hr>
						<table className='dashboard-table-columns'>
							<tr>
								<td><label onClick={() => {setTrigger2(true)}}><BsCameraVideo color="#6666ff" size={100} /></label></td>
								<td><AiOutlinePlusCircle onClick={() => setTrigger(true)} color="#ffb3e6" size={100} /></td>
								<td><Link to="/Profile"><CgProfile color="gray" size={100} /></Link></td>
								<td><Link to="/Contact"><BsQuestionCircle color="orange" size={100} /></Link></td>
								<td><a href={UserManual} target="_blank" rel="noopener noreferrer"><BsBook size={100}/></a></td>
							</tr>
							
							<tr>
								<td><center><label style={{ "color": "black" }} onClick={() => {setTrigger2(true)}}>New Meeting</label></center></td>
								<td><center><label onClick={() => setTrigger(true)}>Join Meeting</label></center></td>
								<td><center><Link to="/Profile"><p style={{ "color": "black" }}>Profile</p></Link></center></td>
								<td><center><Link to="/Contact"><p style={{ "color": "black" }}>Contact Us</p></Link></center></td>
								<td><center><a href={UserManual} target="_blank" rel="noopener noreferrer"><p style={{ "color": "black" }}>User Manual</p></a></center></td>
							</tr>
						</table>
					</div>
				</div> : <div className="loading"><ReactBootStrap.Spinner style={{ height: "100px", width: "100px" }} animation="border" /></div>}
			<JoinMeetingPopup trigger={trigger} setTrigger={setTrigger}></JoinMeetingPopup>
			<ReminderPopup2 trigger2={trigger2} setTrigger2={setTrigger2}></ReminderPopup2>
		</div>
	);
}

export default Dashboard;