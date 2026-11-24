import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/Accordion';

interface ServicePreviewProps {
  onClose: () => void;
  onBack: () => void;
}

const ServicePreview = ({ onClose, onBack }: ServicePreviewProps) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('servicePreviewData');
    if (stored) {
      const data = JSON.parse(stored);
      setPreviewData(data);
      setActiveImage(data.mainImagePreview);
    }
  }, []);

  if (!previewData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[--color-card] rounded-xl p-8">
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  const currentPackage = previewData.pricing.type === 'fixed' 
    ? previewData.pricing.packages?.[selectedPackage]
    : null;

  const priceDisplay = previewData.pricing.type === 'hourly'
    ? `PKR ${previewData.pricing.hourlyRate?.rate || 0}/hour`
    : currentPackage
      ? `PKR ${currentPackage.price.toLocaleString()}`
      : 'PKR 0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[--color-bg-primary] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[--color-border] bg-[--color-card]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-2xl font-bold text-[--color-text-primary]">
              Service Preview
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Main Content */}
              <main className="lg:col-span-7 xl:col-span-8 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    {previewData.categories.map((category: string) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">{previewData.title}</h1>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-[--color-text-secondary]">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star size={16} className="fill-yellow-500" /> 4.9
                      <span className="text-[--color-text-secondary] font-normal ml-1">(127 reviews)</span>
                    </div>
                    <span className="text-[--color-text-secondary]">-</span>
                    <span>By <strong>Your Brand</strong></span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div>
                    {activeImage && (
                      <img 
                        src={activeImage} 
                        alt={previewData.title} 
                        className="rounded-lg w-full aspect-[2/1] object-cover border border-[--color-border]"
                      />
                    )}
                    {previewData.thumbnailPreviews && previewData.thumbnailPreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[previewData.mainImagePreview, ...previewData.thumbnailPreviews].map((url: string, index: number) => (
                          <button key={index} onClick={() => setActiveImage(url)}>
                            <img 
                              src={url} 
                              alt={`Thumbnail ${index + 1}`} 
                              className={`rounded w-full aspect-[2/1] object-cover transition-all ${
                                activeImage === url 
                                  ? 'ring-2 ring-[--color-primary] ring-offset-2 ring-offset-[--color-bg-primary]' 
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap">
                        {previewData.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {previewData.faqs && previewData.faqs.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Frequently Asked Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion>
                          {previewData.faqs.map((faq: any, index: number) => (
                            <AccordionItem key={faq.id} value={`item-${index}`}>
                              <AccordionTrigger>{faq.question}</AccordionTrigger>
                              <AccordionContent>{faq.answer}</AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="lg:col-span-5 xl:col-span-4">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.35 }} 
                  className="sticky top-24"
                >
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>
                        {previewData.pricing.type === 'hourly' ? 'Hourly Rate' : 'Service Packages'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {previewData.pricing.type === 'hourly' ? (
                        <div>
                          <h2 className="font-bold text-3xl text-[--color-primary]">{priceDisplay}</h2>
                          <p className="text-sm text-[--color-text-secondary] mt-2">
                            Minimum {previewData.pricing.hourlyRate?.minimumHours || 1} hour(s)
                          </p>
                          <div className="pt-4 space-y-3">
                            <Button size="lg" className="w-full">
                              Continue ({priceDisplay})
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {previewData.pricing.packages && previewData.pricing.packages.length > 1 && (
                            <div className="flex gap-1 mb-4">
                              {previewData.pricing.packages.map((pkg: any, index: number) => (
                                <Button
                                  key={pkg.id}
                                  variant={selectedPackage === index ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setSelectedPackage(index)}
                                  className="flex-1"
                                >
                                  {pkg.name}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {currentPackage && (
                            <div>
                              <h2 className="font-bold text-3xl text-[--color-primary]">{priceDisplay}</h2>
                              <div className="flex items-center gap-4 text-sm font-medium mt-4 mb-4">
                                <span className="flex items-center gap-2">
                                  <Clock size={16} /> {currentPackage.deliveryTime}
                                </span>
                              </div>
                              <div className="space-y-2 mb-6">
                                <p className="text-sm font-semibold">What's Included:</p>
                                <ul className="text-sm space-y-2">
                                  {currentPackage.features
                                    .filter((feature: string) => feature.trim())
                                    .map((feature: string, index: number) => (
                                      <li key={index} className="flex items-center gap-2 text-[--color-text-secondary]">
                                        <Check size={16} className="text-green-500" /> {feature}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                              <div className="pt-4 space-y-3">
                                <Button size="lg" className="w-full">
                                  Continue ({priceDisplay})
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePreview;