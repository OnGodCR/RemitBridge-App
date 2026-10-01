import type { ComponentType } from 'react';

import {
  ArrivalArt,
  BankArt,
  BasicsArt,
  ChainArt,
  FeeMarkupArt,
  ObservatoryArt,
  ProviderArt,
  ScamCheckArt,
} from '@/components/illustrations';
import type { ModuleId } from '@/data/modules';

/** Each Learn module's drawing (DECISIONS.md D103, D104). */
export const MODULE_ART: Record<ModuleId, ComponentType<{ size?: number }>> = {
  basics: BasicsArt,
  cost: FeeMarkupArt,
  arrival: ArrivalArt,
  safety: ScamCheckArt,
  bigger: ObservatoryArt,
  banks: BankArt,
  provider: ProviderArt,
  crypto: ChainArt,
};
