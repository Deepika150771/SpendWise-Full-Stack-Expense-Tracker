import React from 'react';

const StatCard = ({ title, amount, currency = '$', subtext, icon: Icon, color, accent }) => {
  const formattedAmount = typeof amount === 'number'
    ? `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${currency}0.00`;

  return (
    <div className="stat-card" style={{ '--card-accent': accent }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: `${color}18`,
            color: color,
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div>
        <div className="stat-value">{formattedAmount}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
