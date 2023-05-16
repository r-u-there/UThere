import React from 'react';
import LoginIcon from '../Icons/LoginPageIcon3.png';
import UThere from './UThere';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import API from './API.js';
import axios from 'axios';
import { useCookies } from "react-cookie";
import TermsConditionsPopup from './TermsConditionsPopup';

function RegistrationPage() {
	const [username, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVerification, setPasswordVerification] = useState("");
	const [loginSuccess, setLoginSuccess] = useState(0);
	const [failureMessage, setFailureMessage] = useState("");
	const [trigger, setTrigger] = React.useState(false);
	const [agree, setAgree] = React.useState(false);
	const [cookies, setCookie] = useCookies(["refreshToken"])

	function handleAgreeCheckbox() {
		setAgree(!agree)
		console.log(agree)
	}

	function register() {
		let item = { "username": username, "email": email, "password": password };
		if (password !== passwordVerification) {
			setLoginSuccess(2);
		}
		else if (!agree) {
			setLoginSuccess(3);
		}
		else {
			API.post('auth/register/', item).then(response => {
				window.location = "/Login";
			}).catch((exception) => {
				setLoginSuccess(1);
				if (Object.hasOwn(exception.response.data, 'email')) {
					setFailureMessage("Invalid email address! Registration unsuccessful!");
				} else if (Object.hasOwn(exception.response.data, 'username')) {
					setFailureMessage("Existing username! Registration unsuccessful!");
				} else if (Object.hasOwn(exception.response.data, 'password')) {
					setFailureMessage("Password shorter than 8 characters! Registration unsuccessful!");
				}
				console.log(exception);
			});
		}
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
											<center><p style={{ "fontSize": 50, "color": "#ff9900" }}>Sign Up</p></center>
										</div>
									</div>
									<div className="form-group col-sm-10">
										{loginSuccess === 1 ? <label style={{ "color": "red" }}>{failureMessage}</label> : (loginSuccess == 2 ? <label style={{ "color": "red" }}>Passwords do not match!</label> : (loginSuccess == 3 ? <label style={{ "color": "red" }}>Please Agree Terms & Conditions</label> : null))}
										<input type="text" className="form-control" id="inputName" placeholder="Full Name" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => { setFullName(e.target.value); setLoginSuccess(0); }} />
									</div>
									<div className="form-group col-sm-10">
										<input type="text" className="form-control" id="inputEmail" placeholder="Email" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => { setEmail(e.target.value); setLoginSuccess(0); }} />
									</div>
									<div className="form-group col-sm-10">
										<input type="password" className="form-control" id="inputPassword" placeholder="Password" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => { setPassword(e.target.value); setLoginSuccess(0); }} />
									</div>
									<div className="form-group col-sm-10">
										<input type="password" className="form-control" id="inputPassword" placeholder="Password Verification" style={{ "border-radius": "20px", "width": "70%" }} onChange={(e) => { setPasswordVerification(e.target.value); setLoginSuccess(0); }} />
									</div>
									<div>
										<td>
											<label>
												<input type="checkbox" onChange={handleAgreeCheckbox} /> I have read and agree to UThere's <label className="label-terms" onClick={() => setTrigger(true)} >Terms & Conditions</label>
											</label>
										</td>
									</div>
									<div className="form-group col-sm-10">
										<center><button type="button" className="btn rounded-pill" style={{ "background-color": "#ffb84d", "color": "white" }} onClick={register}>Sign Up</button></center>
									</div>
									<div className="form-group col-sm-10">
										<center><Link to="/Login" style={{ "fontSize": 12 }}>Have an account? Sign in.</Link></center>
									</div>
								</form>
							</div>
							<TermsConditionsPopup trigger={trigger} setTrigger={setTrigger}></TermsConditionsPopup>
						</center>
					</td>
					<td className='row'><img src={LoginIcon} /></td>
				</tr>
			</table>

		</div>
	);
}

export default RegistrationPage;