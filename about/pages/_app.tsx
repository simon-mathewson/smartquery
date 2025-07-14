import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const title =
    "Dabase – AI-powered, browser-based database UI for Postgres, MySQL, and SQLite";
  const description =
    "AI-powered, browser-based database UI for Postgres, MySQL, and SQLite. The AI copilot can answer questions and generate SQL queries tailored to your database. View and edit your data in a user-friendly interface.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://about.dabase.dev/apple-touch-icon-180x180.png"
        />
        <meta property="og:url" content="https://about.dabase.dev" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
