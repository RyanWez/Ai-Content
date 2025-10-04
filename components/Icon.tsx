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
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth={1.5}
         stroke="currentColor"
         className={`text-slate-400 hover:text-slate-300 ${className}`}
         {...props}
       >
         <path
           strokeLinecap="round"
           strokeLinejoin="round"
           d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.043m-7.332 0c-.055.194-.084.4-.084.612v3.043m0 0l-.114.114a2.25 2.25 0 00-3.182 3.182l2.69 2.69a2.25 2.25 0 003.182 0l2.69-2.69a2.25 2.25 0 000-3.182l-.114-.114m-7.332 0l7.332 0"
         />
       </svg>
     ),
    clear: (
       <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth={1.5}
         stroke="currentColor"
         className={`text-slate-400 hover:text-slate-300 ${className}`}
         {...props}
       >
         <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.182m-3.182-4.991v-4.992" />
       </svg>
     ),
     generate: (
        <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth={1.5}
         stroke="currentColor"
         className={`text-slate-400 ${className}`}
         {...props}
       >
         <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.25l-.648-1.688a4.5 4.5 0 01-3.086-3.086L10.75 18l1.688-.648a4.5 4.5 0 013.086 3.086z" />
       </svg>
     ),
  };
  return icons[name] || null;
};

export default Icon;
