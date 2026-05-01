import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { refineNotes } from '../utils/aiService'
import { toast } from 'sonner';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [isRefining, setIsRefining] = useState<{ [key: string]: boolean }>({}); 
  const [aiInsight, setAiInsight] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) return;

    // THE MAGIC: Filter so it only pulls records matching the logged-in user's UID
    const q = query(
      collection(db, "patients"), 
      where("patientUid", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRecords(docs);
    });

    return () => unsubscribe();
  }, [user]);
  const handleRefineWithAI = async (recordId: string, diagnosis: string) => {
    // Set loading only for this specific card
    setIsRefining(prev => ({ ...prev, [recordId]: true }));
    
    try {
      const result = await refineNotes(diagnosis, 'patient');
      
      if (result) {
        setAiInsight(prev => ({ ...prev, [recordId]: result }));
          const recordRef = doc(db, "patients", recordId);
        await updateDoc(recordRef, {
          refinedInsight: result // This saves it to the database
        });
        toast.success("Insights generated successfully!");
      } else {
        toast.error("Could not refine notes at this time.");
      }
    } catch (error) {
      toast.error("AI service error.");
    } finally {
      setIsRefining(prev => ({ ...prev, [recordId]: false }));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="hidden">{JSON.stringify(aiInsight)}</div>
      <h1 className="text-2xl font-bold mb-6 text-green-700">My Health Reports 📋</h1>
      
      {myRecords.length === 0 ? (
        <div className="p-10 text-center bg-gray-100 rounded-xl border-2 border-dashed">
          <p className="text-gray-500">No medical records found yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myRecords.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Diagnosis</p>
                  <h3 className="text-xl font-semibold text-gray-800">{record.diagnosis}</h3>
                </div>
                <button 
                  onClick={() => handleRefineWithAI(record.id, record.diagnosis)}
                  disabled={isRefining[record.id]}
                  className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {isRefining[record.id] ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : "✨ Refine with AI"}
                </button>
              </div>

              {/*Display the Refined Output */}
              {record.refinedInsight && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded animate-fade-in">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">Clear-Read Summary</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {record.refinedInsight}
                  </p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {record.createdAt?.toDate() ? record.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
