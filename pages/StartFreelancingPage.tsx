import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { type Route } from '../types';
import { Progress } from '../components/ui/Progress';

const OnboardingSection = ({ icon: Icon, title, description, children, step }: { icon: React.ElementType, title: string, description: string, children: React.ReactNode, step: number }) => (
    <div className="flex items-start gap-6">
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[--color-primary]/10 text-[--color-primary] flex items-center justify-center border-2 border-[--color-primary]/20">
                <Icon size={24} />
            </div>
            {step < 3 && <div className="w-0.5 h-16 bg-[--color-border] mt-4"></div>}
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-[--color-text-secondary] mt-1 mb-6">{description}</p>
            {children}
        </div>
    </div>
);

const StartFreelancingPage = ({ navigate }: { navigate: (route: Route, context?: any) => void }) => {
    // In a real app, this would be a multi-step form with state management.
    // For this implementation, it's a single page form representing the onboarding steps.
    const progress = 33; // Mock progress for step 1

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => navigate('find-work')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Freelance Hub
                        </Button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Become a FOGSLY Freelancer</CardTitle>
                                <CardDescription>Complete these essential steps to start applying for jobs and earning.</CardDescription>
                                <div className="pt-4">
                                    <Progress value={progress} />
                                    <p className="text-xs text-[--color-text-secondary] mt-2">{progress}% complete</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-12 py-8 px-4 md:px-8">
                                <OnboardingSection
                                    step={1}
                                    icon={Briefcase}
                                    title="Define Your Profession"
                                    description="Tell clients what you do. This will be the headline on your profile."
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="role">Your Professional Role</Label>
                                            <Input id="role" placeholder="e.g., Senior Web Developer" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="skills">Your Top Skills</Label>
                                            <Input id="skills" placeholder="e.g., React, TypeScript, Node.js (comma-separated)" className="mt-1" />
                                        </div>
                                    </div>
                                </OnboardingSection>

                                <OnboardingSection
                                    step={2}
                                    icon={DollarSign}
                                    title="Set Your Rate"
                                    description="Decide how much you want to charge for your expertise."
                                >
                                    <div>
                                        <Label htmlFor="rate">Your Hourly Rate (USD)</Label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                                            <Input id="rate" type="number" placeholder="0.00" className="pl-9" />
                                        </div>
                                    </div>
                                </OnboardingSection>
                                
                                <OnboardingSection
                                    step={3}
                                    icon={User}
                                    title="Write Your Bio"
                                    description="Craft a compelling bio to introduce yourself to clients and highlight your experience."
                                >
                                    <Textarea placeholder="Describe your experience, skills, and what makes you the right person for the job..." rows={6} />
                                </OnboardingSection>

                                <div className="text-center pt-8 border-t border-[--color-border]">
                                    <h3 className="text-xl font-semibold">You're Almost Ready!</h3>
                                    <p className="text-[--color-text-secondary] mt-2 max-w-md mx-auto">
                                        After saving, you can add your portfolio, work experience, and education on your profile page to attract more clients.
                                    </p>
                                    <Button size="lg" className="mt-6" onClick={() => navigate('find-work')}>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Complete Profile & Find Work
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StartFreelancingPage;