import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link} from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Log the user in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Logged in user role:", userData.role);
        toast.success(`Welcome back, ${userData.name || 'User'}!`);
        
        // 3. Redirect to dashboard
        navigate('/dashboard'); 
      } else{
        toast.error("User profile not found in database.");
      }
    } catch (error: any) {
      let message = "Login failed. Please try again.";
      if (error.code === 'auth/user-not-found') message = "No account found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      
      toast.error(message);
      console.error("Login Error:", error.code);
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Log In</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold transition ${
          loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
        <p className="text-center text-sm text-slate-600 mt-4 cursor:pointer">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}