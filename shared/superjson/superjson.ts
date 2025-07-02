import superjson from "superjson";

// Enable buffers in Browser. Needed for certain column types.
superjson.registerCustom<Buffer | Uint8Array, number[]>(
  {
    isApplicable: (v): v is Buffer | Uint8Array =>
      (typeof Buffer !== "undefined" && v instanceof Buffer) ||
      v instanceof Uint8Array,
    serialize: (v) => [...v],
    deserialize: (v) => {
      // Use Uint8Array in browser environments where Buffer might not be available
      if (typeof Buffer !== "undefined") {
        return Buffer.from(v);
      } else {
        return new Uint8Array(v);
      }
    },
  },
  "buffer"
);

export default superjson;
