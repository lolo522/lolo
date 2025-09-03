import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Plus, Check, Eye, ShoppingCart, Play, Info } from 'lucide-react';
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

  return (
    <>
      <div 
        className={`group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 transform ${
          isHovered 
            ? 'shadow-lg scale-[1.02] -translate-y-1' 
            : 'hover:shadow-md hover:scale-[1.01]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`} />
        
        {/* Premium badge for high-rated content */}
        {item.vote_average >= 8.0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center z-20 shadow-sm">
            <Star className="h-3 w-3 mr-1 fill-white" />
            TOP
          </div>
        )}

        {/* Quick Actions Overlay - More Subtle */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex space-x-3">
            {/* Add to Cart Button */}
            <button
              onClick={handleCartAction}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 transform ${
                inCart
                  ? 'bg-green-500 hover:bg-green-600 text-white scale-110'
                  : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
              }`}
            >
              {inCart ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>

            {/* View Details Button */}
            <Link
              to={`/${type}/${item.id}`}
              className="bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 transform"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={posterUrl}
            alt={title}
            className={`w-full h-80 transition-all duration-300 ${
              isHovered ? 'scale-105' : ''
            }`}
            lazy={true}
          />
          
          {/* Subtle overlay on hover */}
          <div className={`absolute inset-0 transition-all duration-300 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/30 via-transparent to-transparent' 
              : 'bg-black/0'
          }`} />
          
          <div className={`absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm flex items-center space-x-1 transition-all duration-300 ${
            isHovered ? 'bg-black/80' : ''
          }`}>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        
        <div className="p-4 relative">
          {/* Smooth title with subtle gradient effect */}
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 transition-all duration-300 ${
            isHovered 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' 
              : ''
          }`}>
            {title}
          </h3>
          
          <div className={`flex items-center text-gray-500 text-sm mb-3 transition-all duration-300 ${
            isHovered ? 'text-blue-600' : ''
          }`}>
            <Calendar className="h-4 w-4 mr-2" />
            <span>{year}</span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {item.overview || 'Sin descripción disponible'}
          </p>
          
          {/* Subtle progress bar for rating */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(item.vote_average / 10) * 100}%` }}
            />
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleCartAction}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 transform ${
              inCart
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center justify-center">
              {inCart ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span>En el Carrito</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Agregar al Carrito</span>
                </>
              )}
            </div>
          </button>

          {/* View Details Link */}
          <Link
            to={`/${type}/${item.id}`}
            className="w-full mt-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Link>
        </div>
        
        {/* Subtle selection indicator */}
        {inCart && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
        )}
      </div>
      
      <CartAnimation 
        show={showAnimation} 
        onComplete={() => setShowAnimation(false)} 
      />
    </>
  );
}