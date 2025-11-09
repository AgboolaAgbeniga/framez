import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  posts: defineTable({
    userId: v.id("users"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});