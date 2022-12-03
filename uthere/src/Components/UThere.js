import React from 'react';
import UThereIcon from "../Icons/UThereIcon.png";
import {Link} from 'react-router-dom';
function UThere() {
	return (
		<div className='uthere'> 
			<table>
				<tr>
					<td><Link to="/Dashboard"><img src={UThereIcon} style={{"height": "80px"}} alt="logo"/></Link>&emsp;</td>
					<td><Link to="/Dashboard"><a style={{"font-size": "50px", "color": "black"}}>UThere</a></Link></td>
				</tr>
			</table>         
		</div>
  );
}

export default UThere;