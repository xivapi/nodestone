# Nodestone

Easy to use Node Lodestone parser.

## How to use

### Inside your own server

#### Running on Host
```shell
yarn install
yarn run express:start
```

#### Running on Docker Container
```shell
docker build -t nodestone .
docker run -p 8080:8080 nodestone
```

The server will then listen on port 8080 by default.

### Inside Google Cloud Run

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
