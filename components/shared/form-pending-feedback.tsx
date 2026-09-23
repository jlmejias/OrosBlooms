"use client";

import { useEffect } from "react";

function restore(form: HTMLFormElement) {
  if (!form.dataset.pending) return;
  form.dataset.pending = "";
  form.classList.remove("is-submitting");
  form.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button[type=submit], input[type=submit]").forEach((button) => {
    button.disabled = false;
    const label = button.dataset.pendingOriginal;
    if (label !== undefined) {
      if (button instanceof HTMLInputElement) button.value = label;
      else button.textContent = label;
      delete button.dataset.pendingOriginal;
    }
  });
}

export function FormPendingFeedback() {
  useEffect(() => {
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.noPendingFeedback === "true" || !form.checkValidity()) return;
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        form.dataset.pending = "true";
        form.classList.add("is-submitting");
        form.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button[type=submit], input[type=submit]").forEach((button) => {
          if (button.disabled) return;
          button.dataset.pendingOriginal = button instanceof HTMLInputElement ? button.value : button.textContent ?? "";
          if (button instanceof HTMLInputElement) button.value = document.documentElement.lang === "en" ? "Saving…" : "Guardando…";
          else button.textContent = document.documentElement.lang === "en" ? "Saving…" : "Guardando…";
          button.disabled = true;
        });
        window.setTimeout(() => restore(form), 10_000);
      });
    };
    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, []);
  return null;
}
