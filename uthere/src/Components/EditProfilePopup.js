import React from 'react';
import { useState } from 'react';
import { Cookies } from "react-cookie";
import axios from 'axios';
import ErrorMessagePopup from './ErrorMessagePopup';
import API from "./API";

function EditProfilePopup(props) {
	const [newInfo, setNewInfo] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const token = localStorage.getItem('token');
	const [trigger, setTrigger] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [currentPassword, setCurrentPassword] = useState("")


	function submitNewInfo() {
		console.log(userId);
			const data = {
				"userId": userId,
				"newInfo": newInfo,
				"changedInfo": props.changedInfo,
				"currentPassword": currentPassword
			};
			API.put(`user/update/`, data, {
				headers: {
					'Authorization': `Token ${token}`
				},
				method: 'PUT'
			}).then(response => {
				if (response.data.status === "ERROR") {
					setTrigger(true)
					setErrorMessage(response.data.message)
				}
				else {
					window.location.reload();
				}
			}).catch((exception) => {
				console.log(exception);
			});
	}


	function setAttentionRatingLimit() {
		console.log(props.settingsId);
		var settings_id = props.settingsId
		API.put(`settings/${userId}/`, {
			"attention_limit": newInfo
		}, { headers: { Authorization: `Token ${token}` } }).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		window.location.reload();
	}


	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						{props.changedInfo === "password" ? <div><label><b>Enter the current {props.changedInfo}:</b></label><input type="password" onChange={(e) => { setCurrentPassword(e.target.value) }} className="form-control" /><br></br></div> : <div></div>}
						<label><b>Enter the new {props.changedInfo}:</b></label>
						{props.changedInfo === "password" ? <input type="password" onChange={(e) => { setNewInfo(e.target.value) }} className="form-control" /> : <input onChange={(e) => { setNewInfo(e.target.value) }} className="form-control" />}
						<button type="button" onClick={() => { if (props.changedInfo === "attention rate") { setAttentionRatingLimit(); props.setTrigger(false) } else { submitNewInfo(); props.setTrigger(false) } }} className="btn btn-warning mt-3">Edit</button>
						<button type="button" onClick={() => { props.setTrigger(false) }} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
			</div>
		);
	}

	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
			<ErrorMessagePopup errorMessage={errorMessage} setErrorMessage={setErrorMessage} trigger={trigger} setTrigger={setTrigger}></ErrorMessagePopup>
		</div>
	);
}

export default EditProfilePopup;