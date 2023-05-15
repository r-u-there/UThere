import React, { useEffect } from 'react';
import UThere from './UThere';
import { useState } from 'react';
import Logout from './Logout';
import axios from 'axios';
import { Cookies } from "react-cookie";
import * as ReactBootStrap from "react-bootstrap"
import ErrorMessagePopup from './ErrorMessagePopup';
const token = localStorage.getItem('token');

function ContactPage() {
	const [message, setMessage] = useState("");
	const [category, setCategory] = useState("Select what we can help you with.");
	const cookies = new Cookies();
	const userId = cookies.get("userId");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [trigger, setTrigger] = useState(false);

	//get user mail from the user id
	function getUserInfo() {
		console.log(userId);
		axios.get(`http://127.0.0.1:8000/api/user/info/${userId}/`, {
			headers: { Authorization: `Token ${token}` }
		}).then(response => {
			setEmail(response.data.email)
			setLoading(true)
		}).catch((exception) => {
			window.location = "/Login"
			console.log(exception);
		});
	}

	function submit() {
		if (message !== "") {
			if (category !== "Select what we can help you with.") {
				let item = { category, message, email };
				axios.post('http://127.0.0.1:8000/api/contact/', item, {
					headers: {
						'Authorization': 'Token ' + token,
						'Content-Type': 'application/json'
					}
				}).then(response => {
					console.log(response);
					window.location = "/Dashboard";
				}).catch(exception => {
					console.log(exception);
				});
			}
			else {
				setErrorMessage("You should select a category to be able to contact us");
				setTrigger(true)
			}
		}
		else {
			if (category !== "Select what we can help you with.") {
				setErrorMessage("You should enter some message to be able to contact us");
				setTrigger(true)
			}
			else {
				setErrorMessage("You should enter some message and select a category to be able to contact us");
				setTrigger(true)
			}
		}

	}

	useEffect(() => {
		getUserInfo()
	}, [])

	return (
		<div>
			{loading ?
				<div>
					<UThere></UThere>
					<div className='page-background'></div>
					<Logout></Logout>
					<div>
						<form className='contact-form' style={{ "backgroundColor": "white" }}>
							<h1 className="my-1 mr-2">We'd love to hear from you!</h1>
							<div className="dropdown">
								<button className="btn btn-light mt-3 dropdown-toggle" style={{ "fontSize": "20px" }} type="button" id="dropdownMenuButton" data-toggle="dropdown" >{category}</button>
								<div className="dropdown-menu">
									<a className="dropdown-item" href="#" onClick={e => setCategory("Error Reporting")}>Error Reporting</a>
									<a className="dropdown-item" href="#" onClick={e => setCategory("Request For A New Feature")}>Request For A New Feature</a>
									<a className="dropdown-item" href="#" onClick={e => setCategory("Other")}>Other</a>
								</div>
							</div>
							<label class="my-1 mr-2 mt-3" style={{ "fontSize": "30px" }}>Message</label>
							<div class="input-group">
								<textarea class="form-control mt-1" style={{ "height": "150px" }} onChange={(e) => setMessage(e.target.value)}></textarea>
							</div>
							<br></br><center><button type="button" onClick={submit} className="btn" style={{ "backgroundColor": "#ffb84d", "color": "white", "fontSize": "20px", "width": "150px", "borderRadius": "100px" }}>Send</button></center>
						</form>
					</div>
				</div> : <div className="loading"><ReactBootStrap.Spinner style={{ height: "100px", width: "100px" }} animation="border" /></div>}
				<ErrorMessagePopup errorMessage={errorMessage} setErrorMessage={setErrorMessage} trigger={trigger} setTrigger={setTrigger}></ErrorMessagePopup>
		</div>
	);
}

export default ContactPage;