import React from 'react';
import UThere from "./UThere";
import Logout from "./Logout";
import {useLocation} from "react-router-dom";

function MeetingEnding(props) {
  const location = useLocation();
  const {data} = location.state;

  return (
    <div>
      <UThere></UThere>
      <div className='page-background'></div>
      <Logout></Logout>
      <div>
        <h1>Meeting is over!</h1>
        <h4>With whom do you want to share the analysis report?</h4>
      </div>
    </div>
  );
}

export default MeetingEnding;