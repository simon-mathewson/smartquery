import {
  ArrowForward,
  AutoAwesome,
  CloseFullscreenOutlined,
  FormatListNumberedOutlined,
  PlayArrowOutlined,
  TableChartOutlined,
  ViewColumnOutlined,
} from "@mui/icons-material";

export const SchemaVisual = () => {
  return (
    <div
      className="flex gap-4 sm:gap-8 select-none items-center flex-col sm:flex-row"
      aria-hidden
    >
      <div className="relative w-[240px] h-[150px]">
        <div className="-rotate-6 px-2 py-1 flex gap-1 items-center bg-gray-50 text-slate-600 rounded-full font-bold shadow-lg w-max text-sm">
          <TableChartOutlined className="text-slate-500 !h-4 !w-4" />
          <div>Tables</div>
        </div>
        <div className="left-[5px] top-[55px] absolute px-3 py-1.5 flex items-center bg-blue-500 text-white rounded-full font-bold shadow-xl w-max">
          <div>monthly sales since 2016</div>
        </div>
        <div className="left-[2px] top-[110px] absolute rotate-6 px-2 py-1 text-sm flex gap-1 items-center bg-gray-50 text-slate-600 rounded-full font-bold shadow-xl w-max">
          <ViewColumnOutlined className="text-slate-500 !h-4 !w-4" />
          <div>Columns</div>
        </div>
        <div className="left-[120px] top-[10px] rotate-3 absolute px-2 py-1 text-sm flex gap-1 items-center bg-gray-50 text-slate-600 rounded-full font-bold shadow-xl w-max">
          <CloseFullscreenOutlined className="text-slate-500 !h-4 !w-4" />
          <div>Constraints</div>
        </div>
        <div className="left-[160px] top-[115px] -rotate-3 absolute px-2 py-1 text-sm flex gap-1 items-center bg-gray-50 text-slate-600 rounded-full font-bold shadow-xl w-max">
          <FormatListNumberedOutlined className="text-slate-500 !h-4 !w-4" />
          <div>Enums</div>
        </div>
      </div>
      <ArrowForward className="!h-10 !w-10 text-white/80 rotate-90 sm:rotate-0" />
      <div className="bg-gray-50 text-slate-800 border border-gray-300 rounded-xl p-2 shadow-xl relative h-[120px] w-[270px] overflow-hidden">
        <div className="flex justify-between pb-1">
          <AutoAwesome className="!h-4 !w-4 text-slate-500" />
          <PlayArrowOutlined className="!h-5 !w-5 text-slate-500" />
        </div>
        <div className="font-[Google_Sans_Code] whitespace-pre-wrap font-bold text-xs">
          <span className="text-blue-600">{"SELECT"}</span>
          <span>{"\n  STRFTIME("}</span>
          <span className="text-orange-600">{"'%Y-%m'"}</span>
          <span>{", InvoiceDate) "}</span>
          <span className="text-blue-600">{"AS "}</span>
          <span>{"SalesMonth,"}</span>
          <span className="text-fuchsia-600">{"\n  SUM"}</span>
          {"(Total) "}
          <span className="text-blue-600">AS</span>
          {" MonthlySales"}
          <span className="text-blue-600">{"\nFROM"}</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-gray-50 from-10% to-transparent"></div>
      </div>
    </div>
  );
};
