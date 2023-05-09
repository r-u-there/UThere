import React, {useEffect, useState} from 'react';
import UThere from "./UThere";
import Logout from "./Logout";
import {useLocation} from "react-router-dom";
import {Cookies} from "react-cookie";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap"

function MeetingEnding() {
  const location = useLocation();
  const cookies = new Cookies();
  const meetingId = cookies.get("channel_id");
  const [participants, setParticipants] = useState([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMeetingParticipants(meetingId);
  }, []);

  // Retrieves the meeting participants.
  async function getMeetingParticipants(meetingId) {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_all_meeting_participants/${meetingId}/`, {
				  headers: { Authorization: `Token ${token}` }
			  }).then(response => {
          setLoading(true);
        }).catch((exception) => {
          window.location = "/Login"
          console.log(exception);
        });
			console.log(response);
      response.data.forEach(function(current, index) {
        axios.get(`http://127.0.0.1:8000/api/user/info/${current.user}/`, {
				  headers: { Authorization: `Token ${token}` }
			  }).then(response => {
				    console.log(response.data.username);
            setParticipants((prevUsers) => {
						  return [...prevUsers, response.data.username];
					  });
  			}).catch((exception) => {
	  			console.log(exception);
		    });
      });
    } catch (error) {
      console.log("error", error);
    }
  }
  return (
    <div>
    {loading ?
			<div>
      <UThere></UThere>
      <div className='page-background'></div>
      <Logout></Logout>
      <div className="meeting-ending">
        <h1>Meeting is over!</h1>
        <h4>With whom do you want to share the analysis report?</h4>
        <table class="meeting-participants-table">
          {participants.map((participant) => {
            return (
              <tr>
                <td>{participant}</td>
                <td><button className="btn btn-success">Share Report</button></td>
              </tr>
            );
          })}
        </table>
      </div></div> : <div className="loading"><ReactBootStrap.Spinner style={{height:"100px", width:"100px"}} animation="border"/></div>}
    </div>
  );
}

export default MeetingEnding;