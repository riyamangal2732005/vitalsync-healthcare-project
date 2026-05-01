import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { refineNotes} from '../utils/aiService';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Heart, Brain, Bone, Stethoscope, Activity, SparkleIcon } from 'lucide-react';
import { faTeeth } from '@fortawesome/free-solid-svg-icons';

const DoctorDashboard = () => {
    const { user } = useAuth();
  // 1. Digital Memory for our inputs and our list
    const [allPatients, setAllPatients] = useState<any[]>([]);
    const [patientName, setPatientName] = useState('');
    const [patientUid, setPatientUid] = useState('');
    const [diagnosis, setDiagnosis] = useState<string>('');
    const [patients, setPatients] = useState<any[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDiagnosis, setEditDiagnosis] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [category, setCategory] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

    const closeModal = () => setSelectedDiagnosis(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);


    useEffect(() => {
  // This looks at the 'users' folder specifically for Patients
        const q = query(collection(db, "users"), where("role", "==", "patient"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllPatients(list);
        });
        return () => unsubscribe();
        }, []);
    // 2. READ: The "Telescope" (Watching the database)
    useEffect(() => {
        // Tell the computer to look at the 'patients' folder
        const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
        
        // Every time a new patient is added, this code runs automatically
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const patientList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPatients(patientList);
        });

        return () => unsubscribe();
    }, []);
    // 3. CREATE: The "Note Taker" (Saving to the cloud)
    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName || !diagnosis || !patientUid || !user) 
        {
            toast.error("Please fill all boxes!", {
                duration: 3000,
                position: 'top-right',
            });
            return;
        }
        

        try {
        // Send the info to the 'patients' folder in Firebase
        await addDoc(collection(db, "patients"), {
            name: patientName,
            diagnosis: diagnosis,
            patientUid: patientUid,
            category: category,
            createdAt: new Date(),
            doctorId: user?.uid || "Unknown"
        });
        setPatientName('');
        setDiagnosis('');
        setPatientUid('');
        toast.success("Patient added successfully");
        } catch (error) {
            console.error("Error adding patient: ", error);
            toast.error("Failed to sasve to database");

            }
        };
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const recordRef = doc(db, "patients", editingId);
            await updateDoc(recordRef, {
            diagnosis: editDiagnosis,
            lastUpdated: new Date()
            });
            toast.success("Changes saved successfully");
            setIsEditModalOpen(false);
            setEditingId(null);
        } catch (error) {
            toast.error("Failed to update record");
            console.error("Error updating record:", error);
        }
    };
    const handleDelete = async (id: string) => 
    {
        toast.warning("Are you sure you want to delete this record?", {
            action: {
            label: "Delete Now",
            onClick: async () => {
                try {
                // 2. Perform the actual deletion
                await deleteDoc(doc(db, "patients", id));
                
                // 3. This toast will now definitely show because the page didn't refresh
                toast.success("Record Deleted successfully");
                } catch (error) {
                toast.error("Error deleting record");
                }
            },
            },
        });
    }
    const handleAIScribe = async () => {
        setIsRefining(true);
        if (!patientName || !patientUid || !diagnosis) {
            toast.error("Please fill Patient Name, UID, and Diagnosis before refining!");
            return;
        }

        try {
            const refined = await refineNotes(diagnosis, 'doctor');
            if (refined) {
                setDiagnosis(refined);
                toast.success("Notes refined successfully!");
            } else {
                throw new Error("AI returned empty");
            }
        } catch (error) {
            toast.error("AI service failed. Check your API key.");
            console.error(error);
        } finally{
            setIsRefining(false);
        }
    };
        const categoryIcons: { [key: string]: React.ReactNode } = {
            "Cardiology": <Heart size={20} className="text-red-500" />,
            "Neurology": <Brain size={20} className="text-purple-500" />,
            "Dermatology": <SparkleIcon size={20} className="text-pink-400" />, 
            "Dental": <FontAwesomeIcon icon={faTeeth} className="text-blue-400" />,
            "Orthopedics": <Bone size={20} className="text-orange-500" />,
            "General Medicine": <Stethoscope size={20} className="text-green-500" />,
            };
            const IconTick = (props: any) => {
            const { x, y, payload } = props;
            const fullName = payload.value;
            return (
                <foreignObject x={x - 10} y={y + 12} width={20} height={20}>
                <div className="flex items-center justify-center pt-1">
                    {categoryIcons[fullName] || <Activity size={20} className="text-gray-400" />}
                </div>
                </foreignObject>
            );
            };


        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
        const chartData = patients.reduce((acc: { name: string; value: number }[], current: any) => {
            const categoryName = current.category || "Uncategorized";
            const existing = acc.find(item => item.name === categoryName);
            if (existing) {
                existing.value += 1;
            } else {
                acc.push({ name: categoryName || "Unknown", value: 1 });
            }
            return acc;
            }, []);

    return (
        <div className="bg-white p-8 px-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 border border-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Doctor's Control Center 🩺</h1>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">Diagnosis Overview 📊</h3>
                    <p className="text-sm text-gray-400 mt-1">Real-time patient statistics</p>
                </div>
                {patients.length > 0 && (
                    <span className="text-sm font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    Total Cases: {patients.length}
                    </span>
                )}
            </div>
            
            {/* logic to handle empty patient details */}
            {patients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-gray-50 p-6 rounded-full">
                        <span className="text-4xl">📈</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700">No Patient Data Yet</h4>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Add your first patient below to see the diagnosis analytics appear here.
                        </p>
                    </div>
                </div>
            ) : (
            <div style={{ width: '100%', height: '300px' }}>
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                angle={-45} 
                                textAnchor="end" 
                                interval={0}
                                tick={<IconTick />}
                            />
                            <YAxis hide domain={[0, 'dataMax + 1']} /> 
                            <Tooltip 
                            cursor={{ fill: '#f8fafc', radius: 10 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar 
                            dataKey="value" 
                            barSize={45} // thin bars in order to avoid crowding
                            radius={[10, 10, 10, 10]} // Rounded tops for a professional look
                            >
                            {chartData.map((_entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                                style={{ filter: `drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))`}}/>
                            ))} 
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}  
            </div>
            )}

            {/* The form for adding new patients */}
            <form onSubmit={handleAddPatient} className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600 ml-1">Patient Name</label>
                        <input 
                            type="text" 
                            placeholder="Patient Name" 
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full h-11 bg-white focus:border-black focus:ring-0 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600 ml-1">Select Registered Patient</label>
                        <select 
                            className="border border-gray-300 p-2 rounded w-full h-11 bg-white focus:border-black focus:ring-0 outline-none transition-all"
                            value={patientUid}
                            onChange={(e) => {
                                const selectedUid = e.target.value;
                                setPatientUid(selectedUid);
                                
                                // This part automatically finds the name so you don't have to type it
                                const selectedPatient = allPatients.find(p => p.uid === selectedUid);
                                setPatientName(selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
                            }}
                            >
                                <option value="">-- Select Registered Patient --</option>
                                {allPatients.map((p) => (
                                    <option key={p.uid} value={p.uid}>
                                    {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 ml-1">Department</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="border border-gray-300 p-2 rounded w-full h-11 bg-white focus:border-black focus:ring-0 outline-none transition-all"
                            >
                                <option value="">-- Select Department --</option>
                                <option value="Cardiology">Cardiology (Heart)</option>
                                <option value="Neurology">Neurology (Brain)</option>
                                <option value="Dermatology">Dermatology (Face/Skin)</option>
                                <option value="Dental">Dental</option>
                                <option value="Orthopedics">Orthopedics (Bones)</option>
                                <option value="General Medicine">General Medicine</option>
                            </select>
                        </div>

                        {/* row 2 */}
                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600 ml-1">Diagnosis Notes</label>
                            <textarea 
                                placeholder="Diagnosis / Patient Notes (Type quick notes here...)" 
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="border border-gray-300 p-2 rounded w-full h-11 bg-white focus:border-black focus:ring-0 outline-none transition-all"
                            ></textarea>
                        </div>

                            <div className="flex flex-col gap-3 justify-end pb-1">
                                <button 
                                    type="button" 
                                    onClick={handleAIScribe}
                                    disabled={isRefining}
                                    className="bg-purple-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 w-full"
                                >
                                    {isRefining ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                        <span>✨</span> Refine with AI
                                        </>
                                    )}
                                </button>

                                <button 
                                    type="submit" // This triggers handleAddPatient
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
                                >
                                    Save to Table
                                </button>
                            </div>
            </form>

            {/* The table for viewing the data*/}
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Patient UID</th>
                            <th className="p-4 text-black font-bold">Category</th>
                            <th className="p-4">Diagnosis</th>
                            <th className="p-4">Date Added</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p) => (
                        <tr key={p.id} className="border-t">
                            <td className="p-4 font-medium">{p.name}</td>
                            
                            <td className="p-4 text-xs font-mono text-gray-500">
                                <span className="inline-block max-w-[120px] truncate font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {p.patientUid || "No UID"}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm border border-black">
                                    {p.category}
                                </span>
                            </td>

                            <td className="p-4">
                                <div className="flex flex-col">
                                    {/* This 'line-clamp-1' is the hero—it keeps the text to one line only */}
                                    <span className="text-sm text-gray-700 line-clamp-1 max-w-[150px] md:max-w-[250px]">
                                    {p.diagnosis}
                                    </span>
                                    
                                    {/* Only show the button if there is actual text to read */}
                                    {p.diagnosis && p.diagnosis.length > 20 && (
                                    <button 
                                        onClick={() => setSelectedDiagnosis(p.diagnosis)}
                                        className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 font-medium underline text-left mt-1 w-fit"
                                    >
                                        View Full Details
                                    </button>
                                    )}
                                </div>
                            </td>

                            <td className="p-4 text-gray-500 text-sm">
                                {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : "N/A"}
                            </td>

                            <td className="p-4 text-right whitespace-nowrap">
                                <button 
                                    onClick={() => {
                                    setEditingId(p.id);
                                    setEditDiagnosis(p.diagnosis); // Pre-fill the data
                                    setIsEditModalOpen(true);
                                    }}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded-md">
                                    Delete
                                </button>
                                </td> 
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* handling empty state for table */}
            {patients.length === 0 && (
                <div className="p-20 text-center">
                    <p className="text-gray-400 font-medium">No patient records found.</p>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Diagnosis</h2>
                        <form onSubmit={handleUpdate}>
                            <textarea
                            className="w-full border p-3 rounded-lg mb-4"
                            value={editDiagnosis}
                            onChange={(e) => setEditDiagnosis(e.target.value)}
                            rows={4}/>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                     </div>
                </div>
            )}
            {selectedDiagnosis && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Diagnosis Details</h2>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto">
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {selectedDiagnosis}
                            </p>
                        </div>
                        
                        <div className="mt-6 text-right">
                            <button 
                                onClick={closeModal}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default DoctorDashboard;