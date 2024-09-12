import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import SLoader from "@/components/loader";
import Message from "@/app/workspace/[workspaceId]/channel/[channelId]/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import useWorkspaceId from "@/hooks/use-workspace-id";

const Thread = ({ messageId, onClose }: { messageId: Id<"messages">; onClose: () => void }) => {
  const wId = useWorkspaceId();
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { data: message, isLoading: isMessageLoading } = useGetMessage({ id: messageId });
  const { data: currentMember, isLoading: currentMemberLoading } = useCurrentMember({
    workspaceId: wId,
  });

  if (isMessageLoading)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <X className="size-5 stroke-1.5" />
          </Button>
        </div>
        <SLoader />
      </div>
    );
  if (!message)
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center h-[49px] px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <X className="size-5 stroke-1.5" />
          </Button>
        </div>
        <div className="flex h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message Not Found</p>
        </div>
      </div>
    );
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-[49px] px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button size="iconSm" variant="ghost" onClick={onClose}>
          <X className="size-5 stroke-1.5" />
        </Button>
      </div>
      <div>
        <Message
          hideThreadButton
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          body={message.body}
          image={message.image}
          createAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
        />
      </div>
    </div>
  );
};

export default Thread;
