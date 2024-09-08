import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useNewJoinCode from "@/features/workspaces/api/use-new-join-code";
import useConfirm from "@/hooks/use-confirm";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Copy, RefreshCcw } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const InviteModal = ({
  open,
  setOpen,
  joinCode,
  name,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}) => {
  const { mutate, isPending } = useNewJoinCode();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm({
    message: "This will de-active the current invite code, and generates new code",
    title: "Are you sure?",
  });
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard.writeText(inviteLink).then(() => toast.success("Link copied to clipboard"));
  };
  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode).then(() => toast.success("Code copied to clipboard"));
  };
  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate(
      { workspaceId },
      {
        onSuccess: () => toast.success("Invite code refreshed"),
        onError: () => toast.error("Failed to refresh invite code"),
      },
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">{joinCode}</p>
            <div className="flex items-center gap-x-4">
              <Button onClick={handleCopy} variant="ghost" size="sm">
                Copy Link <Copy className="size-4 ml-2" />
              </Button>
              <Button onClick={handleCopyCode} variant="ghost" size="sm">
                Copy Code <Copy className="size-4 ml-2" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between w-full items-center">
            <Button disabled={isPending} onClick={handleNewCode} variant="outline">
              New Code <RefreshCcw className="size-4 ml-2" />
            </Button>
            <DialogClose disabled={isPending} asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteModal;
