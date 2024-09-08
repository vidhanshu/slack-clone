import { useState, useEffect } from "react";

const useIsMacOS = () => {
  const [isMacOS, setIsMacOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMac = /macintosh|mac os x/i.test(userAgent);
    setIsMacOS(isMac);
  }, []);

  return isMacOS;
};

export default useIsMacOS;
