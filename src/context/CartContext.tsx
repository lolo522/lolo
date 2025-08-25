import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import { AdminContext } from './AdminContext';
import type { CartItem } from '../types/movie';

interface SeriesCartItem extends CartItem {
  selectedSeasons?: number[];
  paymentType?: 'cash' | 'transfer';
}

interface CartState {
  items: SeriesCartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: SeriesCartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_SEASONS'; payload: { id: number; seasons: number[] } }
  | { type: 'UPDATE_PAYMENT_TYPE'; payload: { id: number; paymentType: 'cash' | 'transfer' } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: SeriesCartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (item: SeriesCartItem) => void;
  removeItem: (id: number) => void;
  updateSeasons: (id: number, seasons: number[]) => void;
  updatePaymentType: (id: number, paymentType: 'cash' | 'transfer') => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemSeasons: (id: number) => number[];
  getItemPaymentType: (id: number) => 'cash' | 'transfer';
  calculateItemPrice: (item: SeriesCartItem) => number;
  calculateTotalPrice: () => number;
  calculateTotalByPaymentType: () => { cash: number; transfer: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.some(item => item.id === action.payload.id && item.type === action.payload.type)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + 1
      };
    case 'UPDATE_SEASONS':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, selectedSeasons: action.payload.seasons }
            : item
        )
      };
    case 'UPDATE_PAYMENT_TYPE':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, paymentType: action.payload.paymentType }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - 1
      };
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
    case 'LOAD_CART':
      return {
        items: action.payload,
        total: action.payload.length
      };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const adminContext = React.useContext(AdminContext);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  // Notificar cuando se inicialice el carrito
  useEffect(() => {
    if (adminContext?.addNotification) {
      adminContext.addNotification({
        type: 'info',
        title: 'Carrito Inicializado',
        message: 'Sistema de carrito de compras iniciado con precios sincronizados',
        section: 'Carrito de Compras',
        action: 'CART_INITIALIZED',
        details: {
          moviePrice: adminContext.state.prices.moviePrice,
          seriesPrice: adminContext.state.prices.seriesPrice,
          transferFeePercentage: adminContext.state.prices.transferFeePercentage
        }
      });
    }
  }, []);

  // Clear cart on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    const handleLoad = () => {
      if (sessionStorage.getItem('pageRefreshed') === 'true') {
        localStorage.removeItem('movieCart');
        dispatch({ type: 'CLEAR_CART' });
        sessionStorage.removeItem('pageRefreshed');
        
        // Notificar limpieza por refresh
        if (adminContext?.addNotification) {
          adminContext.addNotification({
            type: 'warning',
            title: 'Carrito Limpiado por Refresh',
            message: 'El carrito fue limpiado debido a una recarga de página',
            section: 'Carrito de Compras',
            action: 'CART_CLEARED_REFRESH'
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    if (sessionStorage.getItem('pageRefreshed') === 'true') {
      localStorage.removeItem('movieCart');
      dispatch({ type: 'CLEAR_CART' });
      sessionStorage.removeItem('pageRefreshed');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('pageRefreshed') !== 'true') {
      const savedCart = localStorage.getItem('movieCart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: items });
          
          // Notificar carga de carrito guardado
          if (adminContext?.addNotification && items.length > 0) {
            adminContext.addNotification({
              type: 'info',
              title: 'Carrito Restaurado',
              message: `${items.length} elementos restaurados desde la sesión anterior`,
              section: 'Carrito de Compras',
              action: 'CART_RESTORED',
              details: { itemCount: items.length }
            });
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          
          if (adminContext?.addNotification) {
            adminContext.addNotification({
              type: 'error',
              title: 'Error al Restaurar Carrito',
              message: 'No se pudo restaurar el carrito de la sesión anterior',
              section: 'Carrito de Compras',
              action: 'CART_RESTORE_ERROR',
              details: { error: error.toString() }
            });
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('movieCart', JSON.stringify(state.items));
    
    // Exportar automáticamente cuando hay cambios en el carrito
    if (adminContext?.state?.realTimeSyncEnabled && state.items.length > 0) {
      setTimeout(() => {
        adminContext?.exportSingleFile?.('CartContext.tsx');
      }, 2000);
    }
  }, [state.items]);

  const addItem = (item: SeriesCartItem) => {
    const itemWithDefaults = { 
      ...item, 
      paymentType: 'cash' as const,
      selectedSeasons: item.type === 'tv' && !item.selectedSeasons ? [1] : item.selectedSeasons
    };
    dispatch({ type: 'ADD_ITEM', payload: itemWithDefaults });
    
    setToast({
      message: `"${item.title}" agregado al carrito`,
      type: 'success',
      isVisible: true
    });

    // Notificar adición al carrito
    if (adminContext?.addNotification) {
      const price = calculateItemPrice(itemWithDefaults);
      adminContext.addNotification({
        type: 'success',
        title: 'Elemento Agregado al Carrito',
        message: `"${item.title}" agregado (${item.type === 'movie' ? 'Película' : 'Serie'}) - $${price.toLocaleString()} CUP`,
        section: 'Carrito de Compras',
        action: 'ADD_TO_CART',
        details: {
          item: itemWithDefaults,
          price,
          cartTotal: state.total + 1
        }
      });
    }
  };

  const removeItem = (id: number) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      setToast({
        message: `"${item.title}" retirado del carrito`,
        type: 'error',
        isVisible: true
      });

      // Notificar eliminación del carrito
      if (adminContext?.addNotification) {
        const price = calculateItemPrice(item);
        adminContext.addNotification({
          type: 'warning',
          title: 'Elemento Retirado del Carrito',
          message: `"${item.title}" eliminado del carrito - $${price.toLocaleString()} CUP`,
          section: 'Carrito de Compras',
          action: 'REMOVE_FROM_CART',
          details: {
            item,
            price,
            cartTotal: state.total - 1
          }
        });
      }
    }
  };

  const updateSeasons = (id: number, seasons: number[]) => {
    const item = state.items.find(item => item.id === id);
    const oldSeasons = item?.selectedSeasons || [];
    
    dispatch({ type: 'UPDATE_SEASONS', payload: { id, seasons } });

    // Notificar actualización de temporadas
    if (adminContext?.addNotification && item) {
      const oldPrice = calculateItemPrice({ ...item, selectedSeasons: oldSeasons });
      const newPrice = calculateItemPrice({ ...item, selectedSeasons: seasons });
      
      adminContext.addNotification({
        type: 'info',
        title: 'Temporadas Actualizadas',
        message: `"${item.title}": ${oldSeasons.length} → ${seasons.length} temporadas ($${oldPrice.toLocaleString()} → $${newPrice.toLocaleString()} CUP)`,
        section: 'Carrito de Compras',
        action: 'UPDATE_SEASONS',
        details: {
          item,
          oldSeasons,
          newSeasons: seasons,
          oldPrice,
          newPrice
        }
      });
    }
  };

  const updatePaymentType = (id: number, paymentType: 'cash' | 'transfer') => {
    const item = state.items.find(item => item.id === id);
    const oldPaymentType = item?.paymentType || 'cash';
    
    dispatch({ type: 'UPDATE_PAYMENT_TYPE', payload: { id, paymentType } });

    // Notificar cambio de tipo de pago
    if (adminContext?.addNotification && item) {
      const oldPrice = calculateItemPrice({ ...item, paymentType: oldPaymentType });
      const newPrice = calculateItemPrice({ ...item, paymentType });
      
      adminContext.addNotification({
        type: 'info',
        title: 'Tipo de Pago Actualizado',
        message: `"${item.title}": ${oldPaymentType === 'cash' ? 'Efectivo' : 'Transferencia'} → ${paymentType === 'cash' ? 'Efectivo' : 'Transferencia'} ($${oldPrice.toLocaleString()} → $${newPrice.toLocaleString()} CUP)`,
        section: 'Carrito de Compras',
        action: 'UPDATE_PAYMENT_TYPE',
        details: {
          item,
          oldPaymentType,
          newPaymentType: paymentType,
          oldPrice,
          newPrice
        }
      });
    }
  };

  const clearCart = () => {
    const itemCount = state.total;
    const totalValue = calculateTotalPrice();
    
    dispatch({ type: 'CLEAR_CART' });

    // Notificar limpieza del carrito
    if (adminContext?.addNotification && itemCount > 0) {
      adminContext.addNotification({
        type: 'warning',
        title: 'Carrito Vaciado',
        message: `${itemCount} elementos eliminados del carrito (Valor: $${totalValue.toLocaleString()} CUP)`,
        section: 'Carrito de Compras',
        action: 'CLEAR_CART',
        details: {
          itemCount,
          totalValue
        }
      });
    }
  };

  const isInCart = (id: number) => {
    return state.items.some(item => item.id === id);
  };

  const getItemSeasons = (id: number): number[] => {
    const item = state.items.find(item => item.id === id);
    return item?.selectedSeasons || [];
  };

  const getItemPaymentType = (id: number): 'cash' | 'transfer' => {
    const item = state.items.find(item => item.id === id);
    return item?.paymentType || 'cash';
  };

  const calculateItemPrice = (item: SeriesCartItem): number => {
    // Get current prices from admin context with real-time updates
    const moviePrice = adminContext?.state?.prices?.moviePrice || 80;
    const seriesPrice = adminContext?.state?.prices?.seriesPrice || 300;
    const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || 10;
    
    if (item.type === 'movie') {
      const basePrice = moviePrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    } else {
      const seasons = item.selectedSeasons?.length || 1;
      const basePrice = seasons * seriesPrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    }
  };

  const calculateTotalPrice = (): number => {
    return state.items.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const calculateTotalByPaymentType = (): { cash: number; transfer: number } => {
    const moviePrice = adminContext?.state?.prices?.moviePrice || 80;
    const seriesPrice = adminContext?.state?.prices?.seriesPrice || 300;
    const transferFeePercentage = adminContext?.state?.prices?.transferFeePercentage || 10;
    
    return state.items.reduce((totals, item) => {
      const basePrice = item.type === 'movie' ? moviePrice : (item.selectedSeasons?.length || 1) * seriesPrice;
      if (item.paymentType === 'transfer') {
        totals.transfer += Math.round(basePrice * (1 + transferFeePercentage / 100));
      } else {
        totals.cash += basePrice;
      }
      return totals;
    }, { cash: 0, transfer: 0 });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Notificar cambios importantes en el carrito
  useEffect(() => {
    if (adminContext?.addNotification && state.items.length > 0) {
      const total = calculateTotalPrice();
      const { cash, transfer } = calculateTotalByPaymentType();
      
      // Solo notificar cada 5 elementos para evitar spam
      if (state.total % 5 === 0) {
        adminContext.addNotification({
          type: 'info',
          title: 'Resumen del Carrito',
          message: `${state.total} elementos - Total: $${total.toLocaleString()} CUP (Efectivo: $${cash.toLocaleString()}, Transferencia: $${transfer.toLocaleString()})`,
          section: 'Carrito de Compras',
          action: 'CART_SUMMARY',
          details: {
            itemCount: state.total,
            totalValue: total,
            cashTotal: cash,
            transferTotal: transfer
          }
        });
      }
    }
  }, [state.total]);

  return (
    <CartContext.Provider value={{ 
      state, 
      addItem, 
      removeItem, 
      updateSeasons, 
      updatePaymentType,
      clearCart, 
      isInCart, 
      getItemSeasons,
      getItemPaymentType,
      calculateItemPrice,
      calculateTotalPrice,
      calculateTotalByPaymentType
    }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}