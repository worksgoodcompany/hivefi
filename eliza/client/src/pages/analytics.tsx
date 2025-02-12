import { LineChart as LucideLineChart, BarChart as LucideBarChart, PieChart as LucidePieChart, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
    }>;
    label?: string;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
    const isPositive = change >= 0;

    return (
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-muted-foreground">{title}</span>
                <div className="p-2 rounded-md bg-white/[0.03]">
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{value}</span>
                <span className={`text-sm flex items-center gap-0.5 ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(change)}%
                </span>
            </div>
        </div>
    );
}

const tvlData = [
    { id: '2024-01', date: 'Jan 2024', tvl: 0, volume: 0 },
    { id: '2024-02', date: 'Feb', tvl: 50000000, volume: 7500000 },
    { id: '2024-03', date: 'Mar', tvl: 100000000, volume: 15000000 },
    { id: '2024-04', date: 'Apr', tvl: 150000000, volume: 22500000 },
    { id: '2024-05', date: 'May', tvl: 200000000, volume: 30000000 },
    { id: '2024-06', date: 'Jun', tvl: 500000000, volume: 75000000 },
    { id: '2024-07', date: 'Jul', tvl: 450000000, volume: 67500000 },
    { id: '2024-08', date: 'Aug', tvl: 400000000, volume: 60000000 },
    { id: '2024-09', date: 'Sep', tvl: 350000000, volume: 52500000 },
    { id: '2024-10', date: 'Oct', tvl: 325830000, volume: 48874500 }
];

const protocolData = [
    { id: 'nostra', name: 'Nostra', value: 120.6 },
    { id: 'ekubo', name: 'Ekubo', value: 60.27 },
    { id: 'vesu', name: 'Vesu', value: 25.39 },
    { id: 'zklend', name: 'zkLend', value: 21.07 },
    { id: 'nimbora', name: 'Nimbora', value: 14.8 },
    { id: 'endur', name: 'Endur', value: 10.5 }
];

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 border border-white/[0.08] p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium">{label}</p>
                {payload.map((entry) => (
                    <p key={entry.name} className="text-sm text-muted-foreground">
                        {entry.name}: ${(entry.value / 1e6).toFixed(2)}M
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const stats = [
        { id: 'tvl', title: "Total Value Locked", value: "$132.64M", change: 2.5, icon: <LucideLineChart className="h-4 w-4 text-blue-500" /> },
        { id: 'volume', title: "24h Volume", value: "$818.67K", change: -1.2, icon: <LucideBarChart className="h-4 w-4 text-purple-500" /> },
        { id: 'positions', title: "Active Positions", value: "1,234", change: 5.8, icon: <LucidePieChart className="h-4 w-4 text-green-500" /> },
        { id: 'revenue', title: "Protocol Revenue", value: "$182.72K", change: 3.7, icon: <Activity className="h-4 w-4 text-orange-500" /> }
    ];

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 overflow-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold">Mantle DeFi Ecosystem Analytics</h1>
                <div className="text-sm text-muted-foreground">Last updated: 5 minutes ago</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <StatCard key={stat.id} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                    <h3 className="text-sm font-medium mb-4">TVL & Volume Over Time</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tvlData}>
                                <defs>
                                    <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                <YAxis
                                    stroke="rgba(255,255,255,0.5)"
                                    tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="tvl"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#tvlGradient)"
                                    strokeWidth={2}
                                    name="TVL"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#60a5fa"
                                    fillOpacity={1}
                                    fill="url(#volumeGradient)"
                                    strokeWidth={2}
                                    name="Volume"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                    <h3 className="text-sm font-medium mb-4">Protocol Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={protocolData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => {
                                        if (window.innerWidth < 640) return null;
                                        return `${name} ${(percent * 100).toFixed(0)}%`;
                                    }}
                                    labelLine={false}
                                >
                                    {protocolData.map((entry) => (
                                        <Cell key={entry.id} fill={COLORS[protocolData.indexOf(entry) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                <h3 className="text-sm font-medium mb-4">Daily Protocol Revenue</h3>
                <div className="h-[200px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tvlData.slice(-14)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.5)"
                                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                interval={window.innerWidth < 640 ? 1 : 0}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.5)"
                                tickFormatter={(value) => `$${(value / 1e3).toFixed(0)}K`}
                                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                {tvlData.slice(-14).map((entry) => (
                                    <Cell key={entry.id} fill={`rgba(59, 130, 246, ${0.5 + (tvlData.indexOf(entry) / 28)})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
