import { Module } from '@nestjs/common';
import { ClientModule } from './presentation/client/client.module';
import { TariffModule } from './presentation/tariff/tariff.module';
import { CategoryModule } from './presentation/category/category.module';
import { PledgeModule } from './presentation/pledge/pledge.module';

@Module({
  imports: [ClientModule, TariffModule, CategoryModule, PledgeModule],
  controllers: [],
  providers: []
})
export class AppModule {}
