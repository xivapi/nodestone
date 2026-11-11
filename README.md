# @xivapi/nodestone

[![npm version](https://badge.fury.io/js/@xivapi%2Fnodestone.svg)](https://badge.fury.io/js/@xivapi%2Fnodestone)
![NPM License](https://img.shields.io/npm/l/%40xivapi%2Fnodestone)

A JavaScript/TypeScript client for interacting with [The Lodestone], providing access to all endpoints through a consistent, Zod-driven schemas. Designed for server-side and edge runtimes in mind.

If you need help or run into any issues, please [open an issue](https://github.com/xivapi/nodestone/issues) on GitHub or join the [Discord] for support.

## Installation

```bash
npm install @xivapi/nodestone # or pnpm/yarn/bun/deno
```

## Examples

```ts
import { Nodestone } from "@xivapi/nodestone";

const client = new Nodestone();
const char = await client.character.get(12345678);

console.log(char.name); // string
console.log(await char.mounts()); // object[]

const params = { q: "John Finalfantasyxiv" };
const entries = await client.character.search(params);

console.log(entries.all()); // []
console.log(entries.get(1)); // {}
```

<!-- Not sure to keep or not! -->
<!-- Check out [our examples directory](/examples) for ready-to-use snippets covering **Hono**, **Express**, **Fastify**, **Node.js**, **Deno**, and **Bun**. -->

## Attribution

All _Final Fantasy XIV_ assets, including data accessed via the [The Lodestone][The Lodestone], are the intellectual property of &copy; [SQUARE ENIX CO., LTD.](https://www.square-enix.com/). This project is not affiliated with or endorsed by Square Enix.

## Contributing

Thanks for your interest in contributing! We welcome contributions of all kinds, including bug fixes, new features, documentation improvements, and translations.

For details on getting started, coding standards, and submitting PRs, please refer to our [Contributor Manual](/CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](/packages/nodestone/LICENSE) for details.

[The Lodestone]: https://na.finalfantasyxiv.com/lodestone/
[Discord]: https://discord.gg/MFFVHWC
