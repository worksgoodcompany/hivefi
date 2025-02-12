import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import axios from 'axios';

interface IzumiPoolData {
  address: string;
  pair: string;
  tvl: number;
  volume24h: number;
  fee: number;
  apr: number;
}

interface IzumiStats {
  totalTvl: number;
  totalVolume24h: number;
  topPools: IzumiPoolData[];
}

const CACHE_DURATION = 30 * 1000;
let statsCache: { data: IzumiStats | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

function isCacheValid(): boolean {
  return Date.now() - statsCache.timestamp < CACHE_DURATION;
}

async function fetchIzumiStats(): Promise<IzumiStats> {
  if (isCacheValid() && statsCache.data) {
    return statsCache.data;
  }

  try {
    const response = await axios.get('https://api.izumi.finance/mantle/stats');
    const stats: IzumiStats = {
      totalTvl: response.data.tvl,
      totalVolume24h: response.data.volume24h,
      topPools: response.data.pools
        .sort((a: IzumiPoolData, b: IzumiPoolData) => b.tvl - a.tvl)
        .slice(0, 5)
    };

    statsCache = {
      data: stats,
      timestamp: Date.now()
    };

    return stats;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Izumi stats: ${error.message}`);
    }
    throw new Error('Failed to fetch Izumi stats');
  }
}

export const izumiProvider: Provider = {
  async get(_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> {
    try {
      const stats = await fetchIzumiStats();

      return [
        'Izumi Finance Statistics:',
        '',
        `• Total Value Locked: $${stats.totalTvl.toLocaleString()}`,
        `• 24h Trading Volume: $${stats.totalVolume24h.toLocaleString()}`,
        '',
        'Top Liquidity Pools:',
        ...stats.topPools.map((pool, i) =>
          `${i + 1}. ${pool.pair}` +
          `\n   TVL: $${pool.tvl.toLocaleString()}` +
          `\n   24h Volume: $${pool.volume24h.toLocaleString()}` +
          `\n   APR: ${pool.apr.toFixed(2)}%` +
          `\n   Fee: ${pool.fee}%`
        ),
        '',
        'Data updates every 30 seconds.'
      ].join('\n');
    } catch (error) {
      return `Error fetching Izumi data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
};
