import React from 'react';
import { motion } from 'framer-motion';
import { User, Search, CheckCircle } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      stepNumber: "Step 01",
      icon: User,
      title: "Create Your Profile",
      description: "Build a professional profile that helps employers and organizers understand your skills."
    },
    {
      stepNumber: "Step 02",
      icon: Search,
      title: "Discover Opportunities",
      description: "Browse verified jobs, internships and events posted by trusted companies across Pakistan."
    },
    {
      stepNumber: "Step 03",
      icon: CheckCircle,
      title: "Apply Instantly",
      description: "Apply, register or save opportunities in seconds with a simple and focused experience."
    }
  ];

  return (
    <section id="about" className="py-20 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b1220] tracking-tight mb-3"
          >
            How Fogsly Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-[#5b6b82] font-medium"
          >
            Your next opportunity in 3 simple steps
          </motion.p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-white border border-[#dbe6f3] rounded-3xl p-8 shadow-sm hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-2xl transition-all duration-300 group flex flex-col"
              >
                <div>
                  <span className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-black text-[#1d4ed8] bg-[#edf5ff]">
                    {step.stepNumber}
                  </span>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#edf5ff] to-[#e7f0ff] text-[#1d4ed8] flex items-center justify-center my-6 text-2xl group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-[#0b1220] mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#5b6b82] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
