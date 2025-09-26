import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Bell, 
  Download, 
  Upload, 
  LogOut, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  User, 
  Lock,
  Monitor,
  Smartphone,
  Globe,
  Calendar,
  Image,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import JSZip from 'jszip';
import { 
  generateSystemReadme, 
  generateSystemConfig, 
  generateUpdatedPackageJson,
  getViteConfig,
  getTailwindConfig,
  getIndexHtml,
  getNetlifyRedirects,
  getVercelConfig,
  getMainTsxSource,
  getIndexCssSource
} from '../utils/systemExport';

export function AdminPanel() {
  const navigate = useNavigate();
  const { 
    state, 
    login, 
    logout, 
    updatePrices, 
    addDeliveryZone, 
    updateDeliveryZone, 
    deleteDeliveryZone,
    addNovel,
    updateNovel,
    deleteNovel,
    clearNotifications,
    exportSystemData,
    importSystemData
  } = useAdmin();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [priceForm, setPriceForm] = useState(state.prices);
  const [zoneForm, setZoneForm] = useState({ name: '', cost: 0 });
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [novelForm, setNovelForm] = useState({
    titulo: '',
    genero: '',
    capitulos: 1,
    año: new Date().getFullYear(),
    descripcion: '',
    pais: '',
    imagen: '',
    estado: 'finalizada' as 'transmision' | 'finalizada'
  });
  const [editingNovel, setEditingNovel] = useState<number | null>(null);
  const [importData, setImportData] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'titulo' | 'año' | 'capitulos' | 'pais'>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Países disponibles incluyendo Cuba
  const availableCountries = [
    'Cuba',
    'Turquía',
    'México',
    'Brasil',
    'Colombia',
    'Argentina',
    'España',
    'Estados Unidos',
    'Corea del Sur',
    'India',
    'Reino Unido',
    'Francia',
    'Italia',
    'Alemania',
    'Japón',
    'China',
    'Rusia'
  ];

  // Géneros disponibles
  const availableGenres = [
    'Drama',
    'Romance',
    'Comedia',
    'Acción',
    'Familia',
    'Thriller',
    'Misterio',
    'Histórico',
    'Fantasía',
    'Ciencia Ficción'
  ];

  // Sincronizar precios con el estado actual
  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  // Función para obtener novelas filtradas
  const getFilteredNovels = () => {
    let filtered = state.novels.filter(novel => {
      const matchesSearch = novel.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === '' || novel.genero === selectedGenre;
      const matchesCountry = selectedCountry === '' || novel.pais === selectedCountry;
      const matchesStatus = selectedStatus === '' || novel.estado === selectedStatus;
      
      return matchesSearch && matchesGenre && matchesCountry && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'año':
          comparison = a.año - b.año;
          break;
        case 'capitulos':
          comparison = a.capitulos - b.capitulos;
          break;
        case 'pais':
          comparison = (a.pais || '').localeCompare(b.pais || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredNovels = getFilteredNovels();

  // Obtener valores únicos para filtros
  const uniqueGenres = [...new Set(state.novels.map(novel => novel.genero))].sort();
  const uniqueCountries = [...new Set(state.novels.map(novel => novel.pais).filter(Boolean))].sort();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      alert('Credenciales incorrectas');
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneForm.name && zoneForm.cost >= 0) {
      addDeliveryZone(zoneForm);
      setZoneForm({ name: '', cost: 0 });
    }
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone && zoneForm.name && zoneForm.cost >= 0) {
      updateDeliveryZone({ id: editingZone, name: zoneForm.name, cost: zoneForm.cost });
      setEditingZone(null);
      setZoneForm({ name: '', cost: 0 });
    }
  };

  const startEditingZone = (zone: any) => {
    setEditingZone(zone.id);
    setZoneForm({ name: zone.name, cost: zone.cost });
  };

  const cancelEditingZone = () => {
    setEditingZone(null);
    setZoneForm({ name: '', cost: 0 });
  };

  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (novelForm.titulo && novelForm.genero && novelForm.capitulos > 0) {
      addNovel(novelForm);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 1,
        año: new Date().getFullYear(),
        descripcion: '',
        pais: '',
        imagen: '',
        estado: 'finalizada'
      });
    }
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel && novelForm.titulo && novelForm.genero && novelForm.capitulos > 0) {
      updateNovel({ ...novelForm, id: editingNovel });
      setEditingNovel(null);
      setNovelForm({
        titulo: '',
        genero: '',
        capitulos: 1,
        año: new Date().getFullYear(),
        descripcion: '',
        pais: '',
        imagen: '',
        estado: 'finalizada'
      });
    }
  };

  const startEditingNovel = (novel: any) => {
    setEditingNovel(novel.id);
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      pais: novel.pais || '',
      imagen: novel.imagen || '',
      estado: novel.estado || 'finalizada'
    });
  };

  const cancelEditingNovel = () => {
    setEditingNovel(null);
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 1,
      año: new Date().getFullYear(),
      descripcion: '',
      pais: '',
      imagen: '',
      estado: 'finalizada'
    });
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = importSystemData(importData);
      if (success) {
        setImportData('');
      }
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const exportCompleteSystem = async () => {
    try {
      const zip = new JSZip();
      
      // Add configuration files
      zip.file('README.md', generateSystemReadme(state));
      zip.file('system-config.json', generateSystemConfig(state));
      zip.file('package.json', generateUpdatedPackageJson());
      zip.file('vite.config.ts', getViteConfig());
      zip.file('tailwind.config.js', getTailwindConfig());
      zip.file('index.html', getIndexHtml());
      zip.file('vercel.json', getVercelConfig());
      zip.file('public/_redirects', getNetlifyRedirects());
      
      // Add source files
      zip.file('src/main.tsx', getMainTsxSource());
      zip.file('src/index.css', getIndexCssSource());
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-sistema-completo-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating system export:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedStatus('');
    setSortBy('titulo');
    setSortOrder('asc');
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Cuba': '🇨🇺',
      'Turquía': '🇹🇷',
      'México': '🇲🇽',
      'Brasil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Argentina': '🇦🇷',
      'España': '🇪🇸',
      'Estados Unidos': '🇺🇸',
      'Corea del Sur': '🇰🇷',
      'India': '🇮🇳',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Alemania': '🇩🇪',
      'Japón': '🇯🇵',
      'China': '🇨🇳',
      'Rusia': '🇷🇺'
    };
    return flags[country] || '🌍';
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-fit mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">TV a la Carta</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Tienda
              </button>
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800 font-medium"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Monitor },
                { id: 'prices', label: 'Precios', icon: DollarSign },
                { id: 'delivery', label: 'Zonas de Entrega', icon: MapPin },
                { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'export', label: 'Exportar/Importar', icon: Download }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Precio Películas</p>
                    <p className="text-2xl font-bold text-gray-900">${state.prices.moviePrice}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Monitor className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Precio Series</p>
                    <p className="text-2xl font-bold text-gray-900">${state.prices.seriesPrice}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Zonas de Entrega</p>
                    <p className="text-2xl font-bold text-gray-900">{state.deliveryZones.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Novelas</p>
                    <p className="text-2xl font-bold text-gray-900">{state.novels.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Novelas Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-500 mr-2">📡</span>
                  Novelas en Transmisión
                </h3>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {state.novels.filter(n => n.estado === 'transmision').length}
                </div>
                <p className="text-sm text-gray-600">
                  Novelas actualmente siendo transmitidas
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Novelas Finalizadas
                </h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {state.novels.filter(n => n.estado === 'finalizada').length}
                </div>
                <p className="text-sm text-gray-600">
                  Novelas completamente disponibles
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Precios</h2>
            
            <form onSubmit={handlePriceUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Películas (CUP)
                  </label>
                  <input
                    type="number"
                    value={priceForm.moviePrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, moviePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Series por Temporada (CUP)
                  </label>
                  <input
                    type="number"
                    value={priceForm.seriesPrice}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, seriesPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recargo Transferencia (%)
                  </label>
                  <input
                    type="number"
                    value={priceForm.transferFeePercentage}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, transferFeePercentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Novelas por Capítulo (CUP)
                  </label>
                  <input
                    type="number"
                    value={priceForm.novelPricePerChapter}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, novelPricePerChapter: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Precios
              </button>
            </form>
          </div>
        )}

        {/* Delivery Zones Tab */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingZone ? 'Editar Zona de Entrega' : 'Agregar Zona de Entrega'}
              </h2>
              
              <form onSubmit={editingZone ? handleUpdateZone : handleAddZone} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Zona
                    </label>
                    <input
                      type="text"
                      value={zoneForm.name}
                      onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Centro de la Ciudad"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo de Entrega (CUP)
                    </label>
                    <input
                      type="number"
                      value={zoneForm.cost}
                      onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingZone ? 'Actualizar' : 'Agregar'} Zona
                  </button>
                  
                  {editingZone && (
                    <button
                      type="button"
                      onClick={cancelEditingZone}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Delivery Zones List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Zonas Configuradas</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {state.deliveryZones.map((zone) => (
                  <div key={zone.id} className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{zone.name}</h4>
                      <p className="text-sm text-gray-600">${zone.cost} CUP</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditingZone(zone)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteDeliveryZone(zone.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Novels Management Tab */}
        {activeTab === 'novels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
              </h2>
              
              <form onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={novelForm.titulo}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Título de la novela"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género *
                    </label>
                    <select
                      value={novelForm.genero}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar género</option>
                      {availableGenres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País *
                    </label>
                    <select
                      value={novelForm.pais}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, pais: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar país</option>
                      {availableCountries.map(country => (
                        <option key={country} value={country}>
                          {getCountryFlag(country)} {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capítulos *
                    </label>
                    <input
                      type="number"
                      value={novelForm.capitulos}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año *
                    </label>
                    <input
                      type="number"
                      value={novelForm.año}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={novelForm.estado}
                      onChange={(e) => setNovelForm(prev => ({ ...prev, estado: e.target.value as 'transmision' | 'finalizada' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="finalizada">✅ Finalizada</option>
                      <option value="transmision">📡 En Transmisión</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={novelForm.descripcion}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descripción de la novela (opcional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={novelForm.imagen}
                    onChange={(e) => setNovelForm(prev => ({ ...prev, imagen: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg (opcional)"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingNovel ? 'Actualizar' : 'Agregar'} Novela
                  </button>
                  
                  {editingNovel && (
                    <button
                      type="button"
                      onClick={cancelEditingNovel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Novels List with Enhanced Filters */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Catálogo de Novelas ({filteredNovels.length} de {state.novels.length})
                  </h3>
                  {(searchTerm || selectedGenre || selectedCountry || selectedStatus || sortBy !== 'titulo' || sortOrder !== 'asc') && (
                    <button
                      onClick={clearFilters}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
                
                {/* Enhanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los géneros</option>
                    {uniqueGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los países</option>
                    {uniqueCountries.map(country => (
                      <option key={country} value={country}>
                        {getCountryFlag(country)} {country}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="transmision">📡 En Transmisión</option>
                    <option value="finalizada">✅ Finalizada</option>
                  </select>
                  
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="titulo">Título</option>
                      <option value="año">Año</option>
                      <option value="capitulos">Capítulos</option>
                      <option value="pais">País</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredNovels.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredNovels.map((novel) => (
                      <div key={novel.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="font-medium text-gray-900 mr-3">{novel.titulo}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                novel.estado === 'transmision' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {novel.estado === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {novel.genero}
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {getCountryFlag(novel.pais || '')} {novel.pais || 'Sin país'}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {novel.capitulos} capítulos
                              </span>
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                {novel.año}
                              </span>
                            </div>
                            {novel.descripcion && (
                              <p className="text-sm text-gray-600 line-clamp-2">{novel.descripcion}</p>
                            )}
                            <div className="mt-2 text-sm font-medium text-green-600">
                              Precio: ${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditingNovel(novel)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar novela"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteNovel(novel.id)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar novela"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {state.novels.length === 0 ? 'No hay novelas en el catálogo' : 'No se encontraron novelas'}
                    </h3>
                    <p className="text-gray-600">
                      {state.novels.length === 0 
                        ? 'Agrega la primera novela al catálogo usando el formulario de arriba.'
                        : 'Intenta ajustar los filtros para encontrar las novelas que buscas.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Notificaciones del Sistema</h2>
              <button
                onClick={clearNotifications}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Limpiar todas
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {state.notifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {state.notifications.map((notification) => (
                    <div key={notification.id} className="p-4 flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {notification.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : notification.type === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                  <p className="text-gray-600">Las notificaciones del sistema aparecerán aquí.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export/Import Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Exportar Configuración</h2>
              
              <div className="space-y-4">
                <button
                  onClick={exportSystemData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Configuración (JSON)
                </button>
                
                <button
                  onClick={exportCompleteSystem}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Sistema Completo (ZIP)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Importar Configuración</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo JSON
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O pegar datos JSON
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Pegar aquí los datos JSON de configuración..."
                  />
                </div>
                
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Importar Configuración
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}