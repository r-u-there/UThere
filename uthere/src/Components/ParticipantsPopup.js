import React from 'react';

function ParticipantsPopup(props) {
	const {trigger, setTrigger, users} = props;

  function insidePopup() {
    return (
			<div className="popup">
				<div className="popup-inner">
					<br></br>
					<center>
						<h4><u>Participants List</u></h4>
						<table>
							<tr>Me</tr>
							{users.map((user) => {
								return <tr>{user.uid}</tr>
							})}
						</table>
						<button type="button" onClick={() => {setTrigger(false)}} className="close popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</center>
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