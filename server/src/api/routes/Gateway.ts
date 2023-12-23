import crypto from 'crypto';
import express from 'express';
import { Db } from 'mongodb';

export function GatewayRouter(db: Db): express.Router {
    const router = express.Router();

    router.use(async (req, res, next) => {
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
            next();
        }
    });

    return router;
};