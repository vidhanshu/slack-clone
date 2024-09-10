import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import React, { useState } from "react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import Message from "./message";
import ChannelHero from "./channel-hero";
import { Id } from "../../../../../../convex/_generated/dataModel";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { Loader } from "lucide-react";
interface MessageListProps {
  name: string;
  channelCreationTime: number;
  data: GetMessagesReturnType;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  memberName?: string;
  memberImage?: string;
  variant?: "channel" | "thread" | "conversation";
}
const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "yyyy-MM-dd");
};

const TIME_THRESHOLD = 5;

const MessageList = ({
  memberImage,
  memberName,
  name: channelName,
  channelCreationTime,
  data,
  loadMore,
  isLoadingMore,
  canLoadMore,
  variant = "channel",
}: MessageListProps) => {
  const wId = useWorkspaceId();
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { data: currentMember } = useCurrentMember({ workspaceId: wId });

  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message!._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>,
  );
  return (
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
                hideThreadButton={variant === "thread"}
              />
            );
          })}
        </div>
      ))}
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
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
    </div>
  );
};

export default MessageList;
