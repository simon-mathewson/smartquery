"use client";

import { useState, useEffect } from "react";

const getIsMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
};

/**
 * Hook that returns true if the current viewport width is below Tailwind's 'sm' breakpoint (640px)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(getIsMobile());

    const updateIsMobile = () => {
      setIsMobile(getIsMobile());
    };

    window.addEventListener("resize", updateIsMobile);

    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  return isMobile;
};
