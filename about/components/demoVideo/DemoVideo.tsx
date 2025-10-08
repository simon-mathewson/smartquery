import { PlayCircleOutline } from "@mui/icons-material";
import { useRef, useState } from "react";

export const DemoVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hidePlay, setHidePlay] = useState(false);

  return (
    <div className="container">
      <div className="h-max relative rounded-2xl shadow-2xl ring-1 ring-gray-300 inset-ring-4 overflow-hidden">
        <video
          controls={hidePlay}
          className="w-full h-full object-cover block"
          poster="/light-landscape-thumbnail.png"
          ref={videoRef}
          src="light-landscape.mp4"
        />
        {!hidePlay && (
          <button
            className="cursor-pointer absolute top-0 left-0 w-full h-full bg-white/30 backdrop-blur-lg flex items-center justify-center flex-col gap-1 sm:gap-2"
            onClick={() => {
              void videoRef.current?.play();
              setHidePlay(true);
            }}
          >
            <PlayCircleOutline className="!h-15 !w-15 sm:!h-30 sm:!w-30 text-slate-800" />
            <div className="text-2xl sm:text-4xl font-[Outfit] text-blue-600 font-bold">
              Watch demo
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
