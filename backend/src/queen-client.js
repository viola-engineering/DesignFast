/**
 * Queen MQ client singleton using the official queen-mq package.
 */
import { Queen } from 'queen-mq';

const queenUrl = (process.env.QUEEN_URL || 'http://localhost:6632').replace(/\/$/, '');

const queen = new Queen({ url: queenUrl, handleSignals: false });

export default queen;
