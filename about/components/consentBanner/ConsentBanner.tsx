"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useCallback, useEffect, useState } from "react";

export const ConsentBanner = () => {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const isGranted = localStorage.getItem("isAnalyticsConsentGranted");
    setIsGranted(isGranted === null ? null : isGranted === "true");
  }, [setIsGranted]);

  const accept = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAnalyticsConsentGranted", "true");
    }
    setIsGranted(true);
  }, []);

  const decline = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAnalyticsConsentGranted", "false");
    }
    setIsGranted(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      sendGAEvent("consent", "default", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      });
    });
  }, []);

  useEffect(() => {
    if (isGranted === null) return;

    setTimeout(() => {
      if (isGranted) {
        sendGAEvent("consent", "update", {
          ad_personalization: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          analytics_storage: "granted",
        });
        return;
      }

      sendGAEvent("consent", "update", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      });
    });
  }, [isGranted]);

  if (isGranted !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-4 w-full z-50">
      <div className="container !max-w-2xl shadow-[0_0_0_100000px_rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.5)]">
        <div className="bg-white p-3 flex flex-col sm:flex-row rounded-xl shadow-2xl/50 items-center gap-2">
          <div className="text-sm text-slate-600 grow-1 font-medium leading-tight">
            We ask for your consent to collect anonymous analytics data. This
            helps us improve your experience.
          </div>
          <button
            className="text-sm font-medium text-slate-800 px-4 py-2 cursor-pointer w-full sm:w-auto"
            onClick={decline}
          >
            Decline
          </button>
          <button
            className="text-sm font-medium text-white bg-blue-600 rounded-lg px-4 py-2 cursor-pointer min-w-30 w-full sm:w-auto"
            onClick={accept}
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};
