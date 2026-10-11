import { redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-display text-4xl font-bold uppercase italic tracking-tight text-white">Admin</h1>
      {!adminEnabled() ? (
        <p className="mt-4 text-sm text-zinc-400">
          Admin is switched off. Set an <code className="text-zinc-200">ADMIN_PASSWORD</code> environment variable in Vercel
          (Project → Settings → Environment Variables), then redeploy.
        </p>
      ) : (
        <form action={login} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
          </div>
          {error && <p className="text-sm text-red-400">Wrong password.</p>}
          <button className="btn-primary w-full">Log in</button>
        </form>
      )}
    </div>
  );
}
