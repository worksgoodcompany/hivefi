import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import axios from 'axios';

interface AgniPoolData {
  address: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  tvlUSD: number;
  volume24h: number;
  apr: number;
}

interface AgniStats {
  tvl: number;
  volume24h: number;
  pools: AgniPoolData[];
}

const CACHE_DURATION = 30 * 1000; // 30 seconds
let statsCache: { data: AgniStats | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

function isCacheValid(): boolean {
  return Date.now() - statsCache.timestamp < CACHE_DURATION;
}

async function fetchAgniStats(): Promise<AgniStats> {
  if (isCacheValid() && statsCache.data) {
    return statsCache.data;
  }

  try {
    const response = await axios.get('https://api.agni.finance/v1/stats');
    const stats: AgniStats = {
      tvl: response.data.tvl,
      volume24h: response.data.volume24h,
      pools: response.data.pools
        .sort((a: AgniPoolData, b: AgniPoolData) => b.tvlUSD - a.tvlUSD)
        .slice(0, 5)
    };

    statsCache = {
      data: stats,
      timestamp: Date.now()
    };

    return stats;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Agni stats: ${error.message}`);
    }
    throw new Error('Failed to fetch Agni stats');
  }
}

export const agniProvider: Provider = {
  async get(_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> {
    try {
      const stats = await fetchAgniStats();

      return [
        'Agni Protocol Statistics:',
        '',
        `• Total Value Locked: $${stats.tvl.toLocaleString()}`,
        `• 24h Trading Volume: $${stats.volume24h.toLocaleString()}`,
        '',
        'Top Liquidity Pools:',
        ...stats.pools.map((pool, i) =>
          `${i + 1}. ${pool.token0.symbol}/${pool.token1.symbol}` +
          `\n   TVL: $${pool.tvlUSD.toLocaleString()}` +
          `\n   24h Volume: $${pool.volume24h.toLocaleString()}` +
          `\n   APR: ${pool.apr.toFixed(2)}%`
        ),
        '',
        'Data updates every 30 seconds.'
      ].join('\n');
    } catch (error) {
      return `Error fetching Agni data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
};
