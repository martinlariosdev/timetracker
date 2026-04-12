import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  console.log('Creating app...');
  const app = await NestFactory.create(AppModule);
  const port = 3001;
  console.log('Starting listen on port:', port);
  await app.listen(port);
  console.log('App listening on port:', port);
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
