import { describe, expect, it } from "vitest";
import { Nodestone } from "../../src";

describe("/character", () => {
  const client = new Nodestone();
  const id = "29193229";

  describe("/", () => {
    it("successfully performs a paginated search for characters", async () => {
      const stream = client.character.search({
        q: "John Finalfantasyxiv",
        worldname: "_region_2",
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
    it("successfully fetches character profile", async () => {
      const profile = await client.character.get(id);

      expect(profile).not.toBeNull();
      expect(profile?.name).toBeDefined();
    });

    it("returns null for a non-existent character ID", async () => {
      const result = await client.character.get("0");
      expect(result).toBeNull();
    });
  });

  describe("/:id/:column", () => {
    it("equipment", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile) {
        expect(typeof profile.gearset).toBe("function");
        const gear = await profile.gearset();

        expect(Array.isArray(gear)).toBe(true);
        if (gear.length > 0) expect(gear[0]).toHaveProperty("name");
      }
    }, 10000);

    it("class_job", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile) {
        expect(typeof profile.classjobs).toBe("function");
        const classjobs = await profile.classjobs();

        expect(classjobs).not.toBeNull();
        expect(Array.isArray(classjobs?.jobs)).toBe(true);
        expect(Array.isArray(classjobs?.field_operations)).toBe(true);
        expect(Array.isArray(classjobs?.phantom_jobs)).toBe(true);
      }
    }, 7000);

    it("achievement", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile?.achievements) {
        expect(typeof profile.achievements.all).toBe("function");

        const items = await profile.achievements.all({ pages: 2 });
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(70);
        expect(typeof items[0]?.name).toBe("string");
      }
    });

    it("emote", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile?.emotes) {
        expect(typeof profile.emotes).toBe("function");
        const column = await profile.emotes();
        expect(column === null || typeof column === "object").toBe(true);
      }
    });

    it("faceaccessory", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile?.facewear) {
        expect(typeof profile.emotes).toBe("function");
        const column = await profile.facewear();
        expect(column === null || typeof column === "object").toBe(true);
      }
    });

    it("minion", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile?.minions) {
        expect(typeof profile.minions).toBe("function");
        const column = await profile.minions();
        expect(column === null || typeof column === "object").toBe(true);
      }
    });

    it("mount", async () => {
      const profile = await client.character.get(id);
      expect(profile).not.toBeNull();

      if (profile?.mounts) {
        expect(typeof profile.mounts).toBe("function");
        const column = await profile.mounts();
        expect(column === null || typeof column === "object").toBe(true);
      }
    });
  });
});
