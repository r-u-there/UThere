import React from 'react';

function JoinMeetingPopup(props) {

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>Enter Meeting ID</h2><br></br>
						<input className="form-control"/><br></br>
						<button type="button" className="btn btn-primary">Join</button>
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