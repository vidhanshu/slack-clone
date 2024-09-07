import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[481349] bg-white/90 hover:bg-white/90",
      },
      size: {},
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const UserItem = ({
  id,
  image,
  label = "Member",
  variant,
}: {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>["variant"];
}) => {
  const workspaceId = useWorkspaceId();

  return (
    <Button variant="transparent" className={cn(userItemVariants({ variant }))} size="sm" asChild>
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarImage className="rounded-md" src={image} alt={label} />
          <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
            {label.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate font-medium">{label}</span>
      </Link>
    </Button>
  );
};

export default UserItem;
