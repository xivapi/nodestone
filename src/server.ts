import * as express from 'express';
import {Character} from "./profile/character";
import {Achievements} from "./profile/achievements";

const app = express();

const characterParser = new Character();
const achievementsParser = new Achievements();

function getEntriesFromQuery(query: unknown | unknown[]): string[] {
    const entries = Array.isArray(query) ? query as unknown[] : [query];
    return (entries.filter(entry => typeof entry === 'string') as string[])
        .map(entry => entry.split(','))
        .flat();
}

function getColumnsForParser(columns: string | string[], columnsPrefix: string = ''): string[] {
    const columnsArray = Array.isArray(columns) ? columns : [columns];

    return columnsArray.filter(column => column.startsWith(columnsPrefix)).map(column => column.replace(columnsPrefix, ''));
}

app.get('/Character/:characterId', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if ((req.query['columns'] as string)?.indexOf('Bio') > -1) {
        res.set('Cache-Control', 'max-age=3600');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    try {
        const characterId = req.params.characterId;
        const stringColumns = getEntriesFromQuery(req.query.columns);
        const additionalData = getEntriesFromQuery(req.query.data);

        const [character, achievements] = await Promise.all([
            characterParser.get(characterId, getColumnsForParser(stringColumns, 'Character.')),
            additionalData.includes('AC') ? achievementsParser.get(characterId, getColumnsForParser(stringColumns, 'Achievements.')) : Promise.resolve(),
        ] as Promise<(Record<string, unknown> | undefined)>[]);

        const result: Record<string, unknown> = {};
        if (character != null) result.Character = {
            ID: Number.isNaN(Number.parseInt(characterId, 10)) ? characterId : Number.parseInt(characterId, 10),
            ...character,
        };
        if (achievements != null) result.Achievements = achievements

        return res.status(200).send(result);
    } catch (error) {
        if (error instanceof Error && error.message === '404') {
            return res.sendStatus(404)
        }
        return res.status(500).send(error);
    }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
