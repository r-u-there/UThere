import { Route, Routes } from 'react-router-dom';
import React from 'react';
import RegistrationPage from './Components/RegistrationPage';
import LoginPage from './Components/LoginPage';
import ContactPage from './Components/ContactPage';
import Dashboard from './Components/Dashboard';
import './App.css';
import ProfilePage from './Components/ProfilePage';
import MeetingPage from './Components/MeetingPage';
import MeetingEnding from "./Components/MeetingEnding";

function App() {
	return (
		<Routes>
			<Route path="/" element={<RegistrationPage/>} />
			<Route path="/Login" element={<LoginPage/>} />
			<Route path="/Contact" element={<ContactPage/>} />
			<Route path="/Dashboard" element={<Dashboard/>} />
			<Route path="/Profile" element={<ProfilePage/>} />
			<Route path="/Meeting" element={<MeetingPage/>} />
			<Route path="/MeetingEnding" element={<MeetingEnding/>} />
 		</Routes>
	);
}

export default App;