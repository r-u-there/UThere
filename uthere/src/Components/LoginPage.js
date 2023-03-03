/*jshint esversion: 6 */
import React from 'react';
import LoginIcon from '../Icons/LoginPageIcon3.png';
import UThere from './UThere';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {useState} from 'react';
import {useCookies} from "react-cookie";

function LoginPage() {
	const [cookies, setCookie] = useCookies(["refreshToken"])
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginSuccess, setLoginSuccess] = useState(true);

	function login() {
		axios.post('http://127.0.0.1:8000/api/auth/login/', {
			"email": email,
			"password": password
		}).then(response => {
			console.log("success");
			console.log(response);
			setCookie("refreshToken", response.data.refresh);
			setCookie("accessToken", response.data.access);
			setCookie("userId", response.data.user.id);
			setCookie("username", response.data.user.username);
			setCookie("email", response.data.user.email);
			window.location = "/Dashboard";
		}).catch((exception) => {
			setLoginSuccess(false);
			console.log(exception);
		});
	}

return (
	<div>
		<UThere></UThere>
		<table>
			<tr>
				<td className='col-6'>
					<center>
						<div>
							<form>
								<div className="form-group">
									<div className="col-sm-10">
										<center><p style={{ "fontSize": 50, "color": "#ff9900" }}>Sign In</p></center>
									</div>
								</div>
								<div className="form-group col-sm-10">
									{!loginSuccess ? <label style={{"color": "red"}}>Incorrect email or password! Login unsuccessful!</label> : null}
									<input type="text" className="form-control" id="inputEmail" placeholder="Email" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => {setEmail(e.target.value);setLoginSuccess(true);}}/>
								</div>
								<div className="form-group col-sm-10">
									<input type="password" className="form-control" id="inputPassword" placeholder="Password" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => {setPassword(e.target.value); setLoginSuccess(true);}}/>
								</div>
								<div className="form-group col-sm-10">
									<center><button type="button" className="btn rounded-pill" style={{ "background-color": "#ffb84d", "color": "white" }} onClick={login}>Sign In</button></center>
								</div>
								<div className="form-group col-sm-10">
									<center><Link to="/" style={{ "fontSize": 12 }}>New to UThere? Create an account.</Link></center>
								</div>
							</form>
						</div>
					</center>
				</td>
				<td className='row'><img src={LoginIcon} /></td>
			</tr>
		</table>

	</div>
);
}

export default LoginPage;