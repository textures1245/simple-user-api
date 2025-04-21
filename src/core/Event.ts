import type { IDomainEvent } from "@/interface/IEvent";

export type EVENT_METADATA_TYPES = "type" | "aggregateName" | "aggregateId";

export const EVENT_METADATA_KEYS = ["type", "aggregateName", "aggregateId"];

export abstract class DomainEvent implements IDomainEvent {
  abstract type: string;
  abstract aggregateName: string;
  public aggregateId: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
  }
}
