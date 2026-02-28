import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-5">
      <div className="mb-3" style={{ fontSize: '3rem' }} aria-hidden="true">
        {icon}
      </div>
      <h5 className="text-muted mb-2">{title}</h5>
      {description && <p className="text-muted mb-3">{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
