import { fromAnyIterable } from "@sec-ant/readable-stream/ponyfill/fromAnyIterable";
import "core-js/actual/typed-array/to-base64";
import type { JsonValue } from "type-fest";

declare global {
  interface Uint8Array {
    /**
     * Convert the Uint8Array to a base64 encoded string
     *
     * @returns The base64 encoded string representation of the Uint8Array
     */
    toBase64(options?: {
      alphabet?: "base64" | "base64url";
      omitPadding?: boolean;
    }): string;
  }
}

export async function encode(value: JsonValue) {
  const source = JSON.stringify(value);
  const textEncoderStream = new TextEncoderStream();
  const compressionStream = new CompressionStream("gzip");
  const compressed = fromAnyIterable(source)
    .pipeThrough(textEncoderStream)
    .pipeThrough(compressionStream);
  const bytes = await new Response(compressed).bytes();
  return bytes.toBase64({
    omitPadding: true,
  });
}
