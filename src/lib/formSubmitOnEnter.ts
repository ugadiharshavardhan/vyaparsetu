import type { KeyboardEvent } from "react";

/**
 * Press Enter in an input to submit its parent form (or a `[data-submit-on-enter]`
 * shell when no native `<form>` is used).
 */
export function handleFormSubmitOnEnter(
  e: KeyboardEvent<HTMLInputElement>,
  userHandler?: (e: KeyboardEvent<HTMLInputElement>) => void,
) {
  userHandler?.(e);
  if (e.defaultPrevented || e.key !== "Enter") return;
  if (e.nativeEvent.isComposing) return;

  const input = e.currentTarget;
  if (input.type === "file" || input.type === "button" || input.type === "submit") return;

  const form = input.form;
  if (form) {
    const submitter = form.querySelector<HTMLElement>(
      'button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])',
    );
    if (submitter) {
      e.preventDefault();
      form.requestSubmit(submitter);
    }
    return;
  }

  const shell = input.closest("[data-submit-on-enter]");
  if (!shell) return;

  const submitter = shell.querySelector<HTMLElement>(
    '[data-form-submit]:not([disabled]), button[type="submit"]:not([disabled])',
  );
  if (submitter) {
    e.preventDefault();
    submitter.click();
  }
}
