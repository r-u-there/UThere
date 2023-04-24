import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Cookies} from "react-cookie";

function ParticipantsPopup(props) {
	const {trigger, setTrigger, users} = props;
	const [name, setName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id")
	const status = cookies.get("status")
	const [isHost, setIsHost] = useState(status==="host")
	console.log(isHost)
	async function getMeetingUser(arg) {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_participant/${arg}/`);
			let participant_user_id = response.data.user  
			axios.get(`http://127.0.0.1:8000/api/user/info/${participant_user_id}/`).then(response => {
				setParticipantName(response.data.username);
			}).catch((exception) => {
				console.log(exception);
			});
        } catch (error) {
            console.log("error", error);
        }
    }
    function removeUser(removed_user_id){
		//force user to left
		//update left time of the use
		axios.put(`http://127.0.0.1:8000/api/user_kicked_meeting/`, {
			"userId": removed_user_id,
			"channelId": channelId
		}).then(response => {
			console.log("success");
			console.log("user " + removed_user_id + " is removed" )
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
	}
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
							<tr>
								<td>{name+" (Me)"}</td>
								<td></td>
								{isHost? <td><button id={userId+"-set"}>Set Presenter</button></td>: <td></td>}
							</tr>

							{users.map((user) => {
								getMeetingUser(user.uid);
								return <tr>
										<td>{participantName}</td>
										{isHost ? <td><button onClick={removeUser(user.uid)} id={user.uid+"-remove"}>Remove</button></td> : <td></td>}
										{isHost ? <td><button id={user.uid+"-set"}>Set Presenter</button></td>: <td></td>}
									</tr>
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