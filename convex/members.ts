import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) =>
        q.eq("userId", userId).eq("workspaceId", args_0.workspaceId),
      )
      .unique();

    if (!member) return null;
    return member;
  },
});
