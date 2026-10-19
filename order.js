import { CONFIG } from "./config.js";
import { ask } from "./dialog.js";
import { getCart, clearCart } from "./store.js";
import { lines, total, formatPrice } from "./cart.js";
import { isValidPhone, isIos, buildSmsUrl, buildOrderText } from "./sms.js";
import { goHome, goOrder } from "./nav.js";

// 주문 흐름 (장바구니 화면의 주문하기). 접수 방식은 문자(SMS):
// 문자 앱이 열리고 주문 내용이 미리 적혀 있어, 손님이 전송만 누르면 된다. 따로 확인 질문은 하지 않는다.
// 문자 앱을 연 시점에 장바구니를 비운다 (돌아와서 같은 주문을 또 보내는 일을 막기 위해).
// 돌아오면 추가 주문 여부를 묻는다: 추가 주문 → 주문 화면, 아니요 → 메인 화면.
export async function submitOrder() {
  const cartNow = getCart();
  const items = lines(cartNow, CONFIG.products);
  if (items.length === 0) {
    await ask(CONFIG.dialog.emptyOrder, { showCancel: false });
    return;
  }
  if (!isValidPhone(CONFIG.orderPhone)) {
    await ask(CONFIG.dialog.noPhone, { showCancel: false });
    return;
  }
  const summary = items.map((l) => `${l.name} ${CONFIG.productSuffix} ${CONFIG.order.qty(l.qty)}`).join("\n");
  const sum = formatPrice(total(cartNow, CONFIG.products), CONFIG.priceUnit);
  const ok = await ask(CONFIG.dialog.confirmOrder(summary, sum), { showCancel: true });
  if (!ok) return; // 취소하면 장바구니 그대로
  const body = buildOrderText(CONFIG.order.smsHeader, summary, sum, CONFIG.order.total);

  clearCart();
  window.location.href = buildSmsUrl(CONFIG.orderPhone, body, isIos(navigator));

  const more = await ask(CONFIG.dialog.moreOrder, {
    showCancel: true,
    okText: CONFIG.dialog.moreYes,
    cancelText: CONFIG.dialog.moreNo,
  });
  if (more) {
    goOrder();
  } else {
    goHome();
  }
}
