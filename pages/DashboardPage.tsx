import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import {
  Settings, Star, Briefcase,
  DollarSign, PieChart as PieChartIcon, MessageSquare, ArrowRight,
  Plus, Download, Upload,
  Activity, BarChart2, Users as UsersIcon, TrendingUp, Coins,
  TrendingDown, Menu, X
} from "lucide-react";
import { useAuth } from '../firebase/hooks/useAuth';
import { getUserEarnings, getTodayActivity, getRecentTransactions, getWeeklyActivity, getJobTransactions } from '../firebase/services/earningsService';
import { UserEarnings, UserDailyActivity } from '../firebase/types/earnings';
import { Transaction } from '../firebase/types/transaction';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { form } from 'framer-motion/client';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('week');
  const { user } = useAuth();

  // Real data states
  const [userEarnings, setUserEarnings] = useState<UserEarnings | null>(null);
  const [todayActivity, setTodayActivity] = useState<UserDailyActivity | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<UserDailyActivity[]>([]);
  const [jobTransactions, setJobTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock projects data (kept for Projects tab)
  const [activeProject, setActiveProject] = useState(0);
  const projects = [
    { id: 1, title: "Fintech Dashboard", client: "Stripe", status: "completed", budget: 12800, duration: "3 months", progress: 100 },
    { id: 2, title: "Healthcare App", client: "Teladoc", status: "active", budget: 24000, duration: "6 months", progress: 65 },
    { id: 3, title: "E-commerce Platform", client: "Nordstrom", status: "planning", budget: 18500, duration: "4 months", progress: 15 }
  ];

  // Fetch real data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const [earnings, activity, transactions, weekly, jobTxns] = await Promise.all([
          getUserEarnings(user.uid),
          getTodayActivity(user.uid),
          getRecentTransactions(user.uid, 10),
          getWeeklyActivity(user.uid),
          getJobTransactions(user.uid)
        ]);

        setUserEarnings(earnings);
        setTodayActivity(activity);
        setRecentTransactions(transactions);
        setWeeklyActivity(weekly);
        setJobTransactions(jobTxns);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const tabs = [
    { id: 'dashboard', icon: <PieChartIcon size={18} />, label: 'Dashboard' },
    { id: 'earnings', icon: <DollarSign size={18} />, label: 'Earnings Breakdown' },
    { id: 'activity', icon: <Activity size={18} />, label: 'Daily Activity' },
    { id: 'transactions', icon: <BarChart2 size={18} />, label: 'Transactions' },
    { id: 'job-expenses', icon: <Briefcase size={18} />, label: 'Job Expenses' },
    // { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
  ];

  // Prepare earnings breakdown data for pie chart
  const earningsBreakdownData = userEarnings ? [
    { name: 'Ads', value: userEarnings.adsEarnings, color: COLORS[0] },
    { name: 'Referrals', value: userEarnings.referralEarnings, color: COLORS[1] },
    { name: 'Tasks', value: userEarnings.taskEarnings, color: COLORS[2] },
    { name: 'Bonuses', value: userEarnings.bonusEarnings, color: COLORS[3] },
    { name: 'Deposits', value: userEarnings.depositEarnings, color: COLORS[4] },
    { name: 'Freelance Jobs', value: userEarnings.freelanceJobsEarnings, color: COLORS[5] },
    { name: 'Fogsly Services', value: userEarnings.fogslyServicesEarnings, color: COLORS[6] },
    { name: 'Physical Products', value: userEarnings.fogslyPhysicalEarnings, color: COLORS[7] }
  ].filter(item => item.value > 0) : [];

  // Prepare weekly chart data
  const weeklyChartData = weeklyActivity.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    ads: day.adsEarned,
    tasks: 0, // Can be added later
    total: day.adsEarned
  })).reverse();

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} FOG`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'earnings': return <EarningsBreakdownContent />;
      case 'activity': return <DailyActivityContent />;
      case 'transactions': return <TransactionsContent />;
      case 'job-expenses': return <JobExpensesContent />;
      case 'settings': return <PlaceholderContent title="settings" />;
      default: return <PlaceholderContent title={activeTab} />;
    }
  };


  function formatTransactionDate(date: Date | Timestamp | undefined) {
    if (!date) return 'N/A';

    const dateObj = date instanceof Timestamp ? date.toDate() : date;

    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Coins size={20} className="text-blue-600" />}
          title="Available Balance"
          value={formatCurrency(userEarnings?.availableBalance || 0)}
          change="Auto-transferred"
          trend="up"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-green-600" />}
          title="Lifetime Earnings"
          value={formatCurrency(userEarnings?.lifetimeEarnings || 0)}
          change="All sources"
          trend="up"
        />
        <StatCard
          icon={<Activity size={20} className="text-purple-600" />}
          title="Ads Watched Today"
          value={`${todayActivity?.adsWatched || 0}/${todayActivity?.adWatchLimit || 10}`}
          change={`${todayActivity?.adsRemaining || 10} remaining`}
          trend="up"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-amber-500" />}
          title="Today's Earnings"
          value={formatCurrency(todayActivity?.adsEarned || 0)}
          change="From ads"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Weekly Earnings</CardTitle>
              <span className="text-sm text-[--color-text-secondary]">Last 7 days</span>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 8 }} name="Earnings" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[--color-text-secondary]">
                No earnings data for the past week
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Earnings Sources</CardTitle></CardHeader>
          <CardContent className="h-80">
            {earningsBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={earningsBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#3B82F6"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {earningsBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[--color-text-secondary]">
                No earnings yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Your activity breakdown for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[--color-text-secondary]">Ads Watched</span>
              <span className="font-medium">{todayActivity?.adsWatched || 0} / {todayActivity?.adWatchLimit || 10}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[--color-text-secondary]">Tasks Completed</span>
              <span className="font-medium">{todayActivity?.tasksCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[--color-text-secondary]">Jobs Completed</span>
              <span className="font-medium">{todayActivity?.jobsCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[--color-text-secondary]">Services Completed</span>
              <span className="font-medium">{todayActivity?.servicesCompleted || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[--color-text-secondary]">Referrals Made</span>
              <span className="font-medium">{todayActivity?.referralsMade || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-start">
                  <div className="p-2 bg-[--color-primary]/10 rounded-full mr-3 mt-1">
                    <Activity size={16} className="text-[--color-primary]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-small text-[--color-text-primary] text-sm">{transaction.description}</p>
                    <p className="text-xs text-[--color-text-secondary]">
                      {formatTransactionDate(transaction.createdAt)}
                    </p>
                  </div>
                  <span className={`text-sm font-medium flex items-center ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {
                      transaction.amount > 0 ? <TrendingDown size={16} className="inline-block mr-1" /> : <TrendingUp size={16} className="inline-block mr-1" />
                    }
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} FOG</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[--color-text-secondary]">No recent transactions</p>
            )}
          </CardContent>
          {recentTransactions.length > 5 && (
            <CardFooter className="border-t border-[--color-border]">
              <Button variant="link" className="text-[--color-primary] px-0" onClick={() => setActiveTab('transactions')}>
                View all transactions <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );

  const EarningsBreakdownContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[--color-text-primary]">Earnings Breakdown</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Ads Earnings</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.adsEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalAdsEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Referral Earnings</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.referralEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalReferralEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <UsersIcon className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Task Earnings</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.taskEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalTaskEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Briefcase className="text-amber-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Bonus Earnings</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.bonusEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalBonusEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Deposit Earnings</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.depositEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalDepositEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Freelance Jobs</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.freelanceJobsEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalFreelanceJobsEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Briefcase className="text-pink-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Fogsly Services</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.fogslyServicesEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalFogslyServicesEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Activity className="text-teal-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[--color-text-secondary]">Physical Products</p>
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">
                  {formatCurrency(userEarnings?.fogslyPhysicalEarnings || 0)}
                </p>
                <p className="text-xs text-[--color-text-secondary] mt-1">
                  Lifetime: {formatCurrency(userEarnings?.totalFogslyPhysicalEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-[--color-text-secondary]">Available Balance</span>
            <span className="text-2xl font-bold text-[--color-primary]">
              {formatCurrency(userEarnings?.availableBalance || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-[--color-text-secondary]">Lifetime Earnings</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(userEarnings?.lifetimeEarnings || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-[--color-text-secondary]">Total Withdrawn</span>
            <span className="text-2xl font-bold text-red-600">
              {formatCurrency(userEarnings?.totalWithdrawn || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-[--color-text-secondary]">Total Spent</span>
            <span className="text-2xl font-bold text-amber-600">
              {formatCurrency(userEarnings?.totalSpent || 0)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All earnings are automatically transferred to your wallet and available for immediate use.
          Your available balance is the sum of all earning sources.
        </p>
      </div>
    </div>
  );

  const DailyActivityContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[--color-text-primary]">Daily Activity</h2>

      <Card>
        <CardHeader>
          <CardTitle>Today's Summary - {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Ads Watched</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {todayActivity?.adsWatched || 0} / {todayActivity?.adWatchLimit || 10}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {todayActivity?.adsRemaining || 10} ads remaining
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Earned: {formatCurrency(todayActivity?.adsEarned || 0)}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {todayActivity?.tasksCompleted || 0}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">Referrals Made</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {todayActivity?.referralsMade || 0}
              </p>
            </div>

            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-pink-800 font-medium">Freelance Jobs</p>
              <p className="text-3xl font-bold text-pink-600 mt-2">
                {todayActivity?.jobsCompleted || 0}
              </p>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg">
              <p className="text-sm text-teal-800 font-medium">Services Completed</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">
                {todayActivity?.servicesCompleted || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {weeklyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity.map(day => ({
                date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                ads: day.adsWatched,
                tasks: day.tasksCompleted,
                jobs: day.jobsCompleted,
                services: day.servicesCompleted
              })).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={12} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                <Legend />
                <Bar dataKey="ads" fill="#3B82F6" name="Ads Watched" />
                <Bar dataKey="tasks" fill="#10B981" name="Tasks" />
                <Bar dataKey="jobs" fill="#EC4899" name="Jobs" />
                <Bar dataKey="services" fill="#14B8A6" name="Services" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[--color-text-secondary]">
              No activity data for the past week
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const TransactionsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[--color-text-primary]">Transaction History</h2>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest earnings and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start justify-between border-b border-[--color-border] pb-4 last:border-0">
                  <div className="flex items-start">
                    <div className="p-2 bg-[--color-primary]/10 rounded-full mr-3">
                      <Activity size={16} className="text-[--color-primary]" />
                    </div>
                    <div>
                      <p className="font-medium text-[--color-text-primary]">{transaction.description}</p>
                      <p className="text-sm text-[--color-text-secondary]">
                        {formatTransactionDate(transaction.createdAt)}
                      </p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold flex items-center gap-1 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {
                        transaction.amount > 0 ? <TrendingDown size={16} className="inline-block mr-1" /> : <TrendingUp size={16} className="inline-block mr-1" />
                      } {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} FOG
                    </span>
                    {transaction.sourceType && (
                      <p className="text-xs text-[--color-text-secondary] mt-1">
                        {transaction.sourceType}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[--color-text-secondary] py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const JobExpensesContent = () => {
    const totalSpent = jobTransactions
      .filter(t => t.type === 'job_payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalRefunded = jobTransactions
      .filter(t => t.type === 'job_refund')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const platformTaxPaid = jobTransactions
      .filter(t => t.type === 'platform_tax' && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSpending = totalSpent - totalRefunded + platformTaxPaid;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[--color-text-primary]">Job Expenses</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-[--color-text-secondary]">Job Budgets</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {totalSpent.toFixed(2)} FOG
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Briefcase size={24} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-[--color-text-secondary]">Platform Fees</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {platformTaxPaid.toFixed(2)} FOG
                  </p>
                  <p className="text-xs text-[--color-text-secondary] mt-1">2.5% commission</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <DollarSign size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-[--color-text-secondary]">Refunded</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {totalRefunded.toFixed(2)} FOG
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-[--color-text-secondary]">Net Spending</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {netSpending.toFixed(2)} FOG
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Job Payment History</CardTitle>
            <CardDescription>Track all payments and refunds for your posted jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {jobTransactions.length > 0 ? (
              <div className="space-y-4">
                {jobTransactions.map((transaction) => {
                  const isRefund = transaction.type === 'job_refund';
                  const isPayment = transaction.type === 'job_payment';
                  const isPlatformTax = transaction.type === 'platform_tax';

                  return (
                    <div key={transaction.id} className="flex items-start justify-between border-b border-[--color-border] pb-4 last:border-0">
                      <div className="flex items-start flex-1">
                        <div className={`p-2 rounded-full mr-3 ${
                          isRefund ? 'bg-green-100' : 
                          isPlatformTax ? 'bg-orange-100' : 
                          'bg-red-100'
                        }`}>
                          {isRefund ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : isPlatformTax ? (
                            <DollarSign size={16} className="text-orange-600" />
                          ) : (
                            <Briefcase size={16} className="text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[--color-text-primary]">{transaction.description}</p>
                          <p className="text-sm text-[--color-text-secondary] mt-1">
                            {formatTransactionDate(transaction.createdAt)}
                          </p>
                          {transaction.notes && (
                            <p className="text-xs text-[--color-text-secondary] mt-1 italic">
                              {transaction.notes}
                            </p>
                          )}
                          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`text-lg font-bold ${
                          isRefund ? 'text-green-600' : 
                          isPlatformTax ? 'text-orange-600' : 
                          'text-red-600'
                        }`}>
                          {isRefund ? '+' : ''}{Math.abs(transaction.amount).toFixed(2)} FOG
                        </span>
                        <p className="text-xs text-[--color-text-secondary] mt-1">
                          {isRefund ? 'Refund' : isPlatformTax ? 'Platform Fee' : 'Payment'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-[--color-text-secondary]">No job expenses yet</p>
                <p className="text-sm text-[--color-text-secondary] mt-2">
                  Payments for posted jobs will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const ProjectsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[--color-text-primary]">Projects</h2>
        <Button><Plus size={16} className="mr-2" /> New Project</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div key={project.id} {...{ whileHover: { y: -5 }, transition: { type: 'spring', stiffness: 400, damping: 10 } }}>
            <Card className={`cursor-pointer transition-all h-full flex flex-col ${activeProject === index ? 'ring-2 ring-[--color-primary]' : 'hover:shadow-lg'}`} onClick={() => setActiveProject(index)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>{project.client}</CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{project.status}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between text-sm"><span className="text-[--color-text-secondary]">Budget</span><span className="font-medium">{formatCurrency(project.budget)}</span></div>
                <div className="flex justify-between text-sm mt-2"><span className="text-[--color-text-secondary]">Duration</span><span className="font-medium">{project.duration}</span></div>
              </CardContent>
              <CardFooter className="border-t border-[--color-border] pt-4">
                <Button variant="outline" size="sm" className="w-full"><MessageSquare size={16} className="mr-2" /> Chat with Client</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const PlaceholderContent = ({ title }: { title: string }) => (
    <div>
      <h2 className="text-2xl font-bold text-[--color-text-primary] capitalize">{title}</h2>
      <p className="text-[--color-text-secondary] mt-2">This section is under construction.</p>
    </div>
  );

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      {/* Hamburger Button */}
      <div className="p-6 pb-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 bg-[--color-card] border border-[--color-border] rounded-lg shadow-lg hover:bg-[--color-bg-secondary] transition-all duration-300 ${sidebarOpen ? 'ml-[180px]' : 'ml-0'
            }`}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden top-[60px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed md:sticky top-[60px] left-0 z-40 w-64 bg-[--color-card] border-r border-[--color-border] h-[calc(100vh-60px)] overflow-y-auto">
            <div className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-[--color-primary]/10 text-[--color-primary]'
                        : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary]'
                      }`}
                  >
                    <span className="mr-3">{tab.icon}</span>{tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-6 pt-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
function StatCard({ icon, title, value, change, trend }: { icon: React.ReactNode; title: string; value: string | number; change: string; trend: 'up' | 'down'; }) {
  return (
    <Card>
      <CardContent className="pt-6 p-6">
        <div className="flex justify-between">
          <div className="rounded-lg bg-[--color-bg-secondary] p-2">{icon}</div>
          {/* <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{change}</span> */}
        </div>
        <h3 className="text-lg font-medium text-[--color-text-secondary] mt-2">{title}</h3>
        <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;