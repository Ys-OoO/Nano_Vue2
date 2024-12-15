export const inBrowser = typeof window !== "undefined";
export const inNode = typeof global !== "undefined";

let _isServer;

export const isServerRendering = () => {
  if (_isServer !== undefined) return _isServer;
  if (!inBrowser && typeof global !== "undefined") {
    _isServer =
      global["process"] && global["process"].env.NANO_VUE_ENV === "server";
  } else {
    return false;
  }
};
