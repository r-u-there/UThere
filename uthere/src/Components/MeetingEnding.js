import React, { useEffect, useState } from 'react';
import UThere from "./UThere";
import Logout from "./Logout";
import { useLocation } from "react-router-dom";
import { Cookies } from "react-cookie";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap"
import API from "./API";

function MeetingEnding() {
  const location = useLocation();
  const cookies = new Cookies();
  const meetingId = cookies.get("channel_id");
  const userId = cookies.get("userId")
  const [participants, setParticipants] = useState([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false)
  const [triggerShareButton, setTriggerShareButton] = useState(true);
  
  useEffect(() => {
    getMeetingParticipants(meetingId);

    setTimeout(() => {
      setLoading(true);
    }, 4000); // Replace with your actual data fetching logic
  }, []);

  function giveShareAccess(id, agora_id) {
    //updat the database of this user
    API.put(`give_access_user/`, {
      "userId": id,
      "channelId": meetingId,
      "agoraToken": agora_id
    }, {
      headers: { Authorization: `Token ${token}` }
    }).then(response => {
      console.log(response);
    }).catch((exception) => {
      console.log(exception);
    });
    setTriggerShareButton(false)
  }

  // Retrieves the meeting participants.
  async function getMeetingParticipants(meetingId) {
    const newData = [];
    try {
      const response = await API.get(`get_all_meeting_participants/${meetingId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      console.log(meetingId)
      console.log(response);


      response.data.forEach(function (current, index) {
        var agora_uid = current.agora_id
        console.log(agora_uid)
        API.get(`get_user_info/${current.user}/`, {
          headers: { Authorization: `Token ${token}` }
        }).then(response => {
          console.log(response.data.username);
          var name = response.data.username
          if (current.user != userId) {
            //check whether this user becomes presenter at the any point of this meeting 
            API.put(`get_presenter_table/`,
              {
                "channelId": meetingId,
                "userId": current.user
              },
              {
                headers: { Authorization: `Token ${token}` }
              }).then(response => {
                if (response.data.hasOwnProperty('status') && response.data.status === 'MeetingUser not found') {
                  newData.push({ uid: current.user, participantName: name, agora_id: agora_uid });
                }
                else {
                  name = name + " (Presenter)"
                  newData.push({ uid: current.user, participantName: name, agora_id: agora_uid });
                }
                setParticipants(newData)
              }).catch((exception) => {
                console.log(exception);
              });
          }

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
                const { uid, participantName, agora_id } = participant;
                return (
                  <tr>
                    <td>{participantName}</td>
                    {triggerShareButton? <td><button className="btn btn-success" onClick={() => { giveShareAccess(uid, agora_id) }}>Share Report</button></td>: <td><button className="btn btn-light">Shared!</button></td>}
                  </tr>
                );
              })}
            </table>
          </div>
        </div> : <div className="loading"><ReactBootStrap.Spinner style={{ height: "100px", width: "100px" }} animation="border" /></div>}
    </div>
  );
}

export default MeetingEnding;