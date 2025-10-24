
import React from 'react';
import { BaseLogoIcon, WalletIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BaseLogoIcon className="h-8 w-8 text-base-blue" />
          <h1 className="text-2xl font-bold text-dark-text">
            Base<span className="font-semibold text-base-blue">Fam</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-base-blue text-white font-semibold px-3 py-2 md:px-4 rounded-lg hover:bg-base-blue-dark transition-colors duration-300">
            <WalletIcon className="h-5 w-5" />
            <span className="hidden sm:inline">0x123...AbCd</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
