import { PowerBase } from './PowerBase.js';

// Used whenever powers are disabled. Every hook is inherited as a no-op,
// guaranteeing zero behavior change to gameplay when powers are off.
export class NoOpPower extends PowerBase {}
