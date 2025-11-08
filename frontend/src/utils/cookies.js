const getDocument = () => {
  if (typeof document === "undefined") {
    return null;
  }
  return document;
};

export const setCookie = (name, value, options = {}) => {
  const doc = getDocument();
  if (!doc) return;

  const {
    days = 7,
    path = "/",
    secure,
    sameSite = "Lax",
  } = options;

  const encodedValue = encodeURIComponent(value);
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}`
    : "";
  const secureFlag =
    typeof window !== "undefined" && (secure ?? window.location.protocol === "https:")
      ? "; Secure"
      : "";

  doc.cookie = `${name}=${encodedValue}${expires}; path=${path}; SameSite=${sameSite}${secureFlag}`;
};

export const getCookie = (name) => {
  const doc = getDocument();
  if (!doc) return null;

  const cookies = doc.cookie ? doc.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

export const deleteCookie = (name, options = {}) => {
  const doc = getDocument();
  if (!doc) return;
  const { path = "/" } = options;
  doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
};

export const setCookieJSON = (name, value, options = {}) => {
  try {
    const serialized = JSON.stringify(value);
    setCookie(name, serialized, options);
  } catch (error) {
    console.error("Failed to serialize cookie JSON", error);
  }
};

export const getCookieJSON = (name) => {
  const value = getCookie(name);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse cookie JSON", error);
    return null;
  }
};
