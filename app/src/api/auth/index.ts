import bcrypt from 'bcrypt';
import { generateKeyPair, createPrivateKey, KeyObject } from 'crypto';
import Electron from 'electron';
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { Db } from '../../lib/db';
import type { User } from '../../models';

const passphrase = 'one who has eaten the fruit and tasted its mysteries';
let keys: { privateKey: null | KeyObject; publicKey: null | string } = {
    privateKey: null,
    publicKey: null
}

if (!fs.existsSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys'))) {
    fs.mkdirSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys'), { recursive: true });
}

if (
    fs.existsSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'private.pem')) &&
    fs.existsSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'public.pem'))
) {
    const privatePem = fs.readFileSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'private.pem'), 'utf-8');
    const publicPem = fs.readFileSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'public.pem'), 'utf-8');
    keys.privateKey = createPrivateKey({ key: privatePem, format: 'pem', passphrase });
    keys.publicKey = publicPem;
} else {
    generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'one who has eaten the fruit and tasted its mysteries'
        }
    }, (error, publicKey, privatekey) => {
        if (error) throw error;
        fs.writeFileSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'public.pem'), publicKey, 'utf-8');
        fs.writeFileSync(path.join(Electron.app.getPath('userData'), 'phoster', 'keys', 'private.pem'), privatekey, 'utf-8');
        keys.privateKey = createPrivateKey({ key: privatekey, format: 'pem', passphrase });
        keys.publicKey = publicKey;
    });
}

export function AuthRouter(db: Db): express.Router {
    const router = express.Router();

    router.post('/register', async (req, res) => {
        const { username, password } = req.body as { username: string, password: string };
        if (!username) return res.status(400).send({ error: 'username missing' });
        if (!password) return res.status(400).send({ error: 'password missing' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        try {
            await db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash]);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            if (message.match(/UNIQUE constraint failed/)) return res.status(409).send({ error: 'username already exists' });
            return res.status(500).send({ error: 'error creating user', message });
        }

        return res.status(201).send({ username, password: hash });
    });

    router.post('/log-in', async (req, res) => {
        const { username, password } = req.body as { username: string, password: string };
        if (!username) return res.status(400).send({ error: 'username missing' });
        if (!password) return res.status(400).send({ error: 'password missing' });

        let user: User;
        try {
            user = await new Promise(resolve => {
                db.get<User>(`SELECT * FROM users WHERE username = ?`, [username], (error, row) => {
                    if (error) throw error;
                    resolve(row);
                });
            })
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error logging in', message });
        }

        if (!user) return res.status(401).send({ error: 'error logging in', message: 'invalid login credentials' });
        if (!await bcrypt.compare(password, user.password)) return res.status(401).send({ error: 'error logging in', message: 'invalid login credentials' });

        // generate jwt
        jwt.sign({ username }, keys.privateKey!, { algorithm: 'RS256' }, (error, token) => {
            if (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : 'an unknown error has occurred';
                return res.status(500).send({ error: 'error logging in', message });
            }
            return res.status(200).send({ token });
        });
    });

    router.get('/authenticate', async (req, res) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(401).send({ error: 'unauthorized' });

        let decoded: any;

        try {
            decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, keys.publicKey!, { algorithms: ['RS256'] }, (error, decoded) => {
                    if (error) reject(error);
                    resolve(decoded);
                });
            });
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error verifying token', message });
        }

        if (!decoded) return res.status(401).send({ error: 'unauthorized' });
        if (!decoded.username) return res.status(401).send({ error: 'unauthorized' });

        const { username } = decoded;
        return res.status(200).send({ authenticated: true, username });
    });

    return router;
}

export function Gateway(db: Db): express.Router {
    const router = express.Router();

    router.use(async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).send({ error: 'unauthorized' });

        let decoded: any;

        try {
            decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, keys.publicKey!, { algorithms: ['RS256'] }, (error, decoded) => {
                    if (error) reject(error);
                    resolve(decoded);
                });
            });
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error verifying token', message });
        }

        if (!decoded) return res.status(401).send({ error: 'unauthorized' });
        if (!decoded.username) return res.status(401).send({ error: 'unauthorized' });

        const { username } = decoded;

        db.get<User>(`SELECT * FROM users WHERE username = ?`, [username], (error, row) => {
            if (error) {
                console.error(error);
                const message = error instanceof Error ? error.message : 'an unknown error has occurred';
                return res.status(500).send({ error: 'error verifying token', message });
            } else {
                req.user = row;
                next();
            }
        });
    });

    return router;
}