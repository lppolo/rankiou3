import React from 'react'

export const AuthModal: React.FC<{ onLogin: () => void; onClose: () => void }> = ({ onLogin, onClose }) => (
  <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <h2 className="text-xl font-bold text-white">ENTRAR NO RANKIOU</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>
      <div className="p-8 space-y-4">
        <p className="text-center text-gray-300">Crie sua conta para votar, criar enquetes e colecionar Rankards!</p>
        <button onClick={onLogin} className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-transform hover:scale-105">
          <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.617-3.27-11.283-7.94l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.153,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          <span>Continuar com Google</span>
        </button>
        <p className="text-center text-gray-500 text-xs">Ao continuar, você concorda com nossos Termos de Serviço.</p>
      </div>
    </div>
  </div>
)

export default AuthModal
