import React from 'react';
import { useState } from 'react';
import {Cookies} from "react-cookie";
import axios from 'axios';

function EditProfilePopup(props) {
	const [newInfo, setNewInfo] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	function submitNewInfo() {
		axios.put(`http://127.0.0.1:8000/api/user/update/`, {
			"userId": userId,
			"newInfo": newInfo,
			"changedInfo" : props.changedInfo
		}).then(response => {
					console.log("success");
					console.log("userid is" + userId)
					console.log(response);
				}).catch((exception) => {
					console.log(exception);
				});
		window.location.reload();			
	}


	function setAttentionRatingLimit() {
		axios.put(`http://127.0.0.1:8000/api/settings/${props.settingsId}/`, {
			"attention_limit" : newInfo
		}).then(response => {
			console.log("success");
			console.log("user id is" + userId)
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
	}
	

  function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<label><b>Enter the new {props.changedInfo}:</b></label>
						<input onChange={(e) => {setNewInfo(e.target.value)}} className="form-control"/>
						<button type="button" onClick={() => { if (props.changedInfo === "attention rate") {setAttentionRatingLimit(); props.setTrigger(false)} else { submitNewInfo(); props.setTrigger(false)}}} className="btn btn-warning mt-3">Edit</button>
						<button type="button" onClick={() => {window.location.reload()}} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
			</div>
		);
	}

	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
  );
}

export default EditProfilePopup;