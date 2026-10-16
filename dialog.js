import { CONFIG } from "./config.js";

const $ = (id) => document.getElementById(id);

export function initDialog() {
  $("dialog-ok").textContent = CONFIG.dialog.ok;
  $("dialog-cancel").textContent = CONFIG.dialog.cancel;
}

// 앱 자체 대화상자. 확인이면 true, 취소면 false를 돌려준다.
export function ask(text, { showCancel }) {
  return new Promise((resolve) => {
    $("dialog-text").textContent = text;
    $("dialog-cancel").hidden = !showCancel;
    $("dialog").hidden = false;
    const close = (result) => {
      $("dialog").hidden = true;
      $("dialog-ok").onclick = null;
      $("dialog-cancel").onclick = null;
      resolve(result);
    };
    $("dialog-ok").onclick = () => close(true);
    $("dialog-cancel").onclick = () => close(false);
  });
}
