import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import {
  WorkDelivery,
  CreateWorkDeliveryData,
  RequestModificationData,
  RedeliveryData,
  DeliveryFile,
  DeliveryStatus
} from '../types/workDelivery';
import { v4 as uuidv4 } from 'uuid';

// File size limit: 150MB per file
const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB in bytes
const MAX_MODIFICATIONS = 5;

class WorkDeliveryService {
  private collectionName = 'workDeliveries';

  // Upload files to Firebase Storage
  private async uploadFiles(files: File[], deliveryId: string): Promise<DeliveryFile[]> {
    const uploadedFiles: DeliveryFile[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File "${file.name}" exceeds the 150MB size limit`);
      }

      // Create unique file path
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `work-deliveries/${deliveryId}/${fileName}`;

      try {
        // Upload file
        const storageRef = ref(storage, filePath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        uploadedFiles.push({
          name: file.name,
          url: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw new Error(`Failed to upload file "${file.name}"`);
      }
    }

    return uploadedFiles;
  }

  // Delete files from Firebase Storage
  private async deleteFiles(files: DeliveryFile[]): Promise<void> {
    for (const file of files) {
      try {
        const fileRef = ref(storage, file.url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with other files even if one fails
      }
    }
  }

  // Create new work delivery
  async createWorkDelivery(
    data: CreateWorkDeliveryData,
    freelancerId: string,
    freelancerName: string,
    clientId: string,
    clientName: string,
    deliveryDeadline: Date
  ): Promise<{ success: boolean; deliveryId?: string; error?: string }> {
    try {
      // Validate delivery deadline
      let validDeadline: Date;
      if (deliveryDeadline && deliveryDeadline instanceof Date && !isNaN(deliveryDeadline.getTime())) {
        validDeadline = deliveryDeadline;
      } else {
        // Fallback to 7 days from now if deadline is invalid
        validDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        console.warn('Invalid delivery deadline provided, using 7-day fallback:', deliveryDeadline);
      }

      // Validate files size
      const totalSize = data.files.reduce((sum, file) => sum + file.size, 0);
      if (data.files.some(file => file.size > MAX_FILE_SIZE)) {
        return { success: false, error: 'One or more files exceed the 150MB size limit' };
      }

      // Validate required content
      if (data.files.length === 0 && data.urls.length === 0) {
        return { success: false, error: 'Please provide at least one file or URL for delivery' };
      }

      if (!data.description.trim()) {
        return { success: false, error: 'Please provide a description for your delivery' };
      }

      // Create delivery document
      const deliveryData: Omit<WorkDelivery, 'id'> = {
        jobRequestId: data.jobRequestId,
        proposalId: data.proposalId,
        freelancerId,
        freelancerName,
        clientId,
        clientName,
        deliveryType: data.deliveryType,
        files: [], // Will be populated after file upload
        urls: data.urls,
        description: data.description,
        status: 'delivered',
        modificationCount: 0,
        modificationRequests: [],
        deliveryDeadline: validDeadline,
        deliveredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...deliveryData,
        deliveryDeadline: Timestamp.fromDate(validDeadline),
        deliveredAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      const deliveryId = docRef.id;

      // Upload files if any
      if (data.files.length > 0) {
        const uploadedFiles = await this.uploadFiles(data.files, deliveryId);
        await updateDoc(docRef, {
          files: uploadedFiles.map(file => ({
            ...file,
            uploadedAt: Timestamp.fromDate(file.uploadedAt)
          }))
        });
      }

      return { success: true, deliveryId };
    } catch (error) {
      console.error('Error creating work delivery:', error);
      return { success: false, error: 'Failed to submit delivery. Please try again.' };
    }
  }

  // Get work delivery by ID
  async getWorkDelivery(deliveryId: string): Promise<WorkDelivery | null> {
    try {
      const docRef = doc(db, this.collectionName, deliveryId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        deliveryDeadline: data.deliveryDeadline.toDate(),
        deliveredAt: data.deliveredAt.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        lastRedeliveredAt: data.lastRedeliveredAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        files: data.files.map((file: any) => ({
          ...file,
          uploadedAt: file.uploadedAt.toDate()
        })),
        modificationRequests: data.modificationRequests.map((req: any) => ({
          ...req,
          requestedAt: req.requestedAt.toDate()
        }))
      } as WorkDelivery;
    } catch (error) {
      console.error('Error getting work delivery:', error);
      return null;
    }
  }

  // Get work deliveries for a proposal
  async getDeliveriesForProposal(proposalId: string): Promise<WorkDelivery[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('proposalId', '==', proposalId),
        orderBy('deliveredAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          deliveryDeadline: data.deliveryDeadline.toDate(),
          deliveredAt: data.deliveredAt.toDate(),
          acceptedAt: data.acceptedAt?.toDate(),
          lastRedeliveredAt: data.lastRedeliveredAt?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          files: data.files.map((file: any) => ({
            ...file,
            uploadedAt: file.uploadedAt.toDate()
          })),
          modificationRequests: data.modificationRequests.map((req: any) => ({
            ...req,
            requestedAt: req.requestedAt.toDate()
          }))
        } as WorkDelivery;
      });
    } catch (error) {
      console.error('Error getting deliveries for proposal:', error);
      return [];
    }
  }

  // Request modification
  async requestModification(
    data: RequestModificationData,
    clientId: string,
    clientName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deliveryRef = doc(db, this.collectionName, data.deliveryId);
      
      return await runTransaction(db, async (transaction) => {
        const deliveryDoc = await transaction.get(deliveryRef);
        
        if (!deliveryDoc.exists()) {
          return { success: false, error: 'Delivery not found' };
        }

        const delivery = deliveryDoc.data() as any;
        
        // Check if maximum modifications reached
        if (delivery.modificationCount >= MAX_MODIFICATIONS) {
          return { success: false, error: `Maximum modification requests (${MAX_MODIFICATIONS}) reached` };
        }

        // Check if current status allows modification request
        if (delivery.status !== 'delivered' && delivery.status !== 're_delivered') {
          return { success: false, error: 'Cannot request modifications for this delivery status' };
        }

        // Create modification request
        const modificationRequest = {
          id: uuidv4(),
          description: data.description,
          requestedAt: Timestamp.now(),
          requestedBy: clientId,
          clientName
        };

        // Update delivery
        transaction.update(deliveryRef, {
          status: 'modification_requested',
          modificationCount: delivery.modificationCount + 1,
          modificationRequests: [...delivery.modificationRequests, modificationRequest],
          updatedAt: Timestamp.now()
        });

        return { success: true };
      });
    } catch (error) {
      console.error('Error requesting modification:', error);
      return { success: false, error: 'Failed to request modification. Please try again.' };
    }
  }

  // Re-deliver work
  async redeliverWork(
    data: RedeliveryData,
    freelancerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deliveryRef = doc(db, this.collectionName, data.deliveryId);
      const deliveryDoc = await getDoc(deliveryRef);

      if (!deliveryDoc.exists()) {
        return { success: false, error: 'Delivery not found' };
      }

      const delivery = deliveryDoc.data() as any;

      // Check if status allows re-delivery
      if (delivery.status !== 'modification_requested') {
        return { success: false, error: 'Cannot re-deliver work at this time' };
      }

      // Validate required content
      if (data.files.length === 0 && data.urls.length === 0) {
        return { success: false, error: 'Please provide at least one file or URL for re-delivery' };
      }

      if (!data.description.trim()) {
        return { success: false, error: 'Please provide a description for your re-delivery' };
      }

      // Delete old files if replacing with new files
      if (data.files.length > 0 && delivery.files.length > 0) {
        await this.deleteFiles(delivery.files.map((file: any) => ({
          ...file,
          uploadedAt: file.uploadedAt.toDate()
        })));
      }

      // Upload new files if any
      let uploadedFiles: DeliveryFile[] = delivery.files;
      if (data.files.length > 0) {
        uploadedFiles = await this.uploadFiles(data.files, data.deliveryId);
      }

      // Update delivery
      await updateDoc(deliveryRef, {
        deliveryType: data.deliveryType,
        files: uploadedFiles.map(file => ({
          ...file,
          uploadedAt: Timestamp.fromDate(file.uploadedAt)
        })),
        urls: data.urls,
        description: data.description,
        status: 're_delivered',
        lastRedeliveredAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      console.error('Error re-delivering work:', error);
      return { success: false, error: 'Failed to re-deliver work. Please try again.' };
    }
  }

  // Accept work delivery
  async acceptDelivery(
    deliveryId: string,
    clientId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      
      return await runTransaction(db, async (transaction) => {
        const deliveryDoc = await transaction.get(deliveryRef);
        
        if (!deliveryDoc.exists()) {
          return { success: false, error: 'Delivery not found' };
        }

        const delivery = deliveryDoc.data() as any;
        
        // Verify client has permission to accept
        if (delivery.clientId !== clientId) {
          return { success: false, error: 'You do not have permission to accept this delivery' };
        }

        // Check if status allows acceptance
        if (delivery.status !== 'delivered' && delivery.status !== 're_delivered') {
          return { success: false, error: 'Cannot accept delivery with current status' };
        }

        // Update delivery status
        transaction.update(deliveryRef, {
          status: 'accepted',
          acceptedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return { success: true };
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      return { success: false, error: 'Failed to accept delivery. Please try again.' };
    }
  }

  // Reject work delivery (only for delivered/re-delivered status, not final rejection)
  async rejectDelivery(
    deliveryId: string,
    clientId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.requestModification(
        { deliveryId, description: reason },
        clientId,
        'Client' // This should ideally be the actual client name
      );
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      return { success: false, error: 'Failed to reject delivery. Please try again.' };
    }
  }

  // Get latest delivery for proposal
  async getLatestDeliveryForProposal(proposalId: string): Promise<WorkDelivery | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('proposalId', '==', proposalId),
        orderBy('deliveredAt', 'desc'),
        limit(1)
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
        deliveryDeadline: data.deliveryDeadline.toDate(),
        deliveredAt: data.deliveredAt.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        lastRedeliveredAt: data.lastRedeliveredAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        files: data.files.map((file: any) => ({
          ...file,
          uploadedAt: file.uploadedAt.toDate()
        })),
        modificationRequests: data.modificationRequests.map((req: any) => ({
          ...req,
          requestedAt: req.requestedAt.toDate()
        }))
      } as WorkDelivery;
    } catch (error) {
      console.error('Error getting latest delivery:', error);
      return null;
    }
  }
}

// Export singleton instance
export const workDeliveryService = new WorkDeliveryService();

// Export individual functions for backward compatibility
export const {
  createWorkDelivery,
  getWorkDelivery,
  getDeliveriesForProposal,
  requestModification,
  redeliverWork,
  acceptDelivery,
  rejectDelivery,
  getLatestDeliveryForProposal
} = workDeliveryService;