import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon = null,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-outfit font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-chili text-white hover:bg-chili-dark focus:ring-chili shadow-md hover:shadow-lg active:shadow-sm',
    secondary: 'bg-aubergine text-cream hover:bg-aubergine-900 focus:ring-aubergine shadow-md',
    mint: 'bg-mint text-white hover:bg-mint-dark focus:ring-mint shadow-md',
    mango: 'bg-mango text-aubergine hover:bg-mango-light focus:ring-mango shadow-sm',
    outline: 'border-2 border-aubergine/20 text-aubergine hover:bg-aubergine/5 focus:ring-aubergine bg-transparent',
    ghost: 'text-aubergine hover:bg-aubergine/10 focus:ring-aubergine bg-transparent',
    subtle: 'bg-white text-aubergine border border-aubergine/10 hover:bg-cream-100 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 rounded-2xl gap-2 h-11',
    lg: 'text-base px-5 py-3.5 rounded-2xl gap-2.5 h-14',
    icon: 'p-2.5 rounded-2xl h-11 w-11',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
