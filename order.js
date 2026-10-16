import { CONFIG } from "./config.js";
import { ask } from "./dialog.js";
import { getCart } from "./store.js";
import { lines, total, formatPrice } from "./cart.js";

// 주문 확인 흐름. 주문 화면과 장바구니 화면이 함께 쓴다.
// 실제 주문 접수는 아직 없다 (나중에 여기에 붙인다). 접수 전이므로 장바구니는 그대로 둔다.
export async function submitOrder() {
  const cartNow = getCart();
  const items = lines(cartNow, CONFIG.products);
  if (items.length === 0) {
    await ask(CONFIG.dialog.emptyOrder, { showCancel: false });
    return;
  }
  const summary = items.map((l) => `${l.name} ${CONFIG.productSuffix} ${CONFIG.order.qty(l.qty)}`).join("\n");
  const sum = formatPrice(total(cartNow, CONFIG.products), CONFIG.priceUnit);
  const ok = await ask(CONFIG.dialog.confirmOrder(summary, sum), { showCancel: true });
  if (ok) await ask(CONFIG.dialog.done, { showCancel: false });
}
