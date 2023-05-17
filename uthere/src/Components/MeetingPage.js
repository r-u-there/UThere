import React, { useState, useEffect } from 'react';
import UThere from "./UThere";
import { Cookies } from "react-cookie";
import axios from "axios";
import API from "./API";

function MeetingPage() {
  const cookies = new Cookies();
  const userId = cookies.get("userId");
  const token = localStorage.getItem('token');
  var response;

  useEffect(() => {
    async function checkEyeTracking() {
      try {
        response = await API.get(`getsettings/${userId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        if (response.data.hide_eye_tracking) {
          window.location = "/MeetingWithoutCalibration";
        } else {
          window.location = "/Calibration";
        }
      } catch (exception) {
        window.location = "/Login";
        console.log(exception);
      }
    }
    checkEyeTracking();
  }, []);

  return (
    <div>
      <UThere notClickable={false}></UThere>
      <div className='page-background'></div>
    </div>
  );
}

export default MeetingPage;
