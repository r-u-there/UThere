import React, { useEffect, useState } from 'react';
import {Cookies} from "react-cookie";
import axios from 'axios';

function PollPopup(props) {
    const { pollTrigger, setPollTrigger } = props;
    const cookies = new Cookies();
    const channelId = cookies.get("channel_id")
    const userId = cookies.get("userId");
    const token = localStorage.getItem('token');

    function createPoll() {
        const form = document.getElementById('pollForm');
        const q_body = form.q_body.value;
        const option1 = form.option1.value;
        const option2 = form.option2.value;
        const option3 = form.option3.value;

        const data = {
            question_body : q_body,
            channel_id: channelId,
            user_id: userId,
            option_1: option1,
            option_2: option2,
            option_3: option3,
            // Add other form input values to the data object
        };
        console.log(data);

        axios.post('http://127.0.0.1:8000/api/create_poll/', data,{
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(response => {
            console.log("poll created successfully");
        })
        .catch(exception => {
            console.log(exception);
        });
    }

  function insidePopup() {
    return (
        <div className="popup-poll">
            <div className="popup-inner-poll">
                <center>
                    <h2>Create Poll</h2><br></br>
                </center>
                <form id="pollForm">
                    <label for="q_body">Poll Question</label>
                    <textarea name="text" id="q_body" placeholder="Type your question here"></textarea><br></br>
                    
                    <label for="option1">Option1</label>
                    <input type="text" id="option1" name="option1"/><br></br>
                    
                    <label for="option2">Option2</label>
                    <input type="text" id="option2" name="option2"/><br></br>
                    
                    <label for="option3">Option3</label>
                    <input type="text" id="option3" name="option3"/><br></br>

                    <center>
                        <button onClick={() => createPoll()} >Create Poll</button>
                    </center>
                    
                </form>

                <button type="button" onClick={() => setPollTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            </div>
        </div>
    );
  }

  return (
    <div>
      {pollTrigger? insidePopup() : null}
    </div>
  );

}

export default PollPopup;
