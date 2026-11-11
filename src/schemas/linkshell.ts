import * as z from "zod/v4";
import { Logical, Physical, type World } from "../models";

// /linkshell
const params = z.object({
  q: z.string(),
  worldname: z
    .union([
      z.enum(Physical),
      z.enum(Logical),
      z.string<World | `${Physical}` | `${Logical}`>(),
    ])
    .optional(),
  character_count: z.literal(["1-10", "11-30", "31-50", "51-"]).optional(),
  cf_public: z.boolean().optional(),
  order: z.number().min(1).max(6).optional(),
  page: z.number().min(1).max(20).optional(),
});

const entries = z.object({
  total: z
    .string()
    .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
    .pipe(z.coerce.number())
    .meta({ selector: "div.parts__fraction", regex: /(\d+)/.source }),
  items: z
    .array(
      z.object({
        id: z
          .string()
          .transform(
            (val) =>
              val.match(/lodestone\/linkshell\/(\d+)\//)?.[1].trim() ??
              val.trim()
          )
          .pipe(z.string())
          .meta({
            selector: "a",
            attribute: "href",
            regex: /lodestone\/linkshell\/(\d+)\//.source,
          }),
        name: z.string().meta({ selector: "h4" }),
        server: z
          .string()
          .transform((val) => {
            const match = val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/);
            return match?.groups as { world: string; dc: string };
          })
          .pipe(z.object({ world: z.string(), dc: z.string() }))
          .meta({
            selector: "li.btn__icon__inner--left",
            regex: /^(?<world>.+?)\s*\[(?<dc>.*?)\]$/.source,
          }),
        members: z.coerce
          .number()
          .meta({ selector: "li.btn__icon__inner--right > span" }),
      })
    )
    .meta({ selector: "div.linkshells > div" }),
});

// /linkshell/:id
const profile = z.object({
  name: z.string().meta({ selector: "p.frame__chara__name" }),
  server: z
    .string()
    .regex(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/)
    .transform((val) => {
      const match = val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/);
      return match?.groups as { world: string; dc: string };
    })
    .pipe(z.object({ world: z.string(), dc: z.string() }))
    .meta({
      selector:
        "div.linkshell_characters > div.entry:first-of-type p.entry__world",
    }),
  members: z
    .array(
      z.object({
        id: z
          .string()
          .transform((val) => val.match(/(\d+)/)?.[0].trim() ?? val.trim())
          .pipe(z.string())
          .meta({
            selector: "a.cf-member-list",
            attribute: "href",
            regex: /(\d+)/.source,
          }),
        name: z.string().meta({ selector: "p.entry__name" }),
        avatar: z
          .url()
          .meta({ selector: "div.entry__chara__face > img", attribute: "src" }),
        server: z
          .string()
          .regex(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/)
          .transform((val) => {
            const match = val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/);
            return match?.groups as { world: string; dc: string };
          })
          .pipe(z.object({ world: z.string(), dc: z.string() }))
          .meta({ selector: "p.entry__world" }),
        rank: z
          .object({
            name: z
              .string()
              .meta({ selector: "li.entry__chara_info__linkshell > span" }),
            icon: z.url().meta({
              selector: "li.entry__chara_info__linkshell > img",
              attribute: "src",
            }),
          })
          .nullable()
          .default(null),
      })
    )
    .meta({ selector: "div.linkshell_characters > div.entry" }),
});

export default { params, entries, profile } as const;
