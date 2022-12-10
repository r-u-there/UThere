import React from 'react';
import UThere from './UThere';
import {useState} from 'react';
import Logout from './Logout';
import axios from 'axios';

function ContactPage() {
	const [message, setMessage] = useState("");
	const [category, setCategory] = useState("");

	function submit() {
		let item = {category, message};
		axios.post('http://127.0.0.1:8000/api/contact/', item).then(response => {
			console.log("success");
			console.log(response);
			window.location = "/Dashboard";
		}).catch(exception => {
			console.log(exception);
		});
	}

	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			<div>
				<form className='contact-form' style={{"backgroundColor": "white"}}>
					<h1 className="my-1 mr-2">We'd love to hear from you!</h1>
					<div className="dropdown">
						<button className="btn btn-light mt-3 dropdown-toggle" style={{"fontSize": "20px"}} type="button" id="dropdownMenuButton" data-toggle="dropdown" >Select what we can help you with.</button>
						<div className="dropdown-menu">
							<a className="dropdown-item" href="#" onClick={e => setCategory("Error Reporting")}>Error Reporting</a>
							<a className="dropdown-item" href="#" onClick={e => setCategory("Request For A New Feature")}>Request For A New Feature</a>
							<a className="dropdown-item" href="#" onClick={e => setCategory("Other")}>Other</a>
						</div>
					</div>
					<label class="my-1 mr-2 mt-3" style={{"fontSize": "30px"}}>Message</label>
					<div class="input-group">
						<textarea class="form-control mt-1" style={{"height": "150px"}} onChange={(e) => setMessage(e.target.value)}></textarea>
					</div>
					<br></br><center><button type="button" onClick={submit} className="btn" style={{ "backgroundColor": "#ffb84d", "color": "white", "fontSize": "20px", "width": "150px", "borderRadius": "100px"}}>Send</button></center>
				</form>
			</div>
		</div>
	);
}

export default ContactPage;