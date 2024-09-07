"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const id = useWorkspaceId();
  const { data, isLoading } = useGetWorkspace({ id });

  useEffect(() => {
    if (!isLoading && !data) router.push("/");
  }, [router, data, isLoading]);

  return <div>Hello World!</div>;
};

export default WorkspaceIdPage;
