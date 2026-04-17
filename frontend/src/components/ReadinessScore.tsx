import React from 'react';
import { motion } from 'framer-motion';

interface ReadinessScoreProps {
    score: number;
}

export const ReadinessScore: React.FC<ReadinessScoreProps> = ({ score }) => {
    // SVG properties
    const size = 200;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Determine color based on score
    const getColor = (s: number) => {
        if (s >= 80) return '#10b981'; // Green
        if (s >= 50) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const progressColor = getColor(score);

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="relative" style={{ width: size, height: size }}>
                <svg fill="transparent" width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="#1f2937" // gray-800
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-4xl font-bold text-white drop-shadow-md"
                    >
                        {score}%
                    </motion.span>
                    <span className="text-sm font-medium text-gray-400 mt-1">Readiness</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6 text-center max-w-sm"
            >
                <p className="text-gray-300">
                    {score >= 80 ? "You're exceptionally well-aligned!" :
                        score >= 50 ? "You have a solid foundation, some targeted upskilling needed." :
                            "Significant gaps identified. The horizons below will guide your path."}
                </p>
            </motion.div>
        </div>
    );
};
