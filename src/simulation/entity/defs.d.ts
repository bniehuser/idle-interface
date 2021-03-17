declare module 'wavefunctioncollapse' {
  class Model {
    generate(rng: () => number): boolean;
    iterate(iterations: number, rng?: () => number): boolean;
    isGenerationComplete(): boolean;
    clear(): void;
  }
  export class SimpleTiledModel extends Model {
    constructor(data: ImageData, subsetName: string, width: number, height: number, periodicOutput: boolean);
    graphics(out?: Uint8ClampedArray): void|Uint8Array;
  }
  export class OverlappingModel extends Model {
    constructor(data: Uint8ClampedArray, inWidth: number, inHeight: number, sampleSize: number, outWidth: number, outHeight: number, periodicInput: boolean, periodicOutput: boolean, ground?: number);
    graphics(out?: Uint8ClampedArray, color?: [number, number, number, number]):  void|Uint8Array;
  }
}
