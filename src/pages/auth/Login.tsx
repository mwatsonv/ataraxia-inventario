import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, Award, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login, lockoutError } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!correo || !password) {
      setErrorMsg('Por favor complete todos los campos.');
      return;
    }

    setIsLoading(true);
    const success = await login(correo, password);
    setIsLoading(false);

    if (!success) {
      if (!lockoutError) {
        setErrorMsg('Credenciales incorrectas. Verifique e intente de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      {/* Left Column: Stunning Construction Site Photograph with Overlay */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-end p-16">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop"
          alt="Ataraxia Civil Engineering"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Deep Slate/Blue Overlay to matching the mockup theme */}
        <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-900/30 pointer-events-none"></div>

        {/* Content over the image (placed at the bottom) */}
        <div className="relative z-10 max-w-xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
              Precisión en cada estructura.
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-200 text-base leading-relaxed font-normal"
          >
            Sistema centralizado de inventario y logística para la gestión eficiente de grandes proyectos de ingeniería y construcción.
          </motion.p>

          {/* Badges from mockup */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-6 border-t border-white/10 flex items-center space-x-8 text-xs font-medium text-slate-300"
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Certificación ISO 9001</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Infraestructura Segura</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Clean White Minimalist Login Pane */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 md:p-16 lg:p-20 bg-white">
        {/* Empty header helper for layout distribution */}
        <div className="hidden lg:block"></div>

        <div className="w-full max-w-md mx-auto my-auto py-10 space-y-8">
          {/* Logo / Brand Name from mockup */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-base tracking-wider shadow-sm">
              A
            </div>
            <span className="text-orange-600 font-bold text-xl tracking-wider">ATARAXIA</span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-[32px] font-bold text-[#0d2137] tracking-tight leading-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-slate-500 font-normal">
              Ingrese sus credenciales para acceder al sistema ERP.
            </p>
          </div>

          {/* Error notifications */}
          {(errorMsg || lockoutError) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-tight font-medium">{lockoutError || errorMsg}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="usuario@ataraxia.com.pe"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 rounded-xl text-sm text-slate-800 outline-none transition placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 block">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para reestablecer su contraseña, contacte al Administrador del sistema en soporte@ataraxia.com.pe')}
                  className="text-xs text-orange-600 hover:underline font-semibold"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 rounded-xl text-sm text-slate-800 outline-none transition placeholder:text-slate-400 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep Logged In Checkbox */}
            <div className="flex items-center">
              <input
                id="keep-logged-in"
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 bg-white border-slate-200 focus:ring-orange-500 accent-orange-600"
              />
              <label htmlFor="keep-logged-in" className="ml-2.5 text-xs text-slate-600 select-none cursor-pointer font-medium">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Action Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-600/10 active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="tracking-wider uppercase">Iniciar Sesión</span>
                  <span className="text-base font-normal">→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Credentials Helper for testing */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              🔑 Acceso Rápido de Prueba (Autocompletar)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCorreo('admin@ataraxia.com.pe');
                  setPassword('admin');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-500/30 rounded-xl transition flex flex-col justify-center"
              >
                <span className="text-orange-600 text-xs font-bold">Administrador</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">admin / admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('almacenero@ataraxia.com.pe');
                  setPassword('almacenero');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-500/30 rounded-xl transition flex flex-col justify-center"
              >
                <span className="text-emerald-600 text-xs font-bold">Almacenero</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">almacenero / almacenero</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('asistente@ataraxia.com.pe');
                  setPassword('asistente');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-500/30 rounded-xl transition flex flex-col justify-center"
              >
                <span className="text-blue-600 text-xs font-bold">Asistente</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">asistente / asistente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('supervisor@ataraxia.com.pe');
                  setPassword('supervisor');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-500/30 rounded-xl transition flex flex-col justify-center"
              >
                <span className="text-amber-600 text-xs font-bold">Supervisor</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">supervisor / supervisor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info at the very bottom */}
        <div className="pt-6 border-t border-slate-100 flex flex-col items-center space-y-2">
          <span className="text-[11px] text-slate-400 text-center font-medium">
            © 2026 ATARAXIA CONSTRUCTORA S.A.C.
          </span>
          <div className="flex space-x-3 text-[11px] text-slate-500 font-semibold">
            <button onClick={() => alert('Soporte Técnico: soporte@ataraxia.com.pe')} className="hover:text-orange-600 transition">Soporte Técnico</button>
            <span className="text-slate-300">|</span>
            <button onClick={() => alert('Política de Privacidad de Datos de Ataraxia Constructora')} className="hover:text-orange-600 transition">Privacidad</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
