import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/header/Header";

export default function App({ Component, pageProps }: AppProps) {
  const title =
    "SmartQuery – AI-powered, browser-based database UI for Postgres, MySQL, and SQLite";
  const description =
    "Query, visualize, and modify your database using natural language. Get tailor-made queries from a schema-aware AI assistant. Insert, update, and delete with ease. Bring your data to life with charts. Ask your database anything. Intellisense and inline completions. Thoughtful, customizable design. Access your data from anywhere.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://about.smartquery.dev/open-graph-logo.png"
        />
        <meta property="og:url" content="https://about.smartquery.dev" />
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
