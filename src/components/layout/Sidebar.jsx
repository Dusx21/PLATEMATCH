import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { PlateMatchLogo } from '../brand/PlateMatchLogo';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  QrCode,
  History,
  Settings,
  ExternalLink,
  Store,
  X,
} from 'lucide-react';

export function Sidebar({ confirmedOrdersCount = 0, isOpen = false, onClose }) {
  const navItems = [
    {
      to: '/dashboard',
      end: true,
      label: 'Resumen Operativo',
      icon: <LayoutDashboard size={19} />,
    },
    {
      to: '/dashboard/orders',
      label: 'Reservas en Vivo',
      icon: <UtensilsCrossed size={19} />,
      badge: confirmedOrdersCount > 0 ? confirmedOrdersCount : null,
      badgeColor: 'bg-chili text-white animate-pulse',
    },
    {
      to: '/dashboard/inventory',
      label: 'Inventario & Mermas',
      icon: <Package size={19} />,
    },
    {
      to: '/dashboard/validate',
      label: 'Validación QR',
      icon: <QrCode size={19} />,
    },
    {
      to: '/dashboard/history',
      label: 'Historial',
      icon: <History size={19} />,
    },
    {
      to: '/dashboard/settings',
      label: 'Configuración',
      icon: <Settings size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-aubergine/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-aubergine text-cream flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 pb-4 border-b border-aubergine-700/60 flex items-center justify-between">
            <div>
              <PlateMatchLogo size="sm" withText={true} textColor="text-cream" />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                <span className="text-[11px] font-sans font-semibold text-cream/70 uppercase tracking-wider">
                  Panel Doña Rosa
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-cream/60 hover:text-cream rounded-lg hover:bg-aubergine-700"
              aria-label="Cerrar menú lateral"
            >
              <X size={20} />
            </button>
          </div>

          {/* Restaurant Card Summary */}
          <div className="mx-4 my-4 p-3 rounded-2xl bg-aubergine-900/80 border border-aubergine-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chili text-white flex items-center justify-center font-outfit font-black text-sm shrink-0 shadow-sm">
              DR
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-outfit font-bold text-cream truncate">
                Picantería Doña Rosa
              </h4>
              <p className="text-[11px] font-sans text-cream/60 truncate">
                San Jerónimo · Frente a UAC
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-2xl font-outfit text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-chili text-white shadow-md shadow-chili/20'
                      : 'text-cream/80 hover:text-cream hover:bg-aubergine-700/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer: Switch to Diner App */}
        <div className="p-4 border-t border-aubergine-700/60">
          <Link
            to="/"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-outfit font-bold bg-cream/10 text-cream hover:bg-cream/20 transition-all border border-cream/10"
          >
            <span className="flex items-center gap-2">
              <Store size={15} className="text-mango" />
              <span>Ver App Comensal</span>
            </span>
            <ExternalLink size={13} className="text-cream/60" />
          </Link>
          <p className="text-[10px] text-center text-cream/40 mt-3 font-sans">
            platematch v2 · ExpoAndina UAC 2026
          </p>
        </div>
      </aside>
    </>
  );
}
