import { parseAbi, type Address } from 'viem';

// INIT Capital Contract Addresses
export const INIT_CORE = '0x972BcB0284cca0152527c4f70f8F689852bCAFc5';
export const INIT_LENS = '0x4725e220163e0b90b40dd5405ee08718523dea78';

// Pool Addresses
export const POOLS = {
    WETH: '0x51AB74f8B03F0305d8dcE936B473AB587911AEC4',
    WBTC: '0x9c9F28672C4A8Ad5fb2c9Aca6d8D68B02EAfd552',
    WMNT: '0x44949636f778fAD2b139E665aee11a2dc84A2976',
    USDC: '0x00A55649E597d463fD212fBE48a3B40f0E227d06',
    USDT: '0xadA66a8722B5cdfe3bC504007A5d793e7100ad09',
    METH: '0x5071c003bB45e49110a905c1915EbdD2383A89dF'
} as const satisfies Record<string, Address>;

// INIT Core ABI
export const INIT_CORE_ABI = parseAbi([
    'function mintTo(address pool, address receiver) external returns (uint256 shares)',
    'function burnTo(address pool, address receiver) external returns (uint256 amount)',
    'function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)',
    'function createPos(uint16 mode, address viewer) external returns (uint256 posId)',
    'function collateralize(uint256 posId, address pool) external',
    'function getUserPositionIds(address user) external view returns (uint256[] memory)',
    'function getPosition(uint256 posId) external view returns ((uint16,address,address,uint256))'
]);

// Lending Pool ABI
export const LENDING_POOL_ABI = parseAbi([
    'function mint(address _receiver) external returns (uint256 shares)',
    'function burn(address _receiver) external returns (uint256 amt)',
    'function borrow(address _receiver, uint256 _amt) external returns (uint256 shares)',
    'function repay(uint256 _shares) external returns (uint256 amt)',
    'function toShares(uint256 _amt) public view returns (uint256 shares)',
    'function toAmt(uint256 _shares) public view returns (uint256 amt)',
    'function totalAssets() public view returns (uint256)',
    'function getBorrowRate_e18() external view returns (uint256)',
    'function getSupplyRate_e18() external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function totalDebt() external view returns (uint256)',
    'function cash() external view returns (uint256)',
    'function underlyingToken() external view returns (address)'
]);

// ERC20 ABI for token operations
export const ERC20_ABI = parseAbi([
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function allowance(address owner, address spender) external view returns (uint256)'
]);

export function getPoolAddress(symbol: string): Address | undefined {
    const poolKey = symbol as keyof typeof POOLS;
    return POOLS[poolKey];
}

export function parseAmountAndToken(text: string): { amount: string; tokenSymbol: keyof typeof POOLS | undefined } {
    const words = text.split(' ');
    const amount = words.find(w => !Number.isNaN(Number(w))) || '0';
    const tokenSymbol = words.find(w => Object.keys(POOLS).includes(w.toUpperCase()))?.toUpperCase() as keyof typeof POOLS | undefined;
    return { amount, tokenSymbol };
}
