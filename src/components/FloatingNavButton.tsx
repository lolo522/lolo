import React, { useState } from 'react';
import { Menu, X, Flame, Clapperboard, Monitor, Sparkles, Radio, CheckCircle2 } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: 'tendencias', label: 'Tendencias', icon: Flame },
  { id: 'novelas-transmision', label: 'Novelas En Vivo', icon: Radio },
  { id: 'novelas-finalizadas', label: 'Novelas Completas', icon: CheckCircle2 },
  { id: 'peliculas', label: 'Películas', icon: Clapperboard },
  { id: 'series', label: 'Series', icon: Monitor },
  { id: 'anime', label: 'Anime', icon: Sparkles },
];

export function FloatingNavButton() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        aria-label="Navegación rápida"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-2">
              Ir a Sección
            </h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 text-left group"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
