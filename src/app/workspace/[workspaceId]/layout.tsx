"use client";

import React, { PropsWithChildren } from "react";
import Toolbar from "./toolbar";
import Sidebar from "./sidebar";

const WorkspaceLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        {children}
      </div>
    </div>
  );
};

export default WorkspaceLayout;
