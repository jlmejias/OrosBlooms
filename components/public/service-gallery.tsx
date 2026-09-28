"use client";
import Image from "next/image";
import { useState } from "react";

type ServiceImage = { id: string; url: string };
export function ServiceGallery({ images, fallback, alt }: { images: ServiceImage[]; fallback: string; alt: string }) {
  const gallery = images.length ? images : [{ id: "fallback", url: fallback }];
  const [selected, setSelected] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const change = (direction: number) => setSelected(index => (index + direction + gallery.length) % gallery.length);
  return <div className="editorial-image" onTouchStart={event => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={event => { if(touchStart === null)return; const delta=(event.changedTouches[0]?.clientX ?? touchStart)-touchStart;if(Math.abs(delta)>40)change(delta<0?1:-1);setTouchStart(null); }}><Image src={gallery[selected].url} alt={alt} fill priority sizes="(max-width:900px) 100vw,50vw"/><span style={{position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(90deg,rgba(0,0,0,.08),transparent 25%,transparent 75%,rgba(0,0,0,.08))"}}/>{gallery.length>1&&<><button type="button" aria-label="Imagen anterior" onClick={()=>change(-1)} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",border:0,borderRadius:"50%",width:36,height:36,background:"rgba(255,255,255,.72)",color:"#28322a",fontSize:22}}>‹</button><button type="button" aria-label="Imagen siguiente" onClick={()=>change(1)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",border:0,borderRadius:"50%",width:36,height:36,background:"rgba(255,255,255,.72)",color:"#28322a",fontSize:22}}>›</button><div style={{position:"absolute",left:"50%",bottom:14,transform:"translateX(-50%)",display:"flex",gap:6}}>{gallery.map((image,index)=><button key={image.id} type="button" aria-label={`Ver imagen ${index+1}`} onClick={()=>setSelected(index)} style={{width:8,height:8,padding:0,border:0,borderRadius:"50%",background:index===selected?"#fff":"rgba(255,255,255,.55)"}}/>)}</div></>}</div>;
}
