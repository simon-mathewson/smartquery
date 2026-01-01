/* eslint-disable @next/next/no-img-element */
import classNames from "classnames";
import type { Distributable } from "./utils";
import { getDistributableUrl } from "./utils";
import { sendGAEvent } from "@next/third-parties/google";
import { FileDownloadOutlined } from "@mui/icons-material";

export type DistributableLinkProps = {
  distributable: Distributable;
  highlight?: boolean;
};

export const DistributableLink: React.FC<DistributableLinkProps> = ({
  distributable,
  highlight = false,
}) => {
  if (distributable.os === "ios") {
    return (
      <a
        href="https://apps.apple.com/us/app/smartquery/id6755796701?itscg=30200&itsct=apps_box_badge&mttnsubad=6755796701"
        className="block mx-auto cursor-pointer user-select-none"
        target="_blank"
      >
        <img
          src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1765843200"
          alt="Download on the App Store"
          className="w-[144px] h-[48px] object-contain"
        />
      </a>
    );
  }

  return (
    <a
      href={getDistributableUrl(distributable)}
      className={classNames(
        "flex gap-1 px-1.5 py-1 items-center font-semibold !bg-gradient-to-tr rounded-full text-sm border-2 justify-center border-blue-600 text-blue-600",
        {
          "from-blue-600 to-pink-500 text-white px-3 py-2 gap-2 border-none text-md min-w-[200px]":
            highlight,
        }
      )}
      onClick={() => {
        sendGAEvent("event", "download", {
          os: distributable.os,
          arch: distributable.arch,
        });
      }}
      target="_blank"
    >
      <FileDownloadOutlined
        className={classNames("!h-5 !w-5", { "!h-6 !w-6": highlight })}
      />
      {highlight ? "Install " : ""}
      {distributable.label}
    </a>
  );
};
