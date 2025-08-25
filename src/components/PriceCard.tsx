import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard, Bell, FolderSync as Sync, Info } from 'lucide-react';
import { AdminContext } from '../context/AdminContext';

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCard({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const adminContext = React.useContext(AdminContext);
  
  // Get prices from admin context with real-time updates
  const moviePrice = adminContext?.state?.prices?.moviePrice || 80;
  const seriesPrice = adminContext?.state?.prices?.seriesPrice || 300;
  const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || 10;
  const lastUpdate = adminContext?.state?.lastBackup;
  
  // Notificar cuando se muestre la tarjeta de precios
  React.useEffect(() => {
    if (adminContext?.addNotification) {
      adminContext.addNotification({
        type: 'info',
        title: 'Tarjeta de Precios Mostrada',
        message: `Precios mostrados para ${type === 'movie' ? 'película' : 'serie'}${isAnime ? ' (anime)' : ''} - Sincronizado en tiempo real`,
        section: 'Visualización de Precios',
        action: 'SHOW_PRICE_CARD',
        details: {
          contentType: type,
          isAnime,
          moviePrice,
          seriesPrice,
          transferFeePercentage,
          selectedSeasons: selectedSeasons.length,
          lastSync: new Date().toISOString()
        }
      });
    }
  }, [type, isAnime, moviePrice, seriesPrice, transferFeePercentage, selectedSeasons.length]);
  
  const calculatePrice = () => {
    if (type === 'movie') {
      return moviePrice;
    } else {
      // Series: dynamic price per season
      return selectedSeasons.length * seriesPrice;
    }
  };

  const price = calculatePrice();
  const transferPrice = Math.round(price * (1 + transferFeePercentage / 100));
  
  const getIcon = () => {
    if (type === 'movie') {
      return isAnime ? '🎌' : '🎬';
    }
    return isAnime ? '🎌' : '📺';
  };

  const getTypeLabel = () => {
    if (type === 'movie') {
      return isAnime ? 'Película Animada' : 'Película';
    }
    return isAnime ? 'Anime' : 'Serie';
  };

  // Función para exportar la tarjeta de precios
  const handleExportPriceCard = () => {
    if (adminContext?.exportSingleFile) {
      adminContext.exportSingleFile('PriceCard.tsx');
    }
    
    if (adminContext?.addNotification) {
      adminContext.addNotification({
        type: 'success',
        title: 'Tarjeta de Precios Exportada',
        message: 'Componente PriceCard.tsx exportado con precios actualizados',
        section: 'Visualización de Precios',
        action: 'EXPORT_PRICE_CARD',
        details: {
          currentPrices: { moviePrice, seriesPrice, transferFeePercentage },
          exportTimestamp: new Date().toISOString()
        }
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-lg relative">
      {/* Header con información de sincronización */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
            <span className="text-lg">{getIcon()}</span>
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-sm">{getTypeLabel()}</h3>
            <p className="text-green-600 text-xs">
              {type === 'tv' && selectedSeasons.length > 0 
                ? `${selectedSeasons.length} temporada${selectedSeasons.length > 1 ? 's' : ''}`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {/* Indicador de sincronización en tiempo real */}
          <div className="bg-green-500 text-white p-1 rounded-full shadow-md animate-pulse" title="Sincronizado en tiempo real">
            <Sync className="h-3 w-3" />
          </div>
          <div className="bg-green-500 text-white p-2 rounded-full shadow-md">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Información de sincronización */}
      <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center text-xs text-blue-700">
          <Info className="h-3 w-3 mr-1" />
          <span>Precios sincronizados desde el panel de control</span>
        </div>
        {lastUpdate && (
          <div className="text-xs text-blue-600 mt-1">
            Última actualización: {new Date(lastUpdate).toLocaleString('es-ES')}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Cash Price */}
        <div className="bg-white rounded-lg p-3 border border-green-200 hover:border-green-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-green-700 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Efectivo
            </span>
            <span className="text-lg font-bold text-green-700">
              ${price.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-xs text-green-600">
            Sin recargos adicionales
          </div>
        </div>
        
        {/* Transfer Price */}
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-orange-700 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              Transferencia
            </span>
            <span className="text-lg font-bold text-orange-700">
              ${transferPrice.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-xs text-orange-600">
            +{transferFeePercentage}% recargo bancario (+${(transferPrice - price).toLocaleString()} CUP)
          </div>
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className="text-xs text-green-600 text-center bg-green-100 rounded-lg p-2 border border-green-200">
            ${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
            <br />
            ${Math.round((transferPrice / selectedSeasons.length)).toLocaleString()} CUP por temporada (transferencia)
          </div>
        )}

        {/* Detalles de precios base */}
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Precio base {type === 'movie' ? 'película' : 'serie/temporada'}:</span>
              <span className="font-medium">${type === 'movie' ? moviePrice : seriesPrice} CUP</span>
            </div>
            {type === 'tv' && selectedSeasons.length > 1 && (
              <div className="flex justify-between">
                <span>Temporadas seleccionadas:</span>
                <span className="font-medium">{selectedSeasons.length}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Recargo transferencia:</span>
              <span className="font-medium">{transferFeePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Botón de exportación */}
        <button
          onClick={handleExportPriceCard}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          title="Exportar componente con precios actualizados"
        >
          <Sync className="h-3 w-3 mr-1" />
          Exportar Precios
        </button>
      </div>

      {/* Indicador de estado de sincronización */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Sincronizado en tiempo real"></div>
      </div>
    </div>
  );
}