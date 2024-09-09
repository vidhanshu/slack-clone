"use client";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import useChannelId from "@/hooks/use-channel-id";
import { AlertTriangle, Loader } from "lucide-react";
import ChannelHeader from "./channel-header";
import ChatInput from "./chat-input";
import useGetMessages from "@/features/messages/api/use-get-messages";
import MessageList from "./messge-list";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const { data, isLoading } = useGetChannel({ id: channelId });
  const { results, status, loadMore } = useGetMessages({ channelId });

  if (isLoading || status === "LoadingFirstPage")
    return (
      <div className="h-full flex flex-1 items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!data)
    return (
      <div className="h-full flex flex-1 flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No Channel Found</span>
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <ChannelHeader name={data.name} />
      <MessageList
        name={data.name}
        channelCreationTime={data._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message # ${data.name}`} />
    </div>
  );
};

export default ChannelIdPage;
