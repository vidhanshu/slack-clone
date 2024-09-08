import useCreateMessage from "@/features/messages/api/use-create-message";
import useChannelId from "@/hooks/use-channel-id";
import useWorkspaceId from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}
const ChatInput = ({ placeholder }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [pending, setPending] = useState(false);
  const editorRef = useRef<Quill | null>(null);
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { mutate: sendMessage } = useCreateMessage();

  const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
    try {
      setPending(true);
      await sendMessage({ body, workspaceId, channelId }, { throwError: true });

      setEditorKey((e) => e + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={pending}
        innerRef={editorRef}
        // variant="update"
        key={editorKey}
      />
    </div>
  );
};

export default ChatInput;
