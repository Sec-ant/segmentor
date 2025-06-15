import { fromAnyIterable } from "@sec-ant/readable-stream/ponyfill/fromAnyIterable";
import "core-js/actual/typed-array/from-base64";
import type { JsonValue } from "type-fest";

declare global {
  interface Uint8ArrayConstructor {
    /**
     * Create a new Uint8Array from a base64 encoded string
     *
     * @param base64 The base64 encoded string to convert to a Uint8Array
     * @returns A new Uint8Array containing the decoded data
     */
    fromBase64(base64: string): Uint8Array;
  }
}

export async function decode(value: string) {
  try {
    const source = [Uint8Array.fromBase64(value)];
    const decompressStream = new DecompressionStream("gzip");
    const decompressed = fromAnyIterable(source).pipeThrough(decompressStream);
    const text = await new Response(decompressed).text();
    return JSON.parse(text) as JsonValue;
  } catch {
    return undefined;
  }
}
