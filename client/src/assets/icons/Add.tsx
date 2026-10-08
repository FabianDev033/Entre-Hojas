import type { SVGProps } from "react";

export default function Add(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <line
        x1="15.4502"
        y1="30"
        x2="15.4502"
        stroke="currentColor"
        stroke-width="5"
      />
      <line
        y1="16.0508"
        x2="30"
        y2="16.0508"
        stroke="currentColor"
        stroke-width="5"
      />
    </svg>
  );
}
