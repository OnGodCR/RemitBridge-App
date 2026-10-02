import { AlphaType, ColorType, Skia, ImageFormat } from '@shopify/react-native-skia';
import { requireOptionalNativeModule } from 'expo';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import {
  boxesInside,
  fromMlKit,
  grayFromRgba,
  sharpness,
  textBlur,
  type Box,
  type MlKitResult,
  type OcrPage,
  type Sharpness,
} from '@remitbridge/receipt';

/**
 * The phone's half of reading a receipt (DECISIONS.md D73, D74): prepare the photo, run OCR
 * on it, and draw the redaction onto it. Nothing here touches the network; the redacted
 * photo and text leave the phone only through lib/receipts.ts, after the person has seen
 * the preview.
 */

/** Photos are cut down to this on the long side: enough to read, small to send. */
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

type Rect = { left: number; top: number; right: number; bottom: number };
type MlKitText = {
  blocks: { lines: { text: string; frame: Rect; elements: { text: string; frame: Rect }[] }[] }[];
};

/**
 * ML Kit text recognition (@infinitered/react-native-mlkit-text-recognition). Looked up
 * optionally: Expo Go doesn't have it, and the package's own import would throw there.
 */
const MlKit = requireOptionalNativeModule<{ recognizeText(path: string): Promise<MlKitText> }>('RNMLKitTextRecognition');

/** Whether this build can scan. False in Expo Go, which lacks the OCR module. */
export function canScan(): boolean {
  return MlKit !== null;
}

export interface PreparedPhoto {
  uri: string;
  width: number;
  height: number;
  base64: string;
}

/**
 * Re-encodes the photo upright, no larger than MAX_SIDE, as JPEG. That puts the pixels in
 * the orientation OCR reports boxes for, and drops the photo's metadata (EXIF, which can
 * hold the place it was taken) before anything else sees it.
 */
export async function preparePhoto(uri: string, width: number, height: number): Promise<PreparedPhoto> {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const context = ImageManipulator.manipulate(uri);
  if (scale < 1) context.resize(width >= height ? { width: Math.round(width * scale) } : { height: Math.round(height * scale) });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY, base64: true });
  if (!saved.base64) throw new Error('no image data');
  return { uri: saved.uri, width: saved.width, height: saved.height, base64: saved.base64 };
}

/** ML Kit's rectangles as the left/top/width/height frames fromMlKit reads. */
export function toMlKitResult(text: MlKitText): MlKitResult {
  const frame = (r: Rect) => ({ left: r.left, top: r.top, width: r.right - r.left, height: r.bottom - r.top });
  return {
    blocks: text.blocks.map((b) => ({
      lines: b.lines.map((l) => ({
        text: l.text,
        frame: frame(l.frame),
        elements: l.elements.map((e) => ({ text: e.text, frame: frame(e.frame) })),
      })),
    })),
  };
}

export type OcrOutcome =
  | { ok: true; page: OcrPage; sharpness: Sharpness }
  | { ok: false; reason: 'unavailable' | 'no_text' | 'misaligned' | 'blurry' };

/**
 * Reads the prepared photo's text, with a box for every word, and how sharp that text is
 * (D131): a photo too blurry to read is turned back here, before anything is covered or
 * sent, and a borderline one comes with a warning.
 */
export async function recognize(photo: PreparedPhoto): Promise<OcrOutcome> {
  if (!MlKit) return { ok: false, reason: 'unavailable' };
  const page = fromMlKit(toMlKitResult(await MlKit.recognizeText(photo.uri)), photo.width, photo.height);
  if (!page.lines.length) return { ok: false, reason: 'no_text' };
  if (!boxesInside(page)) return { ok: false, reason: 'misaligned' };
  const sharp = measureSharpness(photo, page);
  if (sharp === 'too_blurry') return { ok: false, reason: 'blurry' };
  return { ok: true, page, sharpness: sharp };
}

/** How sharp the words OCR found are, from the photo's pixels. 'unknown' if they can't be read. */
function measureSharpness(photo: PreparedPhoto, page: OcrPage): Sharpness {
  try {
    const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(photo.base64));
    if (!image) return 'unknown';
    const width = image.width();
    const height = image.height();
    const pixels = image.readPixels(0, 0, { width, height, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
    if (!(pixels instanceof Uint8Array)) return 'unknown';
    // OCR's boxes are in the prepared photo's size; the decoded image is the same file.
    return sharpness(textBlur(grayFromRgba(pixels, width, height), page));
  } catch {
    // A failed measurement never stops a scan; the server's reading is the backstop.
    return 'unknown';
  }
}

/**
 * The photo with solid black boxes painted over `boxes`, as base64 JPEG. Solid, not
 * blurred: blurred text can sometimes be read back (D74). The preview shows exactly these
 * bytes, and exactly these bytes are what's sent.
 */
export function renderRedacted(photo: PreparedPhoto, boxes: Box[]): string {
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(photo.base64));
  if (!image) throw new Error('could not decode the photo');
  const surface = Skia.Surface.Make(photo.width, photo.height);
  if (!surface) throw new Error('could not draw');
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  canvas.drawImageRect(
    image,
    Skia.XYWHRect(0, 0, image.width(), image.height()),
    Skia.XYWHRect(0, 0, photo.width, photo.height),
    paint,
  );
  const black = Skia.Paint();
  black.setColor(Skia.Color('black'));
  black.setAntiAlias(false);
  for (const b of boxes) canvas.drawRect(Skia.XYWHRect(b.x, b.y, b.width, b.height), black);
  surface.flush();
  return surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, Math.round(JPEG_QUALITY * 100));
}
