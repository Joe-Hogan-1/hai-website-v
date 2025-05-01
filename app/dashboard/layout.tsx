import type React from "react"
import "../dashboard/admin.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="admin-panel">{children}</div>
}
