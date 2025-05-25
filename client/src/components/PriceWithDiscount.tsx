import { formatPrice } from "@/utils/formatPrice"

export default function PriceWithDiscount({
  price,
  discount,
}: {
  price: number
  discount: number
}) {
  return (
    <div className="flex items-center gap-2">
      {discount > 0 ? (
        <>
          <span className="line-through opacity-60 font-normal text-base">
            {formatPrice(price)}
          </span>
          <span className="text-green-500">
            {formatPrice(price * (1 - discount / 100))}
          </span>
        </>
      ) : (
        <span>{formatPrice(price)}</span>
      )}
    </div>
  )
}
