import React, { useState, useEffect } from 'react';

const AccessibilityManager = () => {
    const [fontSize, setFontSize] = useState(100);
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
        if (isHighContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [fontSize, isHighContrast]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-indigo-100 flex flex-col gap-3 transition-all hover:scale-105">
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Erişilebilirlik</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                        title="Yazı Boyutunu Azalt"
                    >
                        A-
                    </button>
                    <span className="text-xs font-bold text-indigo-600 min-w-[40px] text-center">%{fontSize}</span>
                    <button
                        onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-bold transition-colors"
                        title="Yazı Boyutunu Artır"
                    >
                        A+
                    </button>
                </div>

                <button
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${isHighContrast
                            ? 'bg-yellow-400 text-black'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        }`}
                >
                    {isHighContrast ? '🌕 Normal Görünüm' : '🌓 Yüksek Kontrast'}
                </button>
            </div>
        </div>
    );
};

export default AccessibilityManager;
