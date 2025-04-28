"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  const handleReturn = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a8d1e7] to-[#ffd6c0] p-4 md:p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="mb-6 flex items-center">
          <Button
            onClick={handleReturn}
            variant="ghost"
            className="text-[#a8d1e7] hover:text-[#97c0d6] hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Age Verification
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-[#ffd6c0]">Privacy Policy</h1>

        <div className="prose max-w-none text-gray-800">
          <p className="mb-4">
            This Privacy Policy describes how HAI. ("we", "us", or "our") collects, uses, and shares information when
            you use our website.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, such as when you complete forms, respond to surveys,
            or otherwise interact with our website. We also automatically collect certain information about your device
            and how you interact with our website.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Information You Provide</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Age verification responses</li>
            <li>Contact information if you reach out to us</li>
            <li>Feedback and survey responses</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Device information (browser type, operating system, device type)</li>
            <li>Usage data (pages visited, time spent on pages)</li>
            <li>IP address and approximate location (city/state level only)</li>
            <li>Referral source</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our website</li>
            <li>Understand how users interact with our website</li>
            <li>Detect and prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
            <li>Enforce our terms and policies</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Cookies and Similar Technologies</h2>
          <p className="mb-4">
            We use cookies and similar technologies to collect information about your browsing activities and to
            distinguish you from other users of our website. You can control cookies through your browser settings and
            other tools.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Data Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Service providers who help us operate our website</li>
            <li>Law enforcement or other parties when required by law</li>
            <li>Other parties with your consent</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Your Rights and Choices</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, such as the
            right to access, correct, or delete your data. To exercise these rights, please contact us using the
            information provided below.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy,
            unless a longer retention period is required or permitted by law.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us through the contact information
            provided on our website.
          </p>

          <p className="mt-8 text-sm text-gray-600">Last Updated: April 7, 2024</p>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <Button onClick={handleReturn} className="bg-[#ffd6c0] hover:bg-[#ffcbb0] text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Age Verification
          </Button>
        </div>
      </div>
    </div>
  )
}
