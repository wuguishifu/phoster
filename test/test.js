const { db } = require('./firebase');
const { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where, updateDoc, arrayUnion } = require('firebase/firestore');

(async () => {
    await generateUser('test')
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('a') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('b') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('c') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('d') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('d') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('d') });
    await updateDoc(doc(db, 'users', 'test'), { invitations: arrayUnion('d') });
})().then(() => process.exit(0));

async function generateUser(id) {
    const user = {
        invitations: [],
        joined: []
    };

    const collectionRef = collection(db, 'users');
    const docRef = doc(collectionRef, id);
    await setDoc(docRef, user);
    return docRef;
}