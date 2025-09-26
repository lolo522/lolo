import { useState, useEffect } from 'react';
import { syncManager } from '../utils/syncManager';

interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  pais?: string;
  imagen?: string;
  estado?: 'transmision' | 'finalizada';
}

export function useNovelSync() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [novelsInTransmission, setNovelsInTransmission] = useState<Novel[]>([]);
  const [novelsFinished, setNovelsFinished] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para categorizar novelas en tiempo real
  const categorizeNovels = (novelList: Novel[]) => {
    const transmission = novelList.filter(novel => novel.estado === 'transmision');
    const finished = novelList.filter(novel => novel.estado === 'finalizada');
    
    setNovels(novelList);
    setNovelsInTransmission(transmission);
    setNovelsFinished(finished);
    
    // Emitir evento para notificar cambios a otros componentes
    const event = new CustomEvent('novels_categorized', {
      detail: {
        all: novelList,
        transmission,
        finished,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  };

  // Cargar novelas iniciales desde múltiples fuentes
  useEffect(() => {
    const loadInitialNovels = () => {
      try {
        setLoading(true);
        
        // Intentar cargar desde múltiples fuentes con prioridad
        const sources = [
          { key: 'system_config', path: 'novels' },
          { key: 'admin_system_state', path: 'novels' }
        ];

        let loadedNovels: Novel[] = [];

        for (const source of sources) {
          try {
            const data = localStorage.getItem(source.key);
            if (data) {
              const parsed = JSON.parse(data);
              const novels = source.path.split('.').reduce((obj, key) => obj?.[key], parsed);
              
              if (novels && Array.isArray(novels) && novels.length > 0) {
                loadedNovels = novels;
                console.log(`Novelas cargadas desde ${source.key}:`, novels.length);
                break;
              }
            }
          } catch (parseError) {
            console.warn(`Error parsing ${source.key}:`, parseError);
          }
        }

        categorizeNovels(loadedNovels);
      } catch (error) {
        console.error('Error loading initial novels:', error);
        categorizeNovels([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialNovels();
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    // Suscribirse al sync manager
    const unsubscribe = syncManager.subscribe('novels', (updatedNovels: Novel[]) => {
      console.log('Novelas actualizadas via syncManager:', updatedNovels?.length || 0);
      categorizeNovels(updatedNovels || []);
    });

    // Escuchar cambios en localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'admin_system_state' || event.key === 'system_config') {
        try {
          const currentNovels = syncManager.getCurrentData('novels');
          if (currentNovels && Array.isArray(currentNovels)) {
            console.log('Novelas actualizadas via storage change:', currentNovels.length);
            categorizeNovels(currentNovels);
          }
        } catch (error) {
          console.error('Error processing storage change:', error);
        }
      }
    };

    // Escuchar eventos personalizados del admin
    const handleAdminChange = (event: CustomEvent) => {
      const eventType = event.detail.type;
      
      if (eventType?.includes('novel') || eventType === 'novels_sync' || eventType === 'novel_add' || eventType === 'novel_update' || eventType === 'novel_delete') {
        try {
          let updatedNovels = null;
          
          // Intentar obtener novelas del evento
          if (event.detail.data && Array.isArray(event.detail.data)) {
            updatedNovels = event.detail.data;
          } else if (event.detail.novels && Array.isArray(event.detail.novels)) {
            updatedNovels = event.detail.novels;
          } else {
            // Obtener del sync manager
            updatedNovels = syncManager.getCurrentData('novels');
          }
          
          if (updatedNovels && Array.isArray(updatedNovels)) {
            console.log(`Novelas actualizadas via admin event (${eventType}):`, updatedNovels.length);
            categorizeNovels(updatedNovels);
          }
        } catch (error) {
          console.error('Error processing admin change:', error);
        }
      }
    };

    // Escuchar sincronización completa del admin
    const handleAdminFullSync = (event: CustomEvent) => {
      try {
        let updatedNovels = null;
        
        if (event.detail.config?.novels) {
          updatedNovels = event.detail.config.novels;
        } else if (event.detail.state?.novels) {
          updatedNovels = event.detail.state.novels;
        }
        
        if (updatedNovels && Array.isArray(updatedNovels)) {
          console.log('Novelas actualizadas via full sync:', updatedNovels.length);
          categorizeNovels(updatedNovels);
        }
      } catch (error) {
        console.error('Error processing full sync:', error);
      }
    };

    // Registrar todos los event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin_state_change', handleAdminChange as EventListener);
    window.addEventListener('admin_full_sync', handleAdminFullSync as EventListener);

    // Cleanup function
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin_state_change', handleAdminChange as EventListener);
      window.removeEventListener('admin_full_sync', handleAdminFullSync as EventListener);
    };
  }, []);

  // Función para refrescar novelas manualmente
  const refreshNovels = () => {
    try {
      const currentNovels = syncManager.getCurrentData('novels');
      if (currentNovels && Array.isArray(currentNovels)) {
        console.log('Refrescando novelas manualmente:', currentNovels.length);
        categorizeNovels(currentNovels);
      } else {
        console.log('No hay novelas para refrescar');
        categorizeNovels([]);
      }
    } catch (error) {
      console.error('Error refreshing novels:', error);
      categorizeNovels([]);
    }
  };

  // Función para forzar recarga desde localStorage
  const forceReloadFromStorage = () => {
    try {
      const sources = ['system_config', 'admin_system_state'];
      
      for (const source of sources) {
        const data = localStorage.getItem(source);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.novels && Array.isArray(parsed.novels)) {
            console.log(`Forzando recarga desde ${source}:`, parsed.novels.length);
            categorizeNovels(parsed.novels);
            return;
          }
        }
      }
      
      console.log('No se encontraron novelas en localStorage');
      categorizeNovels([]);
    } catch (error) {
      console.error('Error forcing reload from storage:', error);
      categorizeNovels([]);
    }
  };

  return {
    novels,
    novelsInTransmission,
    novelsFinished,
    loading,
    refreshNovels,
    forceReloadFromStorage,
    totalNovels: novels.length,
    transmissionCount: novelsInTransmission.length,
    finishedCount: novelsFinished.length
  };
}