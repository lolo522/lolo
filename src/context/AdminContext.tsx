import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { syncManager } from '../utils/syncManager';

interface AdminState {
  isAuthenticated: boolean;
  prices: {
    moviePrice: number;
    seriesPrice: number;
    transferFeePercentage: number;
    novelPricePerChapter: number;
  };
  deliveryZones: Array<{
    id: string;
    name: string;
    cost: number;
  }>;
  novels: Array<{
    id: number;
    titulo: string;
    genero: string;
    capitulos: number;
    año: number;
    descripcion?: string;
    pais?: string;
    imagen?: string;
    estado?: 'transmision' | 'finalizada';
  }>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp: Date;
  }>;
  systemConfig: {
    version: string;
    settings: {
      autoSync: boolean;
      syncInterval: number;
      enableNotifications: boolean;
      maxNotifications: number;
    };
    metadata: {
      totalOrders: number;
      totalRevenue: number;
      lastOrderDate: string;
      systemUptime: string;
    };
  };
  syncStatus: {
    lastSync: Date;
    isOnline: boolean;
    pendingChanges: number;
  };
}

type AdminAction = 
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: AdminState['prices'] }
  | { type: 'ADD_DELIVERY_ZONE'; payload: AdminState['deliveryZones'][0] }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: AdminState['deliveryZones'][0] }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: string }
  | { type: 'ADD_NOVEL'; payload: AdminState['novels'][0] }
  | { type: 'UPDATE_NOVEL'; payload: AdminState['novels'][0] }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AdminState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYSTEM_CONFIG'; payload: Partial<AdminState['systemConfig']> }
  | { type: 'LOAD_STATE'; payload: Partial<AdminState> }
  | { type: 'SYNC_STATUS_UPDATE'; payload: Partial<AdminState['syncStatus']> };

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: AdminState['prices']) => void;
  addDeliveryZone: (zone: Omit<AdminState['deliveryZones'][0], 'id'>) => void;
  updateDeliveryZone: (zone: AdminState['deliveryZones'][0]) => void;
  deleteDeliveryZone: (id: string) => void;
  addNovel: (novel: Omit<AdminState['novels'][0], 'id'>) => void;
  updateNovel: (novel: AdminState['novels'][0]) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  updateSystemConfig: (config: Partial<AdminState['systemConfig']>) => void;
  exportSystemData: () => void;
  importSystemData: (data: string) => boolean;
}

const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5,
  },
  deliveryZones: [],
  novels: [],
  notifications: [],
  systemConfig: {
    version: '2.1.0',
    settings: {
      autoSync: true,
      syncInterval: 300000,
      enableNotifications: true,
      maxNotifications: 100,
    },
    metadata: {
      totalOrders: 0,
      totalRevenue: 0,
      lastOrderDate: '',
      systemUptime: new Date().toISOString(),
    },
  },
  syncStatus: {
    lastSync: new Date(),
    isOnline: true,
    pendingChanges: 0,
  },
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { 
        ...state, 
        prices: action.payload,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'ADD_DELIVERY_ZONE':
      return { 
        ...state, 
        deliveryZones: [...state.deliveryZones, action.payload],
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'UPDATE_DELIVERY_ZONE':
      return { 
        ...state, 
        deliveryZones: state.deliveryZones.map(zone => 
          zone.id === action.payload.id ? action.payload : zone
        ),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'DELETE_DELIVERY_ZONE':
      return { 
        ...state, 
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'ADD_NOVEL':
      const newNovel = { ...action.payload, id: Date.now() };
      const updatedNovelsAdd = [...state.novels, newNovel];
      
      // Sincronizar inmediatamente
      setTimeout(() => {
        syncManager.syncNovels(updatedNovelsAdd);
      }, 0);
      
      return { 
        ...state, 
        novels: updatedNovelsAdd,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'UPDATE_NOVEL':
      const updatedNovelsUpdate = state.novels.map(novel => 
        novel.id === action.payload.id ? action.payload : novel
      );
      
      // Sincronizar inmediatamente
      setTimeout(() => {
        syncManager.syncNovels(updatedNovelsUpdate);
      }, 0);
      
      return { 
        ...state, 
        novels: updatedNovelsUpdate,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'DELETE_NOVEL':
      const updatedNovelsDelete = state.novels.filter(novel => novel.id !== action.payload);
      
      // Sincronizar inmediatamente
      setTimeout(() => {
        syncManager.syncNovels(updatedNovelsDelete);
      }, 0);
      
      return { 
        ...state, 
        novels: updatedNovelsDelete,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'ADD_NOTIFICATION':
      const newNotification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      const updatedNotifications = [newNotification, ...state.notifications].slice(0, state.systemConfig.settings.maxNotifications);
      return { ...state, notifications: updatedNotifications };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'UPDATE_SYSTEM_CONFIG':
      return { 
        ...state, 
        systemConfig: { ...state.systemConfig, ...action.payload },
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'SYNC_STATUS_UPDATE':
      return { 
        ...state, 
        syncStatus: { ...state.syncStatus, ...action.payload }
      };
    default:
      return state;
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('admin_system_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
        console.log('Estado del admin cargado desde localStorage');
      }
    } catch (error) {
      console.error('Error loading admin state:', error);
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('admin_system_state', JSON.stringify(state));
      localStorage.setItem('system_config', JSON.stringify({
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        systemConfig: state.systemConfig,
        lastUpdate: new Date().toISOString()
      }));
      
      // Emitir evento de cambio de estado
      const event = new CustomEvent('admin_full_sync', {
        detail: { 
          state, 
          config: {
            prices: state.prices,
            deliveryZones: state.deliveryZones,
            novels: state.novels,
            systemConfig: state.systemConfig
          },
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving admin state:', error);
    }
  }, [state]);

  // Auto-sync functionality
  useEffect(() => {
    if (!state.systemConfig.settings.autoSync) return;

    const interval = setInterval(() => {
      if (state.syncStatus.pendingChanges > 0) {
        dispatch({ 
          type: 'SYNC_STATUS_UPDATE', 
          payload: { 
            lastSync: new Date(), 
            pendingChanges: 0 
          } 
        });
      }
    }, state.systemConfig.settings.syncInterval);

    return () => clearInterval(interval);
  }, [state.systemConfig.settings.autoSync, state.systemConfig.settings.syncInterval, state.syncStatus.pendingChanges]);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      dispatch({ type: 'LOGIN' });
      addNotification({ message: 'Sesión iniciada correctamente', type: 'success' });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({ message: 'Sesión cerrada', type: 'info' });
  };

  const updatePrices = (prices: AdminState['prices']) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    syncManager.syncPrices(prices);
    addNotification({ message: 'Precios actualizados correctamente', type: 'success' });
    
    // Emitir evento específico para precios
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'prices', data: prices }
    });
    window.dispatchEvent(event);
  };

  const addDeliveryZone = (zone: Omit<AdminState['deliveryZones'][0], 'id'>) => {
    const newZone = { ...zone, id: Date.now().toString() };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    
    const updatedZones = [...state.deliveryZones, newZone];
    syncManager.syncDeliveryZones(updatedZones);
    addNotification({ message: `Zona de entrega "${zone.name}" agregada`, type: 'success' });
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'delivery_zone_add', data: newZone }
    });
    window.dispatchEvent(event);
  };

  const updateDeliveryZone = (zone: AdminState['deliveryZones'][0]) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    
    const updatedZones = state.deliveryZones.map(z => z.id === zone.id ? zone : z);
    syncManager.syncDeliveryZones(updatedZones);
    addNotification({ message: `Zona de entrega "${zone.name}" actualizada`, type: 'success' });
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'delivery_zone_update', data: zone }
    });
    window.dispatchEvent(event);
  };

  const deleteDeliveryZone = (id: string) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    
    const updatedZones = state.deliveryZones.filter(z => z.id !== id);
    syncManager.syncDeliveryZones(updatedZones);
    addNotification({ message: `Zona de entrega "${zone?.name}" eliminada`, type: 'success' });
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'delivery_zone_delete', data: { id } }
    });
    window.dispatchEvent(event);
  };

  const addNovel = (novel: Omit<AdminState['novels'][0], 'id'>) => {
    const newNovel = { ...novel, id: Date.now() };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    addNotification({ message: `Novela "${novel.titulo}" agregada al catálogo`, type: 'success' });
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'novel_add', data: newNovel, novels: [...state.novels, newNovel] }
    });
    window.dispatchEvent(event);
  };

  const updateNovel = (novel: AdminState['novels'][0]) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({ message: `Novela "${novel.titulo}" actualizada`, type: 'success' });
    
    const updatedNovels = state.novels.map(n => n.id === novel.id ? novel : n);
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'novel_update', data: novel, novels: updatedNovels }
    });
    window.dispatchEvent(event);
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    addNotification({ message: `Novela "${novel?.titulo}" eliminada del catálogo`, type: 'success' });
    
    const updatedNovels = state.novels.filter(n => n.id !== id);
    
    // Emitir evento específico
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'novel_delete', data: { id }, novels: updatedNovels }
    });
    window.dispatchEvent(event);
  };

  const addNotification = (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp'>) => {
    if (state.systemConfig.settings.enableNotifications) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updateSystemConfig = (config: Partial<AdminState['systemConfig']>) => {
    dispatch({ type: 'UPDATE_SYSTEM_CONFIG', payload: config });
    addNotification({ message: 'Configuración del sistema actualizada', type: 'success' });
  };

  const exportSystemData = () => {
    try {
      const exportData = {
        version: state.systemConfig.version,
        exportDate: new Date().toISOString(),
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        systemConfig: state.systemConfig,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tv-a-la-carta-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({ message: 'Configuración exportada correctamente', type: 'success' });
    } catch (error) {
      console.error('Error exporting system data:', error);
      addNotification({ message: 'Error al exportar la configuración', type: 'error' });
    }
  };

  const importSystemData = (data: string): boolean => {
    try {
      const importedData = JSON.parse(data);
      
      // Validar estructura básica
      if (!importedData.prices || !importedData.deliveryZones || !importedData.novels) {
        throw new Error('Estructura de datos inválida');
      }

      dispatch({ type: 'LOAD_STATE', payload: {
        prices: importedData.prices,
        deliveryZones: importedData.deliveryZones,
        novels: importedData.novels,
        systemConfig: importedData.systemConfig || state.systemConfig,
      }});

      // Sincronizar todos los datos
      syncManager.syncPrices(importedData.prices);
      syncManager.syncDeliveryZones(importedData.deliveryZones);
      syncManager.syncNovels(importedData.novels);

      addNotification({ message: 'Configuración importada correctamente', type: 'success' });
      return true;
    } catch (error) {
      console.error('Error importing system data:', error);
      addNotification({ message: 'Error al importar la configuración', type: 'error' });
      return false;
    }
  };

  return (
    <AdminContext.Provider value={{
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
      addNotification,
      clearNotifications,
      updateSystemConfig,
      exportSystemData,
      importSystemData,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export { AdminContext };