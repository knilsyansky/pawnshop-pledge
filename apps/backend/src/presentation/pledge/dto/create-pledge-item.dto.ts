export class CreatePledgeItemDto {
  categoryId!: string;
  name!: string;
  estimatedValue!: number;
  specifications!: Record<string, unknown>;
}
