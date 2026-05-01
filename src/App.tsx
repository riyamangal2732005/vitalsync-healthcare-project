import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './pages/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
    

    <div className="bg-red-50 min-h-screen">
      <Toaster position="top-right" richColors expand={true} style={{ zIndex: 9999 }}/>
      <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />}></Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </div>
  </>
  );
}

export default App;