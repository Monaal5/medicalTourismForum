
import QuoraHeader from "@/components/header/QuoraHeader";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <QuoraHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
      <FloatingActionButton />
    </>
  );
}
