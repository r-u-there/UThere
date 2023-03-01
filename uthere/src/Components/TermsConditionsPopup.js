import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsConditionsPopup(props) {
    function insidePopup(){
        return(
        <div>
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h2>Privacy Statement</h2><br></br>
						<button type="button" onClick={() => props.setTrigger(false)} className="close popup-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
				</div>
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

export default TermsConditionsPopup;