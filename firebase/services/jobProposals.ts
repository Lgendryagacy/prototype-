import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import { 
  JobProposal, 
  ProposalFormData, 
  ProposalStatus,
  ProposalStats 
} from '../types/proposal';
import { createJobConversation } from './jobMessaging';

const COLLECTION_NAME = 'JobsProposal';

/**
 * Submit a new job proposal
 */
export const submitJobProposal = async (
  jobId: string,
  freelancerId: string,
  freelancerName: string,
  freelancerEmail: string,
  formData: ProposalFormData
): Promise<string> => {
  try {
    // Upload attachments to Firebase Storage
    const uploadedAttachments = await Promise.all(
      formData.attachments.map(async (file) => {
        const storageRef = ref(storage, `proposals/${jobId}/${freelancerId}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        return {
          name: file.name,
          url,
          size: file.size,
          type: file.type
        };
      })
    );

    const proposalData = {
      jobId,
      freelancerId,
      freelancerName,
      freelancerEmail,
      bidAmount: formData.bidAmount,
      bidCurrency: formData.bidCurrency,
      deliveryTime: formData.deliveryTime,
      deliveryTimeUnit: formData.deliveryTimeUnit,
      coverLetter: formData.coverLetter,
      relevantExperience: formData.relevantExperience || '',
      portfolioLinks: formData.portfolioLinks.filter(link => link.trim() !== ''),
      questionsForClient: formData.questionsForClient || '',
      availability: formData.availability,
      attachments: uploadedAttachments,
      status: 'pending' as ProposalStatus,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isWithdrawn: false
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), proposalData);
    console.log('✅ Proposal submitted successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting proposal:', error);
    throw error;
  }
};

/**
 * Check if user has already applied to a job
 */
export const hasUserAppliedToJob = async (
  jobId: string,
  freelancerId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('jobId', '==', jobId),
      where('freelancerId', '==', freelancerId),
      where('isWithdrawn', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking application status:', error);
    return false;
  }
};

/**
 * Get user's proposal for a specific job
 */
export const getUserProposalForJob = async (
  jobId: string,
  freelancerId: string
): Promise<JobProposal | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('jobId', '==', jobId),
      where('freelancerId', '==', freelancerId),
      where('isWithdrawn', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
      withdrawnAt: data.withdrawnAt?.toDate()
    } as JobProposal;
  } catch (error) {
    console.error('❌ Error getting user proposal:', error);
    return null;
  }
};

/**
 * Get all proposals for a specific freelancer
 */
export const getFreelancerProposals = async (
  freelancerId: string,
  statusFilter?: ProposalStatus
): Promise<JobProposal[]> => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('freelancerId', '==', freelancerId),
      where('isWithdrawn', '==', false),
      orderBy('submittedAt', 'desc')
    );

    if (statusFilter) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('freelancerId', '==', freelancerId),
        where('status', '==', statusFilter),
        where('isWithdrawn', '==', false),
        orderBy('submittedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const proposals: JobProposal[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      proposals.push({
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        withdrawnAt: data.withdrawnAt?.toDate()
      } as JobProposal);
    });

    return proposals;
  } catch (error) {
    console.error('❌ Error fetching freelancer proposals:', error);
    throw error;
  }
};

/**
 * Get all proposals for a specific job
 */
export const getJobProposals = async (jobId: string): Promise<JobProposal[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('jobId', '==', jobId),
      where('isWithdrawn', '==', false),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const proposals: JobProposal[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      proposals.push({
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        withdrawnAt: data.withdrawnAt?.toDate()
      } as JobProposal);
    });

    return proposals;
  } catch (error) {
    console.error('❌ Error fetching job proposals:', error);
    throw error;
  }
};

/**
 * Get proposal statistics for a job
 */
export const getProposalStats = async (jobId: string): Promise<ProposalStats> => {
  try {
    const proposals = await getJobProposals(jobId);
    
    return {
      total: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      closed: proposals.filter(p => p.status === 'closed').length
    };
  } catch (error) {
    console.error('❌ Error calculating proposal stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 };
  }
};

/**
 * Withdraw a proposal (freelancer action)
 */
export const withdrawProposal = async (proposalId: string): Promise<void> => {
  try {
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    await updateDoc(proposalRef, {
      isWithdrawn: true,
      withdrawnAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Proposal withdrawn successfully');
  } catch (error) {
    console.error('❌ Error withdrawing proposal:', error);
    throw error;
  }
};

/**
 * Approve a proposal (client action)
 * This will:
 * 1. Set proposal status to 'approved'
 * 2. Close the job
 * 3. Set all other pending proposals to 'closed'
 * 4. Create a job conversation between client and freelancer
 */
export const approveProposal = async (
  proposalId: string,
  jobId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    const batch = writeBatch(db);
    
    // Get the proposal details first
    const proposalDoc = await getDoc(doc(db, COLLECTION_NAME, proposalId));
    if (!proposalDoc.exists()) {
      return {
        success: false,
        error: 'Proposal not found'
      };
    }
    
    const proposalData = proposalDoc.data();
    
    // Get job details
    const jobDoc = await getDoc(doc(db, 'FogslyJobs', jobId));
    if (!jobDoc.exists()) {
      return {
        success: false,
        error: 'Job not found'
      };
    }
    
    const jobData = jobDoc.data();
    
    // 1. Approve the selected proposal
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    
    // Calculate deadline based on deliveryTime
    const now = new Date();
    const deliveryTime = proposalData.deliveryTime || 0;
    const deliveryTimeUnit = proposalData.deliveryTimeUnit || 'days';
    
    let deadlineDate = new Date(now);
    if (deliveryTimeUnit === 'days') {
      deadlineDate.setDate(deadlineDate.getDate() + deliveryTime);
    } else if (deliveryTimeUnit === 'weeks') {
      deadlineDate.setDate(deadlineDate.getDate() + (deliveryTime * 7));
    } else if (deliveryTimeUnit === 'months') {
      deadlineDate.setMonth(deadlineDate.getMonth() + deliveryTime);
    }
    
    batch.update(proposalRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      deadline: Timestamp.fromDate(deadlineDate),
      updatedAt: serverTimestamp()
    });

    // 2. Close the job
    const jobRef = doc(db, 'FogslyJobs', jobId);
    batch.update(jobRef, {
      status: 'closed',
      updatedAt: serverTimestamp()
    });

    // 3. Get all other pending proposals for this job
    const q = query(
      collection(db, COLLECTION_NAME),
      where('jobId', '==', jobId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    
    // 4. Close all other pending proposals
    snapshot.forEach((docSnapshot) => {
      if (docSnapshot.id !== proposalId) {
        const otherProposalRef = doc(db, COLLECTION_NAME, docSnapshot.id);
        batch.update(otherProposalRef, {
          status: 'closed',
          updatedAt: serverTimestamp()
        });
      }
    });

    // Commit all changes atomically
    await batch.commit();
    
    // 5. Create job conversation
    const conversationResult = await createJobConversation(
      jobId,
      jobData.jobTitle || 'Untitled Job',
      jobData.userId,
      jobData.userName || 'Client',
      proposalData.freelancerId,
      proposalData.freelancerName,
      proposalData.freelancerEmail,
      proposalId
    );
    
    console.log('✅ Proposal approved, job closed, and conversation created successfully');
    
    return {
      success: true,
      conversationId: conversationResult.conversationId
    };
  } catch (error) {
    console.error('❌ Error approving proposal:', error);
    return {
      success: false,
      error: 'Failed to approve proposal'
    };
  }
};

/**
 * Reject a proposal (client action)
 */
export const rejectProposal = async (proposalId: string): Promise<void> => {
  try {
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    await updateDoc(proposalRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Proposal rejected successfully');
  } catch (error) {
    console.error('❌ Error rejecting proposal:', error);
    throw error;
  }
};

/**
 * Get a single proposal by ID
 */
export const getProposalById = async (proposalId: string): Promise<JobProposal | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, proposalId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
      rejectedAt: data.rejectedAt?.toDate(),
      withdrawnAt: data.withdrawnAt?.toDate(),
      deadline: data.deadline?.toDate(),
      modificationRequest: data.modificationRequest ? {
        ...data.modificationRequest,
        requestedAt: data.modificationRequest.requestedAt?.toDate() || new Date()
      } : undefined
    } as JobProposal;
  } catch (error) {
    console.error('❌ Error fetching proposal:', error);
    return null;
  }
};

/**
 * Count proposals for freelancer by status
 */
export const countFreelancerProposals = async (
  freelancerId: string
): Promise<ProposalStats> => {
  try {
    const proposals = await getFreelancerProposals(freelancerId);
    
    return {
      total: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      closed: proposals.filter(p => p.status === 'closed').length
    };
  } catch (error) {
    console.error('❌ Error counting proposals:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0, closed: 0 };
  }
};

/**
 * Submit a modification request to a proposal (client only)
 */
export const submitModificationRequest = async (
  proposalId: string,
  newDeliveryTime?: number,
  newDeliveryTimeUnit?: 'days' | 'weeks' | 'months',
  newBidAmount?: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    
    await updateDoc(proposalRef, {
      modificationRequest: {
        newDeliveryTime,
        newDeliveryTimeUnit,
        newBidAmount,
        reason,
        status: 'pending',
        requestedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Modification request submitted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error submitting modification request:', error);
    return {
      success: false,
      error: 'Failed to submit modification request'
    };
  }
};

/**
 * Accept a modification request (freelancer only)
 * This will update the proposal's delivery time and/or budget and recalculate deadline
 */
export const acceptModificationRequest = async (
  proposalId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the proposal with modification request
    const proposalDoc = await getDoc(doc(db, COLLECTION_NAME, proposalId));
    if (!proposalDoc.exists()) {
      return { success: false, error: 'Proposal not found' };
    }
    
    const proposalData = proposalDoc.data();
    const modRequest = proposalData.modificationRequest;
    
    if (!modRequest || modRequest.status !== 'pending') {
      return { success: false, error: 'No pending modification request found' };
    }
    
    // Prepare update object
    const updates: any = {
      'modificationRequest.status': 'accepted',
      updatedAt: serverTimestamp()
    };
    
    // Update delivery time if changed
    if (modRequest.newDeliveryTime !== undefined && modRequest.newDeliveryTimeUnit) {
      updates.deliveryTime = modRequest.newDeliveryTime;
      updates.deliveryTimeUnit = modRequest.newDeliveryTimeUnit;
      
      // Recalculate deadline based on approval date
      const approvedAt = proposalData.approvedAt?.toDate() || new Date();
      let newDeadline = new Date(approvedAt);
      
      if (modRequest.newDeliveryTimeUnit === 'days') {
        newDeadline.setDate(newDeadline.getDate() + modRequest.newDeliveryTime);
      } else if (modRequest.newDeliveryTimeUnit === 'weeks') {
        newDeadline.setDate(newDeadline.getDate() + (modRequest.newDeliveryTime * 7));
      } else if (modRequest.newDeliveryTimeUnit === 'months') {
        newDeadline.setMonth(newDeadline.getMonth() + modRequest.newDeliveryTime);
      }
      
      updates.deadline = Timestamp.fromDate(newDeadline);
    }
    
    // Update bid amount if changed
    if (modRequest.newBidAmount !== undefined) {
      updates.bidAmount = modRequest.newBidAmount;
    }
    
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    await updateDoc(proposalRef, updates);
    
    console.log('✅ Modification request accepted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error accepting modification request:', error);
    return {
      success: false,
      error: 'Failed to accept modification request'
    };
  }
};

/**
 * Reject a modification request (freelancer only)
 */
export const rejectModificationRequest = async (
  proposalId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const proposalRef = doc(db, COLLECTION_NAME, proposalId);
    
    await updateDoc(proposalRef, {
      'modificationRequest.status': 'rejected',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Modification request rejected successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error rejecting modification request:', error);
    return {
      success: false,
      error: 'Failed to reject modification request'
    };
  }
};
