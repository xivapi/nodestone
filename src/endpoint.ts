import type * as z from "zod/v4";
import type { NodestoneOptions } from ".";
import type {
  Client,
  InferPaginated,
  InferSchema,
  NumberResolvable,
  RequestOptions,
} from "./client";

export type InferSchemas = {
  entries: InferSchema<z.ZodType<{ total?: number; items: unknown[] }>>;
  params: InferSchema<
    z.ZodType<{ q: string; page?: number; [key: string]: unknown }>
  >;
  profile: InferSchema<z.ZodType<{ name: string; [key: string]: unknown }>>;
  columns?: Record<string, InferSchema<z.ZodType>>;
};

export type InferContext<P extends string, T extends InferSchemas> = {
  /** */
  client: Client;
  /** */
  path: `${P}/${NumberResolvable}`; // includes id
  /** */
  schemas: Pick<T, "profile" | "columns">;
};

export type EndpointConfig<
  P extends string,
  T extends InferSchemas,
  E extends Record<string, unknown>,
> = {
  /** */
  path: P;
  /** */
  schemas: T;
  /** */
  hook?: (ctx: InferContext<P, T>) => Awaited<E>;
};

export type InferInstance<T extends InferSchemas, E = unknown> = z.output<
  T["profile"]
> &
  (E extends Record<string, unknown> ? E : Record<string, unknown>);

export class Endpoint<
  P extends string,
  T extends InferSchemas,
  E extends Record<string, unknown>,
> {
  public readonly path: P;
  public readonly schemas: T;
  protected readonly hook?: (ctx: InferContext<P, T>) => Awaited<E>;

  /**
   * Initializes a new instance of a Nodestone endpoint.
   * @param {Client} client The client instance to use for the endpoint.
   * @param {EndpointConfig<P, T, E>} config Configuration options for the endpoint.
   */
  public constructor(
    protected readonly client: Client,
    config: EndpointConfig<P, T, E>
  ) {
    this.path = config.path;
    this.schemas = config.schemas;
    this.hook = config.hook;
  }

  /**
   *
   * @param {NumberResolvable} id
   * @param {Omit<NodestoneOptions, "pages">} [options]
   * @returns {Promise<InferInstance<T, Awaited<E>> | null>}
   */
  public async get(
    id: NumberResolvable,
    options?: Omit<NodestoneOptions, "pages">
  ): Promise<InferInstance<T, Awaited<E>> | null> {
    const doc = await this.client.req([this.path, id], options);
    if (!doc) return null;

    const result = this.client.parse(doc, this.schemas.profile as z.ZodType);
    if (!result) return null;
    else if (!this.schemas.columns || !this.hook) {
      return result as InferInstance<T, never>;
    }

    const { profile, columns } = this.schemas;
    return Object.assign(
      result,
      this.hook({
        client: this.client,
        path: `${this.path}/${id}`,
        schemas: { profile, columns },
      })
    ) as InferInstance<T, Awaited<E>>;
  }

  /**
   *
   * @param {z.input<T["params"]>} params
   * @param {NodestoneOptions} [options]
   * @returns {InferPaginated<T["entries"]>}
   */
  public search(
    params: z.input<T["params"]>,
    options?: NodestoneOptions
  ): InferPaginated<T["entries"]> {
    const overrides = Object.assign(
      { params },
      options
    ) as unknown as RequestOptions;

    return this.client.paginate(
      this.path,
      this.schemas.entries,
      overrides
    ) as InferPaginated<T["entries"]>;
  }
}
