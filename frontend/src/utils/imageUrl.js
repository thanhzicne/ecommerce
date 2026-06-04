const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL;

export function resolveImageUrl(imageUrl) {
  if (!imageUrl || !ASSET_BASE_URL) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl);
    const assetBase = new URL(ASSET_BASE_URL);

    if (url.hostname === 'simple-ecommerce-phamducthanh.s3.ap-southeast-2.amazonaws.com') {
      url.protocol = assetBase.protocol;
      url.hostname = assetBase.hostname;
      url.port = assetBase.port;
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
}
