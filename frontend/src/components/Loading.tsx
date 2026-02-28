import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
}) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  }[size];

  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div
        className={`spinner-border text-primary ${sizeClass}`}
        role="status"
        aria-hidden="true"
      >
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <span className="mt-2 text-muted">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`min-vh-100 d-flex align-items-center justify-content-center bg-light ${className}`}
        role="status"
        aria-label="Loading"
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className={`d-flex align-items-center justify-content-center p-4 ${className}`}>
      {spinner}
    </div>
  );
};

export default Loading;
