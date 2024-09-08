import { v } from "convex/values";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

const getMember = async (ctx: QueryCtx, wId: Id<"workspaces">, userId: Id<"users">) => {
  return ctx.db
    .query("members")
    .withIndex("by_user_workspace_id", (q) => q.eq("userId", userId).eq("workspaceId", wId))
    .unique();
};

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    // TODO: add conversationId
  },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await getMember(ctx, args_0.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    // TODO: handle conversationId

    const messageId = await ctx.db.insert("messages", {
      body: args_0.body,
      image: args_0.image,
      memberId: member._id,
      workspaceId: args_0.workspaceId,
      channelId: args_0.channelId,
      parentMessageId: args_0.parentMessageId,
      updatedAt: Date.now(),
    });

    return messageId;
  },
});
