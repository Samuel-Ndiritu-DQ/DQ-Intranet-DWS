import React from 'react';
import { Rocket, ShieldCheck, UserCircle, ArrowRight } from 'lucide-react';

interface OnboardingProgressProps {
    profileCompletion: number;
    documentCompletion: number;
    overallCompletion: number;
    isLoading: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
    profileCompletion,
    documentCompletion,
    overallCompletion,
    isLoading,
}) => {
    return (
        <div className="bg-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Rocket size={120} />
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-50 rounded-lg w-1/3"></div>
                    <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-50 rounded-xl"></div>
                        <div className="h-20 bg-gray-50 rounded-xl"></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Rocket size={20} className="text-[#FB5535]" />
                                Complete Your Setup
                            </h3>
                            <p className="text-sm text-gray-500">
                                Complete your profile and documents to unlock all platform features.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall Progress</p>
                                <p className="text-lg font-black text-[#1A2E6E] leading-none">{overallCompletion}%</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-orange-100 flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 rounded-full border-2 border-[#FB5535]"
                                    style={{ clipPath: `inset(0 0 ${100 - overallCompletion}% 0)` }}
                                ></div>
                                <span className="text-[10px] font-bold text-[#FB5535] italic">Go</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                    <UserCircle size={18} />
                                    Onboarding Profile
                                </div>
                                <span className="text-xs font-bold text-gray-400">{profileCompletion}%</span>
                            </div>
                            <div className="w-full bg-blue-100/50 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 shadow-sm shadow-blue-500/20"
                                    style={{ width: `${profileCompletion}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                                    <ShieldCheck size={18} />
                                    Document Verification
                                </div>
                                <span className="text-xs font-bold text-gray-400">{documentCompletion}%</span>
                            </div>
                            <div className="w-full bg-indigo-100/50 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 shadow-sm shadow-indigo-500/20"
                                    style={{ width: `${documentCompletion}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-50">
                        <button
                            onClick={() => console.log('Continue setup')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A2E6E] text-white font-bold rounded-xl 
                                     hover:bg-[#030F35] hover:shadow-lg transition-all active:scale-95 group"
                        >
                            <span>Resume Onboarding</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
