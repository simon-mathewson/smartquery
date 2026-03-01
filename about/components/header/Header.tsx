import { GitHub } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { LaunchButton } from "../launchButton/LaunchButton";

const GITHUB_URL = "https://github.com/simon-mathewson/smartquery";

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
        <div className="flex items-center gap-4 sm:gap-8">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 flex items-center"
            aria-label="GitHub"
          >
            <GitHub className="!h-6 !w-6 sm:!h-7 sm:!w-7" />
          </a>
          <LaunchButton />
        </div>
      </div>
    </div>
  );
};
