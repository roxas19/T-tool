// src/components/Common/MainToolbarButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import './MainToolbar.css';

export type MainToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

const MainToolbarButton: React.FC<MainToolbarButtonProps> = ({
  active,
  className,
  children,
  ...rest
}) => {
  const classes = `main-toolbar-button ${active ? "btn-active" : ""} ${className || ""}`;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default MainToolbarButton;
