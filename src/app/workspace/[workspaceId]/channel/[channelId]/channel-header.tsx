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
import useRemoveChannel from "@/features/channels/api/use-remove-channel";
import useUpdateChannel from "@/features/channels/api/use-update-channel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import useChannelId from "@/hooks/use-channel-id";
import useConfirm from "@/hooks/use-confirm";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

const ChannelHeader = ({ name }: { name: string }) => {
  const cId = useChannelId();
  const wId = useWorkspaceId();
  const router = useRouter();

  const [value, setValue] = useState(name);
  const [editOpen, setEditOpen] = useState(false);
  const { data: member } = useCurrentMember({ workspaceId: wId });

  const { mutate, isPending } = useUpdateChannel();
  const { mutate: removeChannel, isPending: removingChannel } = useRemoveChannel();
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Delete this channel?",
    message: "You are about to delete this channel. This action cannot be undone.",
  });

  const handleEditOpen = () => {
    if (member?.role !== "admin") return;
    setEditOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, "-").toLowerCase(); // replace whitespace with dash
    setValue(val);
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeChannel(
      { id: cId },
      {
        onSuccess: () => {
          toast.success("Channel removed");
          router.push(`/workspace/${wId}`);
        },
        onError: () => toast.error("Failed to remove channel"),
      },
    );
  };

  const handelSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      { id: cId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel updated");
          setEditOpen(false);
        },
        onError: () => toast.error("Failed to update channel"),
      },
    );
    setEditOpen(false);
  };

  return (
    <>
      <ConfirmDialog />
      <header className="bg-white border-b  h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-lg font-semibold px-2 overflow-hidden w-auto"
            >
              <span className="truncate"># {name}</span> <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle># {name}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{name}</p>
                      {member?.role === "admin" && <p className="text-sm text-[#1264a3]">Edit</p>}
                    </div>
                    <p className="text-sm"># {name}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Channel name</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handelSubmit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={false}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="eg. plan-budget"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isPending}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isPending}>
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {member?.role === "admin" && (
                <button
                  disabled={removingChannel}
                  onClick={handleRemove}
                  className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                >
                  <TrashIcon className="size-4 text-destructive" />
                  <p className="text-sm font-semibold">Delete channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </header>
    </>
  );
};

export default ChannelHeader;
