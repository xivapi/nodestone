import * as z from "zod/v4";
import { Logical, Physical, Race, Tribe, type World } from "../models";

// /character
const params = z.object({
  q: z.string(),
  worldname: z
    .union([
      z.enum(Physical),
      z.enum(Logical),
      z.string<World | `${Physical}` | `${Logical}`>(),
    ])
    .optional(),
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
          .transform((val) => val.match(/(\d+)/)?.[0].trim() ?? val.trim())
          .pipe(z.string())
          .meta({
            selector: "a.entry__chara__link",
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
          .transform((val) => {
            const match = val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/);
            return match?.groups as { world: string; dc: string };
          })
          .pipe(z.object({ world: z.string(), dc: z.string() }))
          .meta({
            selector: "p.entry__world",
            regex: /^(?<world>.+?)\s*\[(?<dc>.*?)\]$/.source,
          }),
        languages: z
          .string()
          .transform((val) => val.split("/"))
          .pipe(z.array(z.string()))
          .meta({ selector: "div.entry__chara__lang" }),
      })
    )
    .meta({ selector: "div.characters > div" }),
});

// /character/:id
const profile = z.object({
  name: z.string().meta({ selector: "p.frame__chara__name" }),
  avatar: z.url().meta({
    selector: "div.frame__chara__face > img",
    attribute: "src",
  }),
  portrait: z
    .url()
    .meta({
      selector: "div.character__detail__image img",
      attribute: "src",
    })
    .optional(),
  server: z
    .string()
    .transform((val) => val.match(/^(?<world>.+?)\s*\[(?<dc>.*?)\]$/)?.groups)
    .pipe(z.object({ world: z.string(), dc: z.string() }))
    .meta({
      selector: "p.frame__chara__world",
      regex: /^(?<world>.+?)\s*\[(?<dc>.*?)\]$/.source,
    }),
  title: z.string().meta({ selector: "p.frame__chara__title" }),
  bio: z
    .string()
    .default("-")
    .meta({ selector: "div.character__character_profile" }),
  identity: z
    .string()
    .transform((val) => {
      const groups = val.match(
        new RegExp(
          `^(?<race>${Object.keys(Race).join("|")})(?<clan>${Object.keys(Tribe).join("|")}) / (?<gender>\\W)`
        )
      )?.groups;

      return {
        ...groups,
        gender: groups?.gender === "♀" ? "Female" : "Male",
      };
    })
    .pipe(
      z.object({
        race: z.string(),
        clan: z.string(),
        gender: z.literal(["Male", "Female"]),
      })
    )
    .meta({
      selector: "div.character-block:nth-child(2) p.character-block__profile",
      regex: `^(?<race>${Object.keys(Race).join("|")})(?<clan>${Object.keys(Tribe).join("|")}) / (?<gender>\\W)`,
    }),
  nameday: z.string().meta({ selector: "p.character-block__birth" }),
  guardian: z
    .string()
    .meta({ selector: "p.character-block__profile:nth-of-type(4)" }),
  citystate: z.string().meta({
    selector: "div.character-block:nth-child(4) p.character-block__profile",
  }),
  grand_company: z
    .object({
      name: z
        .string()
        .transform((val) => val.match(/(\D+) \/ \D+/)?.[1].trim() ?? val.trim())
        .pipe(z.string())
        .meta({
          selector:
            "div.character-block:nth-of-type(4) p.character-block__profile",
          regex: /(\D+) \/ \D+/.source,
        }),
      rank: z.object({
        name: z
          .string()
          .transform(
            (val) => val.match(/\D+ \/ (\D+)/)?.[1].trim() ?? val.trim()
          )
          .pipe(z.string())
          .meta({
            selector:
              "div.character-block:nth-of-type(4) p.character-block__profile",
            regex: /\D+ \/ (\D+)/.source,
          }),
        icon: z.url().meta({
          selector: "div.character-block:nth-of-type(4) > img",
          attribute: "src",
        }),
      }),
    })
    .nullable()
    .default(null),
  free_company: z
    .object({
      id: z
        .string()
        .transform(
          (val) =>
            val.match(/lodestone\/freecompany\/(\S+)\//)?.[1].trim() ??
            val.trim()
        )
        .pipe(z.string())
        .meta({
          selector: 'a.entry__freecompany[href*="/freecompany/"]',
          attribute: "href",
          regex: /lodestone\/freecompany\/(\S+)\//.source,
        }),
      name: z.string().meta({
        selector:
          'a.entry__freecompany[href*="/freecompany/"] div.character__freecompany__name > h4',
      }),
      crest: z.url().array().meta({
        selector:
          'a.entry__freecompany[href*="/freecompany/"] div.character__freecompany__crest__image > img',
        attribute: "src",
      }),
    })
    .nullable()
    .default(null),
  /* v8 ignore next -- @preserve */
  pvp_team: z
    .object({
      id: z
        .string()
        .transform(
          (val) =>
            val.match(/lodestone\/pvpteam\/(\S+)\//)?.[1].trim() ?? val.trim()
        )
        .pipe(z.string())
        .meta({
          selector: 'a.entry__freecompany[href*="/pvpteam/"]',
          attribute: "href",
          regex: /lodestone\/pvpteam\/(\S+)\//.source,
        }),
      name: z.string().meta({
        selector:
          'a.entry__freecompany[href*="/pvpteam/"] div.character__freecompany__name > h4',
      }),
      crest: z.url().array().meta({
        selector:
          'a.entry__freecompany[href*="/pvpteam/"] div.character__freecompany__crest__image > img',
        attribute: "src",
      }),
    })
    .nullable()
    .default(null),
  stats: z
    .array(
      z.object({
        type: z.string().meta({ selector: "p.character__param__text" }),
        value: z.coerce.number().meta({ selector: "span" }),
      })
    )
    .meta({ selector: "ul.character__param div" }),
  attributes: z
    .array(
      z
        .string()
        .transform((val) => {
          const groups = val.match(/^(?<type>\D+)(?<value>\d+)/)?.groups;
          return {
            type: groups?.type.trim() as string,
            value: Number(groups?.value),
          };
        })
        .pipe(z.object({ type: z.string(), value: z.number() }))
    )
    .meta({
      selector: "table.character__param__list tr",
      regex: /^(?<type>\D+)(?<value>\d+)/.source,
    }),
});

// /character/:id/:key
const columns = {
  achievement: z.object({
    score: z.coerce.number().meta({ selector: "p.achievement__point > span" }),
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
                  .match(
                    /lodestone\/character\/\d+\/achievement\/detail\/(\d+)/
                  )?.[1]
                  .trim() ?? val.trim()
            )
            .pipe(z.coerce.number())
            .meta({
              selector: "a",
              attribute: "href",
              regex: /lodestone\/character\/\d+\/achievement\/detail\/(\d+)/
                .source,
            }),
          name: z
            .string()
            .transform((val) => val.match(/"(\D+)"/)?.[1].trim() ?? val.trim())
            .pipe(z.string())
            .meta({
              selector: "p.entry__activity__txt",
              regex: /"(\D+)"/.source,
            }),
          icon: z.url().meta({ selector: "img", attribute: "src" }),
          obtained_at: z
            .string()
            .transform((val) => {
              const match = val.match(/ldst_strftime\((\d+)/);
              return match ? parseInt(match[1], 10) * 1000 : val;
            })
            .pipe(z.coerce.date())
            .meta({
              selector: "time.entry__activity__time > script",
              regex: /ldst_strftime\((\d+)/.source,
            }),
        })
      )
      .meta({ selector: "div.ldst__bg li.entry" }),
  }),
  class_job: z.object({
    jobs: z
      .array(
        z.object({
          name: z
            .string()
            .transform(
              (val) => val.match(/^([^[(]+)/)?.[1].trim() ?? val.trim()
            )
            .pipe(z.string())
            .meta({
              selector: "div.character__job__name",
              regex: /^([^[(]+)/.source,
            }),
          level: z.coerce
            .number()
            .meta({ selector: "div.character__job__level" }),
          exp: z
            .string()
            .transform((val) => {
              const groups = val.match(
                /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/
              )?.groups;

              return Object.fromEntries(
                /* v8 ignore start -- @preserve */
                Object.entries(groups ?? {}).map(([key, str]) => {
                  const digits = str.replace(/\D/g, "");
                  return [key, digits ? parseInt(digits, 10) : 0];
                })
                /* v8 ignore stop -- @preserve */
              );
            })
            .pipe(
              z.object({
                current: z.number().default(0),
                max: z.number().default(0),
              })
            )
            .meta({
              selector: "div.character__job__exp",
              regex: /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/.source,
            }),
        })
      )
      .meta({
        selector:
          "div.ldst__bg > div.character__job__role:nth-of-type(-n + 6) li",
      }),
    field_operations: z
      .array(
        z.object({
          name: z.string().meta({ selector: "div.character__job__name-sp" }),
          level: z.coerce
            .number()
            .meta({ selector: "div.character__job__level" }),
          exp: z
            .string()
            .transform((val) => {
              const groups = val.match(
                /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/
              )?.groups;
              return Object.fromEntries(
                Object.entries(groups ?? {}).map(([key, str]) => {
                  const digits = str.replace(/\D/g, "");
                  return [key, digits ? parseInt(digits, 10) : 0];
                })
              );
            })
            .pipe(
              z.object({
                current: z.number().default(0),
                max: z.number().default(0),
              })
            )
            .meta({
              selector: "div.character__job__exp",
              regex: /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/.source,
            }),
        })
      )
      .meta({
        selector:
          "div.ldst__bg > div.character__job__role:has(div.character__job__name-sp)",
      }),
    phantom_jobs: z
      .array(
        z.object({
          name: z.string().meta({ selector: "p.character__support_job__name" }),
          level: z
            .string()
            .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
            .pipe(z.coerce.number())
            .meta({
              selector: "p.character__support_job__level",
              regex: /(\d+)/.source,
            }),
          mastered: z
            .string()
            .pipe(z.coerce.boolean())
            .optional()
            .meta({ selector: "p.character__support_job__master" }),
          exp: z
            .string()
            .transform((val) => {
              const groups = val.match(
                /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/
              )?.groups;
              return Object.fromEntries(
                Object.entries(groups ?? {}).map(([key, str]) => {
                  const digits = str.replace(/\D/g, "");
                  return [key, digits ? parseInt(digits, 10) : 0];
                })
              );
            })
            .pipe(z.object({ current: z.number(), max: z.number() }))
            .optional()
            .meta({
              selector: "p.character__support_job__exp",
              regex: /^(?<current>[\d,. ]+) \/ (?<max>[\d,. ]+)/.source,
            }),
        })
      )
      .meta({ selector: "div.character__support_job li" }),
  }),
  emote: z
    .array(
      z.object({
        id: z.string().meta({ selector: "span[id]", attribute: "id" }),
        name: z.string().meta({ selector: "span.emote__name" }),
        icon: z.url().meta({ selector: "img", attribute: "src" }),
      })
    )
    .meta({
      selector: "div.character__emote > ul.emote__list > li",
    }),
  equipment: z.object({
    name: z
      .string()
      .meta({ selector: "h1.db-view__header__detail__item-name" }),
    icon: z.url().meta({
      selector: "img.db-view__header__item-image--icon",
      attribute: "src",
    }),
    category: z
      .string()
      .meta({ selector: "h2.db-view__header__detail__category-name" }),
    ilvl: z
      .string()
      .transform(
        (val) => val.match(/(?<level>\d+)/)?.groups?.level.trim() ?? val.trim()
      )
      .pipe(z.coerce.number())
      .meta({
        selector: "h3.db-view__item-level",
        regex: /(?<level>\d+)/.source,
      }),
    equip: z.object({
      class: z
        .string()
        .transform((val) => val.match(/\b[A-Z]{3}\b/g) ?? [val])
        .pipe(z.array(z.string()))
        .meta({
          selector: "div.db-view__item-equip-text p:nth-of-type(1)",
          regex: /\b[A-Z]{3} \b/g.source,
        }),
      level: z
        .string()
        .transform((val) => val.match(/(\d+)/)?.[1].trim() ?? val.trim())
        .pipe(z.coerce.number())
        .meta({
          selector: "div.db-view__item-equip-text p:nth-of-type(2)",
          regex: /(\d+)/.source,
        }),
    }),
    attributes: z.object({
      main: z
        .array(
          z.object({
            type: z.string().meta({ selector: "dt" }),
            value: z.coerce.number().meta({ selector: "dd" }),
          })
        )
        .meta({
          selector:
            "div.db-view__item-info dl.db-view__item-info__list--main-status",
        }),
      bonus: z
        .array(
          z.object({
            type: z.string().meta({ selector: "span.name" }),
            value: z.coerce.number().meta({ selector: "span.value" }),
          })
        )
        .meta({
          selector:
            "div.db-view__item-info ul.db-view__item-info__list--bonuses > li",
        }),
      effect: z
        .array(
          z
            .string()
            /* v8 ignore start -- @preserve */
            .transform((val) => {
              const groups = val.match(/^(?<type>\D+) (?<value>\W\d+)/)?.groups;
              return {
                type: groups?.type.trim() as string,
                value: Number(groups?.value),
              };
            })
            /* v8 ignore stop -- @preserve */
            .pipe(z.object({ type: z.string(), value: z.number() }))
        )
        .meta({
          selector: "div.db-view__series_bonus li",
          regex: /^(?<type>\D+) (?<value>\W\d+)/.source,
        })
        .optional(),
    }),
    materia: z.array(z.object({})).optional().meta({
      selector: "div.db-view__item-info ul.character-item__materia-list > li",
    }),
    flags: z.object({
      repair: z.object({
        req: z
          .string()
          .transform((val) => {
            const groups = val.match(/(?<class>\D+) \D+ (?<level>\d+)/)?.groups;
            return {
              class: groups?.class.trim() as string,
              level: Number(groups?.level),
            };
          })
          .pipe(z.object({ class: z.string(), level: z.number() }))
          .meta({
            selector:
              "div.db-view__item-info__table--craft_repair tr:nth-of-type(3) > td",
            regex: /(?<class>\D+) \D+ (?<level>\d+)/.source,
          }),
        material: z.string().meta({
          selector:
            "div.db-view__item-info__table--craft_repair tr:nth-of-type(4) > td",
        }),
      }),
      extractable: z
        .string()
        .transform((val) => /\b(?:yes|ja|oui|はい)\b|○/.test(val.toLowerCase()))
        .pipe(z.boolean())
        .meta({
          selector:
            "ul.db-view__item-info__craft_repair > li:nth-of-type(1) > span",
          regex: /\b(?:yes|ja|oui|はい)\b|○/.source,
        }),
      projectable: z
        .string()
        .transform((val) => /\b(?:yes|ja|oui|はい)\b|○/.test(val.toLowerCase()))
        .pipe(z.boolean())
        .meta({
          selector:
            "ul.db-view__item-info__craft_repair > li:nth-of-type(2) > span",
          regex: /\b(?:yes|ja|oui|はい)\b|○/.source,
        }),
      desynthesizable: z
        .string()
        .transform((val) => /\b(?:yes|ja|oui|はい)\b|○/.test(val.toLowerCase()))
        .pipe(z.boolean())
        .meta({
          selector:
            "ul.db-view__item-info__craft_repair > li:nth-of-type(3) > span",
          regex: /\b(?:yes|ja|oui|はい)\b|○/.source,
        }),
      dyeable: z
        .string()
        .transform((val) => /\b(?:yes|ja|oui|はい)\b|○/.test(val.toLowerCase()))
        .pipe(z.boolean())
        .meta({
          selector:
            "ul.db-view__item-info__craft_repair > li:nth-of-type(4) > span",
          regex: /\b(?:yes|ja|oui|はい)\b|○/.source,
        }),
    }),
  }),
  faceaccessory: z
    .array(
      z.object({
        id: z.string().meta({ selector: "span[id]", attribute: "id" }),
        name: z.string().meta({ selector: "span.faceaccessory__name" }),
        icon: z.url().meta({ selector: "img", attribute: "src" }),
      })
    )
    .meta({
      selector: "div.character__emote > ul.emote__list > li",
    }),
  minion: z
    .array(
      z.object({
        id: z.string().meta({ selector: "span[id]", attribute: "id" }),
        name: z.string().meta({ selector: "span.minion__name" }),
        icon: z.url().meta({ selector: "img", attribute: "src" }),
      })
    )
    .meta({
      selector: "div.character__minions li, ul.minion__list > li",
    }),
  mount: z
    .array(
      z.object({
        id: z.string().meta({ selector: "span[id]", attribute: "id" }),
        name: z.string().meta({ selector: "span.mount__name" }),
        icon: z.url().meta({ selector: "img", attribute: "src" }),
      })
    )
    .meta({
      selector: "div.character__minions > ul.mount__list > li",
    }),
};

export default { params, entries, profile, columns } as const;
