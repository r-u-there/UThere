import React, { useEffect, useState } from 'react';

function AlertPopup(props) {
  const { triggerAlertPopup, setTriggerAlertPopup } = props;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if(triggerAlertPopup){
        setIsVisible(true);
        setTimeout(() => {
            setIsVisible(false);
            setTriggerAlertPopup(false);
        }, 4000);
    }
  }, [triggerAlertPopup]);

  // alert
  function insidePopup() {
    return (
      <div className="popup">
        <div className="popup-inner-clipboard">
          <br />
          <center>
            <h5>Presenter noticed that your attention rate has decreased. Please pay attention to the presentation.</h5>
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

export default AlertPopup;
