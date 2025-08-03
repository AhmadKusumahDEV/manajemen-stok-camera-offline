import { createDatabse } from '../database/db';
import { cateogryId } from '../types/type';

export const getAllCategory = async (): Promise<cateogryId[]> => {
  const db = await createDatabse();
  let temp: cateogryId[] = [];
  const [result] = await db.executeSql('SELECT * from category');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      name: result.rows.item(i).name,
      id: result.rows.item(i).id,
    });
  }
  return temp;
};

export const getAllCategorycustom = async (): Promise<{ label: string, value: string }[]> => {
  const db = await createDatabse();
  let temp: { label: string, value: string }[] = [];
  const [result] = await db.executeSql('SELECT * from category');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      label: result.rows.item(i).name,
      value: result.rows.item(i).id,
    });
  }
  return temp;
};
