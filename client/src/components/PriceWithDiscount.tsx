import { formatPrice } from "@/utils/formatPrice"

export default function PriceWithDiscount({
  price,
  discount,
}: {
  price: number
  discount: number
}) {
  const priceWithDiscount = price * (1 - discount / 100)
  return (
    <div className="flex items-center gap-2">
      {priceWithDiscount != price ? (
        <>
          <span className="line-through opacity-60 font-normal text-base">
            {formatPrice(price)}
          </span>
          <span className="text-green-500">
            {formatPrice(priceWithDiscount)}
          </span>
        </>
      ) : (
        <span>{formatPrice(price)}</span>
      )}
    </div>
  )
}
