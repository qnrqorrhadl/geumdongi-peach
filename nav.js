import { CONFIG } from "./config.js";
import { resolveRoute } from "./route.js";

// 화면 이동. 주소(#...)로 화면을 정하고, 앱 안에서 몇 단계 들어왔는지(depth)를 기록해
// 뒤로가기가 앱 밖으로 나가지 않게 한다.
let onRoute = () => {};

const depth = () => history.state?.depth ?? 0;
const currentRoute = () => resolveRoute(location.hash, CONFIG.products);

export function startRouting(listener) {
  onRoute = listener;
  window.addEventListener("popstate", () => onRoute(currentRoute())); // 폰 뒤로가기
  onRoute(currentRoute());
}

export function navigate(hash) {
  history.pushState({ depth: depth() + 1 }, "", hash);
  onRoute(currentRoute());
}

export function goBack() {
  if (depth() > 0) {
    history.back(); // popstate가 화면을 바꾼다
    return;
  }
  history.replaceState({ depth: 0 }, "", "#"); // 주소로 바로 열었을 때는 앱 안 메인으로
  onRoute(currentRoute());
}

// 메인 화면으로 돌아간다. 앱 안에서 쌓인 화면 기록을 걷어내서, 폰 뒤로가기를 눌렀을 때 방금 있던 화면으로 되돌아가지 않게 한다.
export function goHome() {
  const toHome = () => {
    history.replaceState({ depth: 0 }, "", "#");
    onRoute(currentRoute());
  };
  const steps = depth();
  if (steps === 0) {
    toHome();
    return;
  }
  window.addEventListener("popstate", toHome, { once: true });
  history.go(-steps);
}
