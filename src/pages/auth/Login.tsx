import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
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
      // AuthContext sets the lockoutError. If there's none, show general failure
      if (!lockoutError) {
        setErrorMsg('Credenciales incorrectas. Verifique e intente de nuevo.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Left Column: Branding Content Overlay */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
        {/* Modern geometric construction grid patterns */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-orange-500 blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500 blur-3xl opacity-20"></div>
        </div>

        {/* Construction Crane Silhouette / Blueprint Motif */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-lg shadow-orange-500/20">
              A
            </div>
            <div>
              <span className="text-white font-extrabold text-lg tracking-wider">ATARAXIA</span>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">CONSTRUCTORA S.A.C.</p>
            </div>
          </div>
        </div>

        {/* Catchy corporate tagline from mockup */}
        <div className="relative z-10 max-w-lg space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Precisión en cada estructura.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-300 text-sm leading-relaxed"
          >
            Sistema centralizado de inventario y logística para la gestión eficiente de grandes proyectos de ingeniería y construcción a nivel nacional.
          </motion.p>
        </div>

        {/* Quality certifications */}
        <div className="relative z-10 flex items-center space-x-8 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>Certificación ISO 9001</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Infraestructura Segura</span>
          </div>
        </div>
      </div>

      {/* Right Column: Centered Login Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl p-8 md:p-10 shadow-2xl relative"
        >
          {/* Decorative background blurs inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>

          <div className="flex flex-col items-center mb-8 text-center">
            {/* Logo from PDF mockup */}
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xl mb-4">
              A
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Bienvenido de nuevo</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingrese sus credenciales para acceder al sistema ERP.
            </p>
          </div>

          {/* Error notifications */}
          {(errorMsg || lockoutError) && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-tight">{lockoutError || errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="usuario@ataraxia.com.pe"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-slate-200 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para reestablecer su contraseña, contacte al Administrador de Red o al soporte técnico en soporte@ataraxia.com.pe')}
                  className="text-[11px] text-orange-500 hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-slate-200 outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
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
                className="w-4 h-4 rounded text-orange-500 bg-slate-950 border-slate-800 focus:ring-orange-500 accent-orange-500 focus:ring-offset-0 focus:ring-0"
              />
              <label htmlFor="keep-logged-in" className="ml-2 text-xs text-slate-400 select-none cursor-pointer">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Action Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Ingresar</span>
                  <span className="font-sans font-normal">→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Credentials Panel for Testing (DX) */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              🔑 Acceso Rápido para Pruebas (Click para autocompletar)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCorreo('admin@ataraxia.com.pe');
                  setPassword('admin');
                }}
                className="px-2.5 py-1.5 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/30 text-slate-300 rounded-lg transition text-[11px] font-medium flex flex-col justify-center"
              >
                <span className="text-orange-400 font-bold">Administrador</span>
                <span className="text-[9px] text-slate-500 font-mono">admin / admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('almacenero@ataraxia.com.pe');
                  setPassword('almacenero');
                }}
                className="px-2.5 py-1.5 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/30 text-slate-300 rounded-lg transition text-[11px] font-medium flex flex-col justify-center"
              >
                <span className="text-emerald-400 font-bold">Almacenero</span>
                <span className="text-[9px] text-slate-500 font-mono">almacenero / almacenero</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('asistente@ataraxia.com.pe');
                  setPassword('asistente');
                }}
                className="px-2.5 py-1.5 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/30 text-slate-300 rounded-lg transition text-[11px] font-medium flex flex-col justify-center"
              >
                <span className="text-blue-400 font-bold">Asistente</span>
                <span className="text-[9px] text-slate-500 font-mono">asistente / asistente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCorreo('supervisor@ataraxia.com.pe');
                  setPassword('supervisor');
                }}
                className="px-2.5 py-1.5 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/30 text-slate-300 rounded-lg transition text-[11px] font-medium flex flex-col justify-center"
              >
                <span className="text-amber-400 font-bold">Supervisor</span>
                <span className="text-[9px] text-slate-500 font-mono">supervisor / supervisor</span>
              </button>
            </div>
          </div>

          {/* Footer inside Card from mockup */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center space-y-2">
            <span className="text-[10px] text-slate-500 text-center font-mono">
              © 2024 ATARAXIA CONSTRUCTORA S.A.C. Todos los derechos reservados.
            </span>
            <div className="flex space-x-3 text-[10px] text-slate-400">
              <button onClick={() => alert('Soporte Técnico: soporte@ataraxia.com.pe')} className="hover:underline">Soporte Técnico</button>
              <span>|</span>
              <button onClick={() => alert('Política de Privacidad de Datos')} className="hover:underline">Privacidad</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Login;
