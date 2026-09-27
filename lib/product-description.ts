import sanitizeHtml from "sanitize-html";

const allowedTags = ["p", "br", "strong", "b", "em", "i", "s", "strike", "ul", "ol", "li", "a", "span"];
const rgbChannel = "(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)";
const safeColor = new RegExp(`^(?:#[0-9a-f]{3,8}|rgb\\(\\s*${rgbChannel}\\s*,\\s*${rgbChannel}\\s*,\\s*${rgbChannel}\\s*\\))$`, "i");

export function sanitizeProductDescription(value: string) {
  return sanitizeHtml(value, { allowedTags, allowedAttributes: { a: ["href", "target", "rel"], span: ["style"] }, allowedStyles: { span: { color: [safeColor] } }, allowedSchemes: ["http", "https", "mailto"], transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) } }).trim();
}

export function productDescriptionText(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).replaceAll("&nbsp;", " ").replace(/\s+/g, " ").trim();
}
