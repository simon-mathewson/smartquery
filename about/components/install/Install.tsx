import { useEffect, useState } from "react";
import { DistributableLink } from "./DistributableLink";
import { detectOS, distributables } from "./utils";
import { ExpandLessOutlined, ExpandMoreOutlined } from "@mui/icons-material";

export const Install: React.FC = () => {
  const [currentOs, setCurrentOs] = useState<{
    os: string;
    arch: string;
  } | null>(null);

  useEffect(() => {
    void detectOS().then(setCurrentOs);
  }, []);

  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);

  const currentDistributable =
    distributables.find(
      ({ arch, os }) => os === currentOs?.os && arch === currentOs?.arch
    ) ??
    distributables.find(({ arch, os }) => os === "macos" && arch === "arm64")!;

  return (
    <div className="flex flex-col gap-3">
      <DistributableLink distributable={currentDistributable} highlight />
      <button
        className="text-sm text-slate-500 flex items-center gap-0.5 font-medium justify-center cursor-pointer"
        onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
      >
        {showOtherPlatforms ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
        {showOtherPlatforms ? "Hide other platforms" : "Show other platforms"}
      </button>
      {showOtherPlatforms && (
        <div className="flex flex-col gap-2">
          {distributables
            .filter(
              ({ arch, os }) =>
                os !== currentDistributable?.os ||
                arch !== currentDistributable?.arch
            )
            .map((distributable) => (
              <DistributableLink
                key={distributable.os + distributable.arch}
                distributable={distributable}
              />
            ))}
        </div>
      )}
    </div>
  );
};
