
export default function DiscountBadge({ discount, size }: {discount: number, size: string}) {
  if (discount <= 0) return null;

  /**
   en caso que quieras meter el precio original
   var newPrice = ((100 * price) / (100 - discount)) 
      <span className="text-black/50 text-sm line-through font-Manrope">
        $ {newPrice}
      </span> 
  */

  return (
    <>
      {size === 'big' ? (
        <div className="flex gap-1">
          <span className="w-fit h-6 px-3 bg-primary-dark text-md flex items-center text-white font-Outfit font-light  text-shadow-none">
            {discount}% OFF
          </span>
        </div>
      ): size === 'mini' && (
        <div className="flex gap-1 items-center justify-self-end">
        <span className="w-fit px-2 h-5 bg-primary-dark text-xs text-white font-Outfit font-light">
          {discount}% OFF
        </span>
      </div>
      )
      }
    </>
  );
}