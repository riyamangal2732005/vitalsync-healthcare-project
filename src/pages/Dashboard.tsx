import { useAuth } from '../context/AuthContext';
import DoctorDashboard from "./DoctorDashboard"; 
import PatientDashboard from './PatientDashboard';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Spinner from './Spinner';

export default function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { userData, loading } = useAuth(); // We get the ID card (userData) here

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  // 1. If the computer is still checking the ID card, show a loading screen
  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {/* Sidebar - This stays the same for everyone */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 
        w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:w-64
      `}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold">VitalSync</h2>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400">✕</button>
          </div>
          <nav className="space-y-4">
            <p className="hover:text-blue-300 cursor-pointer font-bold text-blue-400 text-sm md:text-base">Dashboard</p>
            {/* <p className="hover:text-blue-300 cursor-pointer">Appointments</p>
            {userData?.role === "doctor" && (
              <p className="hover:text-blue-300 cursor-pointer flex items-center gap-2">
                Patients List
              </p>
            )} */}
          </nav>
      </aside>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 w-full">
        {/* Top Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            {/* 4. THE HAMBURGER BUTTON */}
            <button 
              onClick={toggleSidebar} 
              className="p-2 text-gray-600 md:hidden"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-gray-600">
               Welcome, {userData?.firstName || "User"} ({userData?.role})
            </span>
            <button onClick={handleLogout} disabled={isLoggingOut} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* --- THE MAGIC PART (Dynamic Content) --- */}
        <main className="p-4 md:p-8 flex-1 w-full">
          {/* If role is doctor, show the Doctor's Desk (Form + Table) */}
          <div className="w-full max-w-full">
          {userData?.role === "doctor" ? (
            <DoctorDashboard />
          ) : userData?.role === "patient" ? (
            /* REPLACE THE OLD DIV WITH THE ACTUAL COMPONENT */
            <PatientDashboard /> 
          ) : (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600">
              Error: No role assigned to this account.
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}