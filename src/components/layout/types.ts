/** Auth state passed from server to layout/header (avoid importing LandingPageClient in admin bundle). */
export type InitialAuth = {
  isLoggedIn: boolean
  role: 'admin' | 'user' | null
}
