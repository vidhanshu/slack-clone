import useCreateMessage from "@/features/messages/api/use-create-message";
import useGenerateUploadUrl from "@/features/upload/api/use-generate-upload-url";
import useWorkspaceId from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
  conversationId: Id<"conversations">;
}
type CreateMessageValues = {
  workspaceId: Id<"workspaces">;
  conversationId: Id<"conversations">;
  body: string;
  image?: Id<"_storage">;
};
const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [pending, setPending] = useState(false);
  const editorRef = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId();
  const { mutate: sendMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const handleSubmit = async ({ body, image }: { body: string; image: File | null }) => {
    try {
      setPending(true);
      editorRef?.current?.enable(false);
      const values: CreateMessageValues = {
        body,
        workspaceId,
        conversationId,
      };
      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        if (!url) throw new Error("Image upload failed");

        const result = await fetch(url, {
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
