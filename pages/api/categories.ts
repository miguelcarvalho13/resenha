import type { NextApiRequest, NextApiResponse } from 'next'
import Category from '../../models/category';
import FirebaseService from '../../services/firebase';

type Data = {
  categories: Category[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      return getCategories();
    case 'POST':
      return createCategory();
    default:
      return res.status(405).end(`Method ${req.method} NOT ALLOWED`)
  }

  async function getCategories() {
    // const db = FirebaseService.database();
    // const ref = db.ref('categories');
    // const values = await ref.once('value').then((s) => s.val());
    // console.log('####:', values);
    // console.log('####key:', ref.key);

    const firestore = FirebaseService.firestore();
    const users = (await firestore.collection('users').get()).docs;
    console.log('####:', users);

    return res.status(200).json({ categories: [] });;
  }

  function createCategory() {

    return res.status(200).json({ categories: [] });
  }
}
