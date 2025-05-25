export const formatPrice = (price: number) => {
  if (price === 0) return "Бесплатно"
  const truncated = Math.floor(price * 100) / 100

  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(truncated)
      .replace(/,/g, " ")
      .replace(/\./g, ",") + " ₽"
  )
}
