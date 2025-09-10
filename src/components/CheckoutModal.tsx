import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Home, CreditCard, DollarSign, Truck, Package, AlertCircle, Check, Calculator, Sparkles } from 'lucide-react';

// ZONAS DE ENTREGA EMBEBIDAS - Generadas automáticamente
const EMBEDDED_DELIVERY_ZONES = [
  {
    "id": 1,
    "name": "Santiago de Cuba > Santiago de Cuba > Centro Histórico",
    "cost": 50,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Santiago de Cuba > Santiago de Cuba > Vista Alegre",
    "cost": 75,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": 3,
    "name": "Santiago de Cuba > Santiago de Cuba > Reparto Sueño",
    "cost": 100,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
];

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: string;
  deliveryCost: number;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  cashTotal?: number;
  transferTotal?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: ''
  });
  
  const [deliveryZones, setDeliveryZones] = useState(EMBEDDED_DELIVERY_ZONES);
  const [selectedZone, setSelectedZone] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Listen for delivery zones updates from admin panel
  useEffect(() => {
    // Load initial delivery zones
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        if (state.deliveryZones && state.deliveryZones.length > 0) {
          setDeliveryZones(state.deliveryZones);
        }
      }
    } catch (error) {
      console.error('Error loading delivery zones:', error);
    }

    // Listen for real-time updates
    const handleDeliveryZonesUpdate = (event: CustomEvent) => {
      if (event.detail.zones) {
        setDeliveryZones(event.detail.zones);
      }
    };

    const handleAdminConfigUpdate = (event: CustomEvent) => {
      if (event.detail.deliveryZones) {
        setDeliveryZones(event.detail.deliveryZones);
      }
    };

    window.addEventListener('delivery_zones_updated', handleDeliveryZonesUpdate as EventListener);
    window.addEventListener('admin_config_updated', handleAdminConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('delivery_zones_updated', handleDeliveryZonesUpdate as EventListener);
      window.removeEventListener('admin_config_updated', handleAdminConfigUpdate as EventListener);
    };
  }, []);

  const handleZoneChange = (zoneName: string) => {
    setSelectedZone(zoneName);
    const zone = deliveryZones.find(z => z.name === zoneName);
    setDeliveryCost(zone ? zone.cost : 0);
    
    if (errors.deliveryZone) {
      setErrors(prev => ({ ...prev, deliveryZone: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s-()]{8,}$/.test(customerInfo.phone.trim())) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!selectedZone) {
      newErrors.deliveryZone = 'Debe seleccionar una zona de entrega';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: OrderData = {
        orderId: `TV-${Date.now()}`,
        customerInfo,
        deliveryZone: selectedZone,
        deliveryCost,
        items,
        subtotal: total,
        transferFee: 0,
        total: total + deliveryCost
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      onCheckout(orderData);
      
      // Reset form
      setCustomerInfo({ fullName: '', phone: '', address: '' });
      setSelectedZone('');
      setDeliveryCost(0);
      setErrors({});
    } catch (error) {
      console.error('Error processing checkout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalTotal = total + deliveryCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4 shadow-lg">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                <p className="opacity-90">Complete sus datos para procesar el pedido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mr-4 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Información del Cliente</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }));
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese su nombre completo"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+53 5X XXX XXXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="h-4 w-4 inline mr-2" />
                  Dirección Completa *
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => {
                    setCustomerInfo(prev => ({ ...prev, address: e.target.value }));
                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Calle, número, entre calles, repartos, referencias..."
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Zone */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl mr-4 shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Zona de Entrega</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="h-4 w-4 inline mr-2" />
                  Seleccionar Zona de Entrega *
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.deliveryZone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione una zona de entrega</option>
                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.name}>
                      {zone.name} - ${zone.cost} CUP
                    </option>
                  ))}
                </select>
                {errors.deliveryZone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.deliveryZone}
                  </p>
                )}

                {selectedZone && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-green-300 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Zona Seleccionada</p>
                          <p className="text-sm text-gray-600">{selectedZone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${deliveryCost.toLocaleString()} CUP
                        </p>
                        <p className="text-sm text-gray-500">Costo de entrega</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl mr-4 shadow-lg">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Resumen del Pedido</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-purple-200">
                  <span className="text-gray-700">Subtotal ({items.length} elementos)</span>
                  <span className="font-semibold text-gray-900">${total.toLocaleString()} CUP</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-purple-200">
                  <span className="text-gray-700">Costo de entrega</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCost > 0 ? `$${deliveryCost.toLocaleString()} CUP` : 'Seleccione zona'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl px-4 border-2 border-purple-300">
                  <span className="text-lg font-bold text-purple-900 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Total Final
                  </span>
                  <span className="text-2xl font-bold text-purple-900">
                    ${finalTotal.toLocaleString()} CUP
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !selectedZone}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  isSubmitting || !selectedZone
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white transform hover:scale-105 shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}