import React, {useEffect} from 'react';
import UThere from "./UThere";
import Logout from "./Logout";
import {useLocation} from "react-router-dom";
import {Cookies} from "react-cookie";
import axios from "axios";

function MeetingEnding() {
  const location = useLocation();
	const cookies = new Cookies();
  const channelId = cookies.get("channel_id")

  useEffect(() => {
    getMeetingParticipants(channelId);
  }, [])

  // Retrieves the meeting participants.
  async function getMeetingParticipants(channelId) {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_meeting_user/${channelId}/`);
			console.log(response)
    } catch (error) {
      console.log("error", error);
    }
  }

  return (
    <div>
      <UThere></UThere>
      <div className='page-background'></div>
      <Logout></Logout>
      <div className="meeting-ending">
        <h1>Meeting is over!</h1>
        <h4>With whom do you want to share the analysis report?</h4>
        <table class="meeting-participants-table">
          <tr>
            <td>Bilgehan Akcan</td>
            <td><button className="btn btn-success">Share Report</button></td>
          </tr>
        </table>
      </div>
    </div>
  );
}

export default MeetingEnding;