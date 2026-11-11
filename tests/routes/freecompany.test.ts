import { describe, expect, it } from "vitest";
import { Nodestone } from "../../src";

describe("/freecompany", () => {
  const client = new Nodestone();
  const id = "9236460623271821312";

  describe("/", () => {
    it("successfully performs a paginated search for freecompanies", async () => {
      const stream = client.freecompany.search({
        q: "",
        worldname: "_region_2",
        order: 2,
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
    it("successfully fetches freecompany profile", async () => {
      const profile = await client.freecompany.get(id);

      expect(profile).not.toBeNull();
      expect(profile?.name).toBeDefined();
    });

    it("returns null for a non-existent freecompany ID", async () => {
      const result = await client.freecompany.get("0");
      expect(result).toBeNull();
    });
  });

  describe("/:id/:column", () => {
    it("member", async () => {
      const profile = await client.freecompany.get(id);
      expect(profile).not.toBeNull();

      if (profile?.members) {
        expect(typeof profile.members.all).toBe("function");

        const chars = await profile.members.all({ pages: 2 });
        expect(Array.isArray(chars)).toBe(true);
        expect(typeof chars[0]?.name).toBe("string");
      }
    });
  });
});
