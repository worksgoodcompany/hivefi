import type { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Predefined list of tokens to track with correct CoinGecko IDs
const TRACKED_TOKENS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  { id: 'tether', symbol: 'usdt', name: 'Tether' },
  { id: 'mantle', symbol: 'mnt', name: 'Mantle' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB' },
  { id: 'optimism', symbol: 'op', name: 'Optimism' },
  { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum' },
  { id: 'polygon', symbol: 'matic', name: 'Polygon' },
  { id: 'base', symbol: 'base', name: 'Base' },
  { id: 'agni', symbol: 'agni', name: 'Agni' }
];

type TokenInfo = typeof TRACKED_TOKENS[number];

// Types for API responses
interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
interface CacheData {
  marketData: CoinGeckoMarketData[] | null;
  timestamp: number;
}

let marketDataCache: CacheData = {
  marketData: null,
  timestamp: 0
};

// Helper function to check if cache is valid
function isCacheValid(): boolean {
  return Date.now() - marketDataCache.timestamp < CACHE_DURATION && marketDataCache.marketData !== null;
}

// Initialize axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Format currency with appropriate decimal places
function formatCurrency(value: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1000 ? 2 : 4,
    maximumFractionDigits: value >= 1000 ? 2 : 6
  }).format(value);
}

// Format price change percentage
function formatPriceChange(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '+0.00%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchMarketData(tokens: TokenInfo[]): Promise<CoinGeckoMarketData[]> {
  if (isCacheValid() && marketDataCache.marketData) {
    return marketDataCache.marketData;
  }

  try {
    const ids = tokens.map(t => t.id).join(',');
    const response = await api.get('/simple/price', {
      params: {
        ids,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_last_updated_at: true
      }
    });

    const data = response.data;
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid response from CoinGecko API');
    }

    // Sort data to match our predefined order and validate the data
    const sortedData = tokens.map(token => {
      const coinData = data.find(d => d.id === token.id);
      if (!coinData) {
        console.warn(`No data found for token: ${token.id}`);
        return undefined;
      }
      if (typeof coinData.current_price !== 'number' || Number.isNaN(coinData.current_price)) {
        console.warn(`Invalid price for token: ${token.id}`);
        return undefined;
      }
      return coinData;
    }).filter((d): d is CoinGeckoMarketData => d !== undefined);

    if (sortedData.length === 0) {
      throw new Error('No valid price data received from CoinGecko API');
    }

    // Update cache
    marketDataCache = {
      marketData: sortedData,
      timestamp: Date.now()
    };

    return sortedData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
    throw new Error('Failed to fetch market data');
  }
}

export const coinGeckoProvider: Provider = {
  async get(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<string> {
    try {
      let marketData: CoinGeckoMarketData[];
      const requestedTokens = message.content?.text?.toLowerCase().match(/\b(btc|eth|usdt|mnt|bnb|op|arb|matic|base|agni)\b/g);

      if (requestedTokens && requestedTokens.length > 0) {
        const matchedTokens = requestedTokens
          .map(symbol => TRACKED_TOKENS.find(t => t.symbol.toLowerCase() === symbol))
          .filter((t): t is TokenInfo => t !== undefined);

        if (matchedTokens.length > 0) {
          marketData = await fetchMarketData(matchedTokens);
        } else {
          marketData = await fetchMarketData(TRACKED_TOKENS);
        }
      } else {
        marketData = await fetchMarketData(TRACKED_TOKENS);
      }

      if (!marketData.length) {
        return 'Sorry, I couldn\'t fetch the current cryptocurrency prices. Please try again later.';
      }

      return [
        'Current Cryptocurrency Prices:',
        '',
        ...marketData.map(token =>
          `• ${token.name} (${token.symbol.toUpperCase()}): ${formatCurrency(token.current_price)} (${formatPriceChange(token.price_change_percentage_24h)})`
        ),
        '',
        'Prices are updated every 30 seconds. Let me know if you need specific tokens or more market data!'
      ].join('\n');
    } catch (error) {
      console.error('Error in CoinGecko provider:', error);
      return `Error fetching prices: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
};
