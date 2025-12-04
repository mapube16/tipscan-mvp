import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Clock, Eye, Settings, Home, Receipt, BarChart3 } from 'lucide-react';

const TipScanMVP = () => {
  const [view, setView] = useState('worker');
  const [tips, setTips] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('mesero1');
  
  // Configuración de reparto
  const distribution = {
    meseros: 60,
    cocina: 30,
    bar: 10
  };
  
  // Trabajadores del equipo
  const workers = {
    mesero1: { name: 'Juan Pérez', role: 'Mesero', hours: 8 },
    mesero2: { name: 'María García', role: 'Mesero', hours: 8 },
    cocina1: { name: 'Carlos López', role: 'Cocina', hours: 8 },
    cocina2: { name: 'Ana Martínez', role: 'Cocina', hours: 8 },
    bar1: { name: 'Luis Rodríguez', role: 'Bar', hours: 6 }
  };
  
  // Inicializar con propinas de ejemplo
  useEffect(() => {
    const initialTips = [
      { id: 1, amount: 5000, type: 'digital', worker: 'mesero1', time: '10:30', table: 5 },
      { id: 2, amount: 8000, type: 'efectivo', worker: 'mesero2', time: '11:15', table: 3 },
      { id: 3, amount: 12000, type: 'digital', worker: 'mesero1', time: '12:00', table: 7 },
      { id: 4, amount: 6000, type: 'efectivo', worker: 'mesero2', time: '13:30', table: 2 },
      { id: 5, amount: 15000, type: 'digital', worker: 'mesero1', time: '14:45', table: 8 }
    ];
    setTips(initialTips);
  }, []);
  
  // Calcular totales
  const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
  const workerTips = tips.filter(t => t.worker === selectedWorker).reduce((sum, tip) => sum + tip.amount, 0);
  
  // Calcular reparto por rol
  const roleDistribution = {
    Mesero: (totalTips * distribution.meseros / 100) / 2, // dividido entre 2 meseros
    Cocina: (totalTips * distribution.cocina / 100) / 2, // dividido entre 2 cocineros
    Bar: (totalTips * distribution.bar / 100) // 1 bartender
  };
  
  const myShare = roleDistribution[workers[selectedWorker].role];
  
  // Formulario para nueva propina
  const [newTip, setNewTip] = useState({ amount: '', type: 'digital', table: '' });
  
  const handleAddTip = () => {
    if (newTip.amount && newTip.table) {
      const tip = {
        id: tips.length + 1,
        amount: parseInt(newTip.amount),
        type: newTip.type,
        worker: selectedWorker,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        table: parseInt(newTip.table)
      };
      setTips([...tips, tip]);
      setNewTip({ amount: '', type: 'digital', table: '' });
    }
  };
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center w-full sm:w-auto justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">TipScan</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Transparencia en Propinas</p>
                </div>
              </div>

              <div className="hidden sm:block ml-4">
                <span className="text-sm text-gray-500">Selecciona trabajador</span>
              </div>
            </div>
            
            {/* Selector de trabajador */}
            <div className="w-full sm:w-64">
              <select 
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                aria-label="Seleccionar trabajador"
              >
                {Object.entries(workers).map(([id, worker]) => (
                  <option key={id} value={id}>{worker.name} - {worker.role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2">
            {[
              { id: 'worker', label: 'Mi Dashboard', icon: Home },
              { id: 'register', label: 'Registrar', icon: Receipt },
              { id: 'public', label: 'Vista Pública', icon: Eye },
              { id: 'config', label: 'Configuración', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md shrink-0 transition-colors text-sm ${
                  view === item.id 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={view === item.id}
              >
                <item.icon size={16} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Vista: Dashboard del Trabajador */}
        {view === 'worker' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Dashboard de {workers[selectedWorker].name}
              </h2>
              
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium opacity-90">Mi Parte Hoy</span>
                    <DollarSign size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(myShare)}</p>
                  <p className="text-xs sm:text-sm opacity-75 mt-1">Según reparto {distribution[workers[selectedWorker].role.toLowerCase() + 's' || 'meseros']}%</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium opacity-90">Propinas Generadas</span>
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(workerTips)}</p>
                  <p className="text-xs sm:text-sm opacity-75 mt-1">En mis mesas</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium opacity-90">Total Equipo</span>
                    <Users size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalTips)}</p>
                  <p className="text-xs sm:text-sm opacity-75 mt-1">{tips.length} propinas</p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso del Día</span>
                  <span className="text-xs sm:text-sm text-gray-600">{tips.length} propinas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalTips / 200000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Meta diaria: {formatCurrency(200000)}</p>
              </div>
              
              {/* Historial de propinas */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Mis Propinas del Día</h3>
                <div className="space-y-3">
                  {tips.filter(t => t.worker === selectedWorker).map(tip => (
                    <div key={tip.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <Clock size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">Mesa {tip.table}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{tip.time} - {tip.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(tip.amount)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {tips.filter(t => t.worker === selectedWorker).length === 0 && (
                    <p className="text-center text-gray-500 py-6">No hay propinas registradas aún</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista: Registrar Propina */}
        {view === 'register' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Registrar Nueva Propina</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto de la Propina (COP)
                  </label>
                  <input
                    type="number"
                    value={newTip.amount}
                    onChange={(e) => setNewTip({...newTip, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Ej: 5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Mesa
                  </label>
                  <input
                    type="number"
                    value={newTip.table}
                    onChange={(e) => setNewTip({...newTip, table: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Ej: 5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Propina
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewTip({...newTip, type: 'digital'})}
                      className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                        newTip.type === 'digital'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💳 Digital
                    </button>
                    <button
                      onClick={() => setNewTip({...newTip, type: 'efectivo'})}
                      className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                        newTip.type === 'efectivo'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💵 Efectivo
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleAddTip}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg text-sm"
                >
                  Registrar Propina
                </button>
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Las propinas en efectivo deben ser verificadas por el administrador.
                  Las digitales se registran automáticamente.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista: Tablero Público */}
        {view === 'public' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl p-8 sm:p-12 text-white text-center">
              <Eye size={56} className="mx-auto mb-4 sm:mb-6 opacity-90" />
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">Gracias por tu Apoyo</h2>
              <p className="text-base sm:text-xl mb-4 sm:mb-8 opacity-90">
                Hoy el equipo del restaurante ha recibido:
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
                <p className="text-4xl sm:text-6xl font-bold mb-1">{formatCurrency(totalTips)}</p>
                <p className="text-sm sm:text-lg opacity-90">en propinas</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-75 mb-1">Meseros</p>
                  <p className="text-2xl sm:text-3xl font-bold">{distribution.meseros}%</p>
                  <p className="text-xs sm:text-sm mt-2">{formatCurrency(totalTips * distribution.meseros / 100)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-75 mb-1">Cocina</p>
                  <p className="text-2xl sm:text-3xl font-bold">{distribution.cocina}%</p>
                  <p className="text-xs sm:text-sm mt-2">{formatCurrency(totalTips * distribution.cocina / 100)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-75 mb-1">Bar</p>
                  <p className="text-2xl sm:text-3xl font-bold">{distribution.bar}%</p>
                  <p className="text-xs sm:text-sm mt-2">{formatCurrency(totalTips * distribution.bar / 100)}</p>
                </div>
              </div>
              
              <p className="mt-6 text-xs sm:text-sm opacity-75">
                Tu propina apoya directamente al equipo que te atendió.
              </p>
            </div>
          </div>
        )}
        
        {/* Vista: Configuración */}
        {view === 'config' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Configuración de Reparto</h2>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-indigo-900 mb-3">Reglas de Distribución Actuales</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Meseros</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-36 sm:w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-indigo-600 h-3 rounded-full" style={{width: `${distribution.meseros}%`}}></div>
                        </div>
                        <span className="font-bold text-indigo-900 w-12 text-sm">{distribution.meseros}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Cocina</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-36 sm:w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-purple-600 h-3 rounded-full" style={{width: `${distribution.cocina}%`}}></div>
                        </div>
                        <span className="font-bold text-purple-900 w-12 text-sm">{distribution.cocina}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Bar</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-36 sm:w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-green-600 h-3 rounded-full" style={{width: `${distribution.bar}%`}}></div>
                        </div>
                        <span className="font-bold text-green-900 w-12 text-sm">{distribution.bar}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Equipo Actual</h3>
                  <div className="space-y-3">
                    {Object.entries(workers).map(([id, worker]) => (
                      <div key={id} className="flex items-center justify-between bg-white rounded-lg p-3 sm:p-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{worker.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{worker.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600 text-sm">{formatCurrency(roleDistribution[worker.role])}</p>
                          <p className="text-xs text-gray-500">{worker.hours} horas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>🔒 Transparencia garantizada:</strong> Todas las reglas son visibles para todo el equipo.
                    Los cambios requieren aprobación y notificación a todos los miembros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>TipScan MVP - Plataforma de Transparencia en Propinas</p>
          <p className="mt-1">Datos simulados para demostración</p>
        </div>
      </footer>
    </div>
  );
};

export default TipScanMVP;