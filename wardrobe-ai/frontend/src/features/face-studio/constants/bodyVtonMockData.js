/** Virtual Try-On Studio — timing + overlay constants */



export const VTON_GENERATION_DURATION_MS = 4000;



export const WARDROBE_IMAGE_FALLBACK =

  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80&auto=format&fit=crop';



/** Approximate vertical offset (px) for compact card thumbnails */

export const GARMENT_OVERLAY_OFFSET = {

  top: -100,

  bottom: 150,

  shoes: 350,

};



/**

 * Body-zone placement for dev mock preview (percent of preview frame).

 * Garment is clipped to an ellipse so flat product photos don't ghost outside the body.

 */

export const GARMENT_PREVIEW_ZONES = {

  top: {

    top: '11%',

    left: '50%',

    width: '40%',

    height: '30%',

    clipPath: 'ellipse(50% 46% at 50% 48%)',

  },

  bottom: {

    top: '44%',

    left: '50%',

    width: '46%',

    height: '36%',

    clipPath: 'ellipse(48% 44% at 50% 50%)',

  },

  shoes: {

    bottom: '5%',

    left: '50%',

    width: '38%',

    height: '13%',

    clipPath: 'ellipse(52% 48% at 50% 50%)',

  },

};

