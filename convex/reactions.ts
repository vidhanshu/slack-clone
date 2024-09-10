import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const getMember = async (ctx: QueryCtx, wId: Id<"workspaces">, userId: Id<"users">) => {
  return ctx.db
    .query("members")
    .withIndex("by_user_workspace_id", (q) => q.eq("userId", userId).eq("workspaceId", wId))
    .unique();
};

export const react = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    const existingMessageReaction = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), args.emoji),
        ),
      )
      .first();

    if (existingMessageReaction) {
      await ctx.db.delete(existingMessageReaction._id);
      return existingMessageReaction._id;
    } else {
      const newReactionsId = await ctx.db.insert("reactions", {
        workspaceId: message.workspaceId,
        messageId: args.messageId,
        memberId: member._id,
        value: args.emoji,
      });
      return newReactionsId;
    }
    ``;
  },
});
