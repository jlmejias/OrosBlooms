"use client";

import { useEffect } from "react";

type FormErrorsEvent = CustomEvent<{ errors: Record<string, string> }>;

const ignoredTypes = new Set(["hidden", "checkbox", "radio", "file", "submit", "button", "reset", "color", "date", "datetime-local", "time", "month", "week"]);

function fieldLabel(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const label = control.closest("label");
  if (!label) return "este campo";
  const clone = label.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("input, textarea, select, button, .form-required-mark, .form-field-error").forEach(node => node.remove());
  return clone.textContent?.replace(/\s+/g, " ").trim().replace(/[*:]$/, "") || "este campo";
}

function validationMessage(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, locale: string) {
  const en = locale === "en";
  const label = fieldLabel(control);
  const validity = control.validity;
  if (validity.valueMissing) return en ? `${label} is required.` : `${label} es obligatorio.`;
  if (validity.typeMismatch) return en ? `Enter a valid ${control.type === "email" ? "email address" : "value"}.` : `Ingresa ${control.type === "email" ? "un correo electrónico válido" : "un valor válido"}.`;
  if (validity.tooShort && !(control instanceof HTMLSelectElement)) return en ? `Use at least ${control.minLength} characters.` : `Escribe al menos ${control.minLength} caracteres.`;
  if (validity.tooLong && !(control instanceof HTMLSelectElement)) return en ? `Use no more than ${control.maxLength} characters.` : `Usa un máximo de ${control.maxLength} caracteres.`;
  if (validity.rangeUnderflow && control instanceof HTMLInputElement) return en ? `The minimum value is ${control.min}.` : `El valor mínimo es ${control.min}.`;
  if (validity.rangeOverflow && control instanceof HTMLInputElement) return en ? `The maximum value is ${control.max}.` : `El valor máximo es ${control.max}.`;
  if (validity.stepMismatch || validity.badInput) return en ? "Enter a valid number." : "Ingresa un número válido.";
  if (validity.patternMismatch) return en ? "Use the requested format." : "Usa el formato solicitado.";
  return control.validationMessage || (en ? "Review this field." : "Revisa este campo.");
}

function showError(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, message: string) {
  control.setAttribute("aria-invalid", "true");
  const id = control.id || control.name || `field-${Math.random().toString(36).slice(2)}`;
  if (!control.id) control.id = id;
  const errorId = `${id}-error`;
  control.setAttribute("aria-describedby", errorId);
  let error = control.parentElement?.querySelector<HTMLElement>(`:scope > .form-field-error`);
  if (!error) {
    error = document.createElement("small");
    error.className = "form-field-error";
    error.id = errorId;
    error.setAttribute("role", "alert");
    control.insertAdjacentElement("afterend", error);
  }
  error.textContent = message;
}

function clearError(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  control.removeAttribute("aria-invalid");
  control.removeAttribute("aria-describedby");
  control.parentElement?.querySelector(":scope > .form-field-error")?.remove();
}

function enhance(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>("form").forEach(form => {
    form.dataset.formEnhanced = "true";
    const controls = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
    controls.forEach(control => {
      const type = control instanceof HTMLInputElement ? control.type : "";
      const label = control.closest("label");
      if (control.required && label && !label.querySelector(".form-required-mark")) {
        label.classList.add("form-label-required");
        let caption = label.querySelector<HTMLElement>(":scope > .form-label-text");
        if (!caption) {
          caption = document.createElement("span");
          caption.className = "form-label-text";
          const leadingNodes: ChildNode[] = [];
          for (const node of Array.from(label.childNodes)) {
            if (node === control || (node instanceof HTMLElement && node.contains(control))) break;
            leadingNodes.push(node);
          }
          leadingNodes.forEach(node => caption?.append(node));
          label.insertBefore(caption, control);
        }
        const mark = document.createElement("span");
        mark.className = "form-required-mark";
        mark.textContent = "*";
        mark.title = document.documentElement.lang === "en" ? "Required field" : "Campo obligatorio";
        mark.setAttribute("aria-hidden", "true");
        caption.append(mark);
      }
      if (!(control instanceof HTMLSelectElement) && !ignoredTypes.has(type) && !control.placeholder) {
        const name = fieldLabel(control);
        control.placeholder = document.documentElement.lang === "en" ? `Enter ${name.toLowerCase()}` : `Escribe ${name.toLowerCase()}`;
      }
    });
    form.querySelector(":scope > .form-required-note")?.remove();
  });
}

export function FormExperience() {
  useEffect(() => {
    let observer: MutationObserver | undefined;
    let frame = 0;
    const start = () => {
      frame = window.requestAnimationFrame(() => {
        enhance();
        observer = new MutationObserver(() => enhance());
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["required"] });
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    const invalid = (event: Event) => {
      const control = event.target;
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) showError(control, validationMessage(control, document.documentElement.lang));
    };
    const input = (event: Event) => {
      const control = event.target;
      if ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) && control.validity.valid) clearError(control);
    };
    const customErrors = (event: Event) => {
      const formEvent = event as FormErrorsEvent;
      const form = formEvent.target;
      if (!(form instanceof HTMLFormElement)) return;
      Object.entries(formEvent.detail.errors).forEach(([name, message]) => {
        const control = form.elements.namedItem(name);
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) showError(control, message);
      });
      form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    };
    document.addEventListener("invalid", invalid, true);
    document.addEventListener("input", input, true);
    document.addEventListener("change", input, true);
    document.addEventListener("form:errors", customErrors);
    return () => { window.removeEventListener("load", start); window.cancelAnimationFrame(frame); observer?.disconnect(); document.removeEventListener("invalid", invalid, true); document.removeEventListener("input", input, true); document.removeEventListener("change", input, true); document.removeEventListener("form:errors", customErrors); };
  }, []);
  return null;
}
