import React from 'react';
import UThere from './UThere';
import Logout from './Logout';
import {GrDocumentPdf} from 'react-icons/gr'
import {BiChevronRightCircle} from 'react-icons/bi'
import {TbEdit} from 'react-icons/tb';
import {MdToggleOff} from 'react-icons/md';
import {MdToggleOn} from 'react-icons/md';

function ProfilePage() {
	const [tabSelection, setTabSelection] = React.useState(0);
	const [toggle1, setToggle1] = React.useState(false);
	const [toggle2, setToggle2] = React.useState(false);
	const [toggle3, setToggle3] = React.useState(false);
	const [toggle4, setToggle4] = React.useState(false);
	const [toggle5, setToggle5] = React.useState(false);

	function displayProfile() {
		if (tabSelection == 0) {
			return (
				<div>
					<center><table>
						<tr>
							<td><b>Full Name: &ensp;</b></td>
							<td> Ruzan Raschelle</td>
							<td>&ensp;<TbEdit size={40}/></td>
						</tr>
						<tr>
							<td><b>Email: &ensp;</b></td>
							<td>ruzan@gmail.com</td>
							<td>&ensp;<TbEdit size={40}/></td>
						</tr>
						<tr>
							<td><b>Password: &ensp;</b></td>
							<td>*******</td>
							<td>&ensp;<TbEdit size={40}/></td>
						</tr>
					</table></center>
				</div>
			);
		}
		else if (tabSelection == 1) {
			return (
				<div>
					<ul>
						<li><GrDocumentPdf size={30}/>&emsp;Attention Report - 06/05/2022</li>
						<li className='mt-3'><GrDocumentPdf size={30}/>&emsp;Attention Report - 10/24/2022</li>
						<li className='mt-3'><GrDocumentPdf size={30}/>&emsp;Attention Report - 10/17/2022</li>
					</ul>
				</div>
			);
		}
		else if (tabSelection == 2) {
			return (
				<div>
					<table>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Attention Rating Limit: 75%</td>
							<td>&emsp;&emsp;<TbEdit size={40}/></td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Get Analysis Report</td>
							<td>&emsp;&emsp;{!toggle1 ? <MdToggleOff onClick={() => setToggle1(!toggle1)} size={40}/> : <MdToggleOn onClick={() => setToggle1(!toggle1)} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Emotion Analysis</td>
							<td>&emsp;&emsp;{!toggle2 ? <MdToggleOff onClick={() => setToggle2(!toggle2)} size={40}/> : <MdToggleOn onClick={() => setToggle2(!toggle2)} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Attention Analysis</td>
							<td>&emsp;&emsp;{!toggle3 ? <MdToggleOff onClick={() => setToggle3(!toggle3)} size={40}/> : <MdToggleOn onClick={() => setToggle3(!toggle3)} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide Real-Time Analysis</td>
							<td>&emsp;&emsp;{!toggle4? <MdToggleOff onClick={() => setToggle4(!toggle4)} size={40}/> : <MdToggleOn onClick={() => setToggle4(!toggle4)} size={40} color="green"/>}</td>
						</tr>
						<tr>
							<td><BiChevronRightCircle size={30}/></td>
							<td>&ensp;Hide "Who Left" Information</td>
							<td>&emsp;&emsp;{!toggle5 ? <MdToggleOff onClick={() => setToggle5(!toggle5)} size={40}/> : <MdToggleOn onClick={() => setToggle5(!toggle5)} size={40} color="green"/>}</td>
						</tr>
					</table>
				</div>
			);
		}
	}

	React.useEffect( () => {
		displayProfile();
	}, []);

	return (
		<div>
			<UThere></UThere>
			<div className='page-background'></div>
			<Logout></Logout>
			<div className='profile'>
				<ul className="nav nav-tabs">
					<li className="nav-item">
						<a className="nav-link active" data-toggle="tab" href="" onClick={() => {setTabSelection(0)}}>Profile</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(1)}>Past Analysis Reports</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(2)}>Analysis Preferences</a>
					</li>
				</ul><hr></hr>
				{displayProfile()}
			</div>
		</div>
	);
}

export default ProfilePage;