"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function UserAgreementPage() {
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

        <h1 className="text-3xl font-bold mb-6 text-[#ffd6c0]">User Agreement (Terms of Use)</h1>

        <div className="prose max-w-none text-gray-800">
          <p className="mb-4">
            This User Agreement (the "Agreement") governs your access to and use of the HAI. (the "HAI."), which
            provides informational content and listings of adult-use cannabis products in accordance with New York State
            law. By accessing or using HAI., you acknowledge that you have read, understood, and agree to be bound by
            this Agreement. If you do not agree with any part of this Agreement, you must not access or use HAI..
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">1. Age Restriction</h2>
          <p className="mb-4">
            Access to this HAI. is restricted to individuals who are 21 years of age or older. By using HAI., you affirm
            and warrant that you are at least 21 years old. We do not knowingly collect or solicit information from
            anyone under the age of 21. If we learn we have inadvertently collected such information, it will be deleted
            promptly.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">2. Informational Use Only</h2>
          <p className="mb-4">
            HAI. is strictly for informational and browsing purposes. It does not sell, distribute, or facilitate the
            purchase of cannabis or cannabis-related products. Product links may direct you to external dispensary
            HAI.s; we are not affiliated with or responsible for the content, accuracy, or practices of any third-party
            sites.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">3. Compliance with New York Law</h2>
          <p className="mb-4">
            HAI. operates in accordance with the Marihuana Regulation and Taxation Act (MRTA), signed into law on March
            31, 2021, which legalized adult-use cannabis in New York State. HAI. content is curated to reflect
            developments regulated by the Office of Cannabis Management (OCM) and the Cannabis Control Board. Users are
            solely responsible for ensuring that their activities comply with applicable federal, state, and local laws.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">4. Responsible Use and Impairment</h2>
          <p className="mb-4">
            Cannabis should be used responsibly by adults 21 years of age or older. The consumption of cannabis can
            impair motor functions, coordination, and judgment. Do not operate a vehicle, machinery, or engage in
            activities requiring alertness while under the influence of cannabis. HAI. and its operators are not liable
            for any actions taken by users while impaired. Always consume responsibly.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">5. No Medical or Legal Advice</h2>
          <p className="mb-4">
            The information on this HAI., including blog posts and product descriptions, is provided for general
            informational purposes only. Nothing contained on HAI. should be construed as legal, medical, or
            professional advice. You should consult a licensed attorney, medical professional, or other qualified expert
            for specific advice pertaining to your situation.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">6. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, HAI. and its owners, operators, and affiliates disclaim all
            liability for any direct, indirect, incidental, consequential, or special damages arising out of or relating
            to your access to or use of HAI.. All use is at your own risk.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">7. Data Collection and Privacy</h2>
          <p className="mb-4">
            HAI. may collect certain data from users for analytical and market research purposes, including but not
            limited to IP addresses, browser type, usage patterns, and cookies. By using HAI., you consent to such data
            collection. Please refer to our Privacy Policy for more information.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">8. Modifications to This Agreement</h2>
          <p className="mb-4">
            We reserve the right to modify or update this Agreement at any time without prior notice. Your continued use
            of HAI. after such changes constitutes your acceptance of the revised Agreement.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-[#a8d1e7]">9. Governing Law</h2>
          <p className="mb-4">
            This Agreement shall be governed by and construed in accordance with the laws of the State of New York,
            without regard to its conflict of laws principles.
          </p>

          <p className="mt-8 mb-4">
            If you have any questions regarding this Agreement, you may contact us using any available contact form or
            email provided on HAI..
          </p>
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
