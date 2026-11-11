import * as z from "zod/v4";
import { Logical, Physical, type World } from "../models";

// /freecompany
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
  activities: z.number().min(-1).max(8).optional(),
  roles: z
    .enum({
      Tank: 16,
      Healer: 17,
      DPS: 18,
      Crafter: 19,
      Gatherer: 20,
      "Not specified": -1,
    })
    .optional(),
  activetime: z.number().min(1).max(3).optional(),
  join: z.boolean().optional(),
  house: z.number().min(0).max(2).optional(),
  gcid: z.number().min(0).max(3).optional(),
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
          .transform((val) => val.match(/(\d+)/)?.[0].trim() ?? val.trim())
          .pipe(z.string())
          .meta({
            selector: "a.entry__block",
            attribute: "href",
            regex: /(\d+)/.source,
          }),
        name: z.string().meta({ selector: "p.entry__name" }),
        server: z
          .string()
          .transform((val) => {
            const match = val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/);
            return match?.groups as { world: string; dc: string };
          })
          .pipe(z.object({ world: z.string(), dc: z.string() }))
          .meta({
            selector: "p.entry__world:last-of-type",
            regex: /^(?<world>.+?)\s*\[(?<dc>.*?)\]$/.source,
          }),
        crest: z.array(z.url()).meta({
          selector: "div.entry__freecompany__crest__image > img",
          attribute: "src",
        }),
        grand_company: z
          .string()
          .transform(
            (val) =>
              val.match(/(?<name>\D+) <(?<rank>\D+)>/)?.groups ?? val.trim()
          )
          .pipe(z.object({ name: z.string(), rank: z.string() }))
          .meta({
            selector: "p.entry__world",
            regex: /(?<name>\D+) <(?<rank>\D+)>/.source,
          }),
        active: z
          .string()
          .transform((val) => {
            const match = val.match(/^[^:]+:\s*(.+)$/);
            return match ? match[1].trim() : val.trim();
          })
          .pipe(z.string())
          .meta({
            selector: "ul.entry__freecompany__fc-active li:first-of-type",
            regex: /^[^:]+:\s*(.+)$/.source,
          }),
        recruitment: z
          .string()
          .transform((val) => {
            const match = val.match(/^[^:]+:\s*(.+)$/);
            return match ? match[1].trim() : val.trim();
          })
          .pipe(z.string())
          .meta({
            selector: "ul.entry__freecompany__fc-active li:last-of-type",
            regex: /^[^:]+:\s*(.+)$/.source,
          }),
        members: z.coerce
          .number()
          .meta({ selector: "li.entry__freecompany__fc-member" }),
        estate: z
          .string()
          .meta({ selector: "li.entry__freecompany__fc-housing" }),
        formed_at: z
          .string()
          .transform((val) => {
            const match = val.match(/ldst_strftime\((\d+)/);
            return match ? parseInt(match[1], 10) * 1000 : val;
          })
          .pipe(z.coerce.date())
          .meta({
            selector: "li.entry__freecompany__fc-day > script",
            regex: /ldst_strftime\((\d+)/.source,
          }),
      })
    )
    .meta({ selector: "div.freecompanies > div" }),
});

// /freecompany/:id
const profile = z.object({
  name: z.string().meta({ selector: "h2.entry__name" }),
  server: z
    .string()
    .transform((val) => val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/)?.groups)
    .pipe(z.object({ world: z.string(), dc: z.string() }))
    .meta({
      selector: "p.entry__world:last-of-type",
      regex: /^(?<world>.+?)\s*\[(?<dc>.*?)\]$/.source,
    }),
  slogan: z.string().meta({ selector: "p.freecompany__text:first-of-type" }),
  tag: z
    .string()
    .transform((val) => val.match(/«(\S+)»/)?.[1].trim() ?? val.trim())
    .pipe(z.string())
    .meta({
      selector: "p.freecompany__text > span.freecompany__text__tag",
      regex: /«(\S+)»/.source,
    }),
  formed_at: z
    .string()
    .transform((val) => {
      const match = val.match(/ldst_strftime\((\d+)/);
      return match ? parseInt(match[1], 10) * 1000 : val;
    })
    .pipe(z.coerce.date())
    .meta({
      selector: "p.freecompany__text > script",
      regex: /ldst_strftime\((\d+)/.source,
    }),
  stats: z.object({
    members: z
      .string()
      .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
      .pipe(z.coerce.number())
      .meta({
        selector: "p.freecompany__text:nth-child(15)",
        regex: /(\d+)/.source,
      }),
    rank: z
      .string()
      .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
      .pipe(z.coerce.number())
      .meta({
        selector: "p.freecompany__text:nth-child(17)",
        regex: /(\d+)/.source,
      }),
    rankings: z.object({
      weekly: z
        .string()
        .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
        .pipe(z.coerce.number())
        .meta({
          selector: "table.character__ranking__data tr:nth-child(1) > td",
          regex: /(\d+)/.source,
        }),
      monthly: z
        .string()
        .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
        .pipe(z.coerce.number())
        .meta({
          selector: "table.character__ranking__data tr:nth-child(2) > td",
          regex: /(\d+)/.source,
        }),
    }),
  }),
  grand_company: z.object({
    selected: z
      .string()
      .transform((val) => val.match(/^(\D+) <\D+>/)?.[1].trim() ?? val.trim())
      .pipe(z.string())
      .meta({
        selector: "p.entry__world:first-of-type",
        regex: /^(\D+) <\D+>/.source,
      }),
    reputation: z
      .array(
        z.object({
          name: z
            .string()
            .meta({ selector: "p.freecompany__reputation__gcname" }),
          icon: z.url().meta({
            selector: "div.freecompany__reputation__icon > img",
            attribute: "src",
          }),
          rank: z
            .string()
            .meta({ selector: "p.freecompany__reputation__rank" }),
        })
      )
      .meta({ selector: "div.freecompany__reputation" }),
  }),
  estate: z
    .object({
      name: z.string().meta({ selector: "p.parts__text:nth-child(26)" }),
      address: z.string().meta({ selector: "p.parts__text:nth-child(28)" }),
      greeting: z
        .string()
        .meta({ selector: "p.freecompany__estate__greeting" }),
    })
    .nullable()
    .default(null),
  recruitment: z.object({
    active: z.string().meta({ selector: "p.freecompany__text:nth-child(33)" }),
    recruitment: z.string().meta({ selector: "span.freecompany__recruitment" }),
    focus: z
      .array(
        z.object({
          name: z.string().meta({ selector: "p" }),
          icon: z.url().meta({ selector: "div > img", attribute: "src" }),
        })
      )
      .meta({
        selector: 'ul.freecompany__focus_icon > li:not([class*="off"])',
      }),
    seeking: z
      .array(
        z.object({
          name: z.string().meta({ selector: "img", attribute: "alt" }),
          icon: z.url().meta({ selector: "img", attribute: "src" }),
        })
      )
      .meta({ selector: "ul.freecompany__seeking_icon > li" }),
  }),
});

// /freecompany/:id/:key
const columns = {
  member: z.object({
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
          rank: z.object({
            name: z.string().meta({
              selector: "ul.entry__chara_info > li:first-of-type > span",
            }),
            icon: z.url().meta({
              selector: "ul.entry__chara_info > li:first-of-type > img",
              attribute: "src",
            }),
          }),
        })
      )
      .meta({ selector: "div.freecompany_characters li.entry" }),
  }),
};

export default { params, entries, profile, columns } as const;
