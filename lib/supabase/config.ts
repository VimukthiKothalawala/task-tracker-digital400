export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. " +
        "Set it in your .env.local (or hosting provider) and restart the dev server.",
    );
  }
  return url;
}

export function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Set it in your .env.local (or hosting provider) and restart the dev server.",
    );
  }
  return key;
}
