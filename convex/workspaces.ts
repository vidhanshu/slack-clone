import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const generateCode = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const joinCode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args_0.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      role: "admin",
      userId,
      workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = [];
    const workspaceIds = members.map((m) => m.workspaceId);
    for (const wp of workspaceIds) {
      const wps = await ctx.db.get(wp);
      if (wps) workspaces.push(wps);
    }
    return workspaces;
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Checking if the current user is a member of the workspace he tries to access
    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) => q.eq("userId", userId).eq("workspaceId", args.id))
      .unique();
    if (!member) return null;

    return ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: { id: v.id("workspaces"), name: v.string() },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) => q.eq("userId", userId).eq("workspaceId", args_0.id))
      .unique();
    if (!member || member.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args_0.id, { name: args_0.name });

    return args_0.id;
  },
});

export const remove = mutation({
  args: { id: v.id("workspaces") },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const member = await ctx.db
      .query("members")
      .withIndex("by_user_workspace_id", (q) => q.eq("userId", userId).eq("workspaceId", args_0.id))
      .unique();
    if (!member || member.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args_0.id);

    const [members] = await Promise.all([
      ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args_0.id))
        .collect(),
    ]);

    // Remove associated members
    for (const mem of members) {
      await ctx.db.delete(mem._id);
    }

    return args_0.id;
  },
});
