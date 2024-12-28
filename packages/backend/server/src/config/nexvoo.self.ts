/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for NexVoo Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: NexVoo deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `NexVoo.ts` file.
//    For example, NexVoo Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `NexVoo.ts` file.
//
//    ```
//    if (NexVoo.deploy) {
//      NexVoo.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

NexVoo.metrics.enabled = !NexVoo.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  NexVoo.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  NexVoo.storage.storages.avatar.provider = 'cloudflare-r2';
  NexVoo.storage.storages.avatar.bucket = 'account-avatar';
  NexVoo.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.NexVooassets.com/${key}`;

  NexVoo.storage.storages.blob.provider = 'cloudflare-r2';
  NexVoo.storage.storages.blob.bucket = `workspace-blobs-${
    NexVoo.NexVoo.canary ? 'canary' : 'prod'
  }`;

  NexVoo.storage.storages.copilot.provider = 'cloudflare-r2';
  NexVoo.storage.storages.copilot.bucket = `workspace-copilot-${
    NexVoo.NexVoo.canary ? 'canary' : 'prod'
  }`;
}

NexVoo.plugins.use('copilot', {
  openai: {},
  fal: {},
});
NexVoo.plugins.use('redis');
NexVoo.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
NexVoo.plugins.use('oauth');

if (NexVoo.deploy) {
  NexVoo.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  NexVoo.plugins.use('gcloud');
}
