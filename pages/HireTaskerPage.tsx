import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { type Route } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';
import { ArrowLeft, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { taskers, taskCategories } from '../constants';
import TaskerCard from '../components/TaskerCard';

const HireTaskerPage = ({ navigate }: { navigate: (route: Route) => void }) => {
    const [category, setCategory] = useState('all');
    const [rating, setRating] = useState('any');
    const [rate, setRate] = useState('any');
    const [sortBy, setSortBy] = useState('relevance');

    const filteredAndSortedTaskers = useMemo(() => {
        let result = [...taskers]; // Create a mutable copy

        // Filtering logic
        result = result.filter(tasker => {
            // Category filter - simple check if role includes category name
            if (category !== 'all' && !tasker.role.includes(category)) {
                return false;
            }
            // Rating filter
            if (rating === '4' && tasker.rating < 4) return false;
            if (rating === '3' && tasker.rating < 3) return false;
            // Rate filter
            if (rate === '0-25' && tasker.hourlyRate > 25) return false;
            if (rate === '25-50' && (tasker.hourlyRate < 25 || tasker.hourlyRate > 50)) return false;
            if (rate === '50+' && tasker.hourlyRate < 50) return false;

            return true;
        });

        // Sorting logic
        switch (sortBy) {
            case 'rating_high_low':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'price_low_high':
                result.sort((a, b) => a.hourlyRate - b.hourlyRate);
                break;
            case 'price_high_low':
                result.sort((a, b) => b.hourlyRate - a.hourlyRate);
                break;
            default:
                // 'relevance' is default - no sort needed for mock data
                break;
        }

        return result;
    }, [category, rating, rate, sortBy]);

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('tasker-hub')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tasker Hub
                    </Button>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Trusted Taskers</h1>
                    <p className="text-lg text-[--color-text-secondary] max-w-2xl mx-auto">
                        Browse our community of skilled and reliable Taskers for any job, big or small.
                    </p>
                </motion.div>

                {/* Filter Bar */}
                <Card className="p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
                        <div className="relative lg:col-span-2">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                            <Input placeholder="Search for a task (e.g., 'TV mounting')" className="h-12 pl-10" />
                        </div>
                         <div className="relative">
                             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                            <Input placeholder="Your Location" className="h-12 pl-10" />
                        </div>
                        <Button size="lg" className="h-12">Search</Button>
                    </div>
                </Card>

                {/* Filter & Sort Controls */}
                <div className="flex  md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <span className="text-sm font-medium text-[--color-text-secondary] flex items-center gap-2 w-full"><SlidersHorizontal size={16}/> Filter by:</span>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-[--color-card]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {taskCategories.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={rating} onValueChange={setRating}>
                            <SelectTrigger className="w-full sm:w-[160px] bg-[--color-card]">
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Rating</SelectItem>
                                <SelectItem value="4">4 stars & up</SelectItem>
                                <SelectItem value="3">3 stars & up</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select value={rate} onValueChange={setRate}>
                            <SelectTrigger className="w-full sm:w-[160px] bg-[--color-card]">
                                <SelectValue placeholder="Hourly Rate" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Rate</SelectItem>
                                <SelectItem value="0-25">$0 - $25</SelectItem>
                                <SelectItem value="25-50">$25 - $50</SelectItem>
                                <SelectItem value="50+">$50+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-1/2 md:w-1/4 md:w-auto">
                        <span className="text-sm font-medium text-[--color-text-secondary] flex-shrink-0">Sort by:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full bg-[--color-card]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="relevance">Relevance</SelectItem>
                                <SelectItem value="rating_high_low">Rating: High to Low</SelectItem>
                                <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                                <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tasker Grid */}
                {filteredAndSortedTaskers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedTaskers.map((tasker, index) => (
                            <motion.div
                                key={tasker.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <TaskerCard tasker={tasker} navigate={navigate} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-[--color-card] rounded-lg"
                    >
                        <h3 className="text-xl font-semibold">No Taskers Found</h3>
                        <p className="text-[--color-text-secondary] mt-2">Try adjusting your filters to find more results.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HireTaskerPage;