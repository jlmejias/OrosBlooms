import { cookies } from "next/headers";
export type Locale="en"|"es";
export const pick=(locale:Locale,en:string,es:string)=>locale==="es"?es:en;
export async function getLocale():Promise<Locale>{return(await cookies()).get("oros-locale")?.value==="es"?"es":"en"}
