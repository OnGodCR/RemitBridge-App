/** The two Deno globals the Edge Functions use, for typechecking them with tsc. */
declare const Deno: {
  env: { get(key: string): string | undefined }
  serve(handler: (req: Request) => Response | Promise<Response>): void
}
