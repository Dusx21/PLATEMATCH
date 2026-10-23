import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DishCard } from './DishCard';
import { RestaurantCard } from './RestaurantCard';
import { SwipeActions } from './SwipeActions';
import { ModeSelector } from './ModeSelector';
import { HeaderBar } from './HeaderBar';
import { FilterSheet } from './FilterSheet';
import { LocationSelectorModal } from './LocationSelectorModal';
import { DishDetailModal } from './DishDetailModal';
import { MatchDecisionModal } from '../reservation/MatchDecisionModal';
import { CheckoutModal } from '../reservation/CheckoutModal';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { useToast } from '../ui/Toast';

export function DiscoveryFeed({
  dishes,
  restaurants,
  loading,
  error,
  location,
  radius,
  isLocating,
  onChangeLocation,
  onChangeRadius,
  onRequestGps,
  onResetStock,
  onRefresh,
  activeFilters,
  onApplyFilters,
  onResetFilters,
  onConfirmReservation,
  mode,
  onChangeMode,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);

  // Modals state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [detailDish, setDetailDish] = useState(null);
  const [matchDish, setMatchDish] = useState(null);
  const [checkoutDish, setCheckoutDish] = useState(null);

  const { addToast } = useToast();

  const items = mode === 'dish' ? dishes : restaurants;
  const currentItem = items[currentIndex];
  const nextItem = items[currentIndex + 1];

  const handleSwipeLeft = (item) => {
    setHistory((prev) => [...prev, item]);
    setCurrentIndex((prev) => prev + 1);
    addToast(`Pasaste: ${item.title || item.name}`, 'info', 1800);
  };

  const handleSwipeRight = (item) => {
    // If restaurant mode, convert or choose first dish
    if (mode === 'restaurant') {
      if (item.dishes && item.dishes.length > 0) {
        setMatchDish(item.dishes[0]);
      } else {
        addToast(`Restaurante seleccionado: ${item.name}`, 'success');
      }
    } else {
      setMatchDish(item);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || currentIndex === 0) return;
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    addToast('Tarjeta restaurada', 'info', 1500);
  };

  const handleResetCards = () => {
    setCurrentIndex(0);
    setHistory([]);
    addToast('Baraja reiniciada', 'success', 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
      {/* Top Header */}
      <HeaderBar
        location={location}
        radius={radius}
        onOpenLocationModal={() => setIsLocationOpen(true)}
        onOpenFilters={() => setIsFilterOpen(true)}
        onResetStock={() => {
          onResetStock();
          handleResetCards();
          addToast('Stock de demostración reiniciado', 'success');
        }}
      />

      {/* Mode Selector */}
      <ModeSelector
        currentMode={mode}
        onChangeMode={(newMode) => {
          onChangeMode(newMode);
          setCurrentIndex(0);
          setHistory([]);
        }}
      />

      {/* Main Card Swiping Deck Area */}
      <div className="flex-1 px-5 py-2 relative flex items-center justify-center min-h-[460px]">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="p-6 bg-white rounded-card text-center shadow-card border border-chili/20">
            <p className="text-sm text-chili font-bold mb-3">{error}</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-aubergine text-cream text-xs font-bold rounded-xl"
            >
              Reintentar
            </button>
          </div>
        ) : currentItem ? (
          <div className="relative w-full h-[450px] max-w-sm">
            {/* Next card in stack (preview under the top card) */}
            {nextItem && (
              mode === 'dish' ? (
                <DishCard
                  key={nextItem.id}
                  dish={nextItem}
                  isFront={false}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  onOpenDetail={() => {}}
                />
              ) : (
                <RestaurantCard
                  key={nextItem.id}
                  restaurant={nextItem}
                  isFront={false}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  onSelectDish={() => {}}
                />
              )
            )}

            {/* Current Top Card with interactive Framer Motion gestures */}
            <AnimatePresence>
              {mode === 'dish' ? (
                <DishCard
                  key={currentItem.id}
                  dish={currentItem}
                  isFront={true}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onOpenDetail={(dish) => setDetailDish(dish)}
                />
              ) : (
                <RestaurantCard
                  key={currentItem.id}
                  restaurant={currentItem}
                  isFront={true}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onSelectDish={(dish) => setMatchDish(dish)}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            onReset={handleResetCards}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExpandRadius={() => {
              onChangeRadius(500);
              handleResetCards();
              addToast('Radio ampliado a 500 m', 'success');
            }}
          />
        )}
      </div>

      {/* Bottom Accessible Action Controls */}
      {currentItem && (
        <SwipeActions
          onPass={() => handleSwipeLeft(currentItem)}
          onMatch={() => handleSwipeRight(currentItem)}
          onInfo={() => {
            if (mode === 'dish') setDetailDish(currentItem);
          }}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          disabled={loading || !currentItem}
        />
      )}

      {/* Location & Radius Modal */}
      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentLocation={location}
        currentRadius={radius}
        onSelectLocation={onChangeLocation}
        onSelectRadius={onChangeRadius}
        onRequestGps={onRequestGps}
        isLocating={isLocating}
      />

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={(filters) => {
          onApplyFilters(filters);
          setCurrentIndex(0);
          setHistory([]);
          addToast('Filtros aplicados', 'info');
        }}
        onResetFilters={() => {
          onResetFilters();
          setCurrentIndex(0);
          setHistory([]);
          addToast('Filtros restablecidos', 'info');
        }}
      />

      {/* Dish Detailed Nutrition / Specs Modal */}
      <DishDetailModal
        isOpen={Boolean(detailDish)}
        onClose={() => setDetailDish(null)}
        dish={detailDish}
        onSelectMatch={(dish) => {
          setDetailDish(null);
          setMatchDish(dish);
        }}
      />

      {/* Match Decision Modal */}
      <MatchDecisionModal
        isOpen={Boolean(matchDish)}
        onClose={() => setMatchDish(null)}
        dish={matchDish}
        userLocation={location}
        onOpenCheckout={(dish) => {
          setMatchDish(null);
          setCheckoutDish(dish);
        }}
      />

      {/* Checkout Express Modal */}
      <CheckoutModal
        isOpen={Boolean(checkoutDish)}
        onClose={() => setCheckoutDish(null)}
        dish={checkoutDish}
        onConfirmReservation={onConfirmReservation}
      />
    </div>
  );
}
