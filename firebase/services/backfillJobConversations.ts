import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config';
import { createJobConversation } from './jobMessaging';

/**
 * This function creates conversations for proposals that were approved
 * before the chat system was implemented.
 * 
 * Run this once to backfill existing approved proposals.
 */
export const backfillJobConversations = async () => {
  try {
    console.log('🔄 Starting backfill for approved proposals...');
    
    // Get all approved proposals
    const proposalsQuery = query(
      collection(db, 'JobsProposal'),
      where('status', '==', 'approved')
    );
    
    const proposalsSnapshot = await getDocs(proposalsQuery);
    console.log(`📋 Found ${proposalsSnapshot.size} approved proposals`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const proposalDoc of proposalsSnapshot.docs) {
      const proposal = proposalDoc.data();
      const proposalId = proposalDoc.id;
      
      try {
        // Get job details
        const jobDoc = await getDocs(
          query(collection(db, 'FogslyJobs'), where('__name__', '==', proposal.jobId))
        );
        
        if (jobDoc.empty) {
          console.log(`⚠️ Job not found for proposal ${proposalId}`);
          skipped++;
          continue;
        }
        
        const job = jobDoc.docs[0].data();
        
        // Create conversation
        const result = await createJobConversation(
          proposal.jobId,
          job.jobTitle || 'Untitled Job',
          job.userId,
          job.userName || 'Client',
          proposal.freelancerId,
          proposal.freelancerName,
          proposal.freelancerEmail,
          proposalId
        );
        
        if (result.success) {
          console.log(`✅ Created conversation for proposal ${proposalId}`);
          created++;
        } else {
          console.log(`⚠️ Conversation already exists for proposal ${proposalId}`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error processing proposal ${proposalId}:`, error);
        errors++;
      }
    }
    
    console.log(`\n📊 Backfill Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${proposalsSnapshot.size}`);
    
    return { created, skipped, errors, total: proposalsSnapshot.size };
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    throw error;
  }
};

/**
 * Create conversation for a specific approved proposal
 */
export const createConversationForProposal = async (
  proposalId: string,
  jobId: string,
  jobTitle: string,
  clientId: string,
  clientName: string,
  freelancerId: string,
  freelancerName: string,
  freelancerEmail: string
) => {
  return await createJobConversation(
    jobId,
    jobTitle,
    clientId,
    clientName,
    freelancerId,
    freelancerName,
    freelancerEmail,
    proposalId
  );
};
