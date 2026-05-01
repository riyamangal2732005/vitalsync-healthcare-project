import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { toast } from 'sonner';



export default function Register() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleRegister = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                firstName,
                lastName,
                role,
                email,
                uid: userCredential.user.uid
            });
            console.log("User registered: ", userCredential.user);
            toast.success("Account created successfully! Redirecting to Dashboard...");
            navigate('/dashboard');
        }
        catch (error: any){
            console.error("Error registering: ", error.message);
            toast.error(error.message);
        }
        finally{
            setLoading(false);
        }
        console.log("Form Submitted:", email, password);
        // This is where we will call our Auth Service in Phase 2
    };

    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>

                <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>

                <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit" disabled={loading}className={`w-full p-3 rounded-lg font-semibold transition ${
                    loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <p className="text-center text-sm text-slate-600 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}