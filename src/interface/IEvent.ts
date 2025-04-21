export interface IDomainEvent {
  aggregateName: string;
  aggregateId: string;
  type: string;
}
