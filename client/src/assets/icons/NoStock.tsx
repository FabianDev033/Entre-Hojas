import type { SVGProps } from "react";

export default function NoStock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="65"
      height="65"
      viewBox="0 0 65 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M30 0L65 35V65L0 0H30Z" fill="#975C44" />
    </svg>
  );
}
