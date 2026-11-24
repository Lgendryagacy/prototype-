# Chat & Messaging System Documentation

## 📚 Overview
Comprehensive messaging system for connecting users with brands, including service booking flow.

---

## 🗄️ Firebase Collections

### **1. `conversations` Collection**
Stores conversation metadata between users and brands.

```typescript
{
  id: string,
  userId: string,
  userName: string,
  userAvatar: string,
  brandId: string,
  brandName: string,
  brandLogo: string,
  lastMessage: string,
  lastMessageType: 'text' | 'image' | 'video' | 'pdf' | 'service-list',
  lastMessageTime: Timestamp,
  unreadCount: number,
  unreadBy: 'user' | 'brand' | 'none',
  isOnline: boolean,
  lastSeen: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **2. `messages` Collection**
Stores individual messages within conversations.

```typescript
{
  id: string,
  conversationId: string,
  senderId: string,
  senderType: 'user' | 'brand',
  senderName: string,
  senderAvatar: string,
  message: string,
  messageType: 'text' | 'service-list' | 'service-card',
  attachments: [
    {
      id: string,
      type: 'image' | 'video' | 'pdf' | 'document',
      url: string,
      name: string,
      size: number,
      thumbnailUrl: string
    }
  ],
  serviceData: {
    type: 'list' | 'card',
    services: [
      {
        id: string,
        name: string,
        price: string,
        deliveryTime: string,
        image: string
      }
    ]
  },
  status: 'sent' | 'delivered' | 'read',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔄 User Flow

### **Step 1: User Clicks "Message Brand"**
- From Brand Detail Page or Service Detail Page
- System checks if conversation exists
- If not, creates new conversation

### **Step 2: First Message (Welcome)**
- System automatically sends welcome message from brand
- Welcome message includes:
  - Greeting text: "Hello, welcome to [Brand Name]! How can we help you today?"
  - List of brand's services with:
    - Service name
    - Price
    - Delivery time
    - Thumbnail image

### **Step 3: Service Selection**
- User clicks on a service from the list
- System redirects to service detail page
- User can view full details and packages

### **Step 4: Conversation Continues**
- User can send text messages
- User can attach files (images, videos, PDFs)
- Real-time message updates
- Read receipts and online status

---

## 🎨 Interface Components

### **1. Sidebar (WhatsApp-style)**
- **Features:**
  - List of all user's conversations
  - Brand logo and name
  - Last message preview
  - Timestamp
  - Unread count badge
  - Online status indicator (green dot)
  - Search bar at top

### **2. Chat Area**
- **Header:**
  - Brand logo and name
  - Online status
  - Back button
  
- **Messages:**
  - Text messages
  - Service list cards
  - Image/video/PDF attachments
  - Timestamps
  - Read receipts

- **Input:**
  - Text input field
  - Attachment button with options:
    - 📷 Image
    - 🎥 Video
    - 📄 PDF
  - Send button

---

## 🔧 Components Structure

```
components/
  chat/
    ConversationItem.tsx      - Individual conversation in sidebar
    MessageInput.tsx           - Message input with attachment support
    ServiceListMessage.tsx     - Service list display in chat
    ChatMessage.tsx           - Individual message bubble
    AttachmentPreview.tsx     - Preview attachments in messages
```

---

## 📝 Key Functions

### **Message Service (`firebase/services/messageService.ts`)**

#### `getOrCreateConversation()`
Creates or retrieves existing conversation between user and brand.

#### `sendWelcomeMessage()`
Sends automated welcome message with service list.

#### `hasWelcomeMessage()`
Checks if welcome message already sent (prevent duplicates).

#### `sendMessage()`
Sends user message with optional attachments.

#### `uploadAttachment()`
Uploads file to Firebase Storage and returns URL.

#### `subscribeToMessages()`
Real-time listener for new messages in a conversation.

#### `subscribeToConversations()`
Real-time listener for user's conversation list.

#### `markMessagesAsRead()`
Marks all messages in conversation as read.

---

## 🎯 Attachment Configuration

Flexible attachment system that can be easily configured:

```typescript
interface AttachmentConfig {
  allowImages: boolean;
  allowVideos: boolean;
  allowPDFs: boolean;
}

// Example: Disable PDFs in future
const config = {
  allowImages: true,
  allowVideos: true,
  allowPDFs: false  // ← Simply set to false
};
```

---

## 🔐 Security Considerations

1. **File Upload Limits:**
   - Images: Max 5MB
   - Videos: Max 50MB
   - PDFs: Max 10MB

2. **File Type Validation:**
   - Strict MIME type checking
   - Only allowed: image/*, video/*, application/pdf

3. **Storage Structure:**
   ```
   chat-attachments/
     {conversationId}/
       {userId}-{timestamp}-{filename}
   ```

---

## 🚀 Future Enhancements

1. **Typing Indicators**
   - Show when brand is typing
   - Real-time presence updates

2. **Voice Messages**
   - Record and send audio

3. **Message Reactions**
   - Like/emoji reactions to messages

4. **File Download**
   - Download attachments locally

5. **Message Search**
   - Search within conversation history

6. **Push Notifications**
   - Notify users of new messages

---

## 💡 Usage Example

```typescript
// In FogServiceBrandPage.tsx or FogServiceDetailPage.tsx
<Button onClick={() => navigate('messages', { brandId: brand.id })}>
  <MessageSquare className="mr-2" />
  Message Brand
</Button>

// In MessagesPage.tsx
const handleServiceClick = (serviceId: string) => {
  navigate('fog-service-detail', serviceId);
};
```

---

## 📊 Database Queries

### Get User's Conversations (Ordered by Recent)
```typescript
query(
  collection(db, 'conversations'),
  where('userId', '==', userId),
  orderBy('lastMessageTime', 'desc')
)
```

### Get Conversation Messages
```typescript
query(
  collection(db, 'messages'),
  where('conversationId', '==', conversationId),
  orderBy('createdAt', 'asc')
)
```

---

## ✅ Best Practices

1. **Always check if welcome message exists** before sending
2. **Use real-time listeners** for live updates
3. **Clean up listeners** on component unmount
4. **Validate file types** before upload
5. **Show loading states** during file upload
6. **Handle errors gracefully** with user-friendly messages

---

## 🎨 UI/UX Features

✅ WhatsApp-style interface
✅ Real-time message updates
✅ Online status indicators
✅ Unread count badges
✅ Message timestamps
✅ Read receipts
✅ File attachments with previews
✅ Service list cards in chat
✅ Search conversations
✅ Responsive design
✅ Smooth animations
✅ Dark/light mode support

---

This messaging system provides a complete foundation for user-brand communication and can be easily extended for service booking workflows!
