import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CommunityHome } from './CommunityHome';
import Communities from './pages/Communities';
import { CommunityFeed } from './CommunityFeed';
import Community from './pages/Community';
import CommunityEvents from './pages/CommunityEvents';
import EventPage from '@/pages/communities/EventPage';
import { AuthProvider } from './contexts/AuthProvider';

export function CommunitiesRouter() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<CommunityHome />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/feed" element={<CommunityFeed />} />
        <Route path="/community/:id" element={<Community />} />
        <Route path="/community/:id/events" element={<CommunityEvents />} />
        <Route path="/community/:communityId/events/:eventId" element={<EventPage />} />
        <Route path="/*" element={<CommunityHome />} />
      </Routes>
    </AuthProvider>
  );
}