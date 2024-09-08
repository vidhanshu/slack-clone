"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChanelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Loader, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const id = useWorkspaceId();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChanelModal();

  const { data, isLoading } = useGetWorkspace({ id });
  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => member?.role === "admin", [member]);

  useEffect(() => {
    if (workspaceLoading || channelsLoading || memberLoading || !workspace) return;
    if (channelId) router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    channelId,
    workspaceLoading,
    channelsLoading,
    workspace,
    open,
    memberLoading,
    member,
    workspaceId,
    setOpen,
    router,
  ]);

  useEffect(() => {
    if (!isLoading && !data) router.push("/");
  }, [router, data, isLoading]);

  if (workspaceLoading || channelsLoading || memberLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin to-muted-foreground" />
      </div>
    );

  if (!workspace || !member)
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-destructive" />{" "}
        <span className="text-sm text-muted-foreground">Workspace not found</span>
      </div>
    );

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
      <TriangleAlert className="size-6 text-destructive" />{" "}
      <span className="text-sm text-muted-foreground">
        No Channel found, Ask Admin to create one
      </span>
    </div>
  );
};

export default WorkspaceIdPage;
