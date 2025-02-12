import { createContext, useContext, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet } from 'viem/chains';
import type { PublicClient, WalletClient } from 'viem';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  publicClient: PublicClient | undefined;
  walletClient: WalletClient | undefined;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  publicClient: undefined,
  walletClient: undefined,
});

const mantleChain = {
  ...mainnet,
  id: 5000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
    public: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.mantle.xyz' },
  },
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const [walletClient, setWalletClient] = useState<WalletClient>();

  const isConnected = !!address;

  useEffect(() => {
    const client = createPublicClient({
      chain: mantleChain,
      transport: http()
    });
    setPublicClient(client);
  }, []);

  async function connect() {
    if (!window.ethereum) {
      alert('Please install MetaMask or another EVM-compatible wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      // Create wallet client
      const client = createWalletClient({
        chain: mantleChain,
        transport: custom(window.ethereum)
      });

      // Switch to Mantle Network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1388' }], // 5000 in hex
        });
      } catch (switchError: any) {
        // If chain hasn't been added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1388',
              chainName: 'Mantle',
              nativeCurrency: {
                name: 'MNT',
                symbol: 'MNT',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.mantle.xyz'],
              blockExplorerUrls: ['https://explorer.mantle.xyz'],
            }],
          });
        }
      }

      setAddress(accounts[0]);
      setWalletClient(client);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    setAddress(undefined);
    setWalletClient(undefined);
  }

  useEffect(() => {
    // Handle account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', disconnect);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
        publicClient,
        walletClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
