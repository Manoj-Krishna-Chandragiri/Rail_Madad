import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

// Types for animation phases
type AnimationPhase = 'incident' | 'processing' | 'routing' | 'resolution';



// Enhanced Phase Indicator
const PhaseIndicator: React.FC<{ phase: AnimationPhase }> = ({ phase }) => {
  const getPhaseInfo = (currentPhase: AnimationPhase) => {
    switch (currentPhase) {
      case 'incident':
        return { 
          color: 'bg-red-500', 
          text: 'Complaint Detected', 
          description: 'Passenger files complaint from Vande Bharat Express',
          icon: '🚨',
          gradient: 'from-red-500 to-red-600'
        };
      case 'processing':
        return { 
          color: 'bg-purple-500', 
          text: 'AI Processing', 
          description: 'Advanced AI categorizes and prioritizes complaint',
          icon: '🤖',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'routing':
        return { 
          color: 'bg-blue-500', 
          text: 'Smart Routing', 
          description: 'Directing to appropriate railway departments',
          icon: '🔄',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'resolution':
        return { 
          color: 'bg-green-500', 
          text: 'Resolution Complete', 
          description: 'Issue resolved by railway experts',
          icon: '✅',
          gradient: 'from-green-500 to-green-600'
        };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  return (
    <div className="absolute top-6 right-6 text-white z-30 animate-fade-in">
      <div className="bg-black bg-opacity-70 px-6 py-4 rounded-2xl backdrop-blur-lg border border-white border-opacity-30 shadow-2xl">
        <div className="flex items-center mb-3">
          <span className="text-3xl mr-4 animate-bounce">{phaseInfo.icon}</span>
          <div>
            <div className="text-xs opacity-70 mb-1 uppercase tracking-wide">Current Phase</div>
            <div className="text-xl font-bold flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 animate-pulse ${phaseInfo.color} shadow-lg`}></div>
              {phaseInfo.text}
            </div>
          </div>
        </div>
        <div className="text-sm opacity-90 border-t border-white border-opacity-20 pt-3 max-w-xs">
          {phaseInfo.description}
        </div>
      </div>
    </div>
  );
};

// Main Pure CSS Rail Animation Component
const PureCSSRailAnimation: React.FC = () => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('incident');
  useEffect(() => {

    // Animation sequence
    const cinematicSequence = async () => {
      // Chapter 1: The Inciting Incident (0-3 seconds)
      setAnimationPhase('incident');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Chapter 2: The AI's Intervention (3-7 seconds)
      setAnimationPhase('processing');
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Chapter 3: Smart Routing and Action (7-12 seconds)
      setAnimationPhase('routing');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Chapter 4: The Resolution (12-15 seconds)
      setAnimationPhase('resolution');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Pause before next cycle
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const startSequence = () => {
      cinematicSequence();
      const interval = setInterval(cinematicSequence, 17000);
      return interval;
    };

    const timer = setTimeout(() => {
      const interval = startSequence();
      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);



  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Clean Gradient Background */}
      <div className={`absolute inset-0 transition-all duration-2000 ${
        animationPhase === 'incident' ? 'bg-gradient-to-br from-red-900 via-red-800 to-red-900' :
        animationPhase === 'processing' ? 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900' :
        animationPhase === 'routing' ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900' :
        'bg-gradient-to-br from-green-900 via-green-800 to-emerald-900'
      }`} />
      
      {/* Animated Overlay */}
      <div className={`absolute inset-0 transition-all duration-2000 ${
        animationPhase === 'incident' ? 'bg-red-900/30' :
        animationPhase === 'processing' ? 'bg-purple-900/40' :
        animationPhase === 'routing' ? 'bg-blue-900/30' : 'bg-green-900/20'
      }`} />

      {/* Simple Railway Platform */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        {/* Platform */}
        <div className="absolute bottom-16 left-0 right-0 h-8 bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg"></div>

        {/* Passengers on Platform */}
        <div className="absolute bottom-24 left-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-4 h-8 transition-all duration-1000 ${
                animationPhase === 'incident' ? 'animate-bounce' : ''
              }`}
              style={{
                left: `${i * 30}px`,
                animationDelay: `${i * 0.2}s`
              }}
            >
              {/* Simple passenger silhouette */}
              <div className="w-4 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full relative">
                {/* Head */}
                <div className="w-3 h-3 bg-yellow-300 rounded-full absolute -top-1 left-0.5"></div>
                {/* Complaint indicator */}
                {animationPhase === 'incident' && i % 3 === 0 && (
                  <div className="absolute -top-6 -right-1 w-6 h-4 bg-red-500 rounded animate-pulse">
                    <div className="text-white text-xs text-center">!</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Large Moving Indian Railways Train - Properly Connected */}
      <div className={`absolute z-20 transition-all duration-6000 ease-in-out transform ${
        animationPhase === 'incident' ? 'translate-x-0' :
        animationPhase === 'processing' ? 'translate-x-32' :
        animationPhase === 'routing' ? 'translate-x-64' : 'translate-x-96'
      }`} style={{ left: '10%', bottom: '80px' }}>
        <div className="relative flex items-end">
          {/* WAP-7 Electric Locomotive - Large Size */}
          <div className="w-40 h-32 bg-gradient-to-b from-orange-500 via-red-600 to-red-700 shadow-2xl relative rounded-l-xl">
            {/* Engine Front Nose */}
            <div className="absolute top-3 left-0 w-full h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-tl-xl"></div>

            {/* Driver Cabin Windows */}
            <div className="absolute top-10 left-2 w-5 h-6 bg-gradient-to-b from-blue-100 to-blue-300 border border-gray-500"></div>
            <div className="absolute top-10 right-2 w-5 h-6 bg-gradient-to-b from-blue-100 to-blue-300 border border-gray-500"></div>

            {/* Large Front Headlight */}
            <div className="absolute top-18 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-yellow-200 rounded-full border-2 border-yellow-600 animate-pulse shadow-lg"></div>

            {/* Engine Number Plate */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold bg-black px-2 py-1 rounded">
              22620
            </div>

            {/* Pantograph Assembly */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-1 h-5 bg-gray-700"></div>
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-700"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600"></div>

            {/* Engine Side Grilles */}
            <div className="absolute top-12 left-3 right-3 h-8 bg-gradient-to-r from-gray-600 to-gray-700 opacity-80 rounded">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute w-1 h-full bg-gray-900" style={{ left: `${i * 8}%` }}></div>
              ))}
            </div>

            {/* Engine Wheels - Large locomotive wheels */}
            <div className="absolute -bottom-4 left-3 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
            <div className="absolute -bottom-4 left-12 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
            <div className="absolute -bottom-4 right-12 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
            <div className="absolute -bottom-4 right-3 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>

            {/* Engine-Coach Coupling */}
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-6 bg-gray-800 rounded-r"></div>
          </div>

          {/* Indian Railways Passenger Coaches - Large Size, Properly Connected */}
          {Array.from({ length: 4 }).map((_, coachIndex) => (
            <div key={coachIndex} className="relative">
              {/* Coach Body - Large Authentic Blue */}
              <div className="w-64 h-32 bg-gradient-to-b from-blue-400 via-blue-600 to-blue-700 shadow-xl relative">

                {/* White Roof */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-100 to-white"></div>

                {/* Blue and White Stripe Pattern */}
                <div className="absolute top-3 left-0 right-0 h-2 bg-white"></div>
                <div className="absolute top-5 left-0 right-0 h-1 bg-blue-800"></div>

                {/* Coach Windows - Large and properly spaced */}
                {Array.from({ length: 8 }).map((_, windowIndex) => (
                  <div
                    key={windowIndex}
                    className="absolute w-6 h-8 bg-gradient-to-b from-sky-50 to-sky-200 border border-gray-400"
                    style={{
                      left: `${6 + windowIndex * 30}px`,
                      top: '8px'
                    }}
                  >
                    {/* Window Frame */}
                    <div className="absolute inset-1 border border-gray-300"></div>

                    {/* Passenger silhouettes */}
                    {windowIndex % 2 === 0 && (
                      <div className="w-3 h-3 bg-yellow-700 rounded-full absolute bottom-1 left-1.5"></div>
                    )}
                  </div>
                ))}

                {/* Coach Door */}
                <div className="absolute right-2 top-8 w-6 h-20 bg-gradient-to-b from-gray-500 to-gray-700 border border-gray-600 rounded">
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-yellow-400 rounded"></div>
                </div>

                {/* Coach Number */}
                <div className="absolute bottom-2 left-2 text-white text-sm font-bold">
                  {`${22621 + coachIndex}`}
                </div>

                {/* Coach Class */}
                <div className="absolute bottom-2 right-2 text-white text-sm font-bold bg-black bg-opacity-60 px-2 py-1 rounded">
                  {coachIndex === 0 ? 'SL' : coachIndex === 1 ? 'AC' : coachIndex === 2 ? 'GEN' : '2S'}
                </div>

                {/* Ventilation Grilles */}
                <div className="absolute bottom-8 left-8 right-8 h-3 bg-gradient-to-r from-gray-400 to-gray-600 opacity-60 rounded">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="absolute w-0.5 h-full bg-gray-800" style={{ left: `${i * 3.3}%` }}></div>
                  ))}
                </div>
              </div>

              {/* Coach Wheels - Large and animated */}
              <div className="absolute -bottom-4 left-8 w-7 h-7 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 right-8 w-7 h-7 bg-gray-900 rounded-full border-2 border-gray-700 shadow-lg animate-spin" style={{ animationDuration: '2s' }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>

              {/* Inter-coach Coupling */}
              {coachIndex < 3 && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-gray-800 rounded"></div>
              )}
            </div>
          ))}

          {/* Complaint Emission from Coach */}
          {animationPhase === 'incident' && (
            <div className="absolute top-0 left-80 z-30">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    top: `${-12 - i * 8}px`,
                    left: `${i * 4}px`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
              <div className="absolute -top-16 left-0 bg-red-500 text-white px-3 py-2 rounded-lg text-sm animate-bounce z-40">
                Complaint from Coach!
              </div>
            </div>
          )}

          {/* Processing Effect */}
          {animationPhase === 'processing' && (
            <div className="absolute inset-0 bg-purple-400 bg-opacity-20 animate-pulse shadow-xl shadow-purple-400/40 z-10 rounded-xl">
              <div className="absolute inset-0 border-2 border-purple-400 animate-ping rounded-xl"></div>
            </div>
          )}

          {/* Train Movement Steam/Smoke Effect */}
          <div className="absolute -bottom-8 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Railway Tracks */}
      <div className="absolute bottom-12 left-0 right-0 z-10">
        {/* Main Tracks */}
        <div className="h-2 bg-gradient-to-r from-gray-600 to-gray-800 mb-1"></div>
        <div className="h-2 bg-gradient-to-r from-gray-600 to-gray-800"></div>

        {/* Railway Sleepers */}
        <div className="absolute -top-1 left-0 right-0 flex">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-4 bg-gradient-to-b from-amber-700 to-amber-900 mx-2"
              style={{ transform: 'perspective(100px) rotateX(45deg)' }}
            ></div>
          ))}
        </div>
      </div>

      {/* Simple AI Processing Hub */}
      <div className={`absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-2000 ${
        animationPhase === 'processing' ? 'scale-125 opacity-100' : 'scale-100 opacity-80'
      }`}>
        <div className="relative">
          {/* AI Hub Core */}
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-2xl relative overflow-hidden">
            {/* Center AI Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold">
              🤖
            </div>

            {/* Processing Ring */}
            {animationPhase === 'processing' && (
              <div className="absolute inset-2 border-4 border-white rounded-full animate-spin border-t-transparent"></div>
            )}

            {/* Processing Glow */}
            {animationPhase === 'processing' && (
              <div className="absolute inset-0 bg-purple-400 bg-opacity-50 rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Processing Indicators */}
          {animationPhase === 'processing' && (
            <>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>
            </>
          )}

          {/* AI Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
            <div className="bg-black bg-opacity-60 px-3 py-1 rounded text-sm font-bold">
              AI Processing Hub
            </div>
          </div>
        </div>
      </div>

      {/* Railway Department Buildings */}
      <div className={`absolute right-10 top-1/4 transition-all duration-2000 ${
        animationPhase === 'routing' || animationPhase === 'resolution' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}>
        {/* Maintenance Department Building */}
        <div className={`mb-12 transform transition-all duration-1000 ${
          animationPhase === 'resolution' ? 'scale-110' : 'scale-100'
        }`}>
          <div className="w-32 h-40 bg-gradient-to-b from-orange-300 to-orange-600 rounded-lg shadow-2xl relative overflow-hidden">
            {/* Building Details */}
            <div className="absolute top-2 left-2 right-2 h-6 bg-orange-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">MAINTENANCE</span>
            </div>

            {/* Windows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-yellow-200 border border-gray-400"
                style={{
                  left: i % 2 === 0 ? '8px' : '20px',
                  top: `${16 + Math.floor(i / 2) * 8}px`
                }}
              >
                {animationPhase === 'resolution' && (
                  <div className="w-full h-full bg-green-400 animate-pulse"></div>
                )}
              </div>
            ))}

            {/* Department Icon */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-3xl">🔧</div>

            {/* Workers */}
            <div className="absolute bottom-2 left-2 w-3 h-6 bg-blue-600 rounded-t-full"></div>
            <div className="absolute bottom-2 right-2 w-3 h-6 bg-red-600 rounded-t-full"></div>

            {/* Success Effect */}
            {animationPhase === 'resolution' && (
              <div className="absolute inset-0 bg-green-400 bg-opacity-40 animate-pulse rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl animate-bounce">✅</div>
              </div>
            )}
          </div>
          <div className="text-white text-center mt-2 text-sm font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">
            Track Maintenance
          </div>
        </div>

        {/* Customer Support Department */}
        <div className={`mb-12 transform transition-all duration-1000 ${
          animationPhase === 'resolution' ? 'scale-110' : 'scale-100'
        }`}>
          <div className="w-32 h-40 bg-gradient-to-b from-blue-300 to-blue-600 rounded-lg shadow-2xl relative overflow-hidden">
            {/* Building Details */}
            <div className="absolute top-2 left-2 right-2 h-6 bg-blue-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">SUPPORT</span>
            </div>

            {/* Windows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-yellow-200 border border-gray-400"
                style={{
                  left: i % 2 === 0 ? '8px' : '20px',
                  top: `${16 + Math.floor(i / 2) * 8}px`
                }}
              >
                {animationPhase === 'resolution' && (
                  <div className="w-full h-full bg-green-400 animate-pulse"></div>
                )}
              </div>
            ))}

            {/* Department Icon */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-3xl">👥</div>

            {/* Support Staff */}
            <div className="absolute bottom-2 left-2 w-3 h-6 bg-purple-600 rounded-t-full"></div>
            <div className="absolute bottom-2 right-2 w-3 h-6 bg-pink-600 rounded-t-full"></div>

            {/* Success Effect */}
            {animationPhase === 'resolution' && (
              <div className="absolute inset-0 bg-green-400 bg-opacity-40 animate-pulse rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl animate-bounce">✅</div>
              </div>
            )}
          </div>
          <div className="text-white text-center mt-2 text-sm font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">
            Customer Support
          </div>
        </div>

        {/* Feedback Management */}
        <div className={`transform transition-all duration-1000 ${
          animationPhase === 'resolution' ? 'scale-110' : 'scale-100'
        }`}>
          <div className="w-32 h-40 bg-gradient-to-b from-green-300 to-green-600 rounded-lg shadow-2xl relative overflow-hidden">
            {/* Building Details */}
            <div className="absolute top-2 left-2 right-2 h-6 bg-green-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">FEEDBACK</span>
            </div>

            {/* Windows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-yellow-200 border border-gray-400"
                style={{
                  left: i % 2 === 0 ? '8px' : '20px',
                  top: `${16 + Math.floor(i / 2) * 8}px`
                }}
              >
                {animationPhase === 'resolution' && (
                  <div className="w-full h-full bg-green-400 animate-pulse"></div>
                )}
              </div>
            ))}

            {/* Department Icon */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-3xl">📝</div>

            {/* Feedback Staff */}
            <div className="absolute bottom-2 left-2 w-3 h-6 bg-yellow-600 rounded-t-full"></div>
            <div className="absolute bottom-2 right-2 w-3 h-6 bg-orange-600 rounded-t-full"></div>

            {/* Success Effect */}
            {animationPhase === 'resolution' && (
              <div className="absolute inset-0 bg-green-400 bg-opacity-40 animate-pulse rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl animate-bounce">✅</div>
              </div>
            )}
          </div>
          <div className="text-white text-center mt-2 text-sm font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">
            Feedback Analysis
          </div>
        </div>
      </div>

      {/* Enhanced Data Flow Trails */}
      {(animationPhase === 'routing' || animationPhase === 'resolution') && (
        <>
          {/* Trail to Maintenance Department */}
          <div className="absolute right-80 top-32 w-80 h-2 transform rotate-12 z-25">
            <div className="relative w-full h-full bg-gradient-to-r from-purple-500 via-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg">
              {/* Moving Data Packets */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-6 bg-orange-400 rounded-full animate-ping shadow-lg"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '-8px',
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                >
                  <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-50"></div>
                </div>
              ))}
              {/* Data Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                MAINTENANCE DATA
              </div>
            </div>
          </div>

          {/* Trail to Support Department */}
          <div className="absolute right-80 top-48 w-80 h-2 z-25">
            <div className="relative w-full h-full bg-gradient-to-r from-purple-500 via-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg">
              {/* Moving Data Packets */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-6 bg-blue-400 rounded-full animate-ping shadow-lg"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '-8px',
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                >
                  <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-50"></div>
                </div>
              ))}
              {/* Data Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                SUPPORT REQUEST
              </div>
            </div>
          </div>

          {/* Trail to Feedback Department */}
          <div className="absolute right-80 top-64 w-80 h-2 transform -rotate-12 z-25">
            <div className="relative w-full h-full bg-gradient-to-r from-purple-500 via-green-400 to-green-600 rounded-full animate-pulse shadow-lg">
              {/* Moving Data Packets */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-6 h-6 bg-green-400 rounded-full animate-ping shadow-lg"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '-8px',
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                >
                  <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-50"></div>
                </div>
              ))}
              {/* Data Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                FEEDBACK DATA
              </div>
            </div>
          </div>
        </>
      )}

      {/* Railway Control Tower */}
      <div className="absolute bottom-20 left-20 z-20">
        <div className="w-24 h-48 bg-gradient-to-b from-gray-200 to-gray-500 rounded-t-lg shadow-2xl relative">
          {/* Tower Details */}
          <div className="absolute top-2 left-2 right-2 h-4 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">CONTROL</span>
          </div>

          {/* Windows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-yellow-200 border border-gray-400"
              style={{
                left: i % 2 === 0 ? '4px' : '16px',
                top: `${20 + Math.floor(i / 2) * 8}px`
              }}
            >
              {(animationPhase === 'processing' || animationPhase === 'routing') && (
                <div className="w-full h-full bg-blue-400 animate-pulse"></div>
              )}
            </div>
          ))}

          {/* Antenna */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-600"></div>
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <div className="text-white text-center mt-2 text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">
          Signal Control
        </div>
      </div>

      {/* Railway Signals */}
      <div className="absolute bottom-32 left-1/3 z-20">
        <div className="w-4 h-16 bg-gray-600 relative">
          {/* Signal Lights */}
          <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${
            animationPhase === 'incident' ? 'bg-red-500 animate-pulse' : 'bg-red-300'
          }`}></div>
          <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${
            animationPhase === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-300'
          }`}></div>
          <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${
            animationPhase === 'resolution' ? 'bg-green-500 animate-pulse' : 'bg-green-300'
          }`}></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-float ${
              animationPhase === 'incident' ? 'bg-red-400' :
              animationPhase === 'processing' ? 'bg-purple-400' :
              animationPhase === 'routing' ? 'bg-blue-400' : 'bg-green-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced UI Overlay */}
      <div className="absolute top-6 left-6 text-white z-50">
        <div className="bg-black bg-opacity-80 px-6 py-4 rounded-xl backdrop-blur-lg border border-white border-opacity-30 shadow-2xl max-w-sm">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚄 AI-Powered Rail Madad
          </h1>
          <p className="text-sm opacity-90 mb-1 font-medium">
            Intelligent Complaint Resolution System
          </p>
          <p className="text-xs opacity-70">
            Experience the future of railway passenger assistance with advanced AI technology.
          </p>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="z-50">
        <PhaseIndicator phase={animationPhase} />
      </div>

      {/* Progress Timeline */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white z-50">
        <div className="bg-black bg-opacity-80 px-6 py-3 rounded-xl backdrop-blur-lg border border-white border-opacity-30 shadow-2xl">
          <div className="flex items-center space-x-4">
            {[
              { phase: 'incident', icon: '🚨', label: 'Incident' },
              { phase: 'processing', icon: '🤖', label: 'AI Process' },
              { phase: 'routing', icon: '🔄', label: 'Route' },
              { phase: 'resolution', icon: '✅', label: 'Resolve' }
            ].map((item, index) => (
              <div key={item.phase} className="flex items-center">
                <div className={`flex flex-col items-center transition-all duration-500 ${
                  animationPhase === item.phase ? 'scale-110' : 'scale-100'
                }`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-500 ${
                    animationPhase === item.phase
                      ? 'bg-white text-gray-900 border-white shadow-lg'
                      : 'border-white border-opacity-50 text-white'
                  }`}>
                    {item.icon}
                  </div>
                  <div className={`text-xs mt-1 font-medium transition-all duration-500 ${
                    animationPhase === item.phase ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.label}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-2 rounded-full transition-all duration-1000 ${
                    ['incident', 'processing', 'routing'].indexOf(animationPhase) > index
                      ? 'bg-gradient-to-r from-white to-gray-300'
                      : 'bg-white bg-opacity-30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-xs opacity-80 font-medium">
            🇮🇳 Transforming Indian Railways Experience with AI
          </div>
        </div>
      </div>

      {/* Railway Stats */}
      <div className="absolute bottom-6 right-6 text-white z-50">
        <div className="bg-black bg-opacity-80 px-4 py-3 rounded-xl backdrop-blur-lg border border-white border-opacity-30 shadow-2xl">
          <div className="text-xs opacity-70 mb-2 uppercase tracking-wide text-center">System Performance</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gradient-to-b from-green-500/20 to-green-600/20 p-2 rounded">
              <div className="text-lg font-bold text-green-400">99.9%</div>
              <div className="text-xs opacity-70">Uptime</div>
            </div>
            <div className="bg-gradient-to-b from-blue-500/20 to-blue-600/20 p-2 rounded">
              <div className="text-lg font-bold text-blue-400">&lt;30s</div>
              <div className="text-xs opacity-70">Response</div>
            </div>
            <div className="bg-gradient-to-b from-purple-500/20 to-purple-600/20 p-2 rounded">
              <div className="text-lg font-bold text-purple-400">24/7</div>
              <div className="text-xs opacity-70">Support</div>
            </div>
            <div className="bg-gradient-to-b from-pink-500/20 to-pink-600/20 p-2 rounded">
              <div className="text-lg font-bold text-pink-400">AI</div>
              <div className="text-xs opacity-70">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Railway Tracks */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <div className="flex animate-slide-left">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 mx-4">
              <div className="h-2 w-12 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PureCSSRailAnimation;
