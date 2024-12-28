/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = NexVoo.deploy ? '0.0.0.0' : 'localhost';
await app.listen(NexVoo.port, listeningHost);

const logger = new Logger('App');

logger.log(`NexVoo Server is running in [${NexVoo.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${NexVoo.port}`);
logger.log(`And the public server should be recognized as ${NexVoo.baseUrl}`);
