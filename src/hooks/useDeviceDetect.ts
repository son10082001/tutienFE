import { useEffect, useState } from "react";

// hook for detect device
export const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const deviceWidth = window.innerWidth;
    if (deviceWidth < 768) {
      setIsMobile(true);
      return;
    }
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(isMobile);
  }, []);
  return {isMobile, isDesktop: !isMobile};
};