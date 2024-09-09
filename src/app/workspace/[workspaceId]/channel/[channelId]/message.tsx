import React from "react";
import { Doc, Id } from "../../../../../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Thumbnail from "./thumbnail";
const Renderer = dynamic(() => import("./renderer"), { ssr: false });

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
  if (isCompact)
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start  gap-2">
          <Hint label={formatFullTime(new Date(createAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(new Date(createAt), "hh:mm")}
            </button>
          </Hint>
          <div className="flex flex-col w-full">
            <Renderer value={body} />
            <Thumbnail url={image} />
            {!!updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage src={authorImage!} />
            <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
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
        </div>
      </div>
    </div>
  );
};

export default Message;
