import React from 'react';
import UThere from './UThere';
import {BsCameraVideo} from 'react-icons/bs';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {CgProfile} from 'react-icons/cg';
import {BsQuestionCircle} from 'react-icons/bs';
import {Link} from 'react-router-dom';
import Logout from './Logout';
import JoinMeetingPopup from './JoinMeetingPopup';

function Dashboard() {
	const [trigger, setTrigger] = React.useState(false);

	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			<div className='dashboard' style={{"background-color": "white"}}>
				<center><h1>Welcome Jane</h1></center>
				<hr></hr>
				<table className='dashboard-table-columns'>
					<tr>
						<td><Link to="/Meeting"><BsCameraVideo color="#6666ff" size={100}/></Link></td>
						<td><AiOutlinePlusCircle onClick={() => setTrigger(true)} color="#ffb3e6" size={100}/></td>
						<td><Link to="/Profile"><CgProfile color="gray" size={100}/></Link></td>
						<td><Link to="/Contact"><BsQuestionCircle color="orange" size={100}/></Link></td>
					</tr>
					<tr>
						<td><center><Link to="/Meeting"><label>New Meeting</label></Link></center></td>
						<td><center><label onClick={() => setTrigger(true)}>Join Meeting</label></center></td>
						<td><center><Link to="/Profile"><label style={{"color": "black"}}>Profile</label></Link></center></td>
						<td><center><Link to="/Contact"><label style={{"color": "black"}}>Contact Us</label></Link></center></td>
					</tr>
				</table>
			</div>
			<JoinMeetingPopup trigger={trigger} setTrigger={setTrigger}></JoinMeetingPopup>
		</div>
	);
}

export default Dashboard;