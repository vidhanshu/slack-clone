import React from "react";
import { Doc, Id } from "../../../../../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Thumbnail from "./thumbnail";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Pencil, Smile, Trash } from "lucide-react";
import EmojiPopover from "@/components/emoji-popover";
import useUpdateMessage from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useRemoveMessage from "@/features/messages/api/use-remove-message";
import useConfirm from "@/hooks/use-confirm";
import useToggleReaction from "@/features/reactions/api/use-toggle-reaction";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { MdOutlineAddReaction } from "react-icons/md";
const Renderer = dynamic(() => import("./renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string | null;
  authorName?: string;
  isAuthor: boolean;
  body: string;
  image?: string | null;
  updatedAt: Doc<"messages">["updatedAt"];
  createAt: Doc<"messages">["_creationTime"];
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  isEditing: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  isCompact?: boolean;
  hideThreadButton: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & { count: number; memberIds: Id<"members">[] }
  >;
}
const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
};
const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  body,
  image,
  updatedAt,
  createAt,
  threadCount,
  threadImage,
  threadTimestamp,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
  reactions,
}: MessageProps) => {
  const { mutate: updateMessage, isPending: isUpdatePending } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovePending } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isReactionPending } = useToggleReaction();

  const [ConfirmDialog, confirm] = useConfirm({
    message: "This is action irreversible. Are you sure?",
    title: "Are you sure?",
  });

  const isPending = isUpdatePending || isRemovePending;

  const handleUpdate = (body: string) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message updated");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update message"),
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message removed");
          //TODO: close the thread
        },
        onError: () => toast.error("Failed to remove message"),
      },
    );
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      { messageId: id, emoji: value },
      {
        onError: () => toast.error("Failed to update reactions"),
      },
    );
  };

  if (isCompact)
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433",
          isRemovePending &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
        )}
      >
        <ConfirmDialog />
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(new Date(createAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(new Date(createAt), "hh:mm")}
            </button>
          </Hint>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={({ body }) => handleUpdate(body)}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <Renderer value={body} />
              <Thumbnail url={image} />
              {!!updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
              <Reactions data={reactions} onChange={handleReaction} />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={false}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={handleDelete}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433",
        isRemovePending &&
          "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
      )}
    >
      <ConfirmDialog />
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage src={authorImage!} />
            <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="w-full h-full">
            <Editor
              onSubmit={({ body }) => handleUpdate(body)}
              disabled={isPending}
              defaultValue={JSON.parse(body)}
              onCancel={() => setEditingId(null)}
              variant="update"
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm">
              <button onClick={() => {}} className="font-bold text-primary hover:underline">
                {authorName}
              </button>
              <span>&nbsp;</span>
              <Hint label={formatFullTime(new Date(createAt))}>
                <button className="text-xs text-muted-foreground hover:underline">
                  {format(new Date(createAt), "h:mm a")}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            <Thumbnail url={image} />
            {!!updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
            <Reactions data={reactions} onChange={handleReaction} />
          </div>
        )}
      </div>
      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isPending}
          handleEdit={() => setEditingId(id)}
          handleThread={() => {}}
          handleDelete={handleDelete}
          handleReaction={handleReaction}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
};

export default Message;

const Toolbar = ({
  handleDelete,
  handleEdit,
  handleThread,
  hideThreadButton,
  isAuthor,
  isPending,
  handleReaction,
}: {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (reaction: string) => void;
  hideThreadButton: boolean;
}) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover hint="Add reaction" onEmojiSelect={(e) => handleReaction(e.native)}>
          <Button size="iconSm" variant="ghost" disabled={isPending}>
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply">
            <Button size="iconSm" variant="ghost" disabled={isPending}>
              <MessageSquareText className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit">
              <Button onClick={handleEdit} size="iconSm" variant="ghost" disabled={isPending}>
                <Pencil className="size-4" />
              </Button>
            </Hint>
            <Hint label="Trash">
              <Button onClick={handleDelete} size="iconSm" variant="ghost" disabled={isPending}>
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
};

const Reactions = ({
  data,
  onChange,
}: {
  data: (Omit<Doc<"reactions">, "memberId"> & { memberIds: Id<"members">[]; count: number })[];
  onChange: (val: string) => void;
}) => {
  const wId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId: wId });
  const currentMemberId = currentMember?._id;

  if (data.length === 0 || !currentMemberId) return null;
  return (
    <div className="flex gap-x-1 items-center my-1">
      {data.map(({ _id, count, value, memberIds }) => {
        const meReacted = memberIds.includes(currentMemberId);
        return (
          <Hint
            label={`${count} ${count === 1 ? "person" : "people"} reacted with ${value}`}
            key={_id}
          >
            <button
              onClick={() => onChange(value)}
              className={cn(
                "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent flex text-slate-800 items-center gap-x-1",
                meReacted && "bg-blue-100/70 border-blue-500 text-white",
              )}
            >
              {value}
              <span
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  meReacted && "text-blue-500",
                )}
              >
                {count}
              </span>
            </button>
          </Hint>
        );
      })}
      <EmojiPopover hint="Add reaction" onEmojiSelect={(e) => onChange(e.native)}>
        <button className="h-6 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
          <MdOutlineAddReaction className="size-4" />
        </button>
      </EmojiPopover>
    </div>
  );
};
