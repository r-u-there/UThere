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
	const [participantsSet, setParticipantsSet] = useState([]);

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
			setParticipantsSet(prevState => prevState.filter(participant => participant.agora_id !== removed_user_id));

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
	function unsetPresenter(presenter_user_id, presenter_id_table, currentUser) {
		//make the user presenter
		let presenter_agora_id = cookies.get("agora_uid")
		//make the user presenter
		if (presenter_user_id != userId) {
			//get user id from agora token
			presenter_agora_id = presenter_user_id
			presenter_user_id = currentUser.user_id;

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

	async function setPresenter(presenter_user_id, currentUser) {
		let presenter_agora_id = cookies.get("agora_uid")
		//make the user presenter
		if (presenter_user_id != userId) {
			//get user id from agora token
			presenter_agora_id = presenter_user_id
			presenter_user_id = currentUser.user_id

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
		API.get(`user/info/${userId}/`, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			setName(response.data.username);
		}).catch((exception) => {
			console.log(exception);
		});
	}, [])

	useEffect(() => {
		users.forEach(async (user) => {
			API.put(`is_participant_screenshare/`, {
				"agoraId": user.uid,
				"channelId": channelId
			}, { headers: { Authorization: `Token ${token}` } }).then(response => {
				if (!response.data.status && !participantsSet.includes(user)) {
					API.get(`get_meeting_participant/${user.uid}/`, {
						headers: { Authorization: `Token ${token}` }
					}).then(res => {
						let is_presenter = res.data.is_presenter;
						let is_host = res.data.is_host;
						let user_id= res.data.user;
						API.get(`participant_user_info/${user_id}/`, {
							headers: { Authorization: `Token ${token}` }
						}).then(res2 => {
							let name = res2.data.username;
							if (is_host == 1 && is_presenter == 1) {
								name = name + " (Host)(Presenter)";
							}
							else if (is_host == 1 && is_presenter == 0) {
								name = name + " (Host)";
							}
							else if (is_host == 0 && is_presenter == 1) {
								name = name + " (Presenter)";
							}
							else if (is_host == 0 && is_presenter == 0) {
								name = name
							}
							setParticipantsSet((prevParticipantsSet) => [
								...prevParticipantsSet,
								{
									agora_id: user.uid,
									user_id: user_id,
									is_presenter: is_presenter,
									is_host: is_host,
									name: name,
								}
							]);
						}).catch((exception) => {
							console.log(exception);
						});
						
						
					}
					).catch((exception => {
						console.log(exception)
					}))
					console.log("a" + response.data.status)
					setParticipantsSet((participantsSet) => [...participantsSet, user]);
				}
			}).catch((exception) => {
				console.log(exception);
			});
		});
	}, [users])


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

								{participantsSet.map((user) => {
									if (user.name !== undefined) {
									return <tr>
										<td>{user.name}</td>
										{is_host == 1 ? <td><button id={user.agora_id + "-remove"} onClick={() => removeUser(user.agora_id)}>Remove</button></td> : <td>---</td>}
										{is_host == 1 ? user.is_presenter ? <td><button id={user.uid + "-unset"} onClick={() => unsetPresenter(user.agora_id, 0, user)}>Unset Presenter</button></td> :
											<td><button id={user.uid + "-set"} onClick={() => setPresenter(user.agora_id, user)}>Set Presenter</button></td> : <td>---</td>}
										{status === "presenter" && !user.is_presenter ? <td><button onClick={() => alertUser(user.agora_id)}>Alert</button></td> : <td>---</td>}
									</tr>

									}
									else {
										return <div></div>
									}
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