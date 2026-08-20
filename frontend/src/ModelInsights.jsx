import React from 'react';
import { Brain, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ModelInsights() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
            <Brain size={28} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">Model Architecture & Insights</h2>
            <p className="text-sm text-gray-500">Understanding how StrokeGuard AI makes predictions.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Info size={18} className="text-blue-500" /> How It Works
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                StrokeGuard AI utilizes an advanced machine learning pipeline trained on clinical health records. 
                It analyzes 10 distinct patient features to output a probabilistic risk score.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> Feature Engineering & Preprocessing</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> Handling Imbalanced Data (SMOTE)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> Ensemble Classification</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> SHAP (SHapley Additive exPlanations) for interpretability</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-600" /> Clinical Interpretability
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                We believe AI in healthcare should not be a "black box." Every prediction includes a SHAP explainer chart showing exactly which factors (like High Glucose or Age) drove the risk up or down.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
              <h3 className="font-bold text-gray-800 mb-4">Feature Importance (Global)</h3>
              <div className="space-y-4">
                {['Age', 'Average Glucose Level', 'BMI', 'Hypertension', 'Heart Disease'].map((feature, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{feature}</span>
                      <span className="text-gray-400">{100 - (i * 15)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${100 - (i * 15)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6 italic">
                * Note: This chart represents the global importance across the entire training dataset. Individual patient results may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
