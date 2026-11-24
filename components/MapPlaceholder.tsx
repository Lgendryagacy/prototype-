import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const MapPlaceholder = () => {
    return (
        <section>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <Card className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="md:col-span-1 p-8 bg-[--color-bg-secondary] flex flex-col justify-center">
                            <h2 className="text-2xl font-bold mb-3">Find Help Nearby</h2>
                            <p className="text-[--color-text-secondary] mb-6">
                                Connect with skilled Taskers in your local area for in-person jobs.
                            </p>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-secondary]" />
                                <input 
                                    type="text" 
                                    placeholder="Enter your city or zip code" 
                                    className="w-full h-12 bg-[--color-card] border border-[--color-border] rounded-md pl-10 pr-4 text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                                />
                            </div>
                            <Button className="mt-4 w-full">Search Local Tasks</Button>
                        </div>
                        <div className="md:col-span-2 h-64 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://storage.googleapis.com/framer-ai-assets/framer-static-images/map-light.png)' }}>
                            {/* Map Image */}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </section>
    );
};

export default MapPlaceholder;