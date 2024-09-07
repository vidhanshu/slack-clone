"use client";

import React, { PropsWithChildren } from "react";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

const Hint = ({
  label,
  side,
  children,
  align,
}: {
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  align: "start" | "center" | "end";
} & PropsWithChildren) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className="bg-black text-white border-white/5">
          <p className="font-medium text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Hint;
