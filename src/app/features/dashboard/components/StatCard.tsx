import React from 'react';
import { Card } from 'react-bootstrap';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  title: string;
  variant?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, title, variant = 'light' }) => {
  return (
    <Card className={`h-100 border-start border-5 border-${variant}`}>
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <div className={`text-${variant}`}>{icon}</div>
          </div>
          <div className="flex-grow-1 ms-3">
            <h4 className="mb-1 fw-bold">{value}</h4>
            <p className="mb-0 text-muted">{title}</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
