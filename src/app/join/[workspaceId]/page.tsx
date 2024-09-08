"use client";

import { Button } from "@/components/ui/button";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import useJoinWorkspace from "@/features/workspaces/api/use-join";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { Hash, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

const JoinWorkspacePage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
  const { mutate, isPending } = useJoinWorkspace();

  const handleComplete = (value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        onSuccess: (id) => {
          router.replace(`/workspace/${id}`);
          toast.success("Workspace joined");
        },
        onError: (err) => {
          toast.error("Failed to join workspace");
          console.log(err.name);
        },
      },
    );
  };

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if (isMember) router.push(`/workspace/${workspaceId}`);
  }, [isMember, router, workspaceId]);

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Hash className="size-20 -rotate-12 text-[#481349]" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data?.name}</h1>
          <p className="text-lg text-muted-foreground">Enter the workspace code to join</p>
        </div>
      </div>
      <div>
        <VerificationInput
          onComplete={handleComplete}
          length={6}
          classNames={{
            container: cn("flex gap-x-2", isPending && "opacity-50 cursor-not-allowed"),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          autoFocus
        />
      </div>
      <div className="flex gap-x-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinWorkspacePage;
