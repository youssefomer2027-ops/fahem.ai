import React from 'react';

interface FahemLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const FahemLogo: React.FC<FahemLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const titleSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const subtitleSize = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="fahem-logo-container">
      {/* Minimalist Black & White Icon: Open Book Merged with Chat Bubble */}
      <div
        className={`${iconDimensions} rounded-xl bg-black text-white flex items-center justify-center p-2 shadow-xs transition-transform hover:scale-105 duration-200`}
        title="فَهِم - Fahem"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Speech bubble outline */}
          <path
            d="M27 15.5C27 21.299 22.075 26 16 26C14.28 26 12.65 25.625 11.2 24.96L5 27L6.85 21.6C5.69 19.86 5 17.77 5 15.5C5 9.701 9.925 5 16 5C22.075 5 27 9.701 27 15.5Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Open Book pages nestled inside the bubble */}
          <path
            d="M16 11V19M16 19C14.5 17.5 12 17.5 9.5 18V12C12 11.5 14.5 11.5 16 13M16 19C17.5 17.5 20 17.5 22.5 18V12C20 11.5 17.5 11.5 16 13"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-black ${titleSize}`}>
              فَهِم
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              Fahem
            </span>
          </div>
          <span className={`text-neutral-500 font-medium ${subtitleSize}`}>
            فهم وتحليل الكتب والمناهج
          </span>
        </div>
      )}
    </div>
  );
};
