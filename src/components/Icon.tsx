import React from 'react';

type IconName = 'spinner' | 'copy' | 'clear' | 'generate';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', ...props }) => {
   const icons: { [key in IconName]: React.ReactElement } = {
    spinner: (
       <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         className={`animate-spin text-slate-400 ${className}`}
         {...props}
       >
         <circle
           className="opacity-25"
           cx="12"
           cy="12"
           r="10"
           stroke="currentColor"
           strokeWidth="4"
         ></circle>
         <path
           className="opacity-75"
           fill="currentColor"
           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
         ></path>
       </svg>
     ),
    copy: (
       <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 640 640"
         fill="currentColor"
         className={`text-slate-400 hover:text-slate-300 ${className}`}
         {...props}
       >
         <path d="M480 400H288c-8.8 0-16-7.2-16-16V128c0-8.8 7.2-16 16-16h133.5c4.2 0 8.3 1.7 11.3 4.7l58.5 58.5c3 3 4.7 7.1 4.7 11.3V384c0 8.8-7.2 16-16 16m-192 48h192c35.3 0 64-28.7 64-64V186.5c0-17-6.7-33.3-18.7-45.3l-58.6-58.5c-12-12-28.2-18.7-45.2-18.7H288c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64M160 192c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-16h-48v16c0 8.8-7.2 16-16 16H160c-8.8 0-16-7.2-16-16V256c0-8.8 7.2-16 16-16h16v-48z"/>
       </svg>
     ),
    clear: (
       <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 512 512"
         fill="currentColor"
         className={`text-slate-400 hover:text-slate-300 ${className}`}
         {...props}
       >
         <path fillRule="evenodd" d="M256 42.667A213.333 213.333 0 0 1 469.334 256c0 117.821-95.513 213.334-213.334 213.334-117.82 0-213.333-95.513-213.333-213.334C42.667 138.18 138.18 42.667 256 42.667m0 42.667c-94.256 0-170.666 76.41-170.666 170.666 0 94.257 76.41 170.667 170.666 170.667 94.257 0 170.667-76.41 170.667-170.667 0-94.256-76.41-170.666-170.667-170.666m75.425 65.072 30.17 30.17L286.169 256l75.426 75.425-30.17 30.17L256 286.169l-75.424 75.426-30.17-30.17L225.83 256l-75.424-75.424 30.17-30.17L256 225.83z"/>
       </svg>
     ),
     generate: (
        <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 32 32"
         fill="currentColor"
         className={`text-slate-400 ${className}`}
         {...props}
       >
         <path d="M18 11a1 1 0 0 1-1 1 5 5 0 0 0-5 5 1 1 0 0 1-2 0 5 5 0 0 0-5-5 1 1 0 0 1 0-2 5 5 0 0 0 5-5 1 1 0 0 1 2 0 5 5 0 0 0 5 5 1 1 0 0 1 1 1m1 13a1 1 0 0 1-1 1 2 2 0 0 0-2 2 1 1 0 0 1-2 0 2 2 0 0 0-2-2 1 1 0 0 1 0-2 2 2 0 0 0 2-2 1 1 0 0 1 2 0 2 2 0 0 0 2 2 1 1 0 0 1 1 1m9-7a1 1 0 0 1-1 1 4 4 0 0 0-4 4 1 1 0 0 1-2 0 4 4 0 0 0-4-4 1 1 0 0 1 0-2 4 4 0 0 0 4-4 1 1 0 0 1 2 0 4 4 0 0 0 4 4 1 1 0 0 1 1 1"/>
       </svg>
     ),
  };
  return icons[name] || null;
};

export default Icon;
