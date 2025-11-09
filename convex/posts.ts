import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPost = mutation({
  args: {
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("posts", {
      userId: user._id,
      content: args.content,
      imageUrl: args.imageUrl,
      timestamp: Date.now(),
    });
  },
});

export const getPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").take(50);
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          user: user ? { name: user.name, avatarUrl: user.avatarUrl } : null,
        };
      })
    );
    return postsWithUsers;
  },
});

export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(50);
  },
});