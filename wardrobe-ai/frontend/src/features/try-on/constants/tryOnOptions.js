export const TRY_ON_DUMMY_MALE =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80';

export const TRY_ON_DUMMY_FEMALE =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80';

export const TRY_ON_STATUS_MESSAGES = [
  'Mapping fabric to Dummy...',
  'Rendering...',
];

export const TRY_ON_STATUS_INTERVAL_MS = 2500;

export const TRY_ON_IMAGE_SIZES = '(max-width: 768px) 45vw, 320px';

/** Women → female dummy; Men and all other categories → male (default). */
export function getTryOnGender(category) {
  return category === 'Women' ? 'female' : 'male';
}

export function getTryOnDummyImage(category) {
  return getTryOnGender(category) === 'female' ? TRY_ON_DUMMY_FEMALE : TRY_ON_DUMMY_MALE;
}

/** Pre-mapped VTON render URL paired with each catalog product. */
export function getProductAiRenderImage(product) {
  return product?.ai_render_image ?? product?.aiRenderImage ?? product?.image_url ?? '';
}
