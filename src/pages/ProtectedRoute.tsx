import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // If the user isn't logged in, send them to login
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }
  // If they are logged in, let them see the content
  return <>{children}</>;
}