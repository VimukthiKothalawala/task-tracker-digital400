import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dbCredentials: {
    url: "postgresql://postgres.misbxznsvlzwevgyqafq:6d3G3RVE36hW12y6@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres",
  }
});
