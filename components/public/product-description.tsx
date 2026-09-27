import { sanitizeProductDescription } from "@/lib/product-description";

export function ProductDescription({ value }: { value: string }) { return <div className="product-description" dangerouslySetInnerHTML={{ __html: sanitizeProductDescription(value) }}/>; }
