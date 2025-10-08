import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 8v8" />
      <path d="M16 8v8" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
      <path d="M12 8v0" />
      <path d="M9 16h6" />
      <path d="M15 16h-6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h6" />
    </svg>
  ),
};
