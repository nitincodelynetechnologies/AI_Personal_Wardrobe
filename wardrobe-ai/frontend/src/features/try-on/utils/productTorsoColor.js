const TORSO_PALETTE = ['#e91e8c', '#7c3aed', '#38bdf8', '#34d399', '#f59e0b', '#f472b6'];

export function getProductTorsoColor(product) {
  if (!product?.id) return TORSO_PALETTE[0];
  const hash = String(product.id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TORSO_PALETTE[hash % TORSO_PALETTE.length];
}
