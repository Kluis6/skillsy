import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-svh flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </section>
  );
}
