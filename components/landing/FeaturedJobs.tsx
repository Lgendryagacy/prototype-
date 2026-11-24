import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface FeaturedJobsProps {
  navigate: (route: string) => void;
}

interface JobItem {
  id: string;
  title: string;
  company: string;
  logoText: string;
  location: string;
  type: string;
  badgeClass: string;
  salary: string;
  posted: string;
}

const jobsData: JobItem[] = [
  { id: '1', title: "Frontend Developer", company: "TechNova", logoText: "TN", location: "Remote", type: "Full-time", badgeClass: "text-[#1d4ed8] bg-[#edf5ff]", salary: "PKR 120k–180k", posted: "2h ago" },
  { id: '2', title: "Marketing Intern", company: "BrandWave", logoText: "BW", location: "Lahore", type: "Internship", badgeClass: "text-[#047857] bg-[#eafbf5]", salary: "PKR 25k–40k", posted: "Today" },
  { id: '3', title: "UI/UX Designer", company: "Designly", logoText: "DS", location: "Islamabad", type: "Full-time", badgeClass: "text-[#1d4ed8] bg-[#edf5ff]", salary: "PKR 100k–160k", posted: "1d ago" },
  { id: '4', title: "Laravel Developer", company: "CodeCraft", logoText: "CC", location: "Remote", type: "Contract", badgeClass: "text-[#5b4df6] bg-[#f1efff]", salary: "PKR 90k–150k", posted: "2d ago" },
  { id: '5', title: "Social Media Manager", company: "GrowthLab", logoText: "GL", location: "Karachi", type: "Full-time", badgeClass: "text-[#1d4ed8] bg-[#edf5ff]", salary: "PKR 70k–120k", posted: "3d ago" },
  { id: '6', title: "Content Writer", company: "WriteHub", logoText: "WH", location: "Remote", type: "Part-time", badgeClass: "text-[#047857] bg-[#eafbf5]", salary: "PKR 40k–80k", posted: "4d ago" }
];

const FeaturedJobs: React.FC<FeaturedJobsProps> = ({ navigate }) => {
  return (
    <section id="jobs" className="py-20 sm:py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 mb-3 shadow-xs"
          >
            <img src="/images/quick-actions/badge-job-3d.svg" alt="3D Job" className="w-4 h-4 object-contain filter drop-shadow-xs" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Career Hub • FOG Jobs
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-3"
          >
            Real Jobs. Verified Employers.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed"
          >
            Browse the latest opportunities from trusted companies
          </motion.p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {jobsData.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {job.logoText}
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-900 dark:text-white text-base">
                        {job.company}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <img src="/images/quick-actions/badge-verified-3d.svg" alt="3D Verified" className="w-3.5 h-3.5 object-contain" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${job.badgeClass}`}>
                    {job.type}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {job.title}
                </h3>

                <div className="flex items-center gap-3 text-xs font-normal text-slate-500 dark:text-slate-400 mb-5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {job.posted}
                  </span>
                </div>
              </div>

              {/* Bottom: Salary + Apply Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-baseline justify-between mb-4">
                  <strong className="text-base font-bold text-slate-900 dark:text-white">{job.salary}</strong>
                  <small className="text-xs text-slate-500 dark:text-slate-400 font-normal">Monthly</small>
                </div>
                <button
                  id={`btn-apply-job-${job.id}`}
                  onClick={() => navigate('fog-jobs')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all text-xs cursor-pointer shadow-sm"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button
            id="btn-view-all-jobs"
            onClick={() => navigate('fog-jobs')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-sm"
          >
            <span>View All Jobs →</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedJobs;
