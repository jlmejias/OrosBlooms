"use client";

import { useRef, useState } from "react";

export function DraggableModal({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number } | undefined>(undefined);

  return <div className="admin-draggable-modal" style={{ transform: `translate(${position.x}px, ${position.y}px)` }} onPointerDown={event => {
    if (!(event.target instanceof Element) || !event.target.closest(".ant-modal-header")) return;
    origin.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }} onPointerMove={event => {
    if (!origin.current) return;
    setPosition({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y });
  }} onPointerUp={() => { origin.current = undefined; }}>
    {children}
  </div>;
}
