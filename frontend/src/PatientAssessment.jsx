import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function PatientAssessment() {
  const [formData, setFormData] = useState({
    name: '',
    age: 58,
    gender: 'Male',
    hypertension: 'Yes',
    heart_disease: 'Yes',
    marital_status: 'Married',
    glucose: 142,
    bmi: 27.4,
    work_type: 'Private',
    residence: 'Urban',
    smoking: 'formerly smoked'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlider = (name, value) => {
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  const submitAssessment = async () => {
    if(!formData.name.trim()) {
      alert("Please enter the patient's name to save the record.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/predict', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend model. Is the Python API running?");
    }
    setLoading(false);
  };

  const clearForm = () => {
    setFormData({
      name: '', age: 50, gender: 'Male', hypertension: 'No', heart_disease: 'No', marital_status: 'No',
      glucose: 100, bmi: 25, work_type: 'Private', residence: 'Urban', smoking: 'Unknown'
    });
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* FORM CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Patient Assessment</h2>
            <p className="text-sm text-gray-500 mt-1">Enter clinical details to generate a stroke risk report.</p>
          </div>
          <button onClick={clearForm} className="flex items-center gap-2 text-sm text-gray-600 border px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <RefreshCw size={16} /> Reset
          </button>
        </div>

        {/* Patient Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-blue-500"/> Full Name
          </label>
          <input 
            type="text" name="name" value={formData.name} onChange={handleChange} 
            placeholder="e.g., John Doe"
            className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">Age (years)</label>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{formData.age}</span>
              </div>
              <input type="range" min="0" max="100" value={formData.age} onChange={(e) => handleSlider('age', e.target.value)} className="w-full accent-blue-600" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hypertension</label>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1 gap-1">
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.hypertension === 'No' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, hypertension: 'No'})}>No</button>
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.hypertension === 'Yes' ? 'bg-red-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, hypertension: 'Yes'})}>Yes</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Disease</label>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1 gap-1">
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.heart_disease === 'No' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, heart_disease: 'No'})}>No</button>
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.heart_disease === 'Yes' ? 'bg-red-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, heart_disease: 'Yes'})}>Yes</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
              <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Married">Married</option>
                <option value="No">Single</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">Glucose Level (mg/dL)</label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">{formData.glucose}</span>
              </div>
              <input type="range" min="50" max="300" value={formData.glucose} onChange={(e) => handleSlider('glucose', e.target.value)} className="w-full accent-indigo-600" />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">BMI (kg/m²)</label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">{formData.bmi}</span>
              </div>
              <input type="range" min="10" max="60" step="0.1" value={formData.bmi} onChange={(e) => handleSlider('bmi', e.target.value)} className="w-full accent-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                <select name="work_type" value={formData.work_type} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Private">Private</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Govt_job">Govt Job</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Residence</label>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1 gap-1">
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.residence === 'Rural' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, residence: 'Rural'})}>Rural</button>
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.residence === 'Urban' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFormData({...formData, residence: 'Urban'})}>Urban</button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking Status</label>
              <select name="smoking" value={formData.smoking} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="formerly smoked">Formerly Smoked</option>
                <option value="never smoked">Never Smoked</option>
                <option value="smokes">Smokes</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={submitAssessment} disabled={loading} className="w-full mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          {loading ? "Analyzing Profile..." : <><BrainCircuit size={22} /> Generate Stroke Risk Report</>}
        </button>
      </div>

      {/* RESULTS AREA */}
      {result && (
        <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Risk Gauge */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <h3 className="text-xl font-extrabold text-gray-800 mb-6 text-center">Prediction Confidence</h3>
            
            <div className="w-56 h-56 mb-8 relative">
              <CircularProgressbar 
                value={result.probability * 100} 
                text={`${(result.probability * 100).toFixed(1)}%`}
                circleRatio={0.7}
                styles={buildStyles({
                  rotation: 0.65,
                  strokeLinecap: 'round',
                  textSize: '18px',
                  pathTransitionDuration: 1,
                  pathColor: result.prediction === 1 ? '#ef4444' : '#10b981',
                  textColor: '#1f2937',
                  trailColor: '#f3f4f6',
                })}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm font-bold text-gray-500 tracking-widest uppercase">Risk Score</div>
            </div>
            
            {result.prediction === 1 ? (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 w-full">
                <div className="flex items-center gap-2 text-red-700 font-bold text-lg mb-2">
                  <AlertTriangle size={20} /> High Risk Detected
                </div>
                <p className="text-sm text-red-900 leading-relaxed">The patient's clinical profile strongly aligns with indicators associated with an elevated stroke risk. Immediate preventive evaluation is recommended.</p>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-5 w-full">
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg mb-2">
                  <AlertTriangle size={20} /> Low Risk Detected
                </div>
                <p className="text-sm text-green-900 leading-relaxed">The patient currently presents a lower risk profile. Continued maintenance of a healthy lifestyle is advised.</p>
              </div>
            )}
          </div>

          {/* SHAP Values */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">Impact Factors (SHAP)</h3>
            <p className="text-sm text-gray-500 mb-6">What specific features drove this patient's prediction?</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.shap} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="feature" type="category" tick={{fontSize: 12, fontWeight: 500, fill: '#4b5563'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f9fafb'}} formatter={(value) => value.toFixed(3)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <ReferenceLine x={0} stroke="#e5e7eb" strokeWidth={2} />
                  <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                    {result.shap.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-6 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div> Drives Risk Up</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div> Drives Risk Down</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
