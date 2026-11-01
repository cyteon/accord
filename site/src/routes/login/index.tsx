import { useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { login } from "~/lib/api/auth";

export default function Login() {
  const submission = useSubmission(login);

  return (
    <main class="flex h-screen p-2 gap-2">
      <div class="bg-primary w-full hidden lg:flex rounded-md text-primary-fg px-8 py-6 flex-col">
        <h2 class="text-3xl font-bold">Accord</h2>

        <h1 class="mt-auto text-7xl font-bold">Welcome back!</h1>
      </div>

      <div class="bg-card w-full flex rounded-md px-6">
        <form
          action={login}
          method="post"
          class="m-auto w-full lg:w-96 flex flex-col"
        >
          <h2 class="text-2xl font-bold mb-6">Login</h2>

          <label class="mb-1 text-muted-fg font-semibold" for="identifier">
            Email or username
          </label>
          <input
            type="text"
            class="w-full rounded-sm p-2 px-4 h-11.5 mb-4 bg-bg text-fg border-input border"
            placeholder="you@example.com"
            id="identifier"
            name="identifier"
            autocomplete="username"
            required
          />

          <label class="mb-1 text-muted-fg font-semibold" for="password">
            Password
          </label>
          <input
            type="password"
            class="w-full rounded-sm p-2 px-4 h-11.5 mb-6 bg-bg text-fg border-input border"
            placeholder="••••••••"
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />

          <Show when={submission.error}>
            <p class="text-sm text-red-400">{submission.error.message}</p>
          </Show>

          <button
            class="bg-primary text-primary-fg font-semibold rounded-sm h-11.5 w-full mt-2"
            type="submit"
            disabled={submission.pending}
          >
            {submission.pending ? "Logging in..." : "Log in"}
          </button>

          <p class="text-sm text-muted-fg mt-4">
            Don't have an account?{" "}
            <a href="/register" class="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
