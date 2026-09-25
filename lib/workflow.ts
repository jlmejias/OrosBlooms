export const inquiryTransitions = {
  new: ["reviewing", "rejected"],
  reviewing: ["quoting", "rejected"],
  quoting: ["quoted", "rejected"],
  quoted: ["approved", "rejected"],
  approved: ["completed"],
  rejected: [],
  completed: [],
} as const;

export const orderTransitions = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
} as const;

export function canTransition<T extends string>(transitions: Record<T, readonly T[]>, current: T, next: T) {
  return current === next || transitions[current].includes(next);
}

export function assertTransition<T extends string>(transitions: Record<T, readonly T[]>, current: T, next: T, label: string) {
  if (!canTransition(transitions, current, next)) throw new Error(`Transición de ${label} no permitida: ${current} → ${next}.`);
}
