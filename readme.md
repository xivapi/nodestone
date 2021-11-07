# Nodestone

Easy to use Node Lodestone parser.

## How to use

### Inside your own server

```shell
yarn
yarn run express:start
```

The server will then listen on port 8080 by default.

### Inside Cloud Run

```shell
gcloud builds submit --tag gcr.io/<your image name> && gcloud beta run deploy --image gcr.io/<your image name>
```

### Inside your Node.JS project

```shell
yarn add @xivapi/nodestone
```

```js
const character = await this.characterParser.parse({ params: { characterId: id } } as any);
console.log(character);
```

The Node.JS API will be changed later on so you don't have to provide this mock request.
