import React from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';

function Logout() {
	return (
		<div className='logout-position'>
			<Link to="/Login">
				<table>
					<tr>
						<td><IoIosLogOut size={40} /></td>
						<td><label className='mt-2' style={{ "font-size": "18px" }}>Sign Out</label></td>
					</tr>
				</table>
			</Link>
		</div>
	);
}

export default Logout;