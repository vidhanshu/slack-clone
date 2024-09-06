"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateWorkSpaceModal } from "../store/use-create-workspace-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCreateWorkspace from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CreateWorkspaceModal = () => {
  const router = useRouter();

  const [name, setName] = useState("");

  const [open, setOpen] = useCreateWorkSpaceModal();
  const { mutate, isPending } = useCreateWorkspace();

  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { name },
      {
        onSuccess: (id) => {
          handleClose();
          toast.success("Workspace created");
          router.replace(`/workspace/${id}`);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            disabled={isPending}
            value={name}
            required
            autoFocus
            minLength={3}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace Name e.g. 'Work', 'Personal"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
