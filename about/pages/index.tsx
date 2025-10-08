import { DemoVideo } from "@/components/demoVideo/DemoVideo";
import { LaunchButton } from "@/components/launchButton/LaunchButton";
import { WordCarousel } from "@/components/wordCarousel/WordCarousel";
import { useIsMobile } from "@/hooks/useIsMobile";
import Image from "next/image";

export default function Home() {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex flex-col items-center gap-6 py-8 sm:py-12 space-y-2 sm:space-y-3 container">
        <h1 className="text-4xl sm:text-6xl flex gap-10 sm:gap-4 justify-center flex-col sm:flex-row">
          <WordCarousel
            align={isMobile ? "center" : "right"}
            words={["Query", "Visualize", "Modify", "Analyze", "Explore"]}
          />
          <div className="max-w-[400px] text-center sm:text-left">
            your database using natural language
          </div>
        </h1>
        <LaunchButton demo />
        <div className="flex justify-center gap-3 sm:gap-5 items-end overflow-hidden">
          <Image
            src="/postgres.svg"
            alt="PostgreSQL"
            width={isMobile ? 80 : 100}
            height={isMobile ? 80 : 100}
          />
          <Image
            src="/mysql.svg"
            alt="MySQL"
            width={isMobile ? 52 : 65}
            height={isMobile ? 52 : 65}
            className="mb-[3px]"
          />
          <Image
            src="/sqlite.svg"
            alt="SQLite"
            width={isMobile ? 80 : 100}
            height={isMobile ? 80 : 100}
          />
        </div>
      </div>
      <DemoVideo />
    </>
  );
}
