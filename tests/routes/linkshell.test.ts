import { describe, expect, it } from "vitest";
import { Nodestone } from "../../src";

describe("/linkshell", () => {
  const client = new Nodestone();

  describe("/", () => {
    it("successfully performs a paginated search for linkshells", async () => {
      const stream = client.linkshell.search({
        q: "",
        worldname: "_region_2",
        order: 2, // old to new
      });

      expect(stream).toBeDefined();
      expect(typeof stream.all).toBe("function");
      expect(typeof stream.page).toBe("number");
      expect(typeof stream.pages).toBe("number");
      if (stream.total) expect(typeof stream.total).toBe("number");

      const results = await stream.next();
      if (!results.done && results.value) {
        expect(Array.isArray(results.value)).toBe(true);
      }
    });
  });

  describe("/:id", () => {
    it("successfully fetches linkshell profile", async () => {
      const profile = await client.linkshell.get("4503599627379805");

      expect(profile).not.toBeNull();
      expect(profile?.name).toBeDefined();
    });

    it("returns null for a non-existent linkshell ID", async () => {
      const result = await client.linkshell.get("0");
      expect(result).toBeNull();
    });
  });
});
