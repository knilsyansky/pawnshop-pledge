import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './presentation/client/client.module';
import { TariffModule } from './presentation/tariff/tariff.module';
import { CategoryModule } from './presentation/category/category.module';
import { PledgeModule } from './presentation/pledge/pledge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env',
      ],
    }),
    ClientModule, TariffModule, CategoryModule, PledgeModule],
  controllers: [],
  providers: []
})
export class AppModule {}
