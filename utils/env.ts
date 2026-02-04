import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export function loadEnv() {
  const currentEnvPath = path.resolve(process.cwd(), 'env/current.env');
  dotenv.config({ path: currentEnvPath });

  const activeEnv = process.env.ACTIVE_ENV || 'uat';
  const envFilePath = path.resolve(process.cwd(), `env/${activeEnv}.env`);

  if (!fs.existsSync(envFilePath)) {
    throw new Error(`Env file not found: ${envFilePath}`);
  }

  dotenv.config({ path: envFilePath });
}
