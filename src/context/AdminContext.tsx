import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
  createdAt?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  lastBackup?: string;
}

type AdminAction = 
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: Omit<DeliveryZone, 'id' | 'createdAt'> }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Omit<Novel, 'id' | 'createdAt'> }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'EXPORT_BACKUP' }
  | { type: 'LOAD_STATE'; payload: Partial<AdminState> };

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  clearNotifications: () => void;
  exportSystemBackup: () => void;
}

// Base delivery zones - these will be combined with admin zones
const BASE_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 1001, name: 'Santiago de Cuba > Santiago de Cuba > Nuevo Vista Alegre', cost: 100, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1002, name: 'Santiago de Cuba > Santiago de Cuba > Vista Alegre', cost: 300, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1003, name: 'Santiago de Cuba > Santiago de Cuba > Reparto Sueño', cost: 250, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1004, name: 'Santiago de Cuba > Santiago de Cuba > San Pedrito', cost: 150, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1005, name: 'Santiago de Cuba > Santiago de Cuba > Altamira', cost: 300, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1006, name: 'Santiago de Cuba > Santiago de Cuba > Micro 7, 8 , 9', cost: 150, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1007, name: 'Santiago de Cuba > Santiago de Cuba > Alameda', cost: 150, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1008, name: 'Santiago de Cuba > Santiago de Cuba > El Caney', cost: 800, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1009, name: 'Santiago de Cuba > Santiago de Cuba > Quintero', cost: 200, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1010, name: 'Santiago de Cuba > Santiago de Cuba > Marimon', cost: 100, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1011, name: 'Santiago de Cuba > Santiago de Cuba > Los cangrejitos', cost: 150, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1012, name: 'Santiago de Cuba > Santiago de Cuba > Trocha', cost: 200, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1013, name: 'Santiago de Cuba > Santiago de Cuba > Versalles', cost: 800, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1014, name: 'Santiago de Cuba > Santiago de Cuba > Reparto Portuondo', cost: 600, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1015, name: 'Santiago de Cuba > Santiago de Cuba > 30 de Noviembre', cost: 600, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1016, name: 'Santiago de Cuba > Santiago de Cuba > Rajayoga', cost: 800, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1017, name: 'Santiago de Cuba > Santiago de Cuba > Antonio Maceo', cost: 600, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1018, name: 'Santiago de Cuba > Santiago de Cuba > Los Pinos', cost: 200, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1019, name: 'Santiago de Cuba > Santiago de Cuba > Distrito José Martí', cost: 100, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1020, name: 'Santiago de Cuba > Santiago de Cuba > Cobre', cost: 800, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1021, name: 'Santiago de Cuba > Santiago de Cuba > El Parque Céspedes', cost: 200, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 1022, name: 'Santiago de Cuba > Santiago de Cuba > Carretera del Morro', cost: 300, active: true, createdAt: '2024-01-01T00:00:00.000Z' }
];

// Base novels list
const BASE_NOVELS: Novel[] = [
  { id: 2001, titulo: "Corazón Salvaje", genero: "Drama/Romance", capitulos: 185, año: 2009, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2002, titulo: "La Usurpadora", genero: "Drama/Melodrama", capitulos: 98, año: 1998, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2003, titulo: "María la del Barrio", genero: "Drama/Romance", capitulos: 73, año: 1995, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2004, titulo: "Marimar", genero: "Drama/Romance", capitulos: 63, año: 1994, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2005, titulo: "Rosalinda", genero: "Drama/Romance", capitulos: 80, año: 1999, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2006, titulo: "La Madrastra", genero: "Drama/Suspenso", capitulos: 135, año: 2005, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2007, titulo: "Rubí", genero: "Drama/Melodrama", capitulos: 115, año: 2004, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2008, titulo: "Pasión de Gavilanes", genero: "Drama/Romance", capitulos: 188, año: 2003, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2009, titulo: "Yo Soy Betty, la Fea", genero: "Comedia/Romance", capitulos: 335, año: 1999, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2010, titulo: "El Cuerpo del Deseo", genero: "Drama/Fantasía", capitulos: 178, año: 2005, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2011, titulo: "La Reina del Sur", genero: "Drama/Acción", capitulos: 63, año: 2011, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2012, titulo: "Sin Senos Sí Hay Paraíso", genero: "Drama/Acción", capitulos: 91, año: 2016, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2013, titulo: "El Señor de los Cielos", genero: "Drama/Acción", capitulos: 81, año: 2013, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2014, titulo: "La Casa de las Flores", genero: "Comedia/Drama", capitulos: 33, año: 2018, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2015, titulo: "Rebelde", genero: "Drama/Musical", capitulos: 440, año: 2004, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2016, titulo: "Amigas y Rivales", genero: "Drama/Romance", capitulos: 185, año: 2001, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2017, titulo: "Clase 406", genero: "Drama/Juvenil", capitulos: 344, año: 2002, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2018, titulo: "Destilando Amor", genero: "Drama/Romance", capitulos: 171, año: 2007, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2019, titulo: "Fuego en la Sangre", genero: "Drama/Romance", capitulos: 233, año: 2008, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2020, titulo: "Teresa", genero: "Drama/Melodrama", capitulos: 152, año: 2010, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2021, titulo: "Triunfo del Amor", genero: "Drama/Romance", capitulos: 176, año: 2010, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2022, titulo: "Una Familia con Suerte", genero: "Comedia/Drama", capitulos: 357, año: 2011, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2023, titulo: "Amores Verdaderos", genero: "Drama/Romance", capitulos: 181, año: 2012, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2024, titulo: "De Que Te Quiero, Te Quiero", genero: "Comedia/Romance", capitulos: 181, año: 2013, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2025, titulo: "Lo Que la Vida Me Robó", genero: "Drama/Romance", capitulos: 221, año: 2013, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2026, titulo: "La Gata", genero: "Drama/Romance", capitulos: 135, año: 2014, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2027, titulo: "Hasta el Fin del Mundo", genero: "Drama/Romance", capitulos: 177, año: 2014, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2028, titulo: "Yo No Creo en los Hombres", genero: "Drama/Romance", capitulos: 142, año: 2014, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2029, titulo: "La Malquerida", genero: "Drama/Romance", capitulos: 121, año: 2014, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2030, titulo: "Antes Muerta que Lichita", genero: "Comedia/Romance", capitulos: 183, año: 2015, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2031, titulo: "A Que No Me Dejas", genero: "Drama/Romance", capitulos: 153, año: 2015, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2032, titulo: "Simplemente María", genero: "Drama/Romance", capitulos: 155, año: 2015, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2033, titulo: "Tres Veces Ana", genero: "Drama/Romance", capitulos: 123, año: 2016, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2034, titulo: "La Candidata", genero: "Drama/Político", capitulos: 60, año: 2016, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2035, titulo: "Vino el Amor", genero: "Drama/Romance", capitulos: 143, año: 2016, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2036, titulo: "La Doble Vida de Estela Carrillo", genero: "Drama/Musical", capitulos: 95, año: 2017, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2037, titulo: "Mi Marido Tiene Familia", genero: "Comedia/Drama", capitulos: 175, año: 2017, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2038, titulo: "La Piloto", genero: "Drama/Acción", capitulos: 80, año: 2017, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2039, titulo: "Caer en Tentación", genero: "Drama/Suspenso", capitulos: 92, año: 2017, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2040, titulo: "Por Amar Sin Ley", genero: "Drama/Romance", capitulos: 123, año: 2018, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2041, titulo: "Amar a Muerte", genero: "Drama/Fantasía", capitulos: 190, año: 2018, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2042, titulo: "Ringo", genero: "Drama/Musical", capitulos: 90, año: 2019, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2043, titulo: "La Usurpadora (2019)", genero: "Drama/Melodrama", capitulos: 25, año: 2019, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2044, titulo: "100 Días para Enamorarnos", genero: "Comedia/Romance", capitulos: 104, año: 2020, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2045, titulo: "Te Doy la Vida", genero: "Drama/Romance", capitulos: 91, año: 2020, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2046, titulo: "Como Tú No Hay 2", genero: "Comedia/Romance", capitulos: 120, año: 2020, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2047, titulo: "La Desalmada", genero: "Drama/Romance", capitulos: 96, año: 2021, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2048, titulo: "Si Nos Dejan", genero: "Drama/Romance", capitulos: 93, año: 2021, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2049, titulo: "Vencer el Pasado", genero: "Drama/Familia", capitulos: 91, año: 2021, active: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2050, titulo: "La Herencia", genero: "Drama/Romance", capitulos: 74, año: 2022, active: true, createdAt: '2024-01-01T00:00:00.000Z' }
];

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
  notifications: []
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      if (action.payload.username === 'admin' && action.payload.password === 'admin123') {
        return { ...state, isAuthenticated: true };
      }
      return state;
    
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    
    case 'UPDATE_PRICES':
      return { 
        ...state, 
        prices: action.payload,
        notifications: [
          {
            id: Date.now().toString(),
            type: 'success',
            title: 'Precios Actualizados',
            message: 'Los precios han sido actualizados correctamente',
            timestamp: new Date().toISOString(),
            section: 'Precios',
            action: 'Actualizar'
          },
          ...state.notifications
        ]
      };
    
    case 'ADD_DELIVERY_ZONE':
      const newZone: DeliveryZone = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      return { 
        ...state, 
        deliveryZones: [...state.deliveryZones, newZone],
        notifications: [
          {
            id: Date.now().toString(),
            type: 'success',
            title: 'Zona Agregada',
            message: `Se agregó la zona "${action.payload.name}"`,
            timestamp: new Date().toISOString(),
            section: 'Zonas de Entrega',
            action: 'Agregar'
          },
          ...state.notifications
        ]
      };
    
    case 'UPDATE_DELIVERY_ZONE':
      return { 
        ...state, 
        deliveryZones: state.deliveryZones.map(zone => 
          zone.id === action.payload.id ? action.payload : zone
        ),
        notifications: [
          {
            id: Date.now().toString(),
            type: 'info',
            title: 'Zona Actualizada',
            message: `Se actualizó la zona "${action.payload.name}"`,
            timestamp: new Date().toISOString(),
            section: 'Zonas de Entrega',
            action: 'Actualizar'
          },
          ...state.notifications
        ]
      };
    
    case 'DELETE_DELIVERY_ZONE':
      const zoneToDelete = state.deliveryZones.find(zone => zone.id === action.payload);
      return { 
        ...state, 
        deliveryZones: state.deliveryZones.filter(zone => zone.id !== action.payload),
        notifications: [
          {
            id: Date.now().toString(),
            type: 'warning',
            title: 'Zona Eliminada',
            message: `Se eliminó la zona "${zoneToDelete?.name || 'Desconocida'}"`,
            timestamp: new Date().toISOString(),
            section: 'Zonas de Entrega',
            action: 'Eliminar'
          },
          ...state.notifications
        ]
      };
    
    case 'ADD_NOVEL':
      const newNovel: Novel = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      return { 
        ...state, 
        novels: [...state.novels, newNovel],
        notifications: [
          {
            id: Date.now().toString(),
            type: 'success',
            title: 'Novela Agregada',
            message: `Se agregó la novela "${action.payload.titulo}"`,
            timestamp: new Date().toISOString(),
            section: 'Gestión de Novelas',
            action: 'Agregar'
          },
          ...state.notifications
        ]
      };
    
    case 'UPDATE_NOVEL':
      return { 
        ...state, 
        novels: state.novels.map(novel => 
          novel.id === action.payload.id ? action.payload : novel
        ),
        notifications: [
          {
            id: Date.now().toString(),
            type: 'info',
            title: 'Novela Actualizada',
            message: `Se actualizó la novela "${action.payload.titulo}"`,
            timestamp: new Date().toISOString(),
            section: 'Gestión de Novelas',
            action: 'Actualizar'
          },
          ...state.notifications
        ]
      };
    
    case 'DELETE_NOVEL':
      const novelToDelete = state.novels.find(novel => novel.id === action.payload);
      return { 
        ...state, 
        novels: state.novels.filter(novel => novel.id !== action.payload),
        notifications: [
          {
            id: Date.now().toString(),
            type: 'warning',
            title: 'Novela Eliminada',
            message: `Se eliminó la novela "${novelToDelete?.titulo || 'Desconocida'}"`,
            timestamp: new Date().toISOString(),
            section: 'Gestión de Novelas',
            action: 'Eliminar'
          },
          ...state.notifications
        ]
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ]
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'EXPORT_BACKUP':
      return { 
        ...state, 
        lastBackup: new Date().toISOString(),
        notifications: [
          {
            id: Date.now().toString(),
            type: 'success',
            title: 'Backup Exportado',
            message: 'El backup del sistema se ha exportado correctamente',
            timestamp: new Date().toISOString(),
            section: 'Sistema',
            action: 'Exportar'
          },
          ...state.notifications
        ]
      };
    
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('adminState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Combine base zones and novels with saved custom ones
        const combinedZones = [...BASE_DELIVERY_ZONES, ...(parsedState.deliveryZones || [])];
        const combinedNovels = [...BASE_NOVELS, ...(parsedState.novels || [])];
        
        dispatch({ 
          type: 'LOAD_STATE', 
          payload: {
            ...parsedState,
            deliveryZones: combinedZones,
            novels: combinedNovels
          }
        });
      } catch (error) {
        console.error('Error loading admin state:', error);
        // Load base data if parsing fails
        dispatch({ 
          type: 'LOAD_STATE', 
          payload: {
            deliveryZones: BASE_DELIVERY_ZONES,
            novels: BASE_NOVELS
          }
        });
      }
    } else {
      // Load base data on first run
      dispatch({ 
        type: 'LOAD_STATE', 
        payload: {
          deliveryZones: BASE_DELIVERY_ZONES,
          novels: BASE_NOVELS
        }
      });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save custom zones and novels (not base ones)
    const customZones = state.deliveryZones.filter(zone => zone.id < 1000 || zone.id > 1999);
    const customNovels = state.novels.filter(novel => novel.id < 2000 || novel.id > 2999);
    
    const stateToSave = {
      ...state,
      deliveryZones: customZones,
      novels: customNovels
    };
    localStorage.setItem('adminState', JSON.stringify(stateToSave));
  }, [state]);

  const login = (username: string, password: string): boolean => {
    dispatch({ type: 'LOGIN', payload: { username, password } });
    return username === 'admin' && password === 'admin123';
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
  };

  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
  };

  const deleteDeliveryZone = (id: number) => {
    // Prevent deletion of base zones
    if (id >= 1000 && id <= 1999) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pueden eliminar las zonas base del sistema',
          section: 'Zonas de Entrega',
          action: 'Eliminar'
        }
      });
      return;
    }
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
  };

  const addNovel = (novel: Omit<Novel, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NOVEL', payload: novel });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
  };

  const deleteNovel = (id: number) => {
    // Prevent deletion of base novels
    if (id >= 2000 && id <= 2999) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pueden eliminar las novelas base del catálogo',
          section: 'Gestión de Novelas',
          action: 'Eliminar'
        }
      });
      return;
    }
    dispatch({ type: 'DELETE_NOVEL', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const exportSystemBackup = () => {
    const backupData = {
      ...state,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv-a-la-carta-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dispatch({ type: 'EXPORT_BACKUP' });
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
      clearNotifications,
      exportSystemBackup
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