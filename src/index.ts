import type * as z from "zod/v4";
import { Client, type InferPaginated } from "./client";
import { Endpoint } from "./endpoint";
import type { Locale } from "./models";
import character from "./schemas/character";
import cwls from "./schemas/cwls";
import freecompany from "./schemas/freecompany";
import linkshell from "./schemas/linkshell";
import pvpteam from "./schemas/pvpteam";

export class Nodestone extends Client {
  /** @since 1.0.0 */
  public readonly character = new Endpoint(this, {
    path: "/character",
    schemas: character,
    hook: ({ client, path, schemas }) => ({
      get achievements() {
        const schema = schemas.columns.achievement;
        return client.paginate(`${path}/achievement`, schema) as InferPaginated<
          typeof schema
        >;
      },
      async classjobs(overrides?: Omit<NodestoneOptions, "pages">) {
        const doc = await client.req(`${path}/class_job`, overrides);
        if (!doc) return null;

        const data = client.parse(doc, schemas.columns.class_job);
        return data || null;
      },
      async emotes(overrides?: Omit<NodestoneOptions, "pages">) {
        const doc = await client.req(`${path}/emote`, overrides);
        if (!doc) return null;

        const data = client.parse(doc, schemas.columns.emote);
        return data || null;
      },
      async facewear(overrides?: Omit<NodestoneOptions, "pages">) {
        const doc = await client.req(`${path}/faceaccessory`, overrides);
        if (!doc) return null;

        const data = client.parse(doc, schemas.columns.faceaccessory);
        return data || null;
      },
      async gearset(overrides?: Omit<NodestoneOptions, "pages">) {
        type Item = z.output<typeof schemas.columns.equipment>;

        const items: Item[] = [];
        for (let i = 0; i <= 13; i++) {
          if (i === 5) continue; // skipping belts, was removed in 6.0

          const dom = await client.req(`${path}/equipment/${i}`, overrides);
          if (!dom) continue;

          const parsed = client.parse(dom, schemas.columns.equipment);
          if (parsed) items.push(parsed);
        }

        return items;
      },
      async mounts(overrides?: Omit<NodestoneOptions, "pages">) {
        const doc = await client.req(`${path}/mount`, overrides);
        if (!doc) return null;

        const data = client.parse(doc, schemas.columns.mount);
        return data || null;
      },
      async minions(overrides?: Omit<NodestoneOptions, "pages">) {
        const doc = await client.req(`${path}/minion`, overrides);
        if (!doc) return null;

        const data = client.parse(doc, schemas.columns.minion);
        return data || null;
      },
    }),
  });

  /** @since 1.0.0 */
  public readonly cwls = new Endpoint(this, {
    path: "/crossworld_linkshell",
    schemas: cwls,
  });

  /** @since 1.0.0 */
  public readonly freecompany = new Endpoint(this, {
    path: "/freecompany",
    schemas: freecompany,
    hook: ({ client, path, schemas }) => ({
      get members() {
        const schema = schemas.columns.member;
        return client.paginate(`${path}/member`, schema) as InferPaginated<
          typeof schema
        >;
      },
    }),
  });

  /** @since 1.0.0 */
  public readonly linkshell = new Endpoint(this, {
    path: "/linkshell",
    schemas: linkshell,
  });

  /** @since 1.0.0 */
  public readonly pvpteam = new Endpoint(this, {
    path: "/pvpteam",
    schemas: pvpteam,
  });
}

export interface NodestoneOptions {
  /** Custom `fetch` implementation (e.g. for testing, proxies, or custom middleware). */
  fetch?: typeof fetch;

  /**
   * [The Lodestone](https://na.finalfantasyxiv.com/lodestone) region localization.
   * @default "na"
   */
  locale?: Locale | `${Locale}`;

  /**
   * Max pages to fetch for paginated requests.
   * @default 20
   */
  pages?: number;

  /** Signal to cancel in-flight HTTP requests and active streams. */
  signal?: AbortSignal;

  /**
   * Custom app identifier appended to the `User-Agent` header for telemetry.
   * @example "HonoAPI/1.0.0"
   */
  tag?: string;

  /**
   * Request timeout in milliseconds.
   * @default 10_000
   */
  timeout?: number;

  /**
   * Enable verbose logging for debugging.
   * @default false
   */
  verbose?: boolean;
}

export * from "./models";
