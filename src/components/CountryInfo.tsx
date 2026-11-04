import React from 'react';
import { Country } from '../types';

interface CountryInfoProps {
  country: Country;
}

export const CountryInfo: React.FC<CountryInfoProps> = ({ country }) => {
  return (
    <div className="country-info">
      <strong id="country-label">{country.name}</strong>
      <span id="country-description">{country.description}</span>
    </div>
  );
};
