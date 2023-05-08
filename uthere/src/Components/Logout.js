import React from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';
import {Cookies} from "react-cookie";
import axios from 'axios';
const token = localStorage.getItem('token');


function Logout() {
	const cookies = new Cookies();
	function logout(){
	axios.post('http://127.0.0.1:8000/api/auth/logout/', null, {
	  headers: { 'Authorization': `Token ${token}` }
	});


	Object.keys(cookies.getAll()).forEach(cookie => {
			cookies.remove(cookie);
		  });
	}
	return (
		<div className='logout-position'>
			<Link to="/Login">
				<table>
					<tr>
						<td><IoIosLogOut size={40} /></td>
						<td><label className='mt-2' onClick={logout} style={{ "font-size": "18px" }}>Sign Out</label></td>
					</tr>
				</table>
			</Link>
		</div>
	);
}

export default Logout;