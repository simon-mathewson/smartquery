import { ArrowForward } from "@mui/icons-material";
import classNames from "classnames";
import { sendGAEvent } from "@next/third-parties/google";

export const LaunchButton: React.FC<{ demo?: boolean }> = ({
  demo = false,
}) => (
  <div className="gap-1 flex flex-col items-center">
    <a
      href={
        demo
          ? "https://smartquery.dev/conn/demo/demo"
          : "https://smartquery.dev"
      }
      className={classNames(
        "flex gap-1 items-center font-semibold !bg-gradient-to-tr from-blue-600 to-pink-500 text-white px-2 p-1.5 rounded-full text-sm",
        {
          "!px-3 !py-2 !text-base !gap-2": demo,
        }
      )}
      onClick={() => {
        sendGAEvent("event", "launch", { demo });
      }}
      target="_blank"
    >
      <ArrowForward
        className={classNames({
          "!h-6 !w-6": demo,
          "!h-5 !w-5": !demo,
        })}
      />
      {demo ? "Explore interactive demo" : "Launch"}
    </a>
    {demo && (
      <div className="text-xs text-gray-400">No signup or payment required</div>
    )}
  </div>
);
