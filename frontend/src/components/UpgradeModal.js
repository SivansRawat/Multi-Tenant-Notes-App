import React, { useState } from 'react';
import './UpgradeModal.css';

const UpgradeModal = ({ onUpgrade, onCancel, tenantInfo, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    if (!isAdmin) {
      setError('Only administrators can upgrade the subscription');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onUpgrade();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upgrade failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="upgrade-modal-overlay" onClick={handleOverlayClick}>
      <div className="upgrade-modal">
        <div className="upgrade-modal-header">
          <h2>🚀 Upgrade to Pro</h2>
          <button 
            className="close-button"
            onClick={onCancel}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="upgrade-modal-content">
          <div className="current-plan">
            <h3>Current Plan: Free</h3>
            <div className="plan-stats">
              <div className="stat">
                <span className="stat-label">Notes Used:</span>
                <span className="stat-value">{tenantInfo?.note_count || 0} / {tenantInfo?.note_limit || 3}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Tenant:</span>
                <span className="stat-value">{tenantInfo?.name}</span>
              </div>
            </div>
          </div>

          <div className="plans-comparison">
            <div className="plan-card current">
              <div className="plan-header">
                <h4>Free Plan</h4>
                <div className="plan-price">$0/month</div>
              </div>
              <div className="plan-features">
                <div className="feature">✅ Up to 3 notes</div>
                <div className="feature">✅ Basic note editing</div>
                <div className="feature">✅ Multi-user access</div>
                <div className="feature">❌ Unlimited notes</div>
                <div className="feature">❌ Advanced features</div>
              </div>
            </div>

            <div className="plan-card pro">
              <div className="plan-header">
                <h4>Pro Plan</h4>
                <div className="plan-price">$19/month</div>
                <div className="plan-badge">Recommended</div>
              </div>
              <div className="plan-features">
                <div className="feature">✅ Unlimited notes</div>
                <div className="feature">✅ Advanced note editing</div>
                <div className="feature">✅ Multi-user access</div>
                <div className="feature">✅ Priority support</div>
                <div className="feature">✅ Advanced search</div>
              </div>
            </div>
          </div>

          <div className="upgrade-benefits">
            <h3>🎯 Why upgrade?</h3>
            <ul>
              <li><strong>Unlimited Notes:</strong> Create as many notes as you need</li>
              <li><strong>Enhanced Productivity:</strong> Advanced features for better organization</li>
              <li><strong>Team Collaboration:</strong> Better tools for team workflows</li>
              <li><strong>Priority Support:</strong> Get help when you need it</li>
            </ul>
          </div>

          {!isAdmin && (
            <div className="admin-notice">
              <p>⚠️ Only administrators can upgrade the subscription. Please contact your admin to upgrade.</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="upgrade-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Maybe Later
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={handleUpgrade}
              className="upgrade-button"
              disabled={loading}
            >
              {loading ? 'Upgrading...' : '⚡ Upgrade to Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
