import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
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
    if (!member) return [];

    return await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args_0.workspaceId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("channels") },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const channel = await ctx.db.get(args_0.id);
    if (!channel) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) =>
        q.eq("userId", userId).eq("workspaceId", channel.workspaceId),
      )
      .unique();
    if (!member) return null;

    return channel;
  },
});

export const create = mutation({
  args: { name: v.string(), workspaceId: v.id("workspaces") },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) =>
        q.eq("userId", userId).eq("workspaceId", args_0.workspaceId),
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Unauthorized");

    const parsedName = args_0.name.trim().replace(/\s+/g, "-").toLowerCase(); // replace whitespace with dash

    const channelId = await ctx.db.insert("channels", {
      name: parsedName,
      workspaceId: args_0.workspaceId,
    });
    return channelId;
  },
});

export const update = mutation({
  args: { id: v.id("channels"), name: v.string() },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const channel = await ctx.db.get(args_0.id);
    if (!channel) throw new Error("Channel not found");

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) =>
        q.eq("userId", userId).eq("workspaceId", channel.workspaceId),
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Unauthorized");
    const parsedName = args_0.name.trim().replace(/\s+/g, "-").toLowerCase(); // replace whitespace with dash

    await ctx.db.patch(args_0.id, { name: parsedName });

    return args_0.id;
  },
});
export const remove = mutation({
  args: { id: v.id("channels") },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const channel = await ctx.db.get(args_0.id);
    if (!channel) throw new Error("Channel not found");

    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) =>
        q.eq("userId", userId).eq("workspaceId", channel.workspaceId),
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args_0.id);

    // TODO: remove associated messages

    return args_0.id;
  },
});
