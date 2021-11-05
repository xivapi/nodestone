import express from 'express';
import {Character} from "./profile/character";
import {Achievements} from "./profile/achievements";


const app = express();

const characterParser = new Character();
const achievementsParser = new Achievements();

app.get('/Character/:characterId', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if ((req.query['columns'] as string)?.indexOf('Bio') > -1) {
        res.set('Cache-Control', 'max-age=3600');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    const character = await characterParser.parse(req, 'Character.');
    const parsed: any = {
        Character: {
            ID: +req.params.characterId,
            ...character
        }
    }
    const additionalData = Array.isArray(req.query.data) ? req.query.data : [req.query.data].filter(d => !!d);
    if (additionalData.includes('AC')) {
        parsed.Achievements = await achievementsParser.parse(req, 'Achievements.');
    }
    return res.status(200).send(parsed);
});

app.listen(3000, () => console.log('Server started. Press Ctrl+C to quit'));