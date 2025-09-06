// Server Component: safe to prerender
export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; err?: string };
}) {
  const next = searchParams?.next || "/calendar";
  const hasError = searchParams?.err === "1";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-white/70 text-sm mt-1">
          Enter your access code to continue.
        </p>

        <form method="POST" action="/api/signin" className="mt-6 space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            name="code"
            placeholder="Access code"
            className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/30"
            autoComplete="one-time-code"
          />
          {hasError && (
            <div className="text-sm text-red-300">
              Wrong access code or missing server config.
            </div>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Continue
          </button>
        </form>

        <div className="text-xs text-white/60 mt-4">
          You’ll be redirected to <span className="text-white/80">{next}</span>.
        </div>
        <div className="text-xs text-white/50 mt-2">
          Tip: set <code>NEXT_PUBLIC_ACCESS_CODE</code> in Vercel → Environment Variables.
        </div>
      </div>
    </div>
  );
}
