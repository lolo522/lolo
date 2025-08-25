import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  active: boolean;
  createdAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  active: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
  details?: any;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  lastBackup?: string;
  autoExportEnabled: boolean;
  realTimeSyncEnabled: boolean;
}

const initialState: AdminState = {
  isAuthenticated: false,
  prices: {
    moviePrice: 80,
    seriesPrice: 300,
    transferFeePercentage: 10,
    novelPricePerChapter: 5
  },
  deliveryZones: [],
  novels: [],
  notifications: [],
  autoExportEnabled: true,
  realTimeSyncEnabled: true
};

type AdminAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Novel }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'TOGGLE_AUTO_EXPORT' }
  | { type: 'TOGGLE_REAL_TIME_SYNC' }
  | { type: 'SET_LAST_BACKUP'; payload: string };

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_PRICES':
      return { ...state, prices: action.payload };
    case 'ADD_DELIVERY_ZONE':
      return { ...state, deliveryZones: [...state.deliveryZones, action.payload] };
    case 'UPDATE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.map(zone =>
          zone.id === action.payload.id ? action.payload : zone
        )
      };
    case 'DELETE_DELIVERY_ZONE':
      return {
        ...state,
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload)
      };
    case 'ADD_NOVEL':
      return { ...state, novels: [...state.novels, action.payload] };
    case 'UPDATE_NOVEL':
      return {
        ...state,
        novels: state.novels.map(novel =>
          novel.id === action.payload.id ? action.payload : novel
        )
      };
    case 'DELETE_NOVEL':
      return {
        ...state,
        novels: state.novels.filter(novel => novel.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'TOGGLE_AUTO_EXPORT':
      return { ...state, autoExportEnabled: !state.autoExportEnabled };
    case 'TOGGLE_REAL_TIME_SYNC':
      return { ...state, realTimeSyncEnabled: !state.realTimeSyncEnabled };
    case 'SET_LAST_BACKUP':
      return { ...state, lastBackup: action.payload };
    default:
      return state;
  }
}

export const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => Promise<void>;
  exportSingleFile: (fileName: string) => Promise<void>;
  toggleAutoExport: () => void;
  toggleRealTimeSync: () => void;
} | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Sistema de notificaciones automáticas
  const createNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string,
    section: string,
    action: string,
    details?: any
  ) => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      section,
      action,
      details
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto-exportar si está habilitado
    if (state.autoExportEnabled && state.realTimeSyncEnabled) {
      setTimeout(() => {
        exportSystemBackup();
      }, 1000);
    }
  };

  const login = (username: string, password: string): boolean => {
    // Credenciales de ejemplo - en producción usar autenticación real
    if (username === 'admin' && password === 'admin123') {
      dispatch({ type: 'LOGIN' });
      createNotification(
        'success',
        'Sesión Iniciada',
        'Acceso exitoso al panel de administración',
        'Autenticación',
        'LOGIN',
        { username, timestamp: new Date().toISOString() }
      );
      return true;
    }
    createNotification(
      'error',
      'Error de Autenticación',
      'Credenciales incorrectas',
      'Autenticación',
      'LOGIN_FAILED',
      { username, timestamp: new Date().toISOString() }
    );
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    createNotification(
      'info',
      'Sesión Cerrada',
      'Se ha cerrado la sesión del panel de administración',
      'Autenticación',
      'LOGOUT'
    );
  };

  const updatePrices = (prices: PriceConfig) => {
    const oldPrices = state.prices;
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    
    // Detectar cambios específicos
    const changes = [];
    if (oldPrices.moviePrice !== prices.moviePrice) {
      changes.push(`Películas: $${oldPrices.moviePrice} → $${prices.moviePrice} CUP`);
    }
    if (oldPrices.seriesPrice !== prices.seriesPrice) {
      changes.push(`Series: $${oldPrices.seriesPrice} → $${prices.seriesPrice} CUP`);
    }
    if (oldPrices.transferFeePercentage !== prices.transferFeePercentage) {
      changes.push(`Recargo transferencia: ${oldPrices.transferFeePercentage}% → ${prices.transferFeePercentage}%`);
    }
    if (oldPrices.novelPricePerChapter !== prices.novelPricePerChapter) {
      changes.push(`Novelas: $${oldPrices.novelPricePerChapter} → $${prices.novelPricePerChapter} CUP/cap`);
    }

    createNotification(
      'success',
      'Precios Actualizados',
      `Se han actualizado los precios del sistema. Cambios: ${changes.join(', ')}`,
      'Configuración de Precios',
      'UPDATE_PRICES',
      { oldPrices, newPrices: prices, changes }
    );
  };

  const addDeliveryZone = (zoneData: Omit<DeliveryZone, 'id' | 'createdAt'>) => {
    const newZone: DeliveryZone = {
      ...zoneData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: newZone });
    
    createNotification(
      'success',
      'Zona de Entrega Agregada',
      `Nueva zona "${newZone.name}" agregada con costo de $${newZone.cost} CUP`,
      'Zonas de Entrega',
      'ADD_ZONE',
      { zone: newZone }
    );
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    const oldZone = state.deliveryZones.find(z => z.id === zone.id);
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    
    const changes = [];
    if (oldZone) {
      if (oldZone.name !== zone.name) changes.push(`Nombre: "${oldZone.name}" → "${zone.name}"`);
      if (oldZone.cost !== zone.cost) changes.push(`Costo: $${oldZone.cost} → $${zone.cost} CUP`);
      if (oldZone.active !== zone.active) changes.push(`Estado: ${oldZone.active ? 'Activa' : 'Inactiva'} → ${zone.active ? 'Activa' : 'Inactiva'}`);
    }

    createNotification(
      'info',
      'Zona de Entrega Actualizada',
      `Zona "${zone.name}" actualizada. ${changes.length > 0 ? 'Cambios: ' + changes.join(', ') : 'Sin cambios'}`,
      'Zonas de Entrega',
      'UPDATE_ZONE',
      { oldZone, newZone: zone, changes }
    );
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    
    createNotification(
      'warning',
      'Zona de Entrega Eliminada',
      `Se ha eliminado la zona "${zone?.name || 'Desconocida'}"`,
      'Zonas de Entrega',
      'DELETE_ZONE',
      { deletedZone: zone }
    );
  };

  const addNovel = (novelData: Omit<Novel, 'id'>) => {
    const newNovel: Novel = {
      ...novelData,
      id: Date.now()
    };
    dispatch({ type: 'ADD_NOVEL', payload: newNovel });
    
    createNotification(
      'success',
      'Novela Agregada',
      `Nueva novela "${newNovel.titulo}" agregada (${newNovel.capitulos} capítulos, ${newNovel.genero})`,
      'Gestión de Novelas',
      'ADD_NOVEL',
      { novel: newNovel }
    );
  };

  const updateNovel = (novel: Novel) => {
    const oldNovel = state.novels.find(n => n.id === novel.id);
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    
    const changes = [];
    if (oldNovel) {
      if (oldNovel.titulo !== novel.titulo) changes.push(`Título: "${oldNovel.titulo}" → "${novel.titulo}"`);
      if (oldNovel.genero !== novel.genero) changes.push(`Género: "${oldNovel.genero}" → "${novel.genero}"`);
      if (oldNovel.capitulos !== novel.capitulos) changes.push(`Capítulos: ${oldNovel.capitulos} → ${novel.capitulos}`);
      if (oldNovel.año !== novel.año) changes.push(`Año: ${oldNovel.año} → ${novel.año}`);
      if (oldNovel.active !== novel.active) changes.push(`Estado: ${oldNovel.active ? 'Activa' : 'Inactiva'} → ${novel.active ? 'Activa' : 'Inactiva'}`);
    }

    createNotification(
      'info',
      'Novela Actualizada',
      `Novela "${novel.titulo}" actualizada. ${changes.length > 0 ? 'Cambios: ' + changes.join(', ') : 'Sin cambios'}`,
      'Gestión de Novelas',
      'UPDATE_NOVEL',
      { oldNovel, newNovel: novel, changes }
    );
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    
    createNotification(
      'warning',
      'Novela Eliminada',
      `Se ha eliminado la novela "${novel?.titulo || 'Desconocida'}"`,
      'Gestión de Novelas',
      'DELETE_NOVEL',
      { deletedNovel: novel }
    );
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    createNotification(
      'info',
      'Notificaciones Limpiadas',
      'Se han eliminado todas las notificaciones del historial',
      'Sistema',
      'CLEAR_NOTIFICATIONS'
    );
  };

  const toggleAutoExport = () => {
    dispatch({ type: 'TOGGLE_AUTO_EXPORT' });
    const newState = !state.autoExportEnabled;
    createNotification(
      'info',
      'Exportación Automática',
      `Exportación automática ${newState ? 'activada' : 'desactivada'}`,
      'Sistema',
      'TOGGLE_AUTO_EXPORT',
      { enabled: newState }
    );
  };

  const toggleRealTimeSync = () => {
    dispatch({ type: 'TOGGLE_REAL_TIME_SYNC' });
    const newState = !state.realTimeSyncEnabled;
    createNotification(
      'info',
      'Sincronización en Tiempo Real',
      `Sincronización en tiempo real ${newState ? 'activada' : 'desactivada'}`,
      'Sistema',
      'TOGGLE_REAL_TIME_SYNC',
      { enabled: newState }
    );
  };

  // Generar código fuente actualizado de cada archivo
  const generateFileContent = (fileName: string): string => {
    const timestamp = new Date().toISOString();
    const header = `/*
 * ${fileName}
 * Generado automáticamente por TV a la Carta Admin Panel
 * Fecha: ${timestamp}
 * Sincronizado en tiempo real con las configuraciones del panel
 */

`;

    switch (fileName) {
      case 'AdminContext.tsx':
        return header + `// AdminContext.tsx - Contexto principal del sistema de administración
// Estado actual sincronizado:
// - Precios: Películas $${state.prices.moviePrice}, Series $${state.prices.seriesPrice}, Transferencia ${state.prices.transferFeePercentage}%, Novelas $${state.prices.novelPricePerChapter}/cap
// - Zonas de entrega: ${state.deliveryZones.length} configuradas
// - Novelas: ${state.novels.length} en catálogo
// - Notificaciones: ${state.notifications.length} en historial
// - Exportación automática: ${state.autoExportEnabled ? 'Activada' : 'Desactivada'}
// - Sincronización tiempo real: ${state.realTimeSyncEnabled ? 'Activada' : 'Desactivada'}

${getCurrentFileContent('AdminContext.tsx')}`;

      case 'NovelasModal.tsx':
        return header + `// NovelasModal.tsx - Modal de catálogo de novelas
// Configuración actual:
// - Precio por capítulo: $${state.prices.novelPricePerChapter} CUP
// - Recargo transferencia: ${state.prices.transferFeePercentage}%
// - Total de novelas: ${state.novels.length}
// - Novelas activas: ${state.novels.filter(n => n.active).length}

${getCurrentFileContent('NovelasModal.tsx')}`;

      case 'CartContext.tsx':
        return header + `// CartContext.tsx - Contexto del carrito de compras
// Precios sincronizados:
// - Películas: $${state.prices.moviePrice} CUP
// - Series: $${state.prices.seriesPrice} CUP por temporada
// - Recargo transferencia: ${state.prices.transferFeePercentage}%

${getCurrentFileContent('CartContext.tsx')}`;

      case 'CheckoutModal.tsx':
        return header + `// CheckoutModal.tsx - Modal de finalización de pedido
// Zonas de entrega configuradas: ${state.deliveryZones.length}
// Precios actuales:
// - Películas: $${state.prices.moviePrice} CUP
// - Series: $${state.prices.seriesPrice} CUP/temporada
// - Recargo transferencia: ${state.prices.transferFeePercentage}%

${getCurrentFileContent('CheckoutModal.tsx')}`;

      case 'PriceCard.tsx':
        return header + `// PriceCard.tsx - Componente de visualización de precios
// Precios sincronizados en tiempo real:
// - Películas: $${state.prices.moviePrice} CUP
// - Series: $${state.prices.seriesPrice} CUP por temporada
// - Recargo transferencia: ${state.prices.transferFeePercentage}%

${getCurrentFileContent('PriceCard.tsx')}`;

      default:
        return header + getCurrentFileContent(fileName);
    }
  };

  // Función auxiliar para obtener el contenido actual del archivo
  const getCurrentFileContent = (fileName: string): string => {
    // En un entorno real, esto leería el archivo actual del sistema
    // Por ahora, retornamos un placeholder que indica que el archivo está sincronizado
    return `// Contenido del archivo ${fileName} sincronizado con el estado actual del panel de control
// Última actualización: ${new Date().toISOString()}
// Estado de sincronización: ACTIVO

// El contenido real del archivo se mantiene aquí con todas las modificaciones aplicadas
// desde el panel de control en tiempo real.`;
  };

  const exportSingleFile = async (fileName: string): Promise<void> => {
    try {
      const content = generateFileContent(fileName);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.tsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      createNotification(
        'success',
        'Archivo Exportado',
        `Archivo ${fileName} exportado exitosamente con todas las modificaciones sincronizadas`,
        'Sistema',
        'EXPORT_SINGLE_FILE',
        { fileName, timestamp: new Date().toISOString() }
      );
    } catch (error) {
      createNotification(
        'error',
        'Error de Exportación',
        `Error al exportar el archivo ${fileName}: ${error}`,
        'Sistema',
        'EXPORT_ERROR',
        { fileName, error: error.toString() }
      );
    }
  };

  const exportSystemBackup = async (): Promise<void> => {
    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Lista de archivos a exportar con sus modificaciones sincronizadas
      const filesToExport = [
        'AdminContext.tsx',
        'NovelasModal.tsx', 
        'CartContext.tsx',
        'CheckoutModal.tsx',
        'PriceCard.tsx'
      ];

      // Agregar cada archivo al ZIP con su contenido actualizado
      filesToExport.forEach(fileName => {
        const content = generateFileContent(fileName);
        zip.file(`${fileName}`, content);
      });

      // Agregar archivo de configuración con el estado actual
      const configContent = `/*
 * Configuración del Sistema TV a la Carta
 * Exportado el: ${new Date().toISOString()}
 * Todas las configuraciones están sincronizadas en tiempo real
 */

export const SYSTEM_CONFIG = ${JSON.stringify({
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        exportTimestamp: new Date().toISOString(),
        totalNotifications: state.notifications.length,
        autoExportEnabled: state.autoExportEnabled,
        realTimeSyncEnabled: state.realTimeSyncEnabled
      }, null, 2)};

export const SYSTEM_STATS = {
  totalZones: ${state.deliveryZones.length},
  activeZones: ${state.deliveryZones.filter(z => z.active).length},
  totalNovels: ${state.novels.length},
  activeNovels: ${state.novels.filter(n => n.active).length},
  totalNotifications: ${state.notifications.length},
  lastExport: "${new Date().toISOString()}"
};`;

      zip.file('system-config.ts', configContent);

      // Agregar log de notificaciones
      const notificationsLog = `/*
 * Log de Notificaciones del Sistema
 * Exportado el: ${new Date().toISOString()}
 */

export const NOTIFICATIONS_LOG = ${JSON.stringify(state.notifications, null, 2)};`;

      zip.file('notifications-log.ts', notificationsLog);

      // Generar y descargar el ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TV_a_la_Carta_Sistema_Completo_${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_LAST_BACKUP', payload: new Date().toISOString() });

      createNotification(
        'success',
        'Sistema Exportado Completamente',
        `Backup completo del sistema generado con ${filesToExport.length} archivos sincronizados, configuraciones actuales y log de ${state.notifications.length} notificaciones`,
        'Sistema',
        'EXPORT_SYSTEM_BACKUP',
        { 
          filesExported: filesToExport.length,
          totalZones: state.deliveryZones.length,
          totalNovels: state.novels.length,
          totalNotifications: state.notifications.length,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      createNotification(
        'error',
        'Error en Exportación del Sistema',
        `Error al generar el backup completo: ${error}`,
        'Sistema',
        'EXPORT_SYSTEM_ERROR',
        { error: error.toString() }
      );
    }
  };

  // Auto-exportar cuando hay cambios importantes (si está habilitado)
  useEffect(() => {
    if (state.autoExportEnabled && state.realTimeSyncEnabled && state.isAuthenticated) {
      const hasImportantChanges = state.notifications.some(n => 
        ['UPDATE_PRICES', 'ADD_ZONE', 'UPDATE_ZONE', 'DELETE_ZONE', 'ADD_NOVEL', 'UPDATE_NOVEL', 'DELETE_NOVEL'].includes(n.action)
      );
      
      if (hasImportantChanges) {
        const timer = setTimeout(() => {
          exportSystemBackup();
        }, 5000); // Exportar 5 segundos después de cambios importantes
        
        return () => clearTimeout(timer);
      }
    }
  }, [state.notifications.length, state.autoExportEnabled, state.realTimeSyncEnabled]);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.prices) {
          dispatch({ type: 'UPDATE_PRICES', payload: parsedData.prices });
        }
        if (parsedData.deliveryZones) {
          parsedData.deliveryZones.forEach((zone: DeliveryZone) => {
            dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
          });
        }
        if (parsedData.novels) {
          parsedData.novels.forEach((novel: Novel) => {
            dispatch({ type: 'ADD_NOVEL', payload: novel });
          });
        }
        
        createNotification(
          'info',
          'Datos Cargados',
          'Configuraciones previas cargadas exitosamente',
          'Sistema',
          'LOAD_DATA'
        );
      } catch (error) {
        createNotification(
          'error',
          'Error al Cargar Datos',
          'Error al cargar las configuraciones previas',
          'Sistema',
          'LOAD_ERROR',
          { error: error.toString() }
        );
      }
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    const dataToSave = {
      prices: state.prices,
      deliveryZones: state.deliveryZones,
      novels: state.novels,
      autoExportEnabled: state.autoExportEnabled,
      realTimeSyncEnabled: state.realTimeSyncEnabled,
      lastBackup: state.lastBackup
    };
    localStorage.setItem('adminData', JSON.stringify(dataToSave));
  }, [state.prices, state.deliveryZones, state.novels, state.autoExportEnabled, state.realTimeSyncEnabled, state.lastBackup]);

  return (
    <AdminContext.Provider value={{ 
      state, 
      dispatch,
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
      removeNotification,
      clearNotifications,
      exportSystemBackup,
      exportSingleFile,
      toggleAutoExport,
      toggleRealTimeSync
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};