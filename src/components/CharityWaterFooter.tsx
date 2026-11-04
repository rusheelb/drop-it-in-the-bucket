import React from 'react';
import { ExternalLink, Heart, Droplets, Globe, ShieldCheck } from 'lucide-react';

export const CharityWaterFooter: React.FC = () => {
  return (
    <footer className="charity-footer" role="contentinfo" aria-label="charity: water links and info">
      <div className="charity-footer-card">
        {/* Brand Lockup Header */}
        <div className="charity-footer-top">
          <div className="charity-footer-brand">
            <img
              src="/img/cw_logo-horizontal.png"
              alt="charity: water"
              className="charity-footer-logo"
            />
          </div>
          <div className="charity-model-pill">
            <ShieldCheck size={16} className="text-yellow" />
            <span>The 100% Model: Every public cent funds clean water</span>
          </div>
        </div>

        {/* Mission Statement */}
        <p className="charity-footer-mission">
          <strong>charity: water</strong> is a non-profit organization bringing clean and safe
          drinking water to people in developing countries. Private donors fund all operating costs,
          so 100% of public donations go straight to clean water projects in the field.
        </p>

        {/* Impact Highlights Grid */}
        <div className="charity-impact-grid">
          <div className="impact-box">
            <Droplets size={20} className="impact-icon blue" />
            <div>
              <div className="impact-stat">703 Million</div>
              <div className="impact-desc">People still lack access to clean water worldwide</div>
            </div>
          </div>
          <div className="impact-box">
            <Heart size={20} className="impact-icon yellow" />
            <div>
              <div className="impact-stat">$40 / person</div>
              <div className="impact-desc">Can provide clean water to one person for years</div>
            </div>
          </div>
          <div className="impact-box">
            <Globe size={20} className="impact-icon green" />
            <div>
              <div className="impact-stat">29+ Countries</div>
              <div className="impact-desc">Supported with transparent GPS proof on every well</div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Links */}
        <div className="charity-actions-section">
          <div className="charity-button-group">
            <a
              href="https://www.charitywater.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="charity-btn donate-btn"
            >
              <Heart size={18} fill="#231f20" />
              <span>Donate to charity: water</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>

            <a
              href="https://www.charitywater.org/the-spring"
              target="_blank"
              rel="noopener noreferrer"
              className="charity-btn spring-btn"
            >
              <Droplets size={18} />
              <span>Join The Spring (Monthly Giving)</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>

          <div className="charity-quick-links">
            <a
              href="https://www.charitywater.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
            >
              <span>Official Website</span>
              <ExternalLink size={13} />
            </a>
            <span className="dot-divider">•</span>
            <a
              href="https://www.charitywater.org/our-work"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
            >
              <span>Our Work & Mission</span>
              <ExternalLink size={13} />
            </a>
            <span className="dot-divider">•</span>
            <a
              href="https://www.charitywater.org/our-work/where-we-work"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
            >
              <span>Where We Work</span>
              <ExternalLink size={13} />
            </a>
            <span className="dot-divider">•</span>
            <a
              href="https://www.charitywater.org/global-water-crisis"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
            >
              <span>The Water Crisis</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div className="charity-footer-legal">
          <span>
            Drop It in the Bucket is an educational game celebrating the mission of charity: water.
            Visit <a href="https://www.charitywater.org" target="_blank" rel="noopener noreferrer">charitywater.org</a> to learn more or support life-saving projects.
          </span>
        </div>
      </div>
    </footer>
  );
};
