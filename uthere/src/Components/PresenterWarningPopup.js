import React, { useEffect, useState } from 'react';

function PresenterWarningPopup(props) {
  const { triggerPresenterWarningPopup, setTriggerPresenterWarningPopup } = props;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if(triggerPresenterWarningPopup){
        setIsVisible(true);
        setTimeout(() => {
            setIsVisible(false);
            setTriggerPresenterWarningPopup(false);
        }, 4000);
    }
  }, [triggerPresenterWarningPopup]);

  function insidePopup() {
    return (
      <div className="popup">
        <div className="popup-inner-clipboard">
          <br />
          <center>
            <h5>The attention level of participants tend to decrease. You may consider creating a poll or alert users to attract their attention.</h5>
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

export default PresenterWarningPopup;
