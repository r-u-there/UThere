import React, { useState, useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer"
import {Cookies} from "react-cookie";
import axios from 'axios';

function AttentionAnalysisPopup(props) {
  const { attentionScore, emotionStatus, hideEmotionAnalysis,hideAttentionAnalysis} = props;
  const [score, setScore] = useState(attentionScore);
  const [emotion, setEmotion] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
 
  const cookies = new Cookies();
  const token = localStorage.getItem("token");
	const userId = cookies.get("userId");

  useEffect(() => {
    setScore(attentionScore);
    setEmotion(emotionStatus)
  }, [attentionScore,emotionStatus]);

  const handleMinimizeClick = () => {
    setIsMinimized(!isMinimized);
  }

  return (
    <div className="popup-attention">
      {!isMinimized && (
        <div className="popup-attention-inner">
          <table style={{ borderCollapse: "collapse" }}>
            <tr>{!hideAttentionAnalysis? hideEmotionAnalysis? 
              <td style={{  paddingRight: "10px" }}>
                  <table>
                    <tr>
                      <td><h5 style={{ marginTop: '1rem' }}>Average Attention Score</h5></td>
                      <td><button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }} onClick={handleMinimizeClick}>-</button></td>
                    </tr>
                    <tr>
                      <center>
                        <ReactSpeedometer
                          maxValue={3}
                          minValue={1}
                          segments={3}
                          value={score}
                          width={200}
                          height={140}
                          customSegmentLabels={[
                            { text: "Low", color: "#555", position: "OUTSIDE" },
                            { text: "Medium", color: "#555", position: "OUTSIDE" },
                            { text: "High", color: "#555", position: "OUTSIDE" },
                          ]}
                        />
                      </center>
                    </tr>
                  </table>
                </td>:
                <td style={{ borderRight: "2px solid black", paddingRight: "10px" }}>
                <table>
                  <tr>
                    <td><h5 style={{ marginTop: '1rem' }}>Average Attention Score</h5></td>
                  </tr>
                  <tr>
                    <center>
                      <ReactSpeedometer
                        maxValue={3}
                        minValue={1}
                        segments={3}
                        value={score}
                        width={200}
                        height={140}
                        customSegmentLabels={[
                          { text: "Low", color: "#555", position: "OUTSIDE" },
                          { text: "Medium", color: "#555", position: "OUTSIDE" },
                          { text: "High", color: "#555", position: "OUTSIDE" },
                        ]}
                      />
                    </center>
                  </tr>
                </table>
              </td>: <td></td>}
              {!hideEmotionAnalysis?
               <td style={{ paddingLeft: "10px" }}>
               <table>
                 <tr>
                   <td><h5 style={{ marginTop: '1rem' }}>Average Emotion</h5></td>
                   <td><button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }} onClick={handleMinimizeClick}>-</button></td>
                 </tr>
                 <tr>
                   <center>
                     {emotion === 1 ? (
                       <td style={{ fontSize: '4rem' }}>🙁</td>
                     ) : emotion === 2 ? (
                       <td style={{ fontSize: '4rem' }}>😠</td>
                     ) : emotion === 3 ? (
                       <td style={{ fontSize: '4rem' }}>😮</td>
                     ) : emotion === 4 ? (
                       <td style={{ fontSize: '4rem' }}>😨</td>
                     ) : emotion === 5 ? (
                       <td style={{ fontSize: '4rem' }}>😊</td>
                     ) : emotion === 6 ? (
                       <td style={{ fontSize: '4rem' }}>🤢</td>
                     ) : emotion === 7 ? (
                       <td style={{ fontSize: '4rem' }}>😐</td>
                     ) : null}
                   </center>
                 </tr>
                 <tr>
                   <center>
                     {emotion === 1 ? (
                       <td><h5>Sad</h5></td>
                     ) : emotion === 2 ? (
                       <td><h5>Angry</h5></td>
                     ) : emotion === 3 ? (
                       <td><h5>Surprised</h5></td>
                     ) : emotion === 4 ? (
                       <td><h5>Fear</h5></td>
                     ) : emotion === 5 ? (
                       <td><h5>Happy</h5></td>
                     ) : emotion === 6 ? (
                       <td><h5>Disgust</h5></td>
                     ) : emotion === 7 ? (
                       <td><h5>Neutral</h5></td>
                     ) : <td><h5>Not Available</h5></td>}
                   </center>
                 </tr>
               </table>
             </td>:<></>}
            </tr>
          </table>
        </div>
      )}
      {isMinimized && (
        <div className="popup-attention-inner">
          <table>
            <tr>
              <td>
                
                {!hideAttentionAnalysis? !hideEmotionAnalysis? <h5 style={{ marginTop: '1rem' }}>Average Attention Score and Emotion</h5>:
                <h5 style={{ marginTop: '1rem' }}>Average Attention Score</h5>:<h5 style={{ marginTop: '1rem' }}>Average Emotion</h5>} 
         
              </td>
              <td><button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }} onClick={handleMinimizeClick}>+</button></td>
            </tr>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttentionAnalysisPopup;
