import React, { useState, useEffect } from 'react';
import API from "./API";
import { Cookies } from "react-cookie";
import { Chart } from "react-google-charts";
import { Button } from 'react-bootstrap';
const token = localStorage.getItem('token');

function CreatePollPopup(props) {
    const cookies = new Cookies();
    const user = cookies.get("userId");
	const meeting = cookies.get("channel_id");
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [buttonText, setButtonText] = useState('Share Poll');
    const [pollResult, setPollResult] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);

    const handleQuestionChange = (e) => {
      setQuestion(e.target.value);
    };
  
    const handleOption1Change = (e) => {
      setOption1(e.target.value);
    };
  
    const handleOption2Change = (e) => {
      setOption2(e.target.value);
    };
  
    const handleOption3Change = (e) => {
      setOption3(e.target.value);
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        setButtonText('Shared!');
        const request_data = {
            user,
            meeting,
            question,
            options: [option1, option2, option3],
        };
        
            API.post(`create_poll/`, JSON.stringify(request_data) , { headers: { Authorization: `Token ${token}` } }).then(response => {
                console.log(response);
                props.setTrigger(false);
            }).catch((exception) => {
                console.log(exception);
            });
    
    };

    useEffect(() => {
        const interval = setInterval(() => {
          API.get(`get_latest_poll_result/${meeting}/`, { headers: { Authorization: `Token ${token}` } })
            .then(response => {
                if(response.status != 404){
                    setPollResult(response.data.poll_results);
                    setChartOptions({
                        title: response.data.question_body,
                        is3D: true,
                    });
                }
            })
            .catch((exception) => {
              console.log(exception);
            });
        }, 3000);
    
        return () => {
          clearInterval(interval);
        };
      }, []);

	function insidePopup() {
		return (
			<div className="popup">
				<div className="popup-inner">
                    <div class="two-side">
                    <button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <form onSubmit={handleSubmit}>
                        <center>
                            <h2>Create Poll</h2><br></br>
                        </center>
                        <div className="form-group">
                        <label htmlFor="question">Question:</label>
                        <input
                            type="text"
                            id="question"
                            value={question}
                            onChange={handleQuestionChange}
                        />
                        </div>
                        <div className="form-group">
                        <label htmlFor="option1">Option 1:</label>
                        <input
                            type="text"
                            id="option1"
                            value={option1}
                            onChange={handleOption1Change}
                        />
                        </div>
                        <div className="form-group">
                        <label htmlFor="option2">Option 2:</label>
                        <input
                            type="text"
                            id="option2"
                            value={option2}
                            onChange={handleOption2Change}
                        />
                        </div>
                        <div className="form-group">
                        <label htmlFor="option3">Option 3:</label>
                        <input
                            type="text"
                            id="option3"
                            value={option3}
                            onChange={handleOption3Change}
                        />
                        </div>
                        <center>
                            <button id="sharePoll" type="submit" >{buttonText}</button>
                        </center>
                    </form>
                    <div>
                        <center>
                            <h2>Latest Poll Result</h2><br></br>
                        </center>
                        {pollResult !== null ? <Chart
                                                chartType="PieChart"
                                                data={pollResult}
                                                options={chartOptions}
                                                width={"100%"}
                                                height={"300px"}
                                                />:<p>You didn't create any poll yet.</p>}
                    </div>
                    </div>
				</div>
			</div>
		)
	}
	
	return (
		<div>
			{props.trigger === true ? insidePopup() : null}
		</div>
	);
}

export default CreatePollPopup;

