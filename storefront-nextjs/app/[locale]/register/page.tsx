'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const RegistrationPage = () => {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    mixed: false,
    englishOnly: false,
  });

  useEffect(() => {
    const { password } = formData;
    setPasswordValidation({
      length: password.length >= 8,
      mixed: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password),
      englishOnly: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password),
    });
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordValidation.length || !passwordValidation.englishOnly || !passwordValidation.mixed) {
      setError("Please ensure your password meets all safety requirements.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
      } else {
        setShowVerification(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
        <div className="w-full max-w-md text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary-light dark:border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            A verification link has been sent to <span className="font-bold text-primary">{formData.email}</span>. <br/>
            Please check your email to verify your account and complete registration.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors">
              Resend verification link
            </button>
            <Link 
              href={`/${locale}/login`}
              className="block w-full bg-transparent text-gray-500 font-medium py-3 hover:text-primary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-white">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-primary-light dark:bg-blue-900/20 rounded-2xl mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join our professional medical network</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-red-500">error</span>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="fullName">Full Name</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                id="fullName" 
                name="fullName" 
                placeholder="Dr. John Doe" 
                required 
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="email">Email Address</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                id="email" 
                name="email" 
                placeholder="name@hospital.com" 
                required 
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="password">Password</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <div className="mt-3 space-y-2 px-1">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.length ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.length ? "check_circle" : "circle"}</span>
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.englishOnly ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.englishOnly ? "check_circle" : "circle"}</span>
                  English Characters ONLY
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.mixed ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.mixed ? "check_circle" : "circle"}</span>
                  Mix of A-Z, a-z, and 0-9
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                required 
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-start space-x-3 py-2">
              <input 
                className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer bg-white"
                id="terms" 
                name="terms" 
                required 
                type="checkbox"
                checked={formData.terms}
                onChange={handleInputChange}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400 leading-tight" htmlFor="terms">
                I agree to the <Link className="text-primary font-semibold hover:underline" href={`/${locale}/contact`}>Terms & Conditions</Link>.
              </label>
            </div>
            <button 
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
              type="submit"
              disabled={!formData.terms || isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
              Already have an account? <Link className="text-primary font-bold hover:underline" href={`/${locale}/login`}>Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegistrationPage;
