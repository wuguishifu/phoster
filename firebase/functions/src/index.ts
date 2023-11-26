import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from "firebase-functions/logger";
import { onRequest } from 'firebase-functions/v2/https';

const app = admin.initializeApp(functions.config().firebase);
const firestore = app.firestore();

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    const userRef = firestore.doc(`users/${uid}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
        await userRef.set({ email, invitations: [], joined: [] });
        logger.info(`User with email ${email} created.`);
    }
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
    const { uid, email } = user;
    const userRef = firestore.doc(`users/${uid}`);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
        await userRef.delete();
        logger.info(`User with email ${email} deleted.`);
    }
});

export const sendInvitation = onRequest({ timeoutSeconds: 5 }, async (req, res) => {
    const { user_id, server_id, other_id } = req.body;
    if (!user_id || !server_id || !other_id || typeof user_id !== 'string' || typeof server_id !== 'string' || typeof other_id !== 'string') {
        res.status(400).send('Invalid request body. Must include user_id, server_id, and other_id.');
        return;
    }

    logger.info(`Sending invitation from user ${user_id} to user ${other_id} for server ${server_id}.`);

    const serverRef = firestore.doc(`servers/${server_id}`);
    const otherRef = firestore.doc(`users/${other_id}`);
    const [serverSnapshot, otherSnapshot] = await Promise.all([serverRef.get(), otherRef.get()]);

    if (!serverSnapshot.exists) {
        return void res.status(404).send(`Server ${server_id} not found.`);
    }

    if (!otherSnapshot.exists) {
        return void res.status(404).send(`User ${other_id} not found.`);
    }

    if (!(serverSnapshot.data()?.owner === user_id)) {
        return void res.status(404).send(`Server ${server_id} not found.`);
    }

    if (otherSnapshot.data()?.joined?.includes(server_id)) {
        return void res.status(409).send(`User ${other_id} is already a member of server ${server_id}.`);
    }

    await otherRef.update({ invitations: admin.firestore.FieldValue.arrayUnion(server_id) });
    res.status(200).send('Invitation sent.');
});

export const acceptInvitation = onRequest({ timeoutSeconds: 5 }, async (req, res) => {
    const { user_id, server_id } = req.body;
    if (!user_id || !server_id || typeof user_id !== 'string' || typeof server_id !== 'string') {
        res.status(400).send('Invalid request body. Must include user_id and server_id.');
        return;
    }

    logger.info(`Accepting invitation from user ${user_id} for server ${server_id}.`);

    const serverRef = firestore.doc(`servers/${server_id}`);
    const userRef = firestore.doc(`users/${user_id}`);
    const [serverSnapshot, userSnapshot] = await Promise.all([serverRef.get(), userRef.get()]);

    if (!serverSnapshot.exists) {
        return void res.status(404).send(`Server ${server_id} not found.`);
    }

    if (!userSnapshot.exists) {
        return void res.status(404).send(`User ${user_id} not found.`);
    }

    if (!(userSnapshot.data()?.invitations?.includes(server_id))) {
        return void res.status(409).send(`User ${user_id} has not been invited to server ${server_id}.`);
    }

    await Promise.all([
        serverRef.update({ members: admin.firestore.FieldValue.arrayUnion(user_id) }),
        userRef.update({
            invitations: admin.firestore.FieldValue.arrayRemove(server_id),
            joined: admin.firestore.FieldValue.arrayUnion(server_id)
        })
    ]);

    res.status(200).send('Invitation accepted.');
});