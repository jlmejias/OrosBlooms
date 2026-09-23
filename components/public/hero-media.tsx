"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroMediaProps = { mobile?: boolean; videoUrl:string; imageUrl:string; imageAlt:string };
function youtubeEmbedUrl(url:string){try{const parsed=new URL(url);const id=parsed.hostname.includes("youtu.be")?parsed.pathname.slice(1):parsed.searchParams.get("v")??(parsed.pathname.startsWith("/embed/")?parsed.pathname.split("/")[2]:null);return id&&/^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0`:null;}catch{return null;}}

export function HeroMedia({ mobile = false, videoUrl, imageUrl, imageAlt }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = window.matchMedia("(max-width: 1023px)");
    let loadTimer: number | undefined;
    const update = () => {
      const matchesViewport = mobile ? viewport.matches : !viewport.matches;
      window.clearTimeout(loadTimer);
      if (!motion.matches && matchesViewport) {
        loadTimer = window.setTimeout(() => setLoadVideo(true), 900);
      } else {
        videoRef.current?.pause();
        setPlaying(false);
        setLoadVideo(false);
      }
    };
    update();
    motion.addEventListener("change", update);
    viewport.addEventListener("change", update);
    return () => {
      window.clearTimeout(loadTimer);
      motion.removeEventListener("change", update);
      viewport.removeEventListener("change", update);
    };
  }, [mobile]);

  const playManually = () => {
    setLoadVideo(true);
    window.setTimeout(() => videoRef.current?.play().catch(() => undefined), 0);
  };

  const youtubeUrl=youtubeEmbedUrl(videoUrl);
  return <div className={`home-hero-media${playing ? " is-playing" : ""}`}>
    <div className="home-hero-video">
      {loadVideo&&youtubeUrl?<iframe src={youtubeUrl} title="Video de portada" allow="autoplay; encrypted-media; picture-in-picture" tabIndex={-1} aria-hidden="true" onLoad={() => setPlaying(true)}/>:loadVideo&&<video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        onError={() => setPlaying(false)}
      />}
    </div>
    <Image
      src={imageUrl}
      alt={imageAlt}
      fill
      priority
      sizes={mobile ? "100vw" : "(max-width: 1024px) 100vw, 55vw"}
      className={`home-cover home-hero-poster ${mobile ? "home-mobile-hero-photo" : "home-hero-photo"}`}
      unoptimized
    />
    {!mobile && <button type="button" className="home-hero-photo-label" onClick={playManually} aria-label="Reproducir video de OrosBlooms">
      <span className="home-hero-play-mark" aria-hidden="true">▶</span><span>01 / HECHO A MANO</span>
    </button>}
  </div>;
}
