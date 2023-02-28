import * as fs from 'fs';
import { join } from 'path';
import { getConnection } from 'typeorm';

global.beforeEach(() => {
  try {
    fs.unlinkSync(join(__dirname, '..', 'db-test.sqlite'));
  } catch (error) {
    console.log(error);
  }
});

global.afterEach(async () => {
  try {
    const conn = getConnection();
    await conn.close();
  } catch (error) {
    console.log(error);
  }
});
