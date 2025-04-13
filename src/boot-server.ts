import { INestApplication } from '@nestjs/common';

import { Transport } from '@nestjs/microservices';

export const bootMicroservice = async (app: INestApplication) => {
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: process.env.INTERNAL_SERVER_PORT,
    },
  });

  await app.startAllMicroservices();
};
