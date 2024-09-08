"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateChanelModal } from "../store/use-create-channel-modal";
import useCreateChannel from "../api/use-create-workspace";
import useWorkspaceId from "@/hooks/use-workspace-id";

const CreateChannelModal = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const workspaceId = useWorkspaceId();

  const { mutate: createChannel, isPending: isCreatingChannel } = useCreateChannel();

  const [open, setOpen] = useCreateChanelModal();
  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createChannel(
      { name, workspaceId },
      {
        onSuccess: (id) => {
          toast.success("Channel created");
          handleClose();
          router.push(`/workspace/${workspaceId}/channel/${id}`);
        },
        onError: () => toast.error("Failed to create channel"),
      },
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, "-").toLowerCase(); // replace whitespace with dash
    setName(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={name}
            disabled={isCreatingChannel}
            onChange={handleChange}
            minLength={3}
            maxLength={80}
            placeholder="eg. plan-budget"
            autoFocus
            required
          />
          <div className="flex justify-end">
            <Button disabled={isCreatingChannel} size="sm">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
