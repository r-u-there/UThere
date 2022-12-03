import React from 'react';
import LoginIcon from '../Icons/LoginPageIcon3.png';
import UThere from './UThere';
import {Link} from 'react-router-dom';

function LoginPage() {
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
									<input type="text" className="form-control" id="inputEmail" placeholder="Email" style={{ "border-radius": "20px", "width": "70%"}} />
								</div>
								<div className="form-group col-sm-10">
									<input type="password" className="form-control" id="inputPassword" placeholder="Password" style={{ "border-radius": "20px", "width": "70%"}} />
								</div>
								<div className="form-group col-sm-10">
									<center><button type="button" className="btn rounded-pill" style={{ "background-color": "#ffb84d", "color": "white" }}>Sign In</button></center>
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