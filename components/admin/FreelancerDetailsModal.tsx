import React from 'react';
import { X, Mail, Phone, DollarSign, Clock, Star, Briefcase, Award, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FreelanceRequest } from '../../firebase/services/freelanceRequests';

interface FreelancerDetailsModalProps {
  request: FreelanceRequest;
  onClose: () => void;
}

const FreelancerDetailsModal: React.FC<FreelancerDetailsModalProps> = ({ request, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[--color-bg-primary] rounded-xl max-w-5xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[--color-border] flex justify-between items-start sticky top-0 bg-[--color-bg-primary] z-10">
          <div>
            <h2 className="text-2xl font-bold mb-1">{request.fullName}</h2>
            <p className="text-[--color-text-secondary]">{request.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[--color-text-secondary] hover:text-[--color-text-primary] p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Contact & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-[--color-primary]" />
                Contact Information
              </h3>
              <p className="text-sm text-[--color-text-secondary]">
                <span className="font-medium">Email:</span> {request.userEmail}
              </p>
              <p className="text-sm text-[--color-text-secondary]">
                <span className="font-medium">User ID:</span> {request.userId}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-[--color-primary]" />
                Stats & Status
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={`
                  ${request.requestStatus === 'approved' ? 'bg-green-500/20 text-green-600' : ''}
                  ${request.requestStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : ''}
                  ${request.requestStatus === 'rejected' ? 'bg-red-500/20 text-red-600' : ''}
                `}>
                  {request.requestStatus.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-[--color-bg-secondary] p-2 rounded-lg">
                  <p className="text-xs text-[--color-text-secondary]">Total Jobs</p>
                  <p className="text-lg font-bold">{request.totalJobs}</p>
                </div>
                <div className="bg-[--color-bg-secondary] p-2 rounded-lg">
                  <p className="text-xs text-[--color-text-secondary]">Reviews</p>
                  <p className="text-lg font-bold">{request.totalReviews}</p>
                </div>
                <div className="bg-[--color-bg-secondary] p-2 rounded-lg">
                  <p className="text-xs text-[--color-text-secondary]">Total Earnings</p>
                  <p className="text-lg font-bold">${request.totalEarnings}</p>
                </div>
                <div className="bg-[--color-bg-secondary] p-2 rounded-lg">
                  <p className="text-xs text-[--color-text-secondary]">Avg Rating</p>
                  <p className="text-lg font-bold">{request.averageRating.toFixed(1)} ⭐</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Professional Bio</h3>
            <p className="text-[--color-text-secondary] whitespace-pre-wrap">{request.bio}</p>
          </div>

          {/* Skills & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {request.categories.map((category, index) => (
                  <Badge key={index} className="bg-[--color-primary]/10 text-[--color-primary]">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {request.skills.map((skill, index) => (
                  <Badge key={index} className="bg-blue-500/10 text-blue-600">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Items */}
          {request.portfolioItems && request.portfolioItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[--color-primary]" />
                Portfolio ({request.portfolioItems.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.portfolioItems.map((item, index) => (
                  <div key={index} className="border border-[--color-border] rounded-lg overflow-hidden">
                    {item.image && (
                      <div className="aspect-video bg-gray-900">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-[--color-text-secondary] mb-2">
                        {item.description}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[--color-primary] hover:underline flex items-center gap-1"
                        >
                          View Project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rates & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[--color-primary]" />
                <h3 className="font-semibold">Hourly Rate</h3>
              </div>
              <p className="text-2xl font-bold">
                {request.currency} {request.hourlyRate}/hr
              </p>
            </div>

            <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[--color-primary]" />
                <h3 className="font-semibold">Availability</h3>
              </div>
              <p className="text-lg capitalize">{request.availability}</p>
            </div>

            <div className="bg-[--color-bg-secondary] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-[--color-primary]" />
                <h3 className="font-semibold">Experience</h3>
              </div>
              <p className="text-lg capitalize">{request.experience}</p>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {request.languages.map((lang, index) => (
                <Badge key={index} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {request.education && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Education</h3>
                <p className="text-[--color-text-secondary] whitespace-pre-wrap">
                  {request.education}
                </p>
              </div>
            )}

            {request.certifications && request.certifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Certifications</h3>
                <ul className="list-disc list-inside space-y-1">
                  {request.certifications.map((cert, index) => (
                    <li key={index} className="text-[--color-text-secondary]">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="text-sm text-[--color-text-secondary] pt-4 border-t border-[--color-border]">
            <span className="font-medium">Submitted:</span>{' '}
            {request.createdAt?.toDate?.().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) || 'N/A'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[--color-border] flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetailsModal;
