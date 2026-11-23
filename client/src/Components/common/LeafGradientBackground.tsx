import { LeafBg } from "../../assets/icons";

type LeafGradientBackgroundProps = {
  className?: string;
};

const leaves = [
  "-left-7 -top-9 rotate-[36deg]",
  "left-[32%] -top-8 rotate-[78deg]",
  "-right-8 top-0 rotate-[160deg]",
  "left-[3%] top-[52%] rotate-[18deg]",
  "right-[13%] bottom-[3%] rotate-[165deg]",
];

export default function LeafGradientBackground({
  className = "absolute inset-x-0 top-0 h-64",
}: LeafGradientBackgroundProps) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#A8C09A_0%,#A8C09A_40%,#F5F1E8_100%)]" />
      {leaves.map((position) => (
        <LeafBg
          key={position}
          className={`absolute h-24 w-24 text-[#F5F1E8] opacity-70 sm:h-32 sm:w-32 ${position}`}
        />
      ))}
    </div>
  );
}
