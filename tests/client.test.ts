import { Document, parseHTML } from "linkedom";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod/v4";
import { Nodestone } from "../src";

// These tests mock global fetch to isolate the client and avoid overloading The Lodestone.
describe("Client", () => {
  describe("init", () => {
    it("can initialize without options", () => {
      expect(() => new Nodestone()).not.toThrow();
    });

    it("can initialize with options", () => {
      expect(
        () => new Nodestone({ locale: "jp", verbose: true })
      ).not.toThrow();
    });
  });

  const client = new Nodestone();

  describe("request handler", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("throws a validation error when the path parameter is not a string", async () => {
      // @ts-expect-error - path must be a string
      await expect(client.req(0)).rejects.toThrow();
    });

    it("returns null when a target endpoint returns a 404 Not Found status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 404,
          statusText: "Not Found",
          ok: false,
        })
      );

      const dom = await client.req("/non-existent-endpoint-xyz");
      expect(dom).toBeNull();
    });

    it("successfully fetches and parses a valid endpoint into an HTML Document instance", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          statusText: "OK",
          ok: true,
          text: async () => "<html><body><div>Lodestone</div></body></html>",
        })
      );

      const dom = await client.req("/");
      expect(dom).not.toBeNull();
      expect(dom).toBeInstanceOf(Document);
    });

    it("throws a specific maintenance error when encountering a 503 Service Unavailable response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 503,
          statusText: "Service Unavailable",
          ok: false,
        })
      );

      await expect(client.req("/")).rejects.toThrow(
        "Lodestone is undergoing maintenance. Please try again later."
      );
    });

    it("throws a detailed server error when encountering a general 5xx status code", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 500,
          statusText: "Internal Server Error",
          ok: false,
        })
      );

      await expect(client.req("/")).rejects.toThrow(
        "Lodestone server error (500: Internal Server Error)."
      );
    });

    it("handles request timeouts and abortion gracefully with a user-friendly message", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(async (_, { signal }) => {
          await new Promise((_, reject) => {
            signal.addEventListener("abort", () => {
              const err = new Error("Aborted");
              err.name = "AbortError";
              reject(err);
            });
          });
        })
      );

      await expect(client.req("/", { timeout: 10 })).rejects.toThrow(
        "Request was aborted. Please check your network connection and try again."
      );
    });

    it("executes successfully with verbose mode and performance tracking enabled", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          statusText: "OK",
          ok: true,
          text: async () => "<html><body>Verbose test</body></html>",
        })
      );

      const dom = await client.req("/", { verbose: true });
      expect(dom).not.toBeNull();
    });
  });

  describe("parse schema", () => {
    it("successfully extracts and validates data using metadata selectors", () => {
      const html = "<html><body><p class='title'>Hello World</p></body></html>";
      const dom = parseHTML(html).document;

      const schema = z.string().meta({ selector: "p.title" });
      const result = client.parse(dom, schema);

      expect(result).toBe("Hello World");
    });

    it("throws error if not metadata is provided", () => {
      const html = "<html><body><p class='title'>Hello World</p></body></html>";
      const dom = parseHTML(html).document;

      const schema = z.string();
      expect(() => client.parse(dom, schema)).toThrow(TypeError);
    });

    it("returns undefined or handles missing elements", () => {
      const html =
        "<html><body><div>No matching element here</div></body></html>";
      const dom = parseHTML(html).document;

      const schema = z.string().optional().meta({ selector: "p.missing" });
      const result = client.parse(dom, schema);

      expect(result).toBeUndefined();
    });
  });
});
