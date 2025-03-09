import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromotionTypeDebug } from "@/components/debug/PromotionTypeDebug";

export default function PromotionTypeDebugPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-4">Promotion Type Debugger</h1>
        <p className="mb-6 text-gray-600">
          Use this page to debug issues with promotion types.
        </p>
        <PromotionTypeDebug />
      </main>
      <Footer />
    </div>
  );
}
