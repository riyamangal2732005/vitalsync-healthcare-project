// src/layouts/AuthLayout.tsx
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">VitalSync</h1>
          <p className="text-slate-500 mt-2">Healthcare Management Portal</p>
        </div>
        {children}
      </div>
    </div>
  );
}