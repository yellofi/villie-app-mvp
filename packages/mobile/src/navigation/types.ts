// ─── Auth 스택 ──────────────────────────────────
export type AuthStackParamList = {
  PhoneInput: undefined
  OtpVerify: { phone: string }
  RoleSelect: undefined
  NicknameInput: undefined   // 역할 선택 후 닉네임 입력
  LocationVerify: undefined  // 닉네임 후 동네 인증 → 온보딩 완료
}

// ─── 피드 스택 (Feed 탭 내부) ────────────────────
export type FeedStackParamList = {
  CareFeed: undefined
  CareDetail: { requestId: string }
}

// ─── 포스트 스택 (요청 탭 내부, 부모 전용) ─────────
export type PostStackParamList = {
  CarePost: undefined
}

// ─── 메인 탭 ─────────────────────────────────────
export type MainTabParamList = {
  FeedTab: undefined
  PostTab: undefined
  Chat: undefined
  MyVillie: undefined
}
