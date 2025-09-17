import { type IncomingHttpHeaders } from "http";

export const convertIncomingHeadersToNativeHeaders = (incomingHeaders: IncomingHttpHeaders): Headers => {
  const headers = new Headers();

  for (const key in incomingHeaders) {
    if (Object.prototype.hasOwnProperty.call(incomingHeaders, key)) {
      const value = incomingHeaders[key];

      if (value !== undefined) {
        if (Array.isArray(value)) {
          // If the header has multiple values (e.g., Set-Cookie)
          value.forEach((v) => headers.append(key, v));
        } else {
          // Single string value
          headers.append(key, value);
        }
      }
    }
  }

  return headers;
}
