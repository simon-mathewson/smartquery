import {
  ArrowForwardIos,
  AutoAwesome,
  PlayArrowOutlined,
} from "@mui/icons-material";

export const ChatVisual = () => {
  return (
    <div
      className="flex gap-2 select-none items-center flex-col sm:flex-row"
      aria-hidden
    >
      <div className="px-3 py-1.5 flex items-center bg-blue-600 text-white rounded-full font-bold shadow-xl w-max">
        <div>sales per rep</div>
        <div className="w-px h-4 ml-[2px] bg-white animate-pulse" />
      </div>
      <ArrowForwardIos className="!h-6 !w-6 text-slate-500 rotate-90 sm:rotate-0" />
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-2 shadow-xl relative h-[140px] w-[255px] overflow-hidden">
        <div className="flex justify-between pb-1">
          <AutoAwesome className="!h-4 !w-4 text-slate-500" />
          <PlayArrowOutlined className="!h-5 !w-5 text-slate-500" />
        </div>
        <div className="font-[Google_Sans_Code] whitespace-pre-wrap font-bold text-sm">
          <span className="text-blue-600">{"SELECT"}</span>
          <span>{"\n  E.FirstName,\n  E.LastName,\n  "}</span>
          <span className="text-fuchsia-600">{"SUM"}</span>
          {"(I.Total) "}
          <span className="text-blue-600">AS</span>
          {" TotalSales"}
          <span className="text-blue-600">{"\nFROM"}</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-gray-50 from-10% to-transparent"></div>
      </div>
      <ArrowForwardIos className="!h-6 !w-6 text-slate-500 rotate-90 sm:rotate-0" />
      <div className="bg-white border border-gray-300 rounded-xl shadow-xl relative h-[190px] w-[270px] overflow-hidden">
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 items-end p-2">
          <div className="bg-blue-600 rounded-t-lg h-20" />
          <div className="bg-blue-600 rounded-t-lg h-14" />
          <div className="bg-blue-600 rounded-t-lg h-8" />
          <div className="text-center text-xs text-slate-600">Jane</div>
          <div className="text-center text-xs text-slate-600">Margaret</div>
          <div className="text-center text-xs text-slate-600">Steve</div>
        </div>
        <div className="grid grid-cols-3">
          <div className="pl-2 pr-1.5 py-1 text-xs font-[Google_Sans_Code] font-bold border-r border-t border-gray-200">
            LastName
          </div>
          <div className="px-1.5 py-1 text-xs font-[Google_Sans_Code] font-bold border-r border-t border-gray-200">
            FirstName
          </div>
          <div className="pl-1.5 pr-2 py-1 text-xs font-[Google_Sans_Code] font-bold border-t border-gray-200">
            TotalSales
          </div>
          <div className="pl-2 pr-1.5 py-1 text-xs border-r border-t border-gray-200">
            Peacock
          </div>
          <div className="px-1.5 py-1 text-xs border-r border-t border-gray-200">
            Jane
          </div>
          <div className="pr-2 pl-1.5 py-1 text-xs font-[Google_Sans_Code] border-t border-gray-200 text-emerald-600">
            833.04
          </div>
          <div className="pl-2 pr-1.5 py-1 text-xs border-r border-t border-gray-200">
            Park
          </div>
          <div className="px-1.5 py-1 text-xs border-r border-t border-gray-200">
            Margaret
          </div>
          <div className="pl-1.5 pr-2 py-1 text-xs font-[Google_Sans_Code] border-t border-gray-200 text-emerald-600">
            775.4
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-gray-50 from-10% to-transparent"></div>
      </div>
    </div>
  );
};
