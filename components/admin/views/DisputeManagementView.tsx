import React from 'react';
import { Scale, MessageSquare, Shield, Gavel, CheckCircle } from 'lucide-react';

const disputes = [
  { id: 'DIS-001', title: 'Gig deliverable not as described', parties: 'Client A vs Freelancer X', stage: 'new' },
  { id: 'DIS-002', title: 'Late delivery of project assets', parties: 'Client B vs Freelancer Y', stage: 'mediator' },
  { id: 'DIS-003', title: 'Payment not released after work', parties: 'Freelancer Z vs Client C', stage: 'new' },
  { id: 'DIS-004', title: 'Unresponsive client for milestone', parties: 'Freelancer W vs Client D', stage: 'direct' },
  { id: 'DIS-005', title: 'Disagreement on final revision', parties: 'Client E vs Freelancer V', stage: 'arbitration' },
  { id: 'DIS-006', title: 'Task marked incomplete unfairly', parties: 'Tasker U vs Client F', stage: 'resolved' },
];

// FIX: Define a type for a single dispute to avoid circular type references.
type Dispute = typeof disputes[0];

const stages = [
  { id: 'new', title: 'New Disputes', icon: <MessageSquare className="text-blue-400" /> },
  { id: 'direct', title: 'Direct Communication', icon: <MessageSquare className="text-cyan-400" /> },
  { id: 'mediator', title: 'Mediator Review', icon: <Shield className="text-yellow-400" /> },
  { id: 'arbitration', title: 'Arbitration', icon: <Gavel className="text-red-400" /> },
  { id: 'resolved', title: 'Resolved', icon: <CheckCircle className="text-green-400" /> },
];

// FIX: Define a type for a single stage for consistency.
type Stage = typeof stages[0];

const DisputeCard = ({ dispute }: { dispute: Dispute }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing">
    <p className="text-xs text-gray-400 font-mono">{dispute.id}</p>
    <p className="font-semibold text-white mt-1 text-sm">{dispute.title}</p>
    <p className="text-xs text-gray-400 mt-2">{dispute.parties}</p>
  </div>
);

const DisputeColumn = ({ stage, disputes }: { stage: Stage, disputes: Dispute[] }) => (
  <div className="flex-1 min-w-[280px] bg-slate-900/50 rounded-lg p-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 px-2 pb-3">
      {stage.icon}
      {stage.title}
      <span className="text-xs bg-slate-700 text-gray-400 rounded-full px-2 py-0.5">{disputes.length}</span>
    </h3>
    <div className="space-y-3 h-full overflow-y-auto">
      {disputes.map(d => <DisputeCard key={d.id} dispute={d} />)}
    </div>
  </div>
);

const DisputeManagementView = () => {
  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-2xl font-bold">Dispute Management</h2>
        <p className="text-gray-400 text-sm mt-1">Track and resolve user disputes through a staged process.</p>
      </div>
      
      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <DisputeColumn 
            key={stage.id} 
            stage={stage}
            disputes={disputes.filter(d => d.stage === stage.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DisputeManagementView;