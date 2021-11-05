import express from 'express';
import {Character} from "./profile/character";
import {Achievements} from "./profile/achievements";


const app = express();

const characterParser = new Character();
const achievementsParser = new Achievements();

app.get('/Character/:characterId', async (req, res) => {
    const character = await characterParser.parse(req);
    const parsed: any = {
        Character: character
    }
    const additionalData = Array.isArray(req.query.data) ? req.query.data : [req.query.data].filter(d => !!d);
    if (additionalData.includes('AC')) {
        parsed.Achievements = await achievementsParser.parse(req);
    }
    return res.status(200).send(parsed);
});

app.listen(3000, () => console.log('Server started. Press Ctrl+C to quit'));
