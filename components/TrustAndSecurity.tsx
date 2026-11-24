import React from 'react';
import { motion } from 'framer-motion';
import { trustFeatures } from '../constants';

const TrustAndSecurity = () => {
  return (
    <section className="py-10 bg-[--color-bg-secondary]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 mb-4">
                 <feature.icon className='h-full w-full' />
              </div>
              <h3 className="font-semibold text-lg text-[--color-text-primary]">{feature.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustAndSecurity;