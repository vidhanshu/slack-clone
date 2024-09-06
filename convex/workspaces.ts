import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args_0) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // TODO: create proper method later
    const joinCode = "123456";

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args_0.name,
      userId,
      joinCode,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("workspaces").collect();
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return ctx.db.get(args.id);
  },
});
