"use client";

import SLoader from "@/components/loader";
import useCreateOrGetConversation from "@/features/conversations/api/use-create-or-get-conversation";
import useMemberId from "@/hooks/use-member-id";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import Conversation from "./conversation";

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const { mutate: createOrGetConversation, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    createOrGetConversation(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: (data) => {
          setConversationId(data);
        },
        onError: () => {
          toast.error("Failed to get conversation");
        },
      },
    );
  }, [workspaceId, memberId, createOrGetConversation]);

  if (isPending) return <SLoader />;
  if (!conversationId)
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <AlertTriangle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Message Not Found</p>
      </div>
    );

  return <Conversation id={conversationId} />;
};

export default MemberIdPage;
