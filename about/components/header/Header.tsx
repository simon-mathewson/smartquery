import Image from "next/image";
import Link from "next/link";
import { LaunchButton } from "../launchButton/LaunchButton";

export const Header: React.FC = () => {
  return (
    <div className="py-2 sm:py-5 sticky top-0 bg-white/70 z-30 backdrop-blur-2xl">
      <div className="flex justify-between items-center container">
        <Link
          href="/"
          className="h-10 shrink-0 w-[140px] sm:w-[200px] !block relative"
        >
          <Image src="/logo.svg" alt="" fill />
        </Link>
        <div className="flex items-center gap-8">
          <LaunchButton />
        </div>
      </div>
    </div>
  );
};
