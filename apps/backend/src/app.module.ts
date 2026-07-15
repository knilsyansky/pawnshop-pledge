import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { TariffModule } from './tariff/tariff.module';
import { CategoryModule } from './category/category.module';
import { PledgeModule } from './pledge/pledge.module';

@Module({
  imports: [ClientModule, TariffModule, CategoryModule, PledgeModule],
  controllers: [],
  providers: []
})
export class AppModule {}
