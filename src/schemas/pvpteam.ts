import * as z from "zod/v4";
import { Logical, Physical, type World } from "../models";

// /pvpteam
const params = z.object({
  q: z.string(),
  worldname: z
    .union([
      z.enum(Physical),
      z.enum(Logical),
      z.string<World | `${Physical}` | `${Logical}`>(),
    ])
    .optional(),
  cf_public: z.boolean().optional(),
  order: z.number().min(1).max(4).optional(),
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
              val.match(/lodestone\/pvpteam\/(\S+)\//)?.[1].trim() ?? val.trim()
          )
          .pipe(z.string())
          .meta({
            selector: "a.entry__block",
            attribute: "href",
            regex: /lodestone\/pvpteam\/(\S+)\//.source,
          }),
        name: z.string().meta({ selector: "p.entry__name" }),
        server: z.object({
          dc: z.string().meta({ selector: "p.entry__world" }),
        }),
        crest: z.array(z.url()).meta({
          selector: "div.entry__freecompany__crest__image > img",
          attribute: "src",
        }),
      })
    )
    .meta({ selector: "div.pvpteams > div" }),
});

// /pvpteam/:id
const profile = z.object({
  name: z.string().meta({ selector: "h2.entry__pvpteam__name--team" }),
  server: z.object({
    dc: z.string().meta({ selector: "p.entry__pvpteam__name--dc" }),
  }),
  crest: z.array(z.url()).meta({
    selector: "div.entry__pvpteam__crest img:not([class])",
    attribute: "src",
  }),
  formed_at: z
    .string()
    .transform((val) => {
      const match = val.match(/ldst_strftime\((\d+)/);
      return match ? parseInt(match[1], 10) * 1000 : val;
    })
    .pipe(z.coerce.date())
    .meta({
      selector: "p.entry__pvpteam__data--formed > script",
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
        avatar: z.url().meta({
          selector: "div.entry__chara__face > img",
          attribute: "src",
        }),
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
            name: z.string().meta({
              selector:
                "ul.entry__pvpteam__member__info > li:not(:has(i.list__ic__class)):first-of-type > span",
            }),
            icon: z.url().meta({
              selector:
                "ul.entry__pvpteam__member__info > li:not(:has(i.list__ic__class)):first-of-type > img",
              attribute: "src",
            }),
          })
          .nullable()
          .default(null),
        matches: z.coerce.number().default(0).meta({
          selector:
            "ul.entry__pvpteam__member__info > li:not(:has(i.list__ic__class)):last-of-type > span",
        }),
      })
    )
    .meta({ selector: "div.pvpteam__member > div.entry" }),
});

export default { params, entries, profile } as const;
