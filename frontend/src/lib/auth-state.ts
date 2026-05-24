/**
 * Pure module — no "use server" directive.
 *
 * Holds the `AuthState` shape and `initialAuthState` constant used by
 * useActionState() in every auth form. They cannot live in actions/auth.ts
 * because Next.js 16 requires "use server" files to export only async
 * functions.
 */
export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialAuthState: AuthState = { status: "idle" };
