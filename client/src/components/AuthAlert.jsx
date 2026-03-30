import { motion } from 'framer-motion';

export default function AuthAlert({ type = 'error', message }) {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <motion.div
            initial={{ x: isError ? -8 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-sm flex items-start gap-2 ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
        >
            <span className="mt-0.5">{isError ? '⚠️' : '✅'}</span>
            <span>{message}</span>
        </motion.div>
    );
}
