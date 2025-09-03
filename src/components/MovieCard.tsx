import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Plus, Check, Sparkles, Zap, Heart, Eye, ShoppingCart, Play, Info } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useCart } from '../context/CartContext';
import { CartAnimation } from './CartAnimation';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../config/api';
import type { Movie, TVShow, CartItem } from '../types/movie';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
}

export function MovieCard({ item, type }: MovieCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const [showAnimation, setShowAnimation] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const posterUrl = item.poster_path 
    ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${item.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&crop=center';

  const inCart = isInCart(item.id);

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRippleEffect({ x, y, show: true });
    setTimeout(() => setRippleEffect(prev => ({ ...prev, show: false })), 600);

    const cartItem: CartItem = {
      id: item.id,
      title,
      poster_path: item.poster_path,
      type,
      release_date: 'release_date' in item ? item.release_date : undefined,
      first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
      vote_average: item.vote_average,
      selectedSeasons: type === 'tv' ? [1] : undefined,
      original_language: item.original_language,
      genre_ids: item.genre_ids,
    };

    if (inCart) {
      removeItem(item.id);
    } else {
      addItem(cartItem);
      setShowAnimation(true);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowQuickActions(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => setShowQuickActions(false), 200);
  };

  return (
    <>
      <div 
        className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-700 transform ${
          isHovered 
            ? 'shadow-2xl scale-110 -translate-y-4 ring-4 ring-blue-200 ring-opacity-50' 
            : 'hover:shadow-xl hover:scale-105'
        } ${isPressed ? 'scale-95' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-700 ${
          isHovered ? 'opacity-30' : ''
        }`} />
        
        {/* Floating particles effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce opacity-70"
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${10 + (i % 4) * 25}%`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Premium badge for high-rated content */}
        {item.vote_average >= 8.0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-pulse z-20 shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            PREMIUM
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 transition-all duration-500 ${
          showQuickActions && isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex space-x-4">
            {/* Add to Cart Button */}
            <button
              onClick={handleCartAction}
              className={`relative overflow-hidden p-4 rounded-full shadow-2xl transition-all duration-500 transform ${
                inCart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white scale-110 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-125'
              }`}
            >
              {/* Ripple effect */}
              {rippleEffect.show && (
                <div 
                  className="absolute bg-white/30 rounded-full animate-ping"
                  style={{
                    left: rippleEffect.x - 10,
                    top: rippleEffect.y - 10,
                    width: 20,
                    height: 20
                  }}
                />
              )}
              
              {/* Floating mini icons */}
              {isHovered && (
                <>
                  <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-yellow-300 animate-bounce" />
                  <Heart className="absolute -top-1 -right-1 h-3 w-3 text-pink-300 animate-pulse" />
                  <Zap className="absolute -bottom-1 -left-1 h-3 w-3 text-blue-300 animate-bounce delay-100" />
                  <Star className="absolute -bottom-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse delay-200" />
                </>
              )}
              
              {inCart ? (
                <Check className="h-6 w-6 animate-bounce relative z-10" />
              ) : (
                <ShoppingCart className={`h-6 w-6 transition-transform duration-300 relative z-10 ${
                  isHovered ? 'scale-125' : ''
                }`} />
              )}
            </button>

            {/* View Details Button */}
            <Link
              to={`/${type}/${item.id}`}
              className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full shadow-2xl transition-all duration-500 hover:bg-white/30 hover:scale-125 transform"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-6 w-6" />
            </Link>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-t-2xl">
          <OptimizedImage
            src={posterUrl}
            alt={title}
            className={`w-full h-80 transition-all duration-700 ${
              isHovered ? 'scale-125 brightness-110' : 'group-hover:scale-110'
            }`}
            lazy={true}
          />
          <div className={`absolute inset-0 transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' 
              : 'bg-black/0 group-hover:bg-black/20'
          }`} />
          
          {/* Shimmer effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
          
          <div className={`absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm flex items-center space-x-1 transition-all duration-300 ${
            isHovered ? 'scale-110 bg-gradient-to-r from-yellow-500 to-orange-500' : ''
          }`}>
            <Star className={`h-4 w-4 transition-all duration-300 ${
              isHovered ? 'fill-white text-white animate-pulse' : 'fill-yellow-400 text-yellow-400'
            }`} />
            <span className="font-bold">{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        
        <div className="p-5 relative">
          {/* Animated title with gradient effect */}
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 transition-all duration-300 ${
            isHovered 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 transform scale-105' 
              : 'group-hover:text-blue-600'
          }`}>
            {title}
          </h3>
          
          <div className={`flex items-center text-gray-500 text-sm mb-3 transition-all duration-300 ${
            isHovered ? 'text-blue-600 transform translate-x-1' : ''
          }`}>
            <Calendar className={`h-4 w-4 mr-2 transition-all duration-300 ${
              isHovered ? 'text-blue-500 animate-pulse' : ''
            }`} />
            <span>{year}</span>
          </div>
          
          <p className={`text-gray-600 text-sm line-clamp-2 mb-4 transition-all duration-300 ${
            isHovered ? 'text-gray-700 leading-relaxed' : ''
          }`}>
            {item.overview || 'Sin descripción disponible'}
          </p>
          
          {/* Animated progress bar for rating */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ${
                isHovered ? 'animate-pulse' : ''
              }`}
              style={{ 
                width: `${(item.vote_average / 10) * 100}%`,
                transform: isHovered ? 'scaleY(1.5)' : 'scaleY(1)'
              }}
            />
          </div>

          {/* Quick Add Button (Always Visible) */}
          <button
            onClick={handleCartAction}
            className={`w-full mt-4 px-4 py-3 rounded-xl font-bold transition-all duration-500 transform relative overflow-hidden ${
              inCart
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white scale-105 animate-pulse shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105 shadow-md'
            } ${isHovered ? 'scale-105 shadow-xl' : ''}`}
          >
            {/* Animated background */}
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
            )}
            
            {/* Floating mini particles */}
            {isHovered && !inCart && (
              <>
                <div className="absolute top-1 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-bounce" />
                <div className="absolute top-1 right-2 w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
                <div className="absolute bottom-1 left-3 w-1 h-1 bg-blue-300 rounded-full animate-bounce delay-100" />
                <div className="absolute bottom-1 right-3 w-1 h-1 bg-green-300 rounded-full animate-pulse delay-200" />
              </>
            )}
            
            <div className="flex items-center justify-center relative z-10">
              {inCart ? (
                <>
                  <Check className={`mr-2 h-5 w-5 transition-transform duration-300 ${
                    isHovered ? 'scale-125 animate-bounce' : ''
                  }`} />
                  <span>En el Carrito</span>
                </>
              ) : (
                <>
                  <Plus className={`mr-2 h-5 w-5 transition-transform duration-300 ${
                    isHovered ? 'rotate-90 scale-125' : ''
                  }`} />
                  <span>Agregar al Carrito</span>
                </>
              )}
            </div>
          </button>

          {/* View Details Link */}
          <Link
            to={`/${type}/${item.id}`}
            className={`w-full mt-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform border-2 flex items-center justify-center ${
              isHovered 
                ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105' 
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Link>
        </div>
        
        {/* Enhanced selection indicator */}
        {inCart && (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-pulse" />
            <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full animate-bounce shadow-lg z-20">
              <Check className="h-4 w-4" />
            </div>
          </>
        )}
        
        {/* Floating success indicator */}
        {inCart && isHovered && (
          <div className="absolute top-16 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center animate-bounce shadow-lg z-20">
            <Check className="h-3 w-3 mr-1" />
            ✓ AGREGADO
          </div>
        )}

        {/* Magical glow effect */}
        {isHovered && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 animate-pulse pointer-events-none" />
        )}
        
        {/* Corner sparkle effects */}
        {isHovered && (
          <>
            <div className="absolute top-2 left-2 text-yellow-300 animate-bounce z-20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="absolute bottom-2 right-2 text-pink-300 animate-pulse z-20">
              <Heart className="h-4 w-4" />
            </div>
          </>
        )}
      </div>
      
      <CartAnimation 
        show={showAnimation} 
        onComplete={() => setShowAnimation(false)} 
      />
    </>
  );
}