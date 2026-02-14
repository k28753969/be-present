
import React from 'react';

const IntroPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glowing Orb */}
      <div className="absolute w-48 h-48 bg-gradient-to-br from-blue-400/40 via-indigo-500/20 to-transparent rounded-full blur-[40px] animate-pulse-orb" />
      <div className="absolute w-24 h-24 bg-white/10 rounded-full blur-[20px] animate-pulse-orb" style={{ animationDelay: '0.5s' }} />
      
      {/* Intro Text */}
      <div className="z-10">
        <h1 className="text-xl md:text-2xl font-light text-blue-50/90 animate-tracking-expand text-center whitespace-nowrap">
          현존의식 Activated!!
        </h1>
      </div>

      {/* Subtle particle effect using plain CSS circles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/20 rounded-full blur-[1px] animate-pulse"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroPage;
