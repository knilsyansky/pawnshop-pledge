import { CreatePledgeItemDto } from './create-pledge-item.dto';

export class CreatePledgeDto {
  clientId!: number;
  tariffId!: string;
  items!: CreatePledgeItemDto[];
}
