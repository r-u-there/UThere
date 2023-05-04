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
	const status = cookies.get("status");
	const [isHost, setIsHost] = useState(status==="host");
	const [isParticipantPresenter,setIsParticipantPresenter] = useState();
	const [setButton,setsetButton] = useState(true);
	const token = localStorage.getItem('token');

	async function getMeetingUser(arg) {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_participant/${arg}/`);
			let participant_user_id = response.data.user  
			let participant_is_presenter = response.data.is_presenter
			setIsParticipantPresenter(participant_is_presenter)
			axios.get(`http://127.0.0.1:8000/api/user/info/${participant_user_id}/`).then(response => {
				let name = response.data.username
				if(participant_is_presenter){
					name = name + " (Presenter)"
				}
				setParticipantName(name);
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
			headers: { Authorization: `Token ${token}` },
			"userId": removed_user_id,
			"channelId": channelId
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
	}
	function alertUser(alerted_user_id){
		axios.put(`http://127.0.0.1:8000/api/alert_user_meeting/`, {
			headers: { Authorization: `Token ${token}` },
			"userId": alerted_user_id,
			"channelId": channelId
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});

	}
	function unsetPresenter(presenter_user_id){
		//make the user presenter
		axios.put(`http://127.0.0.1:8000/api/unset_presenter_meeting/`, {
			headers: { Authorization: `Token ${token}` },
			"userId": presenter_user_id,
			"channelId": channelId
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		setsetButton(true)
	}
	function setPresenter(presenter_user_id){
		//make the user presenter
		axios.put(`http://127.0.0.1:8000/api/set_presenter_meeting/`, {
			headers: { Authorization: `Token ${token}` },
			"userId": presenter_user_id,
			"channelId": channelId
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		setsetButton(false)
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
								<td>{status ==="presenter"? name+ " (Me)(Presenter)" : name+" (Me)"}</td>
								<td></td>
								{isHost? <td><button>Set Presenter</button></td>: <td></td>}
							</tr>

							{users.map((user) => {
								getMeetingUser(user.uid);
								return <tr>
										<td>{participantName}</td>
										{isHost ? <td><button id={user.uid+"-remove"} onClick={()=>removeUser(user.uid)}>Remove</button></td> : <td></td>}
										{isHost ? isParticipantPresenter ?  <td><button  id= {user.uid+"-unset"} onClick={()=>unsetPresenter(user.uid)}>Unset Presenter</button></td>: 
																			<td><button  id= {user.uid+"-set"} onClick={()=>setPresenter(user.uid)}>Set Presenter</button></td>: <td></td>}
										{status === "presenter"?<td><button onClick={()=>alertUser(user.uid)}>Alert</button></td> : <td></td> }
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