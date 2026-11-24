import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { type Route } from '../types';
import { singleGigData, userProfileData } from '../constants';
import { ArrowLeft, DollarSign, FileText } from 'lucide-react';
import AiProposalGenerator from '../components/AiProposalGenerator';

const SubmitProposalPage = ({ navigate, gigId }: { navigate: (route: Route, context?: any) => void; gigId: number; }) => {
    // In a real app, you'd fetch data based on gigId. Here we use mock data.
    const gig = singleGigData;
    const user = userProfileData;
    const [coverLetter, setCoverLetter] = useState('');

    return (
        <div className="bg-[--color-bg-secondary] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Button variant="ghost" onClick={() => navigate('job-detail', gigId)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Job Details
                        </Button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-3xl">Submit a Proposal</CardTitle>
                                <CardDescription>You are applying for the job: <span className="font-semibold text-[--color-primary]">{gig.title}</span></CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Section 1: Terms */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">What is the rate you'd like to bid for this job?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[--color-bg-secondary] rounded-lg border border-[--color-border]">
                                        <div>
                                            <Label htmlFor="bid-amount">Your Bid</Label>
                                            <div className="relative mt-1">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                                                <Input id="bid-amount" type="number" placeholder="0.00" className="pl-9" />
                                            </div>
                                            <p className="text-xs text-[--color-text-secondary] mt-1">Total amount the client will see on your proposal.</p>
                                        </div>
                                        <div>
                                            <Label>FOGSLY Service Fee</Label>
                                            <p className="text-lg font-semibold mt-1">10%</p>
                                            <p className="text-xs text-[--color-text-secondary] mt-1">You'll receive the bid amount minus our service fee.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Section 2: Cover Letter */}
                                 <div>
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                                        <h3 className="text-lg font-semibold">Cover Letter</h3>
                                        <AiProposalGenerator jobData={gig} userData={user} onGenerated={setCoverLetter}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Textarea 
                                            id="cover-letter" 
                                            placeholder="Introduce yourself and explain why you're a great fit for this job... or let our AI give it a shot!" 
                                            rows={12}
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Attachments */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Attachments (optional)</h3>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-[--color-border] border-dashed rounded-lg cursor-pointer bg-[--color-bg-secondary] hover:bg-[--color-bg-tertiary]">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileText className="w-8 h-8 mb-3 text-[--color-text-secondary]" />
                                                <p className="mb-2 text-sm text-[--color-text-secondary]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-[--color-text-secondary]">PDF, DOCX, PNG, JPG (MAX. 25MB)</p>
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" />
                                        </label>
                                    </div> 
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t border-[--color-border]">
                                    <Button variant="outline" onClick={() => navigate('job-detail', gigId)}>Cancel</Button>
                                    <Button size="lg">Submit Proposal</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SubmitProposalPage;