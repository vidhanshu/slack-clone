import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useRemoveWorkspace from "@/features/workspaces/api/use-remove-workspace";
import useUpdateWorkspace from "@/features/workspaces/api/use-update-workspace";
import useConfirm from "@/hooks/use-confirm";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const PreferencesModal = ({
  open,
  setOpen,
  initialValue,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}) => {
  const router = useRouter();
  const wId = useWorkspaceId();
  const [value, setValue] = useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Are you sure",
    message: "This action is irreversible",
  });

  const { mutate: updateW, isPending: isUpdatingW } = useUpdateWorkspace();
  const { mutate: removeW, isPending: isRemovingW } = useRemoveWorkspace();

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateW(
      { id: wId, name: value },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Workspace updated");
        },
        onError: () => toast.error("Failed to update workspace"),
      },
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeW(
      { id: wId },
      {
        onSuccess: () => {
          setOpen(false);
          router.replace("/");
          toast.success("Workspace removed");
        },
        onError: () => toast.error("Failed to remove workspace"),
      },
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Workspace Name</p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">Edit</p>
                  </div>
                  <p className="text-sm">{value}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename This Workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isUpdatingW}
                    placeholder="Workspace Name eg. My Workspace"
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" disabled={isUpdatingW}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button size="sm" disabled={isUpdatingW} type="submit">
                      Update
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isRemovingW}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete Workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreferencesModal;
