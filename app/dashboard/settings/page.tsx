import Header from "@/components/header"
import SiteSettingsManager from "@/components/admin/site-settings-manager"

export const metadata = {
  title: "Site Settings | hai Dashboard",
  description: "Manage site settings for hai.",
}

export default function SettingsPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
        <SiteSettingsManager />
      </div>
    </>
  )
}
