// src/app/page.tsx
// Root redirect — send users to /dashboard (auth guard handles unauthenticated users)
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
