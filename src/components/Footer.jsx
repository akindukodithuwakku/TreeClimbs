import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Copyright and Ownership */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">
              Tree Climb Tracker
            </h3>
            <p className="text-sm text-gray-300">
              Advanced tree climbing session tracking and analysis software.
            </p>
            <div className="text-xs text-gray-400">
              <p>© {currentYear} Akindu Kodithuwakku. All Rights Reserved.</p>
              <p className="mt-1">
                Proprietary Software - Unauthorized use prohibited.
              </p>
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">
              License & Legal
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                This software is the exclusive property of Akindu Kodithuwakku.
                Unauthorized copying, distribution, modification, or use is
                strictly prohibited and may result in legal action.
              </p>
              <div className="bg-red-900/20 border border-red-700/30 rounded p-3">
                <p className="text-red-300 text-xs font-medium">
                  ⚠️ PROPRIETARY SOFTWARE - NO LICENSE GRANTED
                </p>
                <p className="text-red-200 text-xs mt-1">
                  This software is NOT open source and requires explicit written
                  permission for any use.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">
              Contact & Support
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">👨‍💻</span>
                <span>Developer: Akindu Kodithuwakku</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🌐</span>
                <a
                  href="https://akindukodithuwakku.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  akindukodithuwakku.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">📧</span>
                <span>For licensing inquiries only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-xs text-gray-400">
              <p>
                Tree Climb Tracker v1.0 - Professional climbing session
                management system
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Built with React.js, Firebase, and Chart.js</p>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-6 p-4 bg-red-900/10 border border-red-700/20 rounded-lg">
          <p className="text-xs text-red-300 text-center">
            <strong>LEGAL NOTICE:</strong> This software contains confidential
            and proprietary information. Any unauthorized use, reproduction, or
            distribution constitutes copyright infringement and may result in
            severe legal consequences including monetary damages and injunctive
            relief.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
