import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/conversations/api/use-get-member";
import useMemberId from "@/hooks/use-member-id";
import useGetMessages from "@/features/messages/api/use-get-messages";
import SLoader from "@/components/loader";
import ConversationHeader from "./conversation-header";
import ChatInput from "./chat-input";
import MessageList from "../../channel/[channelId]/message-list";

const Conversation = ({ id }: { id: Id<"conversations"> }) => {
  const memberId = useMemberId();
  const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });
  const { results, status, loadMore } = useGetMessages({ conversationId: id });
  const canLoadMore = status === "CanLoadMore";

  if (memberLoading || status === "LoadingFirstPage") return <SLoader />;

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        memberName={member?.user.name}
        memberImage={member?.user?.image}
        onClick={() => {}}
      />
      <MessageList
        data={results}
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        canLoadMore={canLoadMore}
        isLoadingMore={status === "LoadingMore"}
        variant="conversation"
      />
      <ChatInput conversationId={id} placeholder={`Message ${member?.user.name}`} />
    </div>
  );
};

export default Conversation;
