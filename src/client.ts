import Bottleneck from "bottleneck";
import consola from "consola";
import { Document, parseHTML } from "linkedom";
import pc from "picocolors";
import { runtime } from "std-env";
import * as z from "zod/v4";
import pkg from "../package.json" with { type: "json" };
import type { NodestoneOptions } from ".";

const limiter = new Bottleneck({
  id: `${pkg.name}_${pkg.version}`,
  maxConcurrent: 10,
  minTime: 50, // in milliseconds
});

export type NumberResolvable = string | number;

export type InferSchema<T extends z.ZodType> =
  | T
  | z.core.ZodStandardJSONSchemaPayload<T>;

export type RequestOptions = {
  params?: { page?: number };
  [key: string]: unknown;
} & NodestoneOptions;

export type InferItem<T> =
  z.infer<T> extends { items: (infer U)[] }
    ? U
    : z.infer<T> extends readonly unknown[]
      ? z.infer<T>[number]
      : unknown;

export type InferPaginated<T> = {
  all: (overrides?: RequestOptions) => Promise<InferItem<T>[]>;
  page: number;
  pages: number;
  total: number | undefined;
} & AsyncGenerator<InferItem<T>[], InferItem<T>[]>;

export class Client {
  public readonly logger = consola.withTag(pkg.name);

  /**
   * Initializes a new instance of the Nodestone client.
   * @param {NodestoneOptions} [options] Default request configuration overrides.
   */
  public constructor(public readonly options: NodestoneOptions = {}) {}

  /**
   * Parses a HTML Document or Element against a Zod schema using declarative selectors.
   * @param {Document | Element} dom The DOM container extract from.
   * @param {InferSchema<z.ZodType>} schema A Zod type schema or standard JSON schema payload containing metadata selectors.
   * @returns {z.infer<z.ZodType> | undefined} The Zod parsed output data, or `undefined` if parsing fails.
   * @throws An {@link TypeError} if the provided schema contains unsupported types.
   */
  public parse<T extends z.ZodType>(
    dom: Document | Element,
    schema: InferSchema<T>
  ): z.infer<T> | undefined {
    if (!(schema instanceof z.ZodType)) schema = z.fromJSONSchema(schema) as T;
    const meta = z.globalRegistry.get(schema);

    if (
      meta?.selector &&
      schema.type !== "array" &&
      schema.type !== "object" &&
      schema.type !== "record"
    ) {
      const node = dom.querySelector(meta.selector as string);
      if (!node) return undefined;

      const raw = meta.attribute
        ? node.getAttribute(String(meta.attribute))?.trim()
        : node.textContent.trim();

      const parsed = schema.safeParse((raw ?? "") as z.output<T>);
      return parsed.success ? parsed.data : undefined;
    }

    switch (schema.type) {
      /* v8 ignore start -- @preserve */ // piping is only used to santinaize json outputs
      case "pipe": {
        const inner = (schema as unknown as z.ZodPipe).def.in;
        const outer = (schema as unknown as z.ZodPipe).def.out;

        const result = this.parse(dom, inner as z.ZodType);
        if (result === undefined) return undefined;

        const parsed = z.safeParse(outer, result);
        return parsed.success ? (parsed.data as z.output<T>) : undefined;
      }
      /* v8 ignore stop -- @preserve */
      case "nullable":
      case "optional":
      case "default": {
        const unwrapped = (schema as unknown as z.ZodDefault).unwrap();
        const result = this.parse(dom, unwrapped as z.ZodType);

        if (result !== undefined) return result as z.output<T>;
        if (schema instanceof z.ZodDefault) {
          return schema.def.defaultValue as z.output<T>;
        }

        return undefined;
      }
      case "array": {
        if (!meta?.selector) return undefined;
        const nodes = Array.from(dom.querySelectorAll(meta.selector as string));
        const inner = (schema as unknown as z.ZodArray).unwrap();

        const def = inner._zod.def;
        if (def.type === "object" || def.type === "optional") {
          const results = nodes
            .map((node) => this.parse(node, inner as z.ZodType))
            .filter(
              (value): value is NonNullable<typeof value> => value !== undefined
            );

          return results.length > 0 ? (results as z.output<T>) : undefined;
        }

        const results = nodes.map((node) => {
          const value = meta.attribute
            ? node.getAttribute(String(meta.attribute))
            : node.textContent;

          if (value === null || value === undefined) return undefined;

          const parsed = z.safeParse(inner, value.trim());
          return parsed.success ? parsed.data : undefined;
        });

        return results.length > 0 ? (results as z.output<T>) : undefined;
      }
      case "object": {
        const entries = Object.entries((schema as unknown as z.ZodObject).shape)
          .map(([key, value]) => [key, this.parse(dom, value as z.ZodType)])
          .filter(
            ([_, value]) =>
              value !== undefined && (!Array.isArray(value) || value.length > 0)
          );

        return entries.length > 0 ? Object.fromEntries(entries) : undefined;
      }
    }

    throw TypeError(
      `${schema.type} is unsupported or does not contain metadata. If you believe this is an error, please report it at ${pkg.bugs}.`
    );
  }

  /**
   * Executes an asynchronous generator stream on [The Lodestone](https://na.finalfantasyxiv.com/lodestone).
   * @param {string | NumberResolvable[]} path The pathname to target.
   * @param {InferSchema<z.ZodType>} schema The Zod validation schema representing list items or paginated objects.
   * @param {RequestOptions} [options] Request-specific options overriding client defaults.
   * @returns {InferPaginatedResult<z.ZodType>} An async generator merged with the pagination state.
   * @throws An {@link Error} if request fails, times out, or returns a server error.
   */
  public paginate<
    T extends
      | z.ZodArray<z.ZodType>
      | z.ZodType<{ total?: number; items: unknown[] }>,
  >(
    path: string | NumberResolvable[],
    schema: InferSchema<T>,
    options: RequestOptions = {}
  ): InferPaginated<z.ZodType> {
    if (Array.isArray(path)) path = path.join("/");
    const { params = {} } = options;

    const page = params.page ?? 1;
    const state = {
      page,
      pages: options.pages ?? 20,
      total: undefined as number | undefined,
    };

    async function* generator(client: Client) {
      const results: InferItem<T>[] = [];

      for (let i = page; i <= state.pages; i++, state.page++) {
        const overrides = Object.assign(options, {
          params: { ...params, page: i },
        });

        const dom = await client.req(path, overrides);
        if (!dom || !(dom instanceof Document)) break;

        const data = client.parse(dom, schema) as InferItem<T>;
        if (!data) break;

        // @ts-expect-error 2339
        const entries = Array.isArray(data) ? data : data.items;
        if (!entries || !Array.isArray(entries) || entries.length === 0) break;

        if (
          typeof data === "object" &&
          data !== null &&
          "total" in data &&
          typeof data.total === "number"
        ) {
          if (i === page) {
            state.total = data.total;
            const per = path.includes("achievement") ? 50 : 20;
            const calculated = Math.ceil(data.total / per);
            state.pages =
              options.pages !== undefined
                ? Math.min(options.pages, calculated)
                : calculated;
          }
        }

        yield entries as InferItem<T>[];
        results.push(...entries);

        if (state.total !== undefined && results.length >= state.total) {
          break;
        }
      }

      return results;
    }

    const instance = generator(this) as InferPaginated<T>;
    Object.defineProperties(instance, {
      page: {
        get: () => state.page,
        /* v8 ignore next -- @preserve */
        set: (n: number) => (state.page = n),
        enumerable: true,
      },
      pages: {
        get: () => state.pages,
        /* v8 ignore next -- @preserve */
        set: (n: number) => (state.pages = n),
        enumerable: true,
      },
      total: {
        get: () => state.total,
        /* v8 ignore next -- @preserve */
        set: (n: number) => (state.total = n),
        enumerable: true,
      },
    });

    instance.all = async (overrides?: RequestOptions) => {
      const instance = this.paginate(path, schema, overrides);

      const pages: InferItem<T>[][] = [];
      for await (const page of instance) {
        pages.push(page as InferItem<T>[]);
      }

      return pages.flat();
    };

    return instance;
  }

  /**
   * Executes a rate-limited, tracked HTTP request to [The Lodestone](https://na.finalfantasyxiv.com/lodestone).
   * @param {string | NumberResolvable[]} path The target endpoint pathname.
   * @param {RequestOptions} [options] Request-specific options overriding client defaults.
   * @returns {Promise<Document | null>} A HTML Document, or `null` if a 404 or an error was encountered.
   * @throws An {@link Error} if request fails, times out, or returns a server error.
   */
  public async req(
    path: string | NumberResolvable[],
    options: RequestOptions = {}
  ): Promise<Document | null> {
    if (Array.isArray(path)) path = path.join("/");
    else if (typeof path !== "string") {
      throw new TypeError(`${typeof path} is not a string or string array`);
    }

    const {
      locale = "na",
      fetch: request = fetch,
      params = {},
      signal,
      tag,
      timeout = 10_000,
      verbose = false,
    } = Object.assign(this.options, options);

    const endpoint = `https://${locale}.finalfantasyxiv.com/lodestone/`;
    const uri = new URL(path.replace(/^\//, ""), endpoint);
    uri.search = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();

    // Intentionally restricted to ensure correct telemetry and identification.
    // If users need custom headers, they can supply a wrapped fetch client via options.fetch.
    const headers = {
      "User-Agent": `Mozilla/5.0 (Android 16; Mobile; rv:147.0) Gecko/147.0 Firefox/147.0 (${[
        `+${runtime}`,
        typeof tag === "string" && tag.trim() ? tag.trim() : undefined,
        `${pkg.name.split("/")[1]}/${pkg.version}`,
        `+${pkg.homepage}`,
      ]
        .filter(Boolean)
        .join("; ")})`,
    };

    return limiter.schedule(async () => {
      const marks = { start: `^${uri.pathname}`, end: `$${uri.pathname}` };

      try {
        /* v8 ignore if -- @preserve */
        if (verbose) {
          this.logger.info(`${pc.bgWhite(` GET `)} ${pc.dim(uri.toString())}`);
        }

        performance.mark(marks.start);
        const res = await request(uri, {
          headers,
          signal: AbortSignal.any([
            AbortSignal.timeout(timeout),
            ...(signal ? [signal] : []),
          ]),
        });

        performance.mark(marks.end);
        const measure = performance.measure(
          uri.pathname,
          ...Object.values(marks)
        );

        /* v8 ignore if -- @preserve */
        if (verbose) {
          const statusText = res.statusText ? ` ${res.statusText}` : "";
          const status = `${res.status}${statusText}`;
          const route = `${pc.dim(">")} ${pc.cyan(uri.pathname)}${pc.dim(uri.search)}`;

          (res.ok ? this.logger.success : this.logger.fail)(
            `${pc.dim(`(${measure.duration.toFixed(0)}ms)`)} ${pc.bgGreen(pc.black(` ${status} `))} ${route}`
          );
        }

        if (res.status === 404) return null;
        if (!res.ok) {
          throw new Error(
            res.status === 503
              ? "Lodestone is undergoing maintenance. Please try again later."
              : res.status >= 500
                ? `Lodestone server error (${res.status}: ${res.statusText}).`
                : `Lodestone request failed (${res.status}: ${res.statusText}).`
          );
        }

        return parseHTML(await res.text()).document;
      } catch (error) {
        throw error instanceof Error && error.name === "AbortError"
          ? new Error(
              "Request was aborted. Please check your network connection and try again."
            )
          : error instanceof Error
            ? error
            : new Error(String(error));
      } finally {
        performance.clearMeasures(uri.pathname);
        Object.values(marks).forEach((mark) => {
          performance.clearMarks(mark);
        });
      }
    });
  }
}
