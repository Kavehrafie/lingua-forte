/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		user: import("better-auth").User | null;
		session: import("better-auth").Session | null;
	}
}

declare namespace Cloudflare {
	interface Env {
		ADMIN_EMAIL: string;
		NOREPLY_EMAIL: string;
	}
}

// Fontsource variable fonts are CSS-only side-effect imports with no TS types.
declare module "@fontsource-variable/newsreader";
declare module "@fontsource-variable/inter-tight";
