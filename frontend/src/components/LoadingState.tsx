import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const MESSAGES = [
    "Analyzing Alumni Success Patterns...",
    "Extracting Key Skills from Resume...",
    "Running Comparative Analysis...",
    "Mapping Your Career Horizons...",
    "Generating Personalized Action Plan...",
];

export const LoadingState: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-8 relative"
            >
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full"></div>
                <Loader2 className="w-12 h-12 text-blue-400 relative z-10" />
            </motion.div>

            <div className="h-8 relative w-full max-w-sm flex justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-lg font-medium text-blue-300 absolute text-center w-full"
                    >
                        {MESSAGES[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
};
