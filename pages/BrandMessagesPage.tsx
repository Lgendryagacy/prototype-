import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Route } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Search, Send, Loader2, Image as ImageIcon, Video, FileText, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { ConversationItem } from '../components/chat/ConversationItem';
import { MessageInput } from '../components/chat/MessageInput';
import { ServiceListMessage } from '../components/chat/ServiceListMessage';
import { ServiceInquiryMessage } from '../components/chat/ServiceInquiryMessage';
import { User } from '../firebase/types/user';
import { ChatMessage, Conversation, PaymentRequestData } from '../firebase/types/message';
import {
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead
} from '../firebase/services/messageService';
import { convertPKRtoFOG } from '../firebase/services/servicePaymentService';
import { getUserBrand } from '../firebase/services/brandService';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

interface BrandMessagesPageProps {
  navigate: (route: Route, context?: any, options?: { name?: string }) => void;
  brandId: string;
  user?: User | null;
  isLoggedIn?: boolean;
}

const BrandMessagesPage = ({ navigate, brandId, user, isLoggedIn }: BrandMessagesPageProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendingMessages, setSendingMessages] = useState<ChatMessage[]>([]); // Optimistic messages
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showPaymentRequest, setShowPaymentRequest] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ title: '', description: '', priceInPKR: '' });
  const [fogConversion, setFogConversion] = useState({ priceInFOG: 0, platformFee: 0, brandReceives: 0, conversionRate: 0 });
  const [loadingConversion, setLoadingConversion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeConversations = useRef<(() => void) | null>(null);
  const unsubscribeMessages = useRef<(() => void) | null>(null);

  // Check if user is logged in and brand status
  useEffect(() => {
    if (!user || !isLoggedIn) {
      toast.error('Please login to access messages');
      navigate('auth');
      return;
    }

    if (!brandId) {
      toast.error('Brand ID is required');
      navigate('brand-dashboard');
      return;
    }

    // Check brand status - only approved/active brands can access messages
    const checkBrandStatus = async () => {
      try {
        const brandData = await getUserBrand(user.uid);

        if (!brandData) {
          toast.error('Brand not found. Please create or get your brand approved first.');
          navigate('brand-dashboard');
          return;
        }

        // Restrict access if brand is frozen
        if (brandData.status === 'frozen') {
          toast.error('Your brand is currently paused. You cannot access messages.');
          navigate('brand-dashboard');
          return;
        }

        // Brand status should be 'approved' or 'active' to access messages
        // If getUserBrand returns a brand, it means it's already approved
        // (pending/rejected requests don't become Brand objects)
      } catch (error) {
        console.error('Error checking brand status:', error);
        toast.error('Failed to verify brand status');
        navigate('brand-dashboard');
      }
    };

    checkBrandStatus();
  }, [user, isLoggedIn, brandId, navigate]);

  // Subscribe to brand's conversations
  useEffect(() => {
    if (!brandId) return;

    setLoading(true);

    // Query conversations where this brand is a participant
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('brandId', '==', brandId),
      orderBy('lastMessageTime', 'desc')
    );

    unsubscribeConversations.current = onSnapshot(conversationsQuery, (snapshot) => {
      const convos: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          brandId: data.brandId,
          brandName: data.brandName,
          brandLogo: data.brandLogo,
          lastMessage: data.lastMessage,
          lastMessageType: data.lastMessageType,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
          unreadBy: data.unreadBy || 'none',
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });

      // Deduplicate conversations - keep only the latest conversation per customer
      const uniqueConversations = new Map<string, Conversation>();

      convos.forEach(convo => {
        const existing = uniqueConversations.get(convo.userId);
        if (!existing || convo.lastMessageTime > existing.lastMessageTime) {
          uniqueConversations.set(convo.userId, convo);
        }
      });

      const deduplicatedConvos = Array.from(uniqueConversations.values())
        .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      setConversations(deduplicatedConvos);
      setLoading(false);
    });

    return () => {
      if (unsubscribeConversations.current) {
        unsubscribeConversations.current();
      }
    };
  }, [brandId]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);

    unsubscribeMessages.current = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
      setMessagesLoading(false);

      // Scroll to latest message after messages load
      if (msgs.length > 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }

      // Mark messages as read
      if (msgs.length > 0) {
        markMessagesAsRead(selectedConversation.id, 'brand');
      }
    });

    return () => {
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
      }
    };
  }, [selectedConversation]);

  // Handle send message
  const handleSendMessage = async (message: string, files: File[]) => {
    if (!user || !selectedConversation || (!message.trim() && files.length === 0)) return;

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: brandId,
      senderType: 'brand',
      senderName: selectedConversation.brandName,
      senderAvatar: selectedConversation.brandLogo,
      message: message,
      messageType: 'text',
      status: 'sending',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: files.length > 0 ? files.map((file, index) => ({
        id: `temp-${index}`,
        type: file.type.startsWith('image/') ? 'image' as const :
          file.type.startsWith('video/') ? 'video' as const :
            file.type === 'application/pdf' ? 'pdf' as const : 'document' as const,
        url: URL.createObjectURL(file), // Temporary local URL
        name: file.name,
        size: file.size
      })) : undefined
    };

    // Add to sending messages
    setSendingMessages(prev => [...prev, optimisticMessage]);
    setMessageText('');

    // Scroll to show the new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);

    try {
      const result = await sendMessage(
        brandId, // senderId is brandId for brand owners
        selectedConversation.brandName, // senderName is brand name
        selectedConversation.brandLogo, // senderAvatar is brand logo
        {
          conversationId: selectedConversation.id,
          message,
          attachments: files
        },
        'brand' // Specify this is a brand sending the message
      );

      if (!result.success) {
        toast.error(result.error || 'Failed to send message');
        // Remove the optimistic message on error
        setSendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }

      // Remove from sending messages (real message will come from Firestore subscription)
      setSendingMessages(prev => prev.filter(m => m.id !== tempId));

      // Scroll to latest message after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the optimistic message on error
      setSendingMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // Handle service click from message
  const handleServiceClick = (serviceId: string, serviceName: string) => {
    // Brand owners don't send messages when clicking services
    // They can just view the service details
    handleServiceView(serviceId);
  };

  // Handle view service details
  const handleServiceView = (serviceId: string) => {
    navigate('fog-service-detail', serviceId);
  };

  // Handle PKR price change and calculate FOG conversion
  const handlePriceChange = async (priceInPKR: string) => {
    setPaymentForm(prev => ({ ...prev, priceInPKR }));
    
    const price = parseFloat(priceInPKR);
    if (!price || price <= 0) {
      setFogConversion({ priceInFOG: 0, platformFee: 0, brandReceives: 0, conversionRate: 0 });
      return;
    }

    try {
      setLoadingConversion(true);
      const conversion = await convertPKRtoFOG(price);
      setFogConversion(conversion);
    } catch (error) {
      console.error('Error converting price:', error);
      toast.error('Failed to calculate FOG coin conversion');
    } finally {
      setLoadingConversion(false);
    }
  };

  // Send payment request
  const handleSendPaymentRequest = async () => {
    if (!user || !selectedConversation) return;

    // Validate form
    if (!paymentForm.title.trim()) {
      toast.error('Please enter a service title');
      return;
    }
    if (!paymentForm.description.trim()) {
      toast.error('Please enter a service description');
      return;
    }
    if (!paymentForm.priceInPKR || parseFloat(paymentForm.priceInPKR) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const requestId = `PR-${Date.now()}`;
    
    const paymentData: PaymentRequestData = {
      requestId,
      title: paymentForm.title,
      description: paymentForm.description,
      priceInPKR: parseFloat(paymentForm.priceInPKR),
      priceInFOG: fogConversion.priceInFOG,
      platformFee: fogConversion.platformFee,
      brandReceives: fogConversion.brandReceives,
      conversionRate: fogConversion.conversionRate,
      status: 'pending'
    };

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: brandId,
      senderType: 'brand',
      senderName: selectedConversation.brandName,
      senderAvatar: selectedConversation.brandLogo,
      message: `💰 Payment request for: ${paymentForm.title}`,
      messageType: 'services-payment-request',
      paymentData,
      status: 'sending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSendingMessages(prev => [...prev, optimisticMessage]);
    setShowPaymentRequest(false);
    setPaymentForm({ title: '', description: '', priceInPKR: '' });
    setFogConversion({ priceInFOG: 0, platformFee: 0, brandReceives: 0, conversionRate: 0 });

    // Scroll to show the new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);

    try {
      const result = await sendMessage(
        brandId,
        selectedConversation.brandName,
        selectedConversation.brandLogo,
        {
          conversationId: selectedConversation.id,
          message: `💰 Payment request for: ${paymentForm.title}`,
          messageType: 'services-payment-request',
          paymentData,
          attachments: []
        },
        'brand'
      );

      if (!result.success) {
        toast.error(result.error || 'Failed to send payment request');
        setSendingMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }

      setSendingMessages(prev => prev.filter(m => m.id !== tempId));
      toast.success('Payment request sent successfully!');

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      console.error('Error sending payment request:', error);
      toast.error('Failed to send payment request');
      setSendingMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(convo =>
    convo.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !isLoggedIn) {
    return null;
  }

  return (
    <div className="bg-[--color-bg-secondary]  pb-10">
      <div className="container mx-auto px-4 py-8 pt-2 max-w-7xl">
        {/* Header */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 ">
          {/* Sidebar - Conversations List */}
          <div className={`lg:col-span-4 xl:col-span-3 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
            <Card className="h-full flex flex-col h-[calc(100vh-200px)]">
              <CardHeader className="flex-shrink-0 space border-b border-[--color-border]">
                <div className="mb-1">
                  <Button variant="ghost" onClick={() => navigate('brand-dashboard')} className='px-0'>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
                <CardTitle className='pb-2'>Customer Messages</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0 pt-6 scrollbar-custom">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-sm text-[--color-text-secondary]">
                      {searchTerm ? 'No customers match your search' : 'Customer messages will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[--color-border]">
                    {filteredConversations.map((convo) => (
                      <ConversationItem
                        key={convo.id}
                        brandName={convo.userName} // Show user name instead of brand name
                        brandLogo={convo.userAvatar} // Show user avatar
                        lastMessage={convo.lastMessage}
                        lastMessageType={convo.lastMessageType}
                        lastMessageTime={convo.lastMessageTime}
                        unreadCount={convo.unreadBy === 'brand' ? convo.unreadCount : 0}
                        isOnline={false} // Users don't have online status yet
                        isActive={selectedConversation?.id === convo.id}
                        onClick={() => setSelectedConversation(convo)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className={`lg:col-span-8 xl:col-span-9 ${selectedConversation ? 'block' : 'hidden lg:block'}`}>
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="flex-shrink-0 border-b border-[--color-border] p-3 md:p-6">
                    <div className="flex items-center gap-2 md:gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden p-1 md:p-2"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>

                      <div className="relative flex-shrink-0">
                        {selectedConversation.userAvatar ? (
                          <img
                            src={selectedConversation.userAvatar}
                            alt={selectedConversation.userName}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[--color-primary] to-[--color-primary]/80 flex items-center justify-center text-white font-bold text-sm md:text-base">
                            {selectedConversation.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg truncate">{selectedConversation.userName}</h3>
                        <p className="text-xs md:text-sm text-[--color-text-secondary]">Customer</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <div className=" overflow-y-auto p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 scrollbar-custom h-[calc(100vh-280px)]">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
                      </div>
                    ) : (
                      <>
                        <AnimatePresence>
                          {/* Render real messages (exclude those that are currently in sending state) */}
                          {messages
                            .filter(msg => {
                              // Only show messages that are not duplicates of sending messages
                              const isDuplicate = sendingMessages.some(sendingMsg => {
                                const timeDiff = Math.abs(msg.createdAt.getTime() - sendingMsg.createdAt.getTime());
                                return msg.message === sendingMsg.message &&
                                  msg.senderId === sendingMsg.senderId &&
                                  timeDiff < 5000; // Within 5 seconds
                              });
                              return !isDuplicate;
                            })
                            .map((msg, index) => (
                              <MessageBubble
                                key={msg.id}
                                message={msg}
                                isBrand={msg.senderType === 'brand'}
                                brandLogo={selectedConversation.brandLogo}
                                brandName={selectedConversation.brandName}
                                brandId={selectedConversation.brandId}
                                onServiceClick={handleServiceClick}
                                onServiceView={handleServiceView}
                                onExploreBrand={(brandId) => navigate('fog-service-brand', brandId)}
                                index={index}
                              />
                            ))}
                          {/* Render sending messages */}
                          {sendingMessages.map((msg, index) => (
                            <MessageBubble
                              key={msg.id}
                              message={msg}
                              isBrand={msg.senderType === 'brand'}
                              brandLogo={selectedConversation.brandLogo}
                              brandName={selectedConversation.brandName}
                              brandId={selectedConversation.brandId}
                              onServiceClick={handleServiceClick}
                              onServiceView={handleServiceView}
                              onExploreBrand={(brandId) => navigate('fog-service-brand', brandId)}
                              index={messages.length + index}
                            />
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input - Fixed at bottom */}
                  <div className="flex-shrink-0 border-t border-[--color-border] bg-[--color-card]">
                    {/* Bank Details Button and Modal */}
                    <div className="p-4 pb-0">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPaymentRequest(true)}
                          className="flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Request Payment
                        </Button>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 pt-0">
                      <MessageInput
                        value={messageText}
                        onChange={setMessageText}
                        onSend={handleSendMessage}
                        placeholder="Type your reply..."
                        attachmentConfig={{
                          allowImages: true,
                          allowVideos: true,
                          allowPDFs: true
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="text-8xl mb-4">💬</div>
                  <h3 className="text-2xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-[--color-text-secondary] max-w-md">
                    Choose a customer conversation from the sidebar to view and reply to messages
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Payment Request Modal */}
        <AnimatePresence>
          {showPaymentRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPaymentRequest(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[--color-card] rounded-xl border border-[--color-border] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Header */}
                <div className="sticky top-0 bg-[--color-card] border-b border-[--color-border] p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-400" />
                      Request Payment
                    </h2>
                    <p className="text-sm text-[--color-text-secondary] mt-1">Send payment request to customer</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentRequest(false)}
                    className="p-2 hover:bg-[--color-bg-secondary] rounded-lg transition-colors text-[--color-text-secondary] hover:text-[--color-text-primary]"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[--color-text-primary] mb-2">
                      Service Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Logo Design - Premium Package"
                      value={paymentForm.title}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[--color-text-primary] mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="e.g., Includes 3 revisions, source files, and commercial license..."
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 bg-[--color-bg-secondary] border border-[--color-border] rounded-lg text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary] resize-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-[--color-text-primary] mb-2">
                      Price (PKR) *
                    </label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={paymentForm.priceInPKR}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* FOG Coin Conversion Preview */}
                  {fogConversion.priceInFOG > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[--color-text-secondary]">Customer Pays:</span>
                        <span className="text-lg font-bold text-green-400">
                          {fogConversion.priceInFOG.toFixed(2)} FOG
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[--color-text-secondary]">Platform Fee (3%):</span>
                        <span className="text-yellow-400">
                          -{fogConversion.platformFee.toFixed(2)} FOG
                        </span>
                      </div>
                      <div className="border-t border-[--color-border] pt-2 flex items-center justify-between">
                        <span className="text-[--color-text-primary] font-medium">You Receive:</span>
                        <span className="text-xl font-bold text-green-400">
                          {fogConversion.brandReceives.toFixed(2)} FOG
                        </span>
                      </div>
                      <p className="text-xs text-[--color-text-secondary] mt-2">
                        Conversion rate: 1 FOG = ₨{fogConversion.conversionRate.toFixed(2)}
                      </p>
                    </motion.div>
                  )}

                  {loadingConversion && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[--color-primary]" />
                      <span className="ml-2 text-sm text-[--color-text-secondary]">Calculating...</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-[--color-card] border-t border-[--color-border] p-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentRequest(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendPaymentRequest}
                    disabled={!paymentForm.title || !paymentForm.description || !paymentForm.priceInPKR || fogConversion.priceInFOG === 0 || loadingConversion}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  isBrand: boolean;
  brandLogo?: string;
  brandName: string;
  brandId: string;
  onServiceClick: (serviceId: string, serviceName: string) => void;
  onServiceView: (serviceId: string) => void;
  onExploreBrand: (brandId: string) => void;
  index: number;
}

const MessageBubble = ({ message, isBrand, brandLogo, brandName, brandId, onServiceClick, onServiceView, onExploreBrand, index }: MessageBubbleProps) => {
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasMessage = message.message && message.message.trim().length > 0;
  const hasServiceList = message.messageType === 'service-list' && message.serviceData?.services;
  const hasInquiry = message.messageType === 'service-inquiry' && message.inquiryData;
  const hasPaymentRequest = message.messageType === 'services-payment-request' && message.paymentData;

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {message.attachments.map((attachment) => (
          <div key={attachment.id}>
            {attachment.type === 'image' && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-[200px] md:max-w-[280px] lg:max-w-[300px] max-h-[200px] md:max-h-[280px] lg:max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
              </div>
            )}
            {attachment.type === 'video' && (
              <div className="rounded-2xl overflow-hidden">
                <video
                  src={attachment.url}
                  controls
                  className="max-w-[200px] md:max-w-[280px] lg:max-w-[300px] max-h-[200px] md:max-h-[280px] lg:max-h-[300px]"
                />
              </div>
            )}
            {attachment.type === 'pdf' && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2 md:p-3 rounded-2xl transition-colors ${isBrand
                  ? 'bg-[--color-primary] text-white hover:opacity-90'
                  : 'bg-[--color-card] border border-[--color-border] hover:bg-[--color-bg-secondary]'
                  }`}
              >
                <FileText size={20} className={`md:w-6 md:h-6 ${isBrand ? 'text-white' : 'text-red-500'}`} />
                <div>
                  <p className="font-medium text-xs md:text-sm">{attachment.name}</p>
                  <p className={`text-[10px] md:text-xs ${isBrand ? 'text-white/70' : 'text-[--color-text-secondary]'}`}>
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`flex items-end gap-2 md:gap-3 ${isBrand ? 'justify-end' : ''}`}
    >
      {!isBrand && (
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[--color-bg-tertiary] flex-shrink-0 flex items-center justify-center text-xs md:text-sm font-bold overflow-hidden">
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
          ) : (
            message.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)
          )}
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] lg:max-w-[70%] ${isBrand ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Payment Request - Special card layout */}
        {hasPaymentRequest && message.paymentData && (
          <div className="w-full bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-2xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold text-[--color-text-primary]">{message.paymentData.title}</h4>
                  <p className="text-xs text-[--color-text-secondary]">Payment Request</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                message.paymentData.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                message.paymentData.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                message.paymentData.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {message.paymentData.status.toUpperCase()}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[--color-text-secondary] leading-relaxed">
              {message.paymentData.description}
            </p>

            {/* Price Breakdown */}
            <div className="bg-[--color-bg-secondary]/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[--color-text-secondary]">Price (PKR):</span>
                <span className="font-medium text-[--color-text-primary]">₨{message.paymentData.priceInPKR.toLocaleString()}</span>
              </div>
              <div className="border-t border-[--color-border] pt-2 flex items-center justify-between">
                <span className="text-[--color-text-secondary]">Total (FOG):</span>
                <span className="text-lg font-bold text-green-400">{message.paymentData.priceInFOG.toFixed(2)} FOG</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[--color-text-secondary]">Platform Fee (3%):</span>
                <span className="text-yellow-400">-{message.paymentData.platformFee.toFixed(2)} FOG</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[--color-text-secondary]">Brand Receives (97%):</span>
                <span className="text-green-400">{message.paymentData.brandReceives.toFixed(2)} FOG</span>
              </div>
              <p className="text-xs text-[--color-text-secondary] text-center pt-1">
                Rate: 1 FOG = ₨{message.paymentData.conversionRate.toFixed(2)}
              </p>
            </div>

            {/* Status Info */}
            {message.paymentData.status === 'paid' && message.paymentData.paidAt && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid on {new Date(message.paymentData.paidAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Service Inquiry - Special card layout */}
        {message.messageType === 'service-inquiry' && message.inquiryData && (
          <ServiceInquiryMessage
            serviceName={message.inquiryData.serviceName}
            packageName={message.inquiryData.packageName}
            price={message.inquiryData.price}
            deliveryTime={message.inquiryData.deliveryTime}
            hourlyRate={message.inquiryData.hourlyRate}
            minimumHours={message.inquiryData.minimumHours}
            isUser={!isBrand}
          />
        )}

        {/* Attachments (images/videos) - No background */}
        {hasAttachments && renderAttachments()}

        {/* Message text and service list - With background */}
        {(hasMessage || hasServiceList) && message.messageType !== 'service-inquiry' && (
          <div
            className={`w-full max-w-[100%] mx-auto md:max-w-none p-2.5 md:p-3 rounded-2xl text-sm md:text-base ${isBrand
                ? 'bg-[--color-primary] text-white rounded-br-lg'
                : 'bg-[--color-card] border border-[--color-border] rounded-bl-lg'
              }`}
          >
            {hasMessage && (
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.message}
              </p>
            )}

            {hasServiceList && (
              <div className={hasMessage ? 'mt-2' : ''}>
                <ServiceListMessage
                  services={message.serviceData.services}
                  brandId={message.serviceData.brandId}
                  totalServices={message.serviceData.totalServices}
                  onServiceClick={onServiceClick}
                  onServiceView={onServiceView}
                  onExploreBrand={onExploreBrand}
                />
              </div>
            )}
          </div>

        )}

        <div className={`flex items-center gap-1 md:gap-1.5 ${isBrand ? 'justify-end' : ''}`}>
          {message.status === 'sending' && (
            <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin text-[--color-text-secondary]" />
          )}
          <span className="text-[10px] md:text-xs text-[--color-text-secondary]">
            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

    </motion.div>
  );
};

export default BrandMessagesPage;
