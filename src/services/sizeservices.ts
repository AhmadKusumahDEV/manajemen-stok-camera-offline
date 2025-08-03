import { createDatabse } from '../database/db';

export const getAllSize = async (): Promise<{ label: string, value: string }[]> => {
  const db = await createDatabse();
  let temp: { label: string, value: string }[] = [];
  const [result] = await db.executeSql('SELECT * from size');
  for (let i = 0; i < result.rows.length; i++) {
    temp.push({
      label: result.rows.item(i).name,
      value: result.rows.item(i).id,
    });
  }
  return temp;
};
