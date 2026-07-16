
export default function DiscountBadge({ discount}: {discount: number}) {
  if (discount <= 0) return null;

  /**
   en caso que quieras meter el precio original
   var newPrice = ((100 * price) / (100 - discount)) 
      <span className="text-black/50 text-sm line-through font-Manrope">
        $ {newPrice}
      </span> 
  */

  return (
    <div className="flex gap-1">
      <span className="w-fit px-1.5 py-1 bg-primary-dark text-sm leading-none text-white font-Outfit font-light rounded-xs text-shadow-none">
        {discount}% OFF
      </span>
    </div>
  );
}