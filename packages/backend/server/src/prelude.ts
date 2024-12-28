import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultNexVooConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const NexVoo_CONFIG_PATH = process.env.NexVoo_CONFIG_PATH ?? configDir;
  // Initializing NexVoo config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(NexVoo_CONFIG_PATH, '.env'),
  });

  // 2. generate NexVoo default config and assign to `globalThis.NexVoo`
  globalThis.NexVoo = getDefaultNexVooConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/NexVoo.env`
  // 3. load env => config map to `globalThis.NexVoo.ENV_MAP
  await loadRemote(NexVoo_CONFIG_PATH, 'NexVoo.env.js');

  // 4. load `config/NexVoo` to patch custom configs
  await loadRemote(NexVoo_CONFIG_PATH, 'NexVoo.js');

  // 5. load `config/NexVoo.self` to patch custom configs
  // This is the file only take effect in [NexVoo Cloud]
  if (!NexVoo.isSelfhosted) {
    await loadRemote(NexVoo_CONFIG_PATH, 'NexVoo.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.NexVoo`
  applyEnvToConfig(globalThis.NexVoo);

  if (NexVoo.node.dev) {
    console.log(
      'NexVoo Config:',
      JSON.stringify(omit(globalThis.NexVoo, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
