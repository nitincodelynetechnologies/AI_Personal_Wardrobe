export function toCommerceProduct(product) {
  if (!product?.id) return null;

  return {
    id: String(product.id),
    name: product.name ?? 'Untitled',
    brand: product.brand ?? '',
    price: Number(product.price) || 0,
    image_url: product.image_url ?? '',
  };
}
