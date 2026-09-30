/**
 * The phone's half of a scan (lib/receipt-scan.ts), with the native parts faked: the photo
 * is cut to size and re-encoded, OCR boxes are converted and sanity-checked, and the
 * redaction paints an opaque box for every covered run before encoding.
 */
import { canScan, preparePhoto, recognize, renderRedacted, toMlKitResult } from '@/lib/receipt-scan';

const mockRecognizeText = jest.fn();
const mockDrawn: { kind: string; args: unknown[] }[] = [];

jest.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => (name === 'RNMLKitTextRecognition' ? { recognizeText: (path: string) => mockRecognizeText(path) } : null),
}));

const mockResize = jest.fn();
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: () => {
      const context = {
        resize: (size: unknown) => {
          mockResize(size);
          return context;
        },
        renderAsync: async () => ({
          saveAsync: async (opts: unknown) => ({ uri: 'file:///prepared.jpg', width: 1200, height: 1600, base64: 'UFJFUA==', opts }),
        }),
      };
      return context;
    },
  },
}));

jest.mock('@shopify/react-native-skia', () => {
  const paint = () => {
    const p = { color: null as unknown, aa: true, setColor: (c: unknown) => (p.color = c), setAntiAlias: (a: boolean) => (p.aa = a) };
    return p;
  };
  return {
    ImageFormat: { JPEG: 3 },
    Skia: {
      Data: { fromBase64: (b: string) => ({ b }) },
      Image: { MakeImageFromEncoded: () => ({ width: () => 1200, height: () => 1600 }) },
      Paint: paint,
      Color: (c: string) => `color:${c}`,
      XYWHRect: (x: number, y: number, width: number, height: number) => ({ x, y, width, height }),
      Surface: {
        Make: (w: number, h: number) => ({
          getCanvas: () => ({
            drawImageRect: (...args: unknown[]) => mockDrawn.push({ kind: 'image', args }),
            drawRect: (...args: unknown[]) => mockDrawn.push({ kind: 'rect', args }),
          }),
          flush: () => undefined,
          makeImageSnapshot: () => ({ encodeToBase64: (fmt: number, q: number) => `jpeg:${fmt}:${q}:${w}x${h}` }),
        }),
      },
    },
  };
});


const photo = { uri: 'file:///prepared.jpg', width: 1200, height: 1600, base64: 'UFJFUA==' };
const rect = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom });

beforeEach(() => {
  mockDrawn.length = 0;
  mockResize.mockClear();
  mockRecognizeText.mockReset();
});

it('can scan when the OCR module is there', () => {
  expect(canScan()).toBe(true);
});

describe('preparePhoto', () => {
  it('cuts the long side to 1600 and re-encodes as JPEG with the data', async () => {
    const p = await preparePhoto('file:///camera.jpg', 3024, 4032);
    expect(mockResize).toHaveBeenCalledWith({ height: 1600 });
    expect(p).toEqual(photo);
  });
  it('leaves a small photo its size', async () => {
    await preparePhoto('file:///small.jpg', 800, 1000);
    expect(mockResize).not.toHaveBeenCalled();
  });
});

describe('recognize', () => {
  const line = (text: string, y: number) => ({
    text,
    frame: rect(10, y, 300, y + 30),
    elements: text.split(' ').map((w, i) => ({ text: w, frame: rect(10 + i * 100, y, 100 + i * 100, y + 30) })),
  });

  it('turns ML Kit’s rectangles into words with boxes', async () => {
    mockRecognizeText.mockResolvedValue({ blocks: [{ lines: [line('Fee $4.99', 100), line('Transfer Amount $500.00', 40)] }] });
    const r = await recognize(photo);
    expect(mockRecognizeText).toHaveBeenCalledWith('file:///prepared.jpg');
    expect(r.ok && r.page.lines.map((l) => l.words.map((w) => w.text).join(' '))).toEqual(['Transfer Amount $500.00', 'Fee $4.99']);
    expect(r.ok && r.page.lines[1].words[1].box).toEqual({ x: 110, y: 100, width: 90, height: 30 });
  });

  it('says so when there’s no text', async () => {
    mockRecognizeText.mockResolvedValue({ blocks: [] });
    expect(await recognize(photo)).toEqual({ ok: false, reason: 'no_text' });
  });

  it('refuses boxes that don’t fit the photo, rather than covering the wrong places', async () => {
    mockRecognizeText.mockResolvedValue({ blocks: [{ lines: [{ text: 'x', frame: rect(1500, 0, 1590, 30), elements: [{ text: 'x', frame: rect(1500, 0, 1590, 30) }] }] }] });
    expect(await recognize(photo)).toEqual({ ok: false, reason: 'misaligned' });
  });

  it('converts frames exactly', () => {
    expect(toMlKitResult({ blocks: [{ lines: [line('A', 0)] }] }).blocks[0].lines[0].elements[0].frame).toEqual({ left: 10, top: 0, width: 90, height: 30 });
  });
});

describe('renderRedacted', () => {
  it('draws the photo, then an opaque black box over each covered run, and encodes a JPEG', () => {
    const out = renderRedacted(photo, [
      { x: 10, y: 20, width: 100, height: 30 },
      { x: 200, y: 400, width: 50, height: 25 },
    ]);
    expect(mockDrawn.map((d) => d.kind)).toEqual(['image', 'rect', 'rect']);
    expect(mockDrawn[1].args[0]).toEqual({ x: 10, y: 20, width: 100, height: 30 });
    expect(mockDrawn[1].args[1]).toMatchObject({ color: 'color:black', aa: false });
    expect(out).toBe('jpeg:3:85:1200x1600');
  });
});
