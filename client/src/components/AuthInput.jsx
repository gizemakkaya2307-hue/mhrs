import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({
    icon: Icon,
    type = 'text',
    value,
    onChange,
    placeholder,
    autoFocus = false,
    error = '',
    showToggle = false,
    showPassword = false,
    onTogglePassword
}) {
    return (
        <div>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-3 bg-slate-50 text-slate-800 transition-all ${error ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-100' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'}`}>
                {Icon && <Icon size={18} className="text-slate-400" />}
                <input
                    className="w-full bg-transparent outline-none placeholder:text-slate-400 text-sm font-medium"
                    type={showToggle ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                />
                {showToggle && (
                    <button type="button" onClick={onTogglePassword} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5 font-medium pl-1">{error}</p>}
        </div>
    );
}
