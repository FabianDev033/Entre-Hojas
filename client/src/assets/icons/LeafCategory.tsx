import type { SVGProps } from "react";

export default function LeafCategory(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="39"
      height="39"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.5 5.5C17 6 8.2 9.4 7 17.4c-.6 4.1 2.2 7.2 6.1 7.1C22.1 24.3 26.2 14.8 26.5 5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 27 21 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
