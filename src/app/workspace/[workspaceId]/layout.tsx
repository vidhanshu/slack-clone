"use client";

import React, { PropsWithChildren } from "react";
import Toolbar from "./toolbar";
import Sidebar from "./sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import WorkspaceSidebar from "./workspace-sidebar";

const WorkspaceLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup autoSaveId="vb-slack-layout" direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={11} className="bg-[#5E2C5F]">
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
