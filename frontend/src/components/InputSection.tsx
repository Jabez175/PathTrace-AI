import React, { useState } from 'react';
import { UploadCloud, File, X, Sparkles } from 'lucide-react';

interface InputSectionProps {
    onSubmit: (file: File, intent: string) => void;
    isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [intent, setIntent] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file && intent) {
            onSubmit(file, intent);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
            {/* Decorative gradient glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            <h2 className="text-2xl font-semibold mb-6 text-center tracking-tight text-white flex items-center justify-center gap-2">
                <Sparkles className="text-blue-400 w-5 h-5" />
                Analyze Your Path
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File drop area */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Resume (PDF)</label>
                    {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 bg-gray-900/50 hover:bg-gray-800/50 transition-all cursor-pointer group/drop">
                            <UploadCloud className="w-10 h-10 text-gray-500 mb-3 group-hover/drop:text-blue-400 transition-colors" />
                            <p className="text-sm font-medium text-gray-300">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PDF max 5MB</p>
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    ) : (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-700 bg-gray-800/80">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <File className="w-8 h-8 text-blue-400 flex-shrink-0" />
                                <div className="truncate">
                                    <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="intent" className="block text-sm font-medium text-gray-400 mb-2">
                        Career Intent (Vibe Check)
                    </label>
                    <textarea
                        id="intent"
                        rows={3}
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        className="w-full rounded-xl bg-gray-900 border border-gray-700 text-gray-200 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder-gray-600"
                        placeholder="e.g., I want to transition from frontend to a full-stack engineering role focusing on Node.js and systems architecture."
                    />
                </div>

                <button
                    type="submit"
                    disabled={!file || !intent || isLoading}
                    className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium text-lg transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    {isLoading ? 'Analyzing...' : 'Generate Roadmap'}
                </button>
            </form>
        </div>
    );
};
