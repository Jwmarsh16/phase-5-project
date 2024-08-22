import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Events from './components/Events';
import EventDetail from './components/EventDetail';
import Groups from './components/Groups';
import GroupDetail from './components/GroupDetail';
import GroupInvite from './components/GroupInvite';
import GroupInvitations from './components/GroupInvitations';
import UserProfile from './components/UserProfile';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/groups/:id/invite" element={<GroupInvite />} />
        <Route path="/invitations" element={<GroupInvitations />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
