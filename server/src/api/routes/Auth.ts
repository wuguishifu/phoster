import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcrypt';
import { Db } from 'mongodb';

export function AuthRouter(db: Db): express.Router {
    const router = express.Router();

    router.post('/sign-up', async (req, res) => {
        console.log('sign up', req.body);
        const { username, password } = req.body as { username: string, password: string };
        if (!username) return res.status(400).send({ error: 'username missing' });
        if (!password) return res.status(400).send({ error: 'password missing' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = { username, password_hash: hash };

        let result;
        try {
            result = await db.collection('users').insertOne(user);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            if (message.match(/duplicate key error/)) return res.status(409).send({ error: 'username already exists' });
            return res.status(500).send({ error: 'error creating user', message });
        }

        if (result.acknowledged) return res.status(201).send({ user });
        return res.status(500).send({ error: 'internal server error' });
    });

    router.post('/log-in', async (req, res) => {
        const { username, password } = req.body as { username: string, password: string };
        if (!username) return res.status(400).send({ error: 'username missing' });
        if (!password) return res.status(400).send({ error: 'password missing' });

        let user;
        try {
            user = await db.collection('users').findOne({ username });
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error logging in', message });
        }

        if (!user) return res.status(401).send({ error: 'error logging in', message: 'invalid login credentials' });
        if (!await bcrypt.compare(password, user.password_hash)) return res.status(401).send({ error: 'error logging in', message: 'invalid login credentials' });

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        let result;
        try {
            result = await db.collection('users').updateOne(
                { username },
                {
                    $push: {
                        tokens: {
                            hash: tokenHash,
                            expires_at: expiresAt,
                            ...(process.env.NODE_ENV !== 'production' && { debug: token })
                        }
                    }
                }
            );
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error logging in', message });
        }

        if (result.acknowledged) return res.status(200).send({ username, token });
        return res.status(500).send({ error: 'internal server error' });
    });

    router.get('/authenticate', async (req, res) => {
        const { 'x-username': username, 'x-auth-token': token, 'x-refresh': shouldRefresh = 'false' } = req.headers as { 'x-username': string; 'x-auth-token': string; 'x-refresh'?: string };
        if (!username) return res.status(400).send({ error: 'username missing', authenticated: false });
        if (!token) return res.status(400).send({ error: 'token missing', authenticated: false });

        const hash = crypto.createHash('sha256').update(token).digest('hex');

        let user;
        try {
            user = await db.collection('users').findOne(
                { username, 'tokens.hash': hash },
                { projection: { _id: 1, 'tokens.$': 1 } }
            ) as { _id: string, tokens: [{ expires_at: Date }] } | null;
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error authenticating', message, authenticated: false });
        }

        if (!user) return res.status(401).send({ authenticated: false, message: 'invalid token' });
        if (new Date() > new Date(user.tokens[0].expires_at)) {
            res.status(401).send({ authenticated: false, message: 'token expired' });
            try {
                await db.collection('users').updateOne(
                    { username },
                    { $pull: { tokens: { hash } } }
                );
            } catch (error) {
                console.error(error);
            }
        } else {
            res.status(200).send({ authenticated: true });
            if (shouldRefresh === 'true') {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);
                try {
                    await db.collection('users').updateOne(
                        { username, tokens: { $elemMatch: { hash } } },
                        { $set: { 'tokens.$.expires_at': expiresAt } }
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        }
    });

    router.post('/log-out', async (req, res) => {
        const { 'x-username': username, 'x-auth-token': token } = req.headers as { 'x-username': string, 'x-auth-token': string };
        if (!username) return res.status(400).send({ error: 'username missing', authenticated: false });
        if (!token) return res.status(400).send({ error: 'token missing', authenticated: false });

        const hash = crypto.createHash('sha256').update(token).digest('hex');

        let result;
        try {
            result = await db.collection('users').updateOne(
                { username, 'tokens.hash': hash },
                { $pull: { tokens: { hash } } }
            );
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error authenticating', message, authenticated: false });
        }

        if (result.acknowledged) return res.status(200).send({ acknowledged: true });
        return res.status(500).send({ error: 'internal server error' });
    });

    return router;
};