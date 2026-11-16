import React from 'react';
import { Heart, Shield, Globe, ExternalLink, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050810] border-t border-slate-800/80 text-slate-400 text-xs mt-24 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-48 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Vision */}
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Heart className="w-4 h-4 fill-emerald-500/30" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                BUY<span className="text-emerald-400">4</span>A<span className="text-amber-400">CHANGE</span>
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-md text-xs font-normal">
              A transformative commerce initiative anchored in the vision of the <strong>Universal Guard Trust (UGT)</strong>. 
              Every product you purchase directly funds clean drinking water, women's entrepreneurship, youth AI education, and ecological restoration across Indian PIN codes.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-emerald-400 font-semibold text-xs">
              <a
                href="https://ugtindia.space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center space-x-1"
              >
                <span>ugtindia.space</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-700">•</span>
              <a
                href="https://ugtglobal.space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center space-x-1"
              >
                <span>ugtglobal.space</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* UGT India 8 National Missions */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              UGT 8 National Missions
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>Everyday Essentials</li>
              <li>Women Entrepreneurship</li>
              <li>AI Free Training</li>
              <li>Water Security</li>
              <li>Protect the Earth</li>
              <li>Hill and City</li>
              <li>Sports Ecosystem</li>
              <li>Living Culture</li>
            </ul>
          </div>

          {/* Pillars of Integrity */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Pillars of Integrity
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct Cause Allocation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>100% Verified Community Audits</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>PIN-Code Localized Hubs</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Guardian Impact Certificates</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights & Manifesto */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            © 2026 Buy4AChange • Universal Guard Trust (UGT). All rights reserved.
          </div>
          <div className="text-emerald-400/90 font-medium tracking-wide">
            "Every purchase builds our town, our people, and our earth."
          </div>
        </div>

      </div>
    </footer>
  );
};
