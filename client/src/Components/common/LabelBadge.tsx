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

const ICON_SIZE = "h-3 w-3 shrink-0";

export default function LabelBadge({ label }: { label: string }) {
  const selected = productLabels.find((option) => option.value === label);

  if (!selected) return null;

  return (
    <div className="w-full z-10">
      <div
        className={`flex w-fit max-w-full py-1 px-2 mb-auto items-center gap-1 rounded-r-sm text-white ${selected.color}`}>
        {(label === "promo" || label === "oferta") && (
          <Promo className={ICON_SIZE} />
        )}
        {label === "top" && <BestSeller className={ICON_SIZE} />}
        {label === "ultimo" && <Fuego className={ICON_SIZE} />}
        {label === "nuevo" && <New className={ICON_SIZE} />}
        {label === "volvio" && <CameBack className={ICON_SIZE} />}
        {label === "regalo" && <IdealGift className={ICON_SIZE} />}
        {label === "elegido" && <OurSelection className={ICON_SIZE} />}
        {label === "limitada" && <LimitedEdition className={ICON_SIZE} />}

        <span className="text-white text-xs font-Manrope font-light">
          {selected.label}
        </span>
      </div>
    </div>
  );
}
