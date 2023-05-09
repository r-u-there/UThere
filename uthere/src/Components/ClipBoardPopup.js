import React, { useEffect, useState } from 'react';

function ClipBoardPopup(props) {
  const { trigger2, setTrigger2 } = props;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if(trigger2){
        setIsVisible(true);
        setTimeout(() => {
            setIsVisible(false);
            setTrigger2(false);
        }, 1500);
    }
  }, [trigger2]);

  function insidePopup() {
    return (
      <div className="popup-clipboard">
        <div className="popup-inner-clipboard">
          <br />
          <center>
            <h5>Copied to Clipboard</h5>
          </center>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isVisible? insidePopup() : null}
    </div>
  );
}

export default ClipBoardPopup;
