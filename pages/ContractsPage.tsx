import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { type Route } from '../types';
import { contractsData } from '../constants';

const ContractsPage = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
    const [activeFilter, setActiveFilter] = useState('Active');
    const filters = ['Active', 'Pending', 'Completed', 'Cancelled'];

    const filteredContracts = contractsData.filter(c => {
        if (activeFilter === 'Active') return c.status === 'In Progress';
        return c.status === activeFilter;
    });

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">My Contracts</h1>
                    <Button onClick={() => navigate('post-job')}>Post a New Job</Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-2 bg-[--color-bg-secondary] p-1 rounded-lg border border-[--color-border]">
                            {filters.map(filter => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                            <Input placeholder="Search contracts..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-[--color-text-secondary] uppercase bg-[--color-bg-secondary]">
                                    <tr>
                                        <th className="px-6 py-3">Project Title</th>
                                        <th className="px-6 py-3">Other Party</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Budget</th>
                                        <th className="px-6 py-3">End Date</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.map(contract => (
                                        <tr key={contract.id} className="border-b border-[--color-border] last:border-0 hover:bg-[--color-bg-secondary]/50">
                                            <td className="px-6 py-4 font-medium">{contract.title}</td>
                                            <td className="px-6 py-4">{contract.otherParty}</td>
                                            <td className="px-6 py-4"><Badge variant={contract.status === 'In Progress' ? 'default' : 'secondary'}>{contract.status}</Badge></td>
                                            <td className="px-6 py-4 font-semibold text-right">${contract.budget.toLocaleString()}</td>
                                            <td className="px-6 py-4">{contract.endDate}</td>
                                            <td className="px-6 py-4 text-right">
                                                {/* <Button variant="outline" size="sm" onClick={() => navigate('project-workspace', { projectId: contract.id })}>
                                                    Open Workspace
                                                </Button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContractsPage;