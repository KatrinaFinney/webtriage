import React from 'react';
import styles from '../styles/Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  children,
  onClick,
  className = '',
  variant = 'primary',
  ...rest
}: ButtonProps) {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (navigator.vibrate) navigator.vibrate(50);
    onClick?.(e);
  };

  const variantClass = variant === 'secondary' ? styles.secondary : styles.primary;

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`${styles.button} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
