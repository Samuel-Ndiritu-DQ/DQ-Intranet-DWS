import React, { useEffect, useState } from "react";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

const DiscoverDQ: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to March 17, 2026 at midnight UTC
    const targetDate = new Date('2026-03-17T00:00:00Z').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // If the target date has passed, show zeros
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Update immediately when component mounts
    updateCountdown();
    
    // Then update every second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col">
        {/* Coming Soon Section */}
        <div 
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f1629 0%, #162862 50%, #1e3a8a 100%)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }} />
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto min-h-screen flex flex-col justify-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                Discover DQ
              </h1>
              <p className="text-lg md:text-xl text-gray-300 font-medium tracking-wider uppercase">
                EXPLORE THE DIGITALQATALYST ECOSYSTEM
              </p>
            </div>

            {/* Coming Soon Title */}
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Coming <span style={{ color: '#FB5535' }}>Soon</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                We're building an extraordinary discovery experience. <span style={{ color: '#FB5535' }}>Discover DQ</span> will showcase 
                our ecosystem, partnerships, and the digital transformation journey that powers innovation across the region.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="mb-12">
              <div className="flex justify-center gap-4 md:gap-8 mb-8">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px] border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                    DAYS
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px] border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                    HOURS
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px] border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                    MINUTES
                  </div>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 min-w-[80px] md:min-w-[100px] border border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                    SECONDS
                  </div>
                </div>
              </div>
              
              {/* Debug info to verify countdown is working */}
              <div className="text-xs text-gray-500 text-center">
                Countdown to March 17, 2026: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </div>
            </div>

            {/* Features Preview */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Ecosystem Map</h3>
                  <p className="text-gray-400 text-sm">Interactive visualization of our global partnerships and client engagements</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M9 11H15M9 15H15M17 21L12 16L7 21V5C7 4.46957 7.21071 3.96086 7.58579 3.58579C7.96086 3.21071 8.46957 3 9 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Success Stories</h3>
                  <p className="text-gray-400 text-sm">Real transformation journeys and measurable impact across industries</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Team Directory</h3>
                  <p className="text-gray-400 text-sm">Meet the experts and leaders driving digital transformation</p>
                </div>
              </div>
            </div>

            {/* Stay Tuned */}
            <div className="mb-16">
              <p className="text-gray-400 uppercase tracking-wider text-sm font-medium">
                STAY TUNED
              </p>
            </div>
          </div>

          {/* Footer Text - Fixed Position */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              POWERED BY DIGITAL QATALYST
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DiscoverDQ;