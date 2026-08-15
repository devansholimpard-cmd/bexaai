declare module "serverless-http" {
  import type { RequestHandler } from "express";
  export default function serverless(app: RequestHandler): (event: unknown, context: unknown) => Promise<unknown>;
}
