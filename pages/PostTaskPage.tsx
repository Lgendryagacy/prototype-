import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, MapPin, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { type Route } from '../types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';
import { taskCategories } from '../constants';
import { Checkbox } from '../components/ui/Checkbox';

const PostTaskPage = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
    const [urgency, setUrgency] = useState('Medium');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [isVirtual, setIsVirtual] = useState(false);
    const [address, setAddress] = useState('');
    const addressInputRef = useRef<HTMLInputElement>(null);

    // Function to initialize Google Maps Autocomplete
    const initAutocomplete = () => {
        if (addressInputRef.current && (window as any).google) {
            const autocomplete = new (window as any).google.maps.places.Autocomplete(
                addressInputRef.current,
                {
                    componentRestrictions: { country: "pk" }, // Restrict to Pakistan
                    fields: ["formatted_address"],
                    types: ["address"],
                }
            );

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    setAddress(place.formatted_address);
                }
            });
        }
    };

    // Effect to load Google Maps script
    useEffect(() => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("Google Maps API key is missing.");
            return;
        }

        const scriptId = 'google-maps-script';

        if (document.getElementById(scriptId)) {
             if ((window as any).google) {
                initAutocomplete();
            }
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            initAutocomplete();
        };

    }, []);

    const handleVirtualToggle = (checked: boolean) => {
        setIsVirtual(checked);
        if (checked) {
            setAddress('');
        }
    };

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-10">
                <div className="max-w-3xl mx-auto">
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
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-3xl">Tell us what you need done</CardTitle>
                                <CardDescription>Provide details about your task to get matched with the right Taskers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <FormSection icon={Edit3} title="Task Details">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="task-title">Task Title</Label>
                                            <Input id="task-title" placeholder="e.g., Assemble IKEA bed frame" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="task-category">Category</Label>
                                             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a task category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taskCategories.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                                                    <SelectItem value="other">Other (Please specify)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {selectedCategory === 'other' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <Label htmlFor="custom-category">Custom Category</Label>
                                                <Input 
                                                    id="custom-category" 
                                                    placeholder="e.g., Pet Sitting"
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                />
                                            </motion.div>
                                        )}
                                         <div className="space-y-2">
                                            <Label htmlFor="task-description">Task Description</Label>
                                            <Textarea id="task-description" placeholder="Describe what you need in detail. Include sizes, tools needed, etc." rows={5} />
                                        </div>
                                    </div>
                                </FormSection>
                                
                                <FormSection icon={MapPin} title="Location">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Checkbox id="is-virtual" checked={isVirtual} onCheckedChange={handleVirtualToggle} />
                                        <Label htmlFor="is-virtual">This is a virtual or online task</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-address">Task Address</Label>
                                        <Input 
                                            id="task-address" 
                                            ref={addressInputRef} 
                                            placeholder="Enter the full address" 
                                            disabled={isVirtual}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </FormSection>
                                
                                 <FormSection icon={DollarSign} title="Budget">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="payment-type">Payment Type</Label>
                                            <Select>
                                                <SelectTrigger><SelectValue placeholder="Select payment type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fixed">Fixed Price</SelectItem>
                                                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="task-budget">Your Budget (USD)</Label>
                                            <Input id="task-budget" type="number" placeholder="e.g., 150" />
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection icon={Calendar} title="Urgency">
                                     <div className="space-y-2">
                                        <Label htmlFor="task-urgency">How soon do you need this done?</Label>
                                        <Select value={urgency} onValueChange={setUrgency}>
                                            <SelectTrigger id="task-urgency">
                                                <SelectValue placeholder="Select urgency level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low - Flexible</SelectItem>
                                                <SelectItem value="Medium">Medium - Within a week</SelectItem>
                                                <SelectItem value="High">High - Within a few days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormSection>

                                <div className="flex justify-end gap-4 pt-6 border-t border-[--color-border]">
                                    <Button variant="outline">Save Draft</Button>
                                    <Button size="lg">Find Taskers</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const FormSection = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[--color-bg-secondary] flex items-center justify-center">
                <Icon size={16} className="text-[--color-primary]" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="pl-11">{children}</div>
    </div>
);

export default PostTaskPage;