// 로그인 화면 주소: 로그인 후 지금 보던 화면(주소 + ?… 값)으로 돌아오도록 next 를 붙임
export const loginPathHere = () => `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
