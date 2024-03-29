import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Cookies } from "react-cookie";
import * as ReactBootStrap from "react-bootstrap"
import API from "./API";

function ParticipantsPopup(props) {
	const { trigger, setTrigger, users } = props;
	const [name, setName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const cookies = new Cookies();
	const [new_users, setNewUsers] = useState([]);
	const [screenshare, setScreenshare] = useState(false);
	const userId = cookies.get("userId");
	const channelId = cookies.get("channel_id")
	const status = cookies.get("status");
	const is_host = cookies.get("is_host")
	const agora_token = cookies.get("token");
	const [isParticipantPresenter, setIsParticipantPresenter] = useState();
	const [isParticipantHost, setIsParticipantHost] = useState();
	const [participantUserId, setparticipantUserId] = useState();
	const [setButton, setsetButton] = useState(true);
	const token = localStorage.getItem('token');
	const presenter_id = cookies.get("presenter_id")

	async function createNewUsers(){
		users.map(async (user) => {
			const response_screenshare = await API.put(`is_participant_screenshare/`, {
				"agoraId": user.uid,
				"channelId": channelId
			}, { headers: { Authorization: `Token ${token}` } });
			if(!response_screenshare.data.status){
				setNewUsers(new_users => [...new_users, user])
			}
		})
	}

	async function getMeetingUser(arg) {
		try {
			const response_screenshare = await API.put(`is_participant_screenshare/`, {
				"agoraId": arg,
				"channelId": channelId
			}, { headers: { Authorization: `Token ${token}` } });
			if(!response_screenshare.data.status){
				console.log(arg + " is not screenshare")
				const response = await API.get(`get_meeting_participant/${arg}/`, {
					headers: { Authorization: `Token ${token}` }
				});
				let participant_user_id = response.data.user;
				let participant_is_presenter = response.data.is_presenter;
				let participant_is_host = response.data.is_host;
				setIsParticipantPresenter(participant_is_presenter);
				setIsParticipantHost(participant_is_host);
				API.get(`participant_user_info/${participant_user_id}/`, {
					headers: { Authorization: `Token ${token}` }
				}).then(response => {
					let name = response.data.username;
					setparticipantUserId(participant_user_id)
					if (participant_is_host == 1 && participant_is_presenter == 1) {
						name = name + " (Host)(Presenter)";
					}
					else if (participant_is_host == 1 && participant_is_presenter == 0) {
						name = name + " (Host)";
					}
					else if (participant_is_host == 0 && participant_is_presenter == 1) {
						name = name + " (Presenter)";
					}
					else if (participant_is_host == 0 && participant_is_presenter == 0) {
						name = name
					}
					setParticipantName(name);
					
				}).catch((exception) => {
					console.log(exception);
				});
				

			}
			else{
				setParticipantName("Screen Share")
				
			}
		} catch (error) {
			console.log("error", error);
		}
	}

	function removeUser(removed_user_id) {
		//force user to left
		//update left time of the use
		console.log("token: ", token);
		API.put(`user_kicked_meeting/`, {
			"userId": removed_user_id,
			"channelId": channelId
		}, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
	}
	function alertUser(alerted_user_id) {
		API.put(`alert_user_meeting/`, {
			"userId": alerted_user_id,
			"channelId": channelId
		}, { headers: { Authorization: `Token ${token}` } }).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});

	}
	function unsetPresenter(presenter_user_id, presenter_id_table) {
		//make the user presenter
		let presenter_agora_id = cookies.get("agora_uid")
		//make the user presenter
		if (presenter_user_id != userId) {
			//get user id from agora token
			presenter_agora_id = presenter_user_id
			presenter_user_id = participantUserId

		}
		API.put(`unset_presenter_meeting/`, {
			"userId": presenter_user_id,
			"channelId": channelId,
			"agoraToken": presenter_agora_id
		}, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		//enter end time to the presenter table for this user
		API.put(`end_time_presenter_table/`, {
			"userId": presenter_user_id,
			"channelId": channelId,
			"id": presenter_id_table
		}, {
			headers: { Authorization: `Token ${token}` },
		}).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		if (presenter_user_id == userId) {
			cookies.set("status", "participant")
			console.log("current user status is set to participant through unset button")
		}
		setsetButton(true)
	}
	async function setPresenter(presenter_user_id) {
		let presenter_agora_id = cookies.get("agora_uid")
		//make the user presenter
		if (presenter_user_id != userId) {
			//get user id from agora token
			presenter_agora_id = presenter_user_id
			presenter_user_id = participantUserId

		}

		API.put(`set_presenter_meeting/`, {
			"userId": presenter_user_id,
			"channelId": channelId,
			"agoraToken": presenter_agora_id
		}, { headers: { Authorization: `Token ${token}` } }).then(response => {
			console.log(response);
		}).catch((exception) => {
			console.log(exception);
		});
		const createPresenterResponse = await API.post('create_presenter/', {
			"meeting": channelId,
			"user": presenter_user_id,
		},
			{
				headers: { Authorization: `Token ${token}` }
			});
		console.log(createPresenterResponse);
		if (presenter_user_id == userId) {
			cookies.set("status", "presenter")
			console.log("current user status is set to presenter through set button")
			cookies.set("presenter_id", createPresenterResponse.data.id)
		}
		setsetButton(false)
	}
	useEffect(() => {
		setNewUsers([])
		createNewUsers()
	},[users])
	
	useEffect(() => {
		API.get(`user/info/${userId}/`, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			setName(response.data.username);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [])


	function insidePopup() {
		return (
			<div>
				<div className="popup-participants">
					<div className="popup-inner-participants">
						<br></br>
						<center>
							<h4><u>Participants List</u></h4>
							<table>
								<tr>
									<td>
										{(() => {
											if (is_host == 1 && status === "presenter") {
												return name + " (Me)(Presenter)(Host)";
											}
											else if (is_host == 1 && status === "participant") {
												return name + " (Me)(Host)";
											}
											else if (is_host == 0 && status === "presenter") {
												return name + " (Me)(Presenter)";
											}
											else if (is_host == 0 && status === "participant") {
												return name + " (Me)";
											}

										})()}
									</td>
									<td>---</td>
									{is_host == 1 ? status === "presenter" ? <td><button onClick={() => unsetPresenter(userId, presenter_id)}>Unset Presenter</button></td> : <td><button onClick={() => setPresenter(userId)}>Set Presenter</button></td> : <td>---</td>}
									<td>---</td>
								</tr>

								{new_users.map((user) => {
									    getMeetingUser(user.uid);
											return <tr>
											<td>{participantName}</td>
											{is_host == 1 ? <td><button id={user.uid + "-remove"} onClick={() => removeUser(user.uid)}>Remove</button></td> : <td>---</td>}
											{is_host == 1 ? isParticipantPresenter ? <td><button id={user.uid + "-unset"} onClick={() => unsetPresenter(user.uid, 0)}>Unset Presenter</button></td> :
												<td><button id={user.uid + "-set"} onClick={() => setPresenter(user.uid)}>Set Presenter</button></td> : <td>---</td>}
											{status === "presenter" && !isParticipantPresenter ? <td><button onClick={() => alertUser(user.uid)}>Alert</button></td> : <td>---</td>}
										</tr>
									

								})} 
							</table>
							<button type="button" onClick={() => { setTrigger(false) }} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						</center>
					</div>
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