import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Ticket, Store, Sparkles } from 'lucide-react';
import { transitions } from '../../lib/animations';

export function ConsumerNavbar({ activeReservation }) {
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'Descubrir',
      icon: <Utensils size={18} />,
      badge: null,
    },
    {
      to: activeReservation ? `/ticket/${activeReservation.id}` : '#',
      label: 'Mi Ticket',
      icon: <Ticket size={18} />,
      badge: activeReservation?.status === 'confirmed' ? '15m' : null,
      disabled: !activeReservation,
      badgeColor: 'bg-chili text-white animate-pulse',
    },
    {
      to: '/dashboard',
      label: 'Panel Cocina',
      icon: <Store size={18} />,
      badge: 'Doña Rosa',
      badgeColor: 'bg-aubergine text-cream',
    },
  ];

  return (
    <nav className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-white/92 backdrop-blur-xl border border-aubergine/10 shadow-float rounded-full p-1.5 flex items-center gap-1 max-w-sm w-full transition-all">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : item.to.startsWith('/ticket')
              ? location.pathname.startsWith('/ticket')
              : location.pathname.startsWith('/dashboard');

          if (item.disabled) {
            return (
              <div
                key={item.label}
                title="Aún no tienes un ticket activo"
                className="flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-aubergine/30 cursor-not-allowed select-none text-[10px] font-outfit font-semibold gap-0.5"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-outfit font-bold transition-colors select-none gap-0.5 z-10 ${
                isActive ? 'text-white' : 'text-aubergine/70 hover:text-aubergine'
              }`}
            >
              {/* Sliding Active Pill */}
              {isActive && (
                <motion.div
                  layoutId="consumerNavPill"
                  transition={transitions.snappy}
                  className="absolute inset-0 rounded-full bg-aubergine shadow-sm -z-10"
                />
              )}

              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-sans font-bold px-1 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
