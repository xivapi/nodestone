import * as z from "zod/v4";
import { Physical } from "../models";

// /crossworld_linkshell
const params = z.object({
  q: z.string(),
  dcname: z.enum(Physical).optional(),
  classjob: z
    .union([
      z.templateLiteral([
        "_class_",
        z.literal(["TANK", "HEALER", "DPS", "CRAFTER", "GATHERER"]),
      ]),
      z.number().min(1).max(43),
    ])
    .optional(),
  race_tribe: z
    .union([
      z.templateLiteral(["race_", z.number().min(1).max(8)]),
      z.templateLiteral(["tribe_", z.number().min(1).max(16)]),
    ])
    .optional(),
  gcid: z.number().min(0).max(3).optional(),
  blog_lang: z.enum(["ja", "en", "de", "fr"]).optional(),
  order: z.number().min(1).max(8).optional(),
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
              val
                .match(/lodestone\/crossworld_linkshell\/(\S+)\//)?.[1]
                .trim() ?? val.trim()
          )
          .pipe(z.string())
          .meta({
            selector: "a",
            attribute: "href",
            regex: /lodestone\/crossworld_linkshell\/(\S+)\//.source,
          }),
        name: z.string().meta({ selector: "div > h4" }),
        server: z.object({
          region: z.string().meta({ selector: "li:first-of-type" }),
        }),
        members: z.coerce.number().meta({ selector: "li:last-of-type > span" }),
      })
    )
    .meta({ selector: "div.linkshells > div" }),
});

// /crossworld_linkshell/:id
const profile = z.object({
  name: z.string().meta({ selector: "p.frame__cwls__name" }),
  server: z.object({
    region: z.string().meta({ selector: "span.frame__cwls__world" }),
  }),
  formed_at: z
    .string()
    .transform((val) => {
      const match = val.match(/ldst_strftime\((\d+)/);
      return match ? parseInt(match[1], 10) * 1000 : val;
    })
    .pipe(z.coerce.date())
    .meta({
      selector: "span.frame__cwls__formed > script",
      regex: /ldst_strftime\((\d+)/.source,
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
    .meta({ selector: "div.linkshell_characters div.entry__bg" }),
});

export default { params, entries, profile } as const;
