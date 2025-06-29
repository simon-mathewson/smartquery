import { Html, Head, Main, NextScript } from "next/document";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Logo />
        <Main />
        <Footer />
        <NextScript />
      </body>
    </Html>
  );
}
