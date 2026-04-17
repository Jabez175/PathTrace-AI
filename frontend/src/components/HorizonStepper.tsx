import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, CheckCircle2, ChevronDown, CheckSquare, ExternalLink, Award } from 'lucide-react';
import type { AnalysisResponse } from '../App';

interface HorizonStepperProps {
    roadmap: AnalysisResponse['roadmap'];
}

export const HorizonStepper: React.FC<HorizonStepperProps> = ({ roadmap }) => {
    const [unlockedStep, setUnlockedStep] = useState(0);

    const horizons = [
        { ...roadmap.horizon_1, type: 'horizon_1', originalIdx: 0 },
        { ...roadmap.horizon_2, type: 'horizon_2', originalIdx: 1 },
        { ...roadmap.horizon_3, type: 'horizon_3', originalIdx: 2 },
    ];

    const handleNext = () => {
        if (unlockedStep < horizons.length - 1) {
            setUnlockedStep(prev => prev + 1);
        }
    };

    return (
        <div className="w-full space-y-8">
            <AnimatePresence>
                {horizons.map((h, idx) => {
                    const isUnlocked = idx <= unlockedStep;
                    const isCurrent = idx === unlockedStep;
                    const isPast = idx < unlockedStep;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${isUnlocked ? 'border-blue-500/30 bg-gray-900 shadow-xl shadow-blue-900/10' : 'border-gray-800 bg-gray-900/50'
                                }`}
                        >
                            <div className={`p-6 md:p-8 flex items-start gap-4 transition-opacity ${!isUnlocked ? 'opacity-40' : 'opacity-100'}`}>
                                <div className="flex-shrink-0 mt-1">
                                    {isPast ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    ) : isCurrent ? (
                                        <Unlock className="w-8 h-8 text-blue-400" />
                                    ) : (
                                        <Lock className="w-8 h-8 text-gray-500" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                        <span className="text-blue-500 text-sm font-semibold tracking-wider font-mono bg-blue-500/10 px-3 py-1 rounded-full">
                                            HORIZON {idx + 1}
                                        </span>
                                        {h.title}
                                    </h3>

                                    {isUnlocked ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-gray-300 leading-relaxed text-base space-y-4"
                                        >
                                            {/* Render tasks based on horizon type */}
                                            {h.type === 'horizon_1' && (
                                                <ul className="space-y-3">
                                                    {h.tasks.map((task: any, i: number) => (
                                                        <li key={i} className="flex items-start gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                                                            <CheckSquare className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-gray-200">{task.task}</p>
                                                                {task.link && (
                                                                    <a href={task.link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 font-medium transition-colors w-max">
                                                                        <ExternalLink className="w-3 h-3" /> View Resource
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {h.type === 'horizon_2' && (
                                                <div className="space-y-4">
                                                    {h.tasks.map((task: any, i: number) => (
                                                        <div key={i} className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl">
                                                            <h4 className="text-blue-300 font-semibold text-lg mb-3">{task.item}</h4>
                                                            <ul className="space-y-2">
                                                                {task.checklist?.map((step: string, j: number) => (
                                                                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                                                        <span className="text-blue-500 mt-0.5 text-xs">■</span>
                                                                        {step}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {h.type === 'horizon_3' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {h.tasks.map((task: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                                                            <div className="bg-indigo-500/20 p-3 rounded-full flex-shrink-0">
                                                                <Award className="w-5 h-5 text-indigo-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-gray-100 font-medium text-sm md:text-base leading-snug">{task.cert}</h4>
                                                                <p className="text-xs text-gray-400 mt-1 break-words break-all pr-2">{task.provider}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </motion.div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-800/50 rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-gray-800/50 rounded animate-pulse w-1/2"></div>
                                        </div>
                                    )}

                                    {isCurrent && idx < horizons.length - 1 && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            onClick={handleNext}
                                            className="mt-6 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-95 border-none outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                        >
                                            Unlock Next Horizon
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        </motion.button>
                                    )}

                                    {idx === horizons.length - 1 && isCurrent && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-6 inline-flex items-center text-green-400 font-medium bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg"
                                        >
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Success Path Initialized
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
