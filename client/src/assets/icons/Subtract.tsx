import type { SVGProps } from "react";

export default function Substract(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="30"
      height="5"
      viewBox="0 0 30 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <line y1="2.5" x2="30" y2="2.5" stroke="currentColor" stroke-width="5" />
    </svg>
  );
}
