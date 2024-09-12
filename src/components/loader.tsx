import { Loader } from "lucide-react";
import React from "react";

const SLoader = () => {
  return (
    <div className="h-full flex flex-1 items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default SLoader;
