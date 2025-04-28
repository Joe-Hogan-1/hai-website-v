import Header from "@/components/header"
import WaterBackground from "@/components/water-background"

export default function ContactPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-6 text-[#ffd6c0]">contact us</h1>
          <p className="text-xl mb-8 text-black">get in touch with us for any inquiries or feedback.</p>
          {/* Add contact form or contact information here */}
        </div>
      </div>
    </>
  )
}
