import {
  Promo,
  Fuego,
  BestSeller,
  New,
  CameBack,
  IdealGift,
  OurSelection,
  LimitedEdition,
} from "../../assets/icons";
import { productLabels } from "../../utils/productLabels";
export default function LabelBadge({ label }: { label: string }) {
  const selected = productLabels.find((option) => option.value === label);
  if (!selected) return null;

  return (
    <div className="w-full z-10">
      <div
        className={`flex w-fit max-w-full min-h-5 px-2 items-center gap-1 rounded-r-sm text-white ${selected.color}`}>
        {(label === "promo" || label === "oferta") && (
          <Promo className="h-3 w-3 shrink-0" />
        )}
        {label === "top" && <BestSeller className="h-3 w-3 shrink-0" />}
        {label === "ultimo" && <Fuego className="h-3 w-3 shrink-0" />}
        {label === "nuevo" && <New className="h-3 w-3 shrink-0" />}
        {label === "volvio" && <CameBack className="h-3 w-3 shrink-0" />}
        {label === "regalo" && <IdealGift className="h-3 w-3 shrink-0" />}
        {label === "elegido" && <OurSelection className="h-3 w-3 shrink-0" />}
        {label === "limitada" && (
          <LimitedEdition className="h-3 w-3 shrink-0" />
        )}
        <span className="text-white text-[.7rem] font-Manrope font-light">
          {selected.label}
        </span>
      </div>
    </div>
  );
}
