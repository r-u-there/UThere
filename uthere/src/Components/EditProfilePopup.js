import React from 'react';
import { useState } from 'react';

function EditProfilePopup(props) {
	const [newInfo, setNewInfo] = useState("");

	function submitNewInfo() {
		
	}

  function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<label><b>Enter the new {props.changedInfo}:</b></label>
						<input onChange={(e) => {setNewInfo(e.target.value)}} className="form-control"/>
						<button type="button" className="btn btn-warning mt-3">Edit</button>
						<button type="button" onClick={() => {submitNewInfo(); props.setTrigger(false)}} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
			</div>
		);
	}

	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
  );
}

export default EditProfilePopup;