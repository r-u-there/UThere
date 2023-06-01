import React from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { Link } from 'react-router-dom';
import {Cookies} from "react-cookie";
import axios from 'axios';
import API from "./API";
const token = localStorage.getItem('token');


function Logout() {
	const cookies = new Cookies();
	function logout(){
	API.post('auth/logout/', null, {
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
						<td><IoIosLogOut size={40} onClick={logout} /></td>
						<td><p className='mt-2' onClick={logout} style={{ "font-size": "18px" }}>Sign Out</p></td>
					</tr>
				</table>
			</Link>
		</div>
	);
}

export default Logout;