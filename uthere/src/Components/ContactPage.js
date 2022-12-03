import React from 'react';
import UThere from './UThere';
import Logout from './Logout';

function ContactPage() {
	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			<div>
				<form className='contact-form' style={{"background-color": "white"}}>
					<h1 class="my-1 mr-2">We'd love to hear from you!</h1>
					<div class="dropdown">
						<button class="btn btn-light mt-3 dropdown-toggle" style={{"font-size": "20px"}} type="button" id="dropdownMenuButton" data-toggle="dropdown" >Select what we can help you with.</button>
						<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a class="dropdown-item" href="#">Error Reporting</a>
							<a class="dropdown-item" href="#">Request For A New Feature</a>
							<a class="dropdown-item" href="#">Other</a>
						</div>
					</div>
					<label class="my-1 mr-2 mt-3" style={{"font-size": "30px"}}>Message</label>
					<div class="input-group">
						<textarea class="form-control mt-1" style={{"height": "150px"}}></textarea>
					</div>
					<br></br><center><button type="button" className="btn" style={{ "background-color": "#ffb84d", "color": "white", "font-size": "20px", "width": "150px", "border-radius": "100px"}}>Send</button></center>
				</form>
			</div>
		</div>
	);
}

export default ContactPage;