"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import useWorkspaceId from "@/hooks/use-workspace-id";

const WorkspaceIdPage = () => {
  const id = useWorkspaceId();
  const { data, isLoading } = useGetWorkspace({ id });

  return <div>Hello World!</div>;
};

export default WorkspaceIdPage;
