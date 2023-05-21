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
    const [tabSelection, setTabSelection] = useState(0);

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

        API.post(`create_poll/`, JSON.stringify(request_data), { headers: { Authorization: `Token ${token}` } }).then(response => {
            console.log(response);
            setButtonText('Share Poll')
            props.setTrigger(false);
        }).catch((exception) => {
            console.log(exception);
        });

    };

    useEffect(() => {
        const interval = setInterval(() => {
            API.get(`get_latest_poll_result/${meeting}/`, { headers: { Authorization: `Token ${token}` } })
                .then(response => {
                    if (response.status != 404) {
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

    function displayProfile() {
        if (tabSelection == 0) {
            return (
                <div>
                    <form onSubmit={handleSubmit}>
                        <br></br>
                        <center>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Question:</span>
                                </div>
                                <textarea onChange={handleQuestionChange} type="text" className="form-control" placeholder="Please type the poll question." />
                            </div>
                            <div class="input-group mt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Option 1:</span>
                                </div>
                                <input onChange={handleOption1Change} type="text" className="form-control" placeholder="Please type the first option." />
                            </div>
                            <div class="input-group mt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Option 2:</span>
                                </div>
                                <input onChange={handleOption2Change} type="text" className="form-control" placeholder="Please type the second option." />
                            </div>
                            <div class="input-group mt-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Option 3:</span>
                                </div>
                                <input onChange={handleOption3Change} type="text" className="form-control" placeholder="Please type the third option." />
                            </div>
                        </center>
                        <center>
                            <button type="submit" className="mt-3">{buttonText}</button>
                        </center>
                    </form>
                </div>
            );
        }
        else if (tabSelection == 1) {
            return (
                <div>
                    <br></br>
                    {pollResult !== null ? <Chart
                        chartType="PieChart"
                        data={pollResult}
                        options={{
                            ...chartOptions,
                            fontSize: 15, // Set the desired font size here
                        }}
                        width= "100%"
                        height="200px"
                    /> : <p>You didn't create any poll yet.</p>}
                </div>
            );
        }
    }

    function insidePopup() {
        return (
            <div className="popup-poll">
                <div className="popup-poll-inner">
                    <div>
                        <button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <div>
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <a className="nav-link active" data-toggle="tab" href="" onClick={() => { setTabSelection(0) }}>Create Poll</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(1)}>Latest Poll Result</a>
                                </li>
                            </ul>
                            {displayProfile()}
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

