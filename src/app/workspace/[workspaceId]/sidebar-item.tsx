import { Button } from "@/components/ui/button";
import useChannelId from "@/hooks/use-channel-id";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { IconType } from "react-icons/lib";

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
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

const SidebarItem = ({
  label,
  id,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  id: string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}) => {
  const wId = useWorkspaceId();

  return (
    <Button
      size="sm"
      variant="transparent"
      asChild
      className={cn(sidebarItemVariants({ variant }))}
    >
      <Link href={`/workspace/${wId}/channel/${id}`}>
        <Icon className="size-4 mr-1 shrink-0" />
        <span className="truncate text-sm font-medium">{label}</span>
      </Link>
    </Button>
  );
};

export default SidebarItem;
