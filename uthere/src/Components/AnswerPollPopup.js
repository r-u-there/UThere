import React from 'react';
import { useState } from 'react';
import API from "./API";
const token = localStorage.getItem('token');

function AnswerPollPopup(props) {
    const poll = props.polldata
    const [selectedOption, setSelectedOption] = useState('');
    const [submitText, setSubmitText] = useState('Submit Answer');

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitText("Submitted")
        API.put(`answer_poll/`, {
            "poll_id": poll.poll_id,
            "selected_option": selectedOption
        }, {
            headers: { Authorization: `Token ${token}` }
        }).then(response => {
            console.log(response);
            setSelectedOption('');
            props.setTrigger(false);
        }).catch((exception) => {
            console.log(exception);
        });
    };

    function insidePopup() {
        return (
            <div className="popup-poll">
                <div className="popup-poll-inner">
                    <button type="button" onClick={() => props.setTrigger(false)} className="close popup-close3" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <center>
                        <h4>Please answer the following question:</h4><br></br>
                    </center>
                    <h4>{poll.question_body}</h4>
                    <form onSubmit={handleSubmit}>
                        <label>
                            <input
                                type="radio"
                                value={poll.option1}
                                checked={selectedOption === poll.option1}
                                onChange={handleOptionChange}
                            />&ensp;
                            {poll.option1}
                        </label>
                        <br />
                        <label>
                            <input
                                type="radio"
                                value={poll.option2}
                                checked={selectedOption === poll.option2}
                                onChange={handleOptionChange}
                            />&ensp;
                            {poll.option2}
                        </label>
                        <br />
                        <label>
                            <input
                                type="radio"
                                value={poll.option3}
                                checked={selectedOption === poll.option3}
                                onChange={handleOptionChange}
                            />&ensp;
                            {poll.option3}
                        </label>
                        <br />
                        <center>
                            <button type="submit">{submitText}</button>
                        </center>
                    </form>
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

export default AnswerPollPopup;

