import React from 'react';
import { useNavigate } from 'react-router-dom';

function JoinMeetingPopup(props) {
	const navigate = useNavigate(); 

 	function joinMeeting() {
		// TODO: this will be a meeting id, for now it is meeting's token
    	if (document.querySelector(".form-control").value === "007eJxTYNitcuGg5FJD71SvRqN5X6OEX22Ovi/zqF8gqf7xSouzN54pMBiamidaJpsZJKWZpJgkW5hamBqaWJglJhklm6UYJBsbFU6an9wQyMiwgHcVMyMDBIL4LAy5iZl5DAwAhYkgLw==") {
			navigate("/Meeting");
    	}
		else {
			alert("Invalid Meeting ID");
		}
	}

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>Enter Meeting ID</h2><br></br>
						<input className="form-control"/><br></br>
						<button onClick={() => joinMeeting()} className="btn btn-primary">Join</button>
						<button type="button" onClick={() => props.setTrigger(false)} className="close popup-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
			</div>
		)
	}
	
	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
	);
}

export default JoinMeetingPopup;