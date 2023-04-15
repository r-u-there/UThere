import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";

function ParticipantsPopup(props) {
	const {trigger, setTrigger, users} = props;
	const [name, setName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");

	useEffect(() => {
		axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`).then(response => {
			setName(response.data.username);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [])

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h4><u>Participants List</u></h4>
						<table>
							<tr>{name}</tr>
							{users.map((user) => {
								return <tr>{user.uid}</tr>
							})}
						</table>
						<button type="button" onClick={() => {setTrigger(false)}} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
			</div>
		);
	}

	return (
		<div>
			{trigger === true ? insidePopup() : null}
		</div>
	);
}

export default ParticipantsPopup;