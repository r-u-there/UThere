import React from 'react';

function ErrorMessagePopup(props) {

	function insidePopup() {
		return (
			<div className="popup-error">
				<div className="popup-error-inner">
					<br></br>
					<center>
						<h3>{props.errorMessage}. Please try again!</h3>
						<button onClick={() => {props.setTrigger(false)}} className='btn btn-danger'>OK</button>
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

export default ErrorMessagePopup;