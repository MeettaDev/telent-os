const FLASH_TOAST_KEY = "meetta-flash-success";

export function setSuccessFlashToast(message: string) {
  window.sessionStorage.setItem(FLASH_TOAST_KEY, message);
}

export function takeSuccessFlashToast() {
  const message = window.sessionStorage.getItem(FLASH_TOAST_KEY);
  if (message) window.sessionStorage.removeItem(FLASH_TOAST_KEY);
  return message;
}
