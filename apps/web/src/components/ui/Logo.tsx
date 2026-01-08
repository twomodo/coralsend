'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: 'text-xl' },
    md: { icon: 48, text: 'text-3xl' },
    lg: { icon: 64, text: 'text-5xl' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div 
        className="relative"
        style={{ width: icon, height: icon }}
      >
        {/* Logo SVG inline for animation control */}
        <svg 
          viewBox="0 0 200 200" 
          className="relative w-full h-full"
        >
          <defs>
            <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="coralGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          
          {/* Center node */}
          <circle cx="100" cy="100" r="16" fill="url(#coralGrad)" />
          
          {/* Branches with subtle animation */}
          <g className="animate-[pulse_4s_ease-in-out_infinite]">
            <path d="M 100 100 L 60 45" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="60" cy="45" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
            <path d="M 100 100 L 100 35" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="100" cy="35" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
            <path d="M 100 100 L 140 45" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="140" cy="45" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}>
            <path d="M 100 100 L 45 100" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="45" cy="100" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
            <path d="M 100 100 L 155 100" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="155" cy="100" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2.5s' }}>
            <path d="M 100 100 L 60 155" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="60" cy="155" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '3s' }}>
            <path d="M 100 100 L 100 165" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="100" cy="165" r="10" fill="url(#coralGradDark)" />
          </g>
          
          <g className="animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '3.5s' }}>
            <path d="M 100 100 L 140 155" stroke="url(#coralGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <circle cx="140" cy="155" r="10" fill="url(#coralGradDark)" />
          </g>
          
          {/* Connection mesh */}
          <path 
            d="M 60 45 L 100 35 L 140 45" 
            stroke="url(#coralGradDark)" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.3" 
            strokeLinecap="round"
          />
          <path 
            d="M 45 100 L 60 155 L 100 165 L 140 155 L 155 100" 
            stroke="url(#coralGradDark)" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.3" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          text,
          'font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent'
        )}>
          CoralSend
        </span>
      )}
    </div>
  );
}

