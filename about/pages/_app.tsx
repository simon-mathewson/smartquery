import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>
          Dabase &ndash; The fun, browser-based, AI-powered database UI
        </title>
        <meta
          name="description"
          content="The fun, browser-based, AI-powered database UI for PostgreSQL, MySQL, and SQLite."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
