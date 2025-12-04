import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Clock, Eye, Settings, Home, Receipt, BarChart3 } from 'lucide-react';

const TipScanMVP = () => {
  const [view, setView] = useState('worker');
  const [tips, setTips] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('mesero1');
  const [showModal, setShowModal] = useState(false);
  const [pendingTip, setPendingTip] = useState(null);
  const [customDistribution, setCustomDistribution] = useState({ meseros: 60, cocina: 30, bar: 10 });
  const [useCustom, setUseCustom] = useState(false);
  
  // Configuración de reparto por defecto
  const defaultDistribution = {
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
  
  // Configuración activa (calculada como promedio ponderado por monto de las propinas)
  const calculatePublicDistribution = () => {
    if (!tips || tips.length === 0) return defaultDistribution;
    const totals = { meseros: 0, cocina: 0, bar: 0 };
    let totalAmount = 0;
    tips.forEach(tip => {
      const dist = tip.customDistribution || defaultDistribution;
      const amount = tip.amount || 0;
      totals.meseros += dist.meseros * amount;
      totals.cocina += dist.cocina * amount;
      totals.bar += dist.bar * amount;
      totalAmount += amount;
    });
    if (totalAmount === 0) return defaultDistribution;
    const meserosPct = Math.round(totals.meseros / totalAmount);
    const cocinaPct = Math.round(totals.cocina / totalAmount);
    // asegurar que sumen 100%
    const barPct = 100 - (meserosPct + cocinaPct);
    return { meseros: meserosPct, cocina: cocinaPct, bar: barPct };
  };

  const distribution = calculatePublicDistribution();

  // Calcular totales with distribuciones personalizadas
  const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
  const workerTips = tips.filter(t => t.worker === selectedWorker).reduce((sum, tip) => sum + tip.amount, 0);
  
  // Calcular reparto por rol usando distribución personalizada de cada propina
  const calculateRoleDistribution = () => {
    const totals = { Mesero: 0, Cocina: 0, Bar: 0 };
    
    tips.forEach(tip => {
      const dist = tip.customDistribution || defaultDistribution;
      totals.Mesero += (tip.amount * dist.meseros / 100) / 2;
      totals.Cocina += (tip.amount * dist.cocina / 100) / 2;
      totals.Bar += (tip.amount * dist.bar / 100);
    });
    
    return totals;
  };
  
  const roleDistribution = calculateRoleDistribution();
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
      setPendingTip(tip);
      setCustomDistribution(defaultDistribution);
      setUseCustom(false);
      setShowModal(true);
    }
  };
  
  const confirmTip = () => {
    const finalTip = {
      ...pendingTip,
      customDistribution: useCustom ? customDistribution : defaultDistribution
    };
    setTips([...tips, finalTip]);
    setShowModal(false);
    setPendingTip(null);
    setNewTip({ amount: '', type: 'digital', table: '' });
  };
  
  const handleDistributionChange = (role, value) => {
    const numValue = parseInt(value) || 0;
    setCustomDistribution(prev => ({
      ...prev,
      [role]: Math.min(100, Math.max(0, numValue))
    }));
  };
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">TipScan</h1>
                <p className="text-sm text-gray-500">Transparencia en Propinas</p>
              </div>
            </div>
            
            {/* Selector de trabajador */}
            <select 
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Object.entries(workers).map(([id, worker]) => (
                <option key={id} value={id}>{worker.name} - {worker.role}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'worker', label: 'Mi Dashboard', icon: Home },
              { id: 'register', label: 'Registrar Propina', icon: Receipt },
              { id: 'public', label: 'Vista Pública', icon: Eye },
              { id: 'config', label: 'Configuración', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  view === item.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Modal de Distribución */}
        {showModal && pendingTip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Distribución de Propina
                </h3>
                <p className="text-gray-600 mb-6">
                  Propina de {formatCurrency(pendingTip.amount)} - Mesa {pendingTip.table}
                </p>
                
                <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                  <p className="text-sm font-semibold text-indigo-900 mb-4">
                    ¿Deseas usar la distribución estándar o personalizarla?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => setUseCustom(false)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        !useCustom
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Distribución Estándar
                    </button>
                    <button
                      onClick={() => setUseCustom(true)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        useCustom
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Personalizar
                    </button>
                  </div>
                </div>
                
                {/* Distribución Actual */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Meseros
                      </label>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(pendingTip.amount * (useCustom ? customDistribution.meseros : defaultDistribution.meseros) / 100)}
                      </span>
                    </div>
                    {useCustom ? (
                      <input
                        type="number"
                        value={customDistribution.meseros}
                        onChange={(e) => handleDistributionChange('meseros', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-indigo-600 h-3 rounded-full"
                          style={{ width: `${defaultDistribution.meseros}%` }}
                        ></div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {useCustom ? customDistribution.meseros : defaultDistribution.meseros}%
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cocina
                      </label>
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(pendingTip.amount * (useCustom ? customDistribution.cocina : defaultDistribution.cocina) / 100)}
                      </span>
                    </div>
                    {useCustom ? (
                      <input
                        type="number"
                        value={customDistribution.cocina}
                        onChange={(e) => handleDistributionChange('cocina', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-600 h-3 rounded-full"
                          style={{ width: `${defaultDistribution.cocina}%` }}
                        ></div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {useCustom ? customDistribution.cocina : defaultDistribution.cocina}%
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bar
                      </label>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(pendingTip.amount * (useCustom ? customDistribution.bar : defaultDistribution.bar) / 100)}
                      </span>
                    </div>
                    {useCustom ? (
                      <input
                        type="number"
                        value={customDistribution.bar}
                        onChange={(e) => handleDistributionChange('bar', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${defaultDistribution.bar}%` }}
                        ></div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {useCustom ? customDistribution.bar : defaultDistribution.bar}%
                    </p>
                  </div>
                  
                  {useCustom && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Total:</strong> {customDistribution.meseros + customDistribution.cocina + customDistribution.bar}%
                        {(customDistribution.meseros + customDistribution.cocina + customDistribution.bar) !== 100 && (
                          <span className="text-red-600 ml-2">⚠️ Debe sumar 100%</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setPendingTip(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmTip}
                    disabled={useCustom && (customDistribution.meseros + customDistribution.cocina + customDistribution.bar) !== 100}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      useCustom && (customDistribution.meseros + customDistribution.cocina + customDistribution.bar) !== 100
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                    }`}
                  >
                    Confirmar Propina
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista: Dashboard del Trabajador */}
        {view === 'worker' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Dashboard de {workers[selectedWorker].name}
              </h2>
              
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90">Mi Parte Hoy</span>
                    <DollarSign size={24} />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(myShare)}</p>
                  <p className="text-sm opacity-75 mt-1">Según reparto {distribution[workers[selectedWorker].role.toLowerCase() + 's' || 'meseros']}%</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90">Propinas Generadas</span>
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(workerTips)}</p>
                  <p className="text-sm opacity-75 mt-1">En mis mesas</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90">Total Equipo</span>
                    <Users size={24} />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(totalTips)}</p>
                  <p className="text-sm opacity-75 mt-1">{tips.length} propinas registradas</p>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progreso del Día</span>
                  <span className="text-sm text-gray-600">{tips.length} propinas</span>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Propinas del Día</h3>
                <div className="space-y-3">
                  {tips.filter(t => t.worker === selectedWorker).map(tip => (
                    <div key={tip.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <Clock size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Mesa {tip.table}</p>
                          <p className="text-sm text-gray-500">{tip.time} - {tip.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(tip.amount)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {tips.filter(t => t.worker === selectedWorker).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay propinas registradas aún</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vista: Registrar Propina */}
        {view === 'register' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nueva Propina</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de la Propina (COP)
                  </label>
                  <input
                    type="number"
                    value={newTip.amount}
                    onChange={(e) => setNewTip({...newTip, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: 5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Mesa
                  </label>
                  <input
                    type="number"
                    value={newTip.table}
                    onChange={(e) => setNewTip({...newTip, table: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: 5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Propina
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setNewTip({...newTip, type: 'digital'})}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        newTip.type === 'digital'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💳 Digital
                    </button>
                    <button
                      onClick={() => setNewTip({...newTip, type: 'efectivo'})}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Registrar Propina
                </button>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl p-12 text-white text-center">
              <Eye size={64} className="mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-bold mb-4">Gracias por tu Apoyo</h2>
              <p className="text-xl mb-8 opacity-90">
                Hoy el equipo del restaurante ha recibido:
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <p className="text-6xl font-bold mb-2">{formatCurrency(totalTips)}</p>
                <p className="text-lg opacity-90">en propinas</p>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-sm opacity-75 mb-2">Meseros</p>
                  <p className="text-3xl font-bold">{distribution.meseros}%</p>
                  <p className="text-sm mt-2">{formatCurrency(totalTips * distribution.meseros / 100)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-sm opacity-75 mb-2">Cocina</p>
                  <p className="text-3xl font-bold">{distribution.cocina}%</p>
                  <p className="text-sm mt-2">{formatCurrency(totalTips * distribution.cocina / 100)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <p className="text-sm opacity-75 mb-2">Bar</p>
                  <p className="text-3xl font-bold">{distribution.bar}%</p>
                  <p className="text-sm mt-2">{formatCurrency(totalTips * distribution.bar / 100)}</p>
                </div>
              </div>
              
              <p className="mt-8 text-sm opacity-75">
                Tu propina apoya directamente al equipo que te atendió.
              </p>
            </div>
          </div>
        )}
        
        {/* Vista: Configuración */}
        {view === 'config' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración de Reparto</h2>
              
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h3 className="font-semibold text-indigo-900 mb-4">Reglas de Distribución Actuales</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Meseros</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-indigo-600 h-3 rounded-full" style={{width: `${distribution.meseros}%`}}></div>
                        </div>
                        <span className="font-bold text-indigo-900 w-12">{distribution.meseros}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Cocina</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-purple-600 h-3 rounded-full" style={{width: `${distribution.cocina}%`}}></div>
                        </div>
                        <span className="font-bold text-purple-900 w-12">{distribution.cocina}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Bar</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-green-600 h-3 rounded-full" style={{width: `${distribution.bar}%`}}></div>
                        </div>
                        <span className="font-bold text-green-900 w-12">{distribution.bar}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Equipo Actual</h3>
                  <div className="space-y-3">
                    {Object.entries(workers).map(([id, worker]) => (
                      <div key={id} className="flex items-center justify-between bg-white rounded-lg p-4">
                        <div>
                          <p className="font-semibold text-gray-800">{worker.name}</p>
                          <p className="text-sm text-gray-500">{worker.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-indigo-600">{formatCurrency(roleDistribution[worker.role])}</p>
                          <p className="text-xs text-gray-500">{worker.hours} horas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>TipScan MVP - Plataforma de Transparencia en Propinas</p>
          <p className="mt-1">Datos simulados para demostración</p>
        </div>
      </footer>
    </div>
  );
};

export default TipScanMVP;