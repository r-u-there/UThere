import React from 'react';
import UThere from './UThere';
import Logout from './Logout';
import {GrDocumentPdf} from 'react-icons/gr'
import {BiChevronRightCircle} from 'react-icons/bi'
import {TbEdit} from 'react-icons/tb';
import {MdToggleOff} from 'react-icons/md';
import {MdToggleOn} from 'react-icons/md';
import {useState, useEffect, useCallback} from "react";
import EditProfilePopup from "./EditProfilePopup";
import {Cookies} from "react-cookie";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap"

function ProfilePage() {
	const [tabSelection, setTabSelection] = useState(0);
	const [toggle1, setToggle1] = useState(false);
	const [toggle2, setToggle2] = useState(false);
	const [toggle3, setToggle3] = useState(false);
	const [toggle4, setToggle4] = useState(false);
	const [toggle5, setToggle5] = useState(false);
	const [toggle6, setToggle6] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [trigger, setTrigger] = useState(false);
	const [changedInfo, setChangedInfo] = useState("");
	const cookies = new Cookies();
	const refreshToken = cookies.get(["refreshToken"]);
	const accessToken = cookies.get(["accessToken"]);
	const userId = cookies.get("userId");
	const [settingsId, setSettingsId] = useState(0);
	const [attentionRatingLimit, setAttentionRatingLimit] = useState("")
	const [loading, setLoading] = useState(false);

	const getUserInfo = useCallback(() => {
		axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`).then(response => {
			console.log("success");
			console.log("userid is" + userId);
			console.log(response);
			setName(response.data.username);
			setEmail(response.data.email);
			setPassword(response.data.password);
			setLoading(true);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [userId]);


	const getProfileSettings = useCallback(() => {
		axios.get(`http://127.0.0.1:8000/api/getsettings/${userId}/`).then(response => {
			console.log("success");
			console.log("user id is" + userId);
			console.log(response);
			setAttentionRatingLimit(response.data.attention_limit);
			setToggle1(response.data.get_analysis_report);
			setToggle2(response.data.hide_real_time_emotion_analysis);
			setToggle3(response.data.hide_real_time_attention_analysis);
			setToggle4(response.data.hide_real_time_analysis);
			setToggle5(response.data.hide_who_left);
			setToggle6(response.data.hide_eye_tracking);
			setSettingsId(response.data.id);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [userId]);


	const setProfilePreferences = useCallback(() => {
		axios.put(`http://127.0.0.1:8000/api/settings/${settingsId}/`, {
			"get_analysis_report" : toggle1,
			"hide_real_time_emotion_analysis" : toggle2,
			"hide_real_time_attention_analysis" : toggle3,
			"hide_real_time_analysis" : toggle4,
			"hide_who_left" : toggle5,
			"hide_eye_tracking" : toggle6
		}).then(response => {
			console.log("success");
			console.log("user id is" + userId);
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [settingsId, toggle1, toggle2, toggle3, toggle4, toggle5, toggle6, userId]);

	useEffect(() => {
		getUserInfo();
		getProfileSettings();
	}, [getUserInfo, getProfileSettings]);

	useEffect(() => {
		setProfilePreferences();
	}, [setProfilePreferences]);


	function displayProfile() {
		if (tabSelection == 0) {
			return (
				<div>
					<center><table>
						<tr>
							<td><b>Full Name: &ensp;</b></td>
							<td>{name}</td>
							<td>&ensp;<TbEdit onClick={() => {setTrigger(true); setChangedInfo("full name")}} size={40}/></td>
						</tr>
						<tr>
							<td><b>Email: &ensp;</b></td>
							<td>{email}</td>
							<td>&ensp;<TbEdit onClick={() => {setTrigger(true); setChangedInfo("email")}} size={40}/></td>
						</tr>
						<tr>
							<td><b>Password: &ensp;</b></td>
							<td>********</td>
							<td>&ensp;<TbEdit onClick={() => {setTrigger(true); setChangedInfo("password")}} size={40}/></td>
						</tr>

					</table></center>
				</div>
			);
		}
		else if (tabSelection == 1) {
			return (
				<div>
					<ul>
						<li><GrDocumentPdf size={30}/>&emsp;Attention Report - 06/05/2022</li>
						<li className='mt-3'><GrDocumentPdf size={30}/>&emsp;Attention Report - 10/24/2022</li>
						<li className='mt-3'><GrDocumentPdf size={30}/>&emsp;Attention Report - 10/17/2022</li>
					</ul>
				</div>
			);
		}
		else if (tabSelection == 2) {
			return (
				<div>
					<table>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Attention Rating Limit: {attentionRatingLimit}</td>
							<td>&emsp;&emsp;<TbEdit onClick={() => {setTrigger(true); setChangedInfo("attention rate")}} size={40}/></td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Get Analysis Report</td>
							<td>&emsp;&emsp;{!toggle1 ? <MdToggleOff onClick={() => {setToggle1(!toggle1);}} size={40}/> : <MdToggleOn onClick={() => {setToggle1(!toggle1);}} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Emotion Analysis</td>
							<td>&emsp;&emsp;{!toggle2 ? <MdToggleOff onClick={() => {setToggle2(!toggle2); }} size={40}/> : <MdToggleOn onClick={() => {setToggle2(!toggle2);}} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Attention Analysis</td>
							<td>&emsp;&emsp;{!toggle3 ? <MdToggleOff onClick={() => {setToggle3(!toggle3); }} size={40}/> : <MdToggleOn onClick={() => {setToggle3(!toggle3);}} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Analysis</td>
							<td>&emsp;&emsp;{!toggle4? <MdToggleOff onClick={() => {setToggle4(!toggle4); }} size={40}/> : <MdToggleOn onClick={() => {setToggle4(!toggle4); }} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide "Who Left" Information</td>
							<td>&emsp;&emsp;{!toggle5 ? <MdToggleOff onClick={() => {setToggle5(!toggle5); }} size={40}/> : <MdToggleOn onClick={() => {setToggle5(!toggle5); }} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Eye Tracking</td>
							<td>&emsp;&emsp;{!toggle6 ? <MdToggleOff onClick={() => {setToggle6(!toggle6); }} size={40}/> : <MdToggleOn onClick={() => {setToggle6(!toggle6); }} size={40} color="green"/>}</td>
						</tr>
					</table>
				</div>
			);
		}
	}
	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			{loading ? <div className='profile'>
				<ul className="nav nav-tabs">
					<li className="nav-item">
						<a className="nav-link active" data-toggle="tab" href="" onClick={() => {setTabSelection(0)}}>Profile</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(1)}>Past Analysis Reports</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(2)}>Analysis Preferences</a>
					</li>
				</ul><hr></hr>
				{displayProfile()}
			</div> : <div className="loading"><ReactBootStrap.Spinner animation="border" style={{height:"100px", width:"100px"}}/></div>}
			<EditProfilePopup trigger={trigger} setTrigger={setTrigger} settingsId={settingsId} changedInfo={changedInfo}></EditProfilePopup>
		</div>
	);
}

export default ProfilePage;

