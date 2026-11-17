import type { SVGProps } from "react";

export default function MiniAdd(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20L10 -1.90735e-06" stroke-width="2" stroke="currentColor" />
      <path d="M0 10H20" stroke-width="2" stroke="currentColor" />
    </svg>
  );
}
