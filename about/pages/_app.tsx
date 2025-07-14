import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useRef } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const title =
    "Dabase – AI-powered, browser-based database UI for Postgres, MySQL, and SQLite";
  const description =
    "AI-powered, browser-based database UI for Postgres, MySQL, and SQLite. The AI copilot can answer questions and generate SQL queries tailored to your database. View and edit your data in a user-friendly interface.";

  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    windowRef.current = window;
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content={`${windowRef.current?.location.origin}/apple-touch-icon-180x180.png`}
        />
        <meta property="og:url" content={windowRef.current?.location.origin} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
