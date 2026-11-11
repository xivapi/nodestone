import { describe, expect, it } from "vitest";
import { Nodestone, Physical } from "../../src";

describe("/crossworld_linkshell", () => {
  const client = new Nodestone();

  describe("/", () => {
    it("successfully performs a paginated search for linkshells", async () => {
      const stream = client.cwls.search({
        q: "",
        dcname: Physical.Japan,
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
      const profile = await client.cwls.get(
        "1ec24a8d9d888cf3c59d9a214263dd2400c5141f"
      );

      expect(profile).not.toBeNull();
      expect(profile?.name).toBeDefined();
    });

    it("returns null for a non-existent linkshell ID", async () => {
      const result = await client.cwls.get("0");
      expect(result).toBeNull();
    });
  });
});
