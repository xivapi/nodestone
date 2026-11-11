import { describe, expect, it } from "vitest";
import { Nodestone } from "../../src";

describe("/pvpteam", () => {
  const client = new Nodestone();

  describe("/", () => {
    it("successfully performs a paginated search for pvpteams", async () => {
      const stream = client.pvpteam.search({
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
        expect(Array.isArray(results.value)).toBeTruthy();
      }
    });
  });

  describe("/:id", () => {
    it("successfully fetches pvpteam profile", async () => {
      const profile = await client.pvpteam.get(
        "49a0cf59d705b76a3c60ba60bcc25f041092786d"
      );

      expect(profile).not.toBeNull();
      expect(profile?.name).toBeDefined();

      const members = profile?.members;
      expect(Array.isArray(members)).toBeTruthy();
      expect(members?.length).toBeGreaterThanOrEqual(1);
      expect(typeof members?.[0].id).toBe("string");
    });

    it("returns null for a non-existent pvpteam ID", async () => {
      const result = await client.pvpteam.get("0");
      expect(result).toBeNull();
    });
  });
});
