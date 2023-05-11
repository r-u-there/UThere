import React, { useState, useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer"

function AttentionAnalysisPopup(props) {
  const { attentionScore } = props;
  const [score, setScore] = useState(attentionScore);
  const [isMinimized, setIsMinimized] = useState(false);
  useEffect(() => {
    setScore(attentionScore);
  }, [attentionScore]);

  const handleMinimizeClick = () => {
    setIsMinimized(!isMinimized);
  }

  return (
    <div className="popup-attention">
      {!isMinimized && (
        <div className="popup-attention-inner">
          <table>
            <tr>
              <td><h5 style={{ marginTop: '1rem' }}>Average Attention Score</h5></td>
              <td><button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }}  onClick={handleMinimizeClick}>-</button></td>
            </tr>
          </table>
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
        </div>
      )}
      {isMinimized && (
        <div className="popup-attention-inner">
        <table>
            <tr>
              <td><h5 style={{ marginTop: '1rem' }}>Average Attention Score</h5></td>
              <td><button className="btn btn-primary btn-sm" style={{ marginLeft: '1rem' }}  onClick={handleMinimizeClick}>+</button></td>
            </tr>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttentionAnalysisPopup;
