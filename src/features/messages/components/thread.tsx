import React, { useRef, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader, X } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import SLoader from "@/components/loader";
import Message from "@/app/workspace/[workspaceId]/channel/[channelId]/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import useWorkspaceId from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import useCreateMessage from "../api/use-create-message";
import useGenerateUploadUrl from "@/features/upload/api/use-generate-upload-url";
import useChannelId from "@/hooks/use-channel-id";
import { toast } from "sonner";
import useGetMessages from "../api/use-get-messages";
import { differenceInMinutes, format } from "date-fns";
import {
  formatDateLabel,
  TIME_THRESHOLD,
} from "@/app/workspace/[workspaceId]/channel/[channelId]/message-list";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

// interface ChatInputProps {
//   placeholder: string;
// }
type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage">;
};
const Thread = ({ messageId, onClose }: { messageId: Id<"messages">; onClose: () => void }) => {
  const channelId = useChannelId();
  const [editorKey, setEditorKey] = useState(0);
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const [pending, setPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const wId = useWorkspaceId();
  const { mutate: sendMessage, isPending: isSendingMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { data: message, isLoading: isMessageLoading } = useGetMessage({ id: messageId });
  const { data: currentMember } = useCurrentMember({
    workspaceId: wId,
  });
  const { loadMore, results, status } = useGetMessages({ channelId, parentMessageId: messageId });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
    try {
      setPending(true);
      editorRef?.current?.enable(false);
      const values: CreateMessageValues = {
        body,
        workspaceId: wId,
        parentMessageId: messageId,
        channelId,
      };
      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        if (!url) throw new Error("Image upload failed");

        const result = await fetch(url!, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) throw new Error("Image upload failed");

        const { storageId } = await result.json();
        if (storageId) values.image = storageId;
      }
      await sendMessage(values, { throwError: true });

      setEditorKey((e) => e + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setPending(false);
      editorRef?.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message!._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>,
  );

  if (isMessageLoading || status === "LoadingFirstPage")
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
      <div className="flex flex-1 flex-col-reverse pb-4 overflow-y-auto  messages-scrollbar">
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 sticky top-0 z-50">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const isCompact =
                prevMessage &&
                prevMessage.user._id === message!.user._id &&
                differenceInMinutes(
                  new Date(message!._creationTime),
                  new Date(prevMessage._creationTime),
                ) < TIME_THRESHOLD;
              return (
                <Message
                  key={message!._id}
                  id={message!._id}
                  memberId={message!.member._id}
                  authorImage={message!.user.image}
                  reactions={message!.reactions}
                  authorName={message!.user.name}
                  isAuthor={message?.memberId === currentMember?._id}
                  body={message!.body}
                  image={message!.image}
                  updatedAt={message!.updatedAt}
                  createAt={message!._creationTime}
                  threadCount={message?.threadCount}
                  threadImage={message?.threadImage}
                  threadTimestamp={message?.threadTimestamp}
                  isEditing={editingId === message!._id}
                  setEditingId={(id) => {
                    setEditingId(id);
                  }}
                  isCompact={!!isCompact}
                  hideThreadButton={true}
                />
              );
            })}
          </div>
        ))}
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
        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entries]) => {
                  if (entries.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                { threshold: 1.0 },
              );

              observer.observe(el);
              return () => {
                observer.disconnect();
              };
            }
          }}
        />
        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader className="size-4 animate-spin" />
            </span>
          </div>
        )}
      </div>
      <div className="px-4">
        <Editor
          key={editorKey}
          innerRef={editorRef}
          disabled={isSendingMessage}
          placeholder="Reply..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default Thread;
