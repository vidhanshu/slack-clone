"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import UserButton from "@/features/auth/components/UserButton";
import { useCreateWorkSpaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";

const Home = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkSpaceModal();
  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (workspaceId) router.replace(`/workspace/${workspaceId}`);
    else if (!open) setOpen(true);
  }, [workspaceId, isLoading, open, setOpen, router]);

  return (
    <div>
      <UserButton />
    </div>
  );
};

export default Home;
