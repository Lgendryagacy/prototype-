# Messaging System Flow Diagram

## 🎯 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BRAND/SERVICE PAGES                              │
│                                                                       │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │ Brand Page       │              │ Service Detail   │            │
│  │                  │              │                  │            │
│  │ [Message Brand] ─┼──────────────┼─ [Message Brand] │            │
│  └──────────────────┘              └──────────────────┘            │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ navigate('messages', { brandId })
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         MESSAGES PAGE                                 │
│  ┌──────────────────┬────────────────────────────────────────────┐  │
│  │   SIDEBAR        │         CHAT AREA                          │  │
│  │                  │                                            │  │
│  │ ┌──────────┐     │  ┌──────────────────────────────────────┐ │  │
│  │ │ Search   │     │  │ Brand Header [View Brand]            │ │  │
│  │ └──────────┘     │  └──────────────────────────────────────┘ │  │
│  │                  │                                            │  │
│  │ Conversations:   │  Messages:                                │  │
│  │                  │  ┌──────────────────────────────────────┐ │  │
│  │ ┌────────────┐   │  │ [BRAND] Welcome! Services:           │ │  │
│  │ │ Brand A  ●│◄──┼──│  • Logo Design - $500 - 3 days       │ │  │
│  │ │ Last msg ②│   │  │  • Web Dev - $2000 - 7 days          │ │  │
│  │ └────────────┘   │  │  [Click to view service]             │ │  │
│  │                  │  └──────────────────────────────────────┘ │  │
│  │ ┌────────────┐   │                                            │  │
│  │ │ Brand B    │   │  ┌──────────────────────────────────────┐ │  │
│  │ │ Last msg   │   │  │ [USER] Hi, interested in logo design │ │  │
│  │ └────────────┘   │  └──────────────────────────────────────┘ │  │
│  │                  │                                            │  │
│  │ ┌────────────┐   │  ┌──────────────────────────────────────┐ │  │
│  │ │ Brand C    │   │  │ [BRAND] Great! I can help with that  │ │  │
│  │ │ Last msg   │   │  └──────────────────────────────────────┘ │  │
│  │ └────────────┘   │                                            │  │
│  │                  │  ┌──────────────────────────────────────┐ │  │
│  │                  │  │ [📎 Attach] [Type message...] [Send] │ │  │
│  │                  │  └──────────────────────────────────────┘ │  │
│  └──────────────────┴────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
USER ACTION                    FRONTEND                    BACKEND
───────────                    ─────────                   ────────

Click "Message Brand"
      │
      ├──────────────────► navigate('messages', {brandId})
                                   │
                                   ├──────────────────► getOrCreateConversation()
                                                              │
                                                              ├── Check if exists
                                                              │
                                                              ├── Create if new
                                                              │
                                                              └── Return conversationId
                                   │
                                   ├──────────────────► hasWelcomeMessage()
                                                              │
                                                              └── Check messages collection
                                   │
                                   ├── If NO welcome:
                                   │
                                   ├──────────────────► getBrandServices()
                                                              │
                                                              └── Fetch active services
                                   │
                                   ├──────────────────► sendWelcomeMessage()
                                                              │
                                                              ├── Create message doc
                                                              │
                                                              └── Update conversation
                                   │
                                   ├──────────────────► subscribeToConversations()
                                                              │
                                                              └── onSnapshot listener
                                   │
                                   └── Display sidebar ◄───── Real-time updates


Select conversation
      │
      ├──────────────────► setSelectedConversation()
                                   │
                                   ├──────────────────► subscribeToMessages()
                                                              │
                                                              └── onSnapshot listener
                                   │
                                   └── Display messages ◄──── Real-time updates


Type & Send message
      │
      ├──────────────────► handleSendMessage()
                                   │
                                   ├── If files:
                                   │
                                   ├──────────────────► uploadAttachment()
                                                              │
                                                              └── Storage upload
                                   │
                                   ├──────────────────► sendMessage()
                                                              │
                                                              ├── Create message doc
                                                              │
                                                              ├── Update conversation
                                                              │
                                                              └── Update lastMessage
                                   │
                                   └── Message appears ◄───── Real-time update
```

## 📁 Component Architecture

```
MessagesPage
├── ConversationItem (x N)
│   ├── Brand Avatar
│   ├── Brand Name
│   ├── Last Message Preview
│   ├── Unread Badge
│   └── Online Status
│
├── Chat Header
│   ├── Brand Info
│   └── [View Brand] Button
│
├── MessageBubble (x N)
│   ├── Sender Avatar
│   ├── Message Text
│   ├── ServiceListMessage (if welcome)
│   │   └── Service Cards (x N)
│   ├── Attachments
│   │   ├── Image Preview
│   │   ├── Video Player
│   │   └── PDF Link
│   └── Timestamp
│
└── MessageInput
    ├── Text Input
    ├── Attachment Button
    │   ├── 📷 Images
    │   ├── 🎥 Videos
    │   └── 📄 PDFs
    └── Send Button
```

## 🔥 Firebase Collections

```
Firestore
├── conversations/
│   ├── {conversationId-1}/
│   │   ├── participants: { userId, brandId, ... }
│   │   ├── lastMessage: "Hello, I need help..."
│   │   ├── lastMessageType: "text"
│   │   ├── unreadCount: 2
│   │   └── ...
│   │
│   └── {conversationId-2}/
│       └── ...
│
└── messages/
    ├── {messageId-1}/
    │   ├── conversationId: "conv-123"
    │   ├── senderId: "user-456"
    │   ├── message: "Hi there!"
    │   ├── messageType: "text"
    │   └── ...
    │
    ├── {messageId-2}/
    │   ├── conversationId: "conv-123"
    │   ├── messageType: "service-list"
    │   ├── serviceData: { brandId, services: [...] }
    │   └── ...
    │
    └── {messageId-3}/
        ├── conversationId: "conv-123"
        ├── messageType: "image"
        ├── attachments: [{ type, url, ... }]
        └── ...


Storage
└── chat-attachments/
    ├── {conversationId-1}/
    │   ├── image-123.jpg
    │   ├── video-456.mp4
    │   └── document-789.pdf
    │
    └── {conversationId-2}/
        └── ...
```

## ⚡ Real-Time Updates

```
Firestore Listeners:

┌─────────────────────────────────────────┐
│  subscribeToConversations(userId)       │
│                                         │
│  Listen to changes in conversations     │
│  where userId matches                   │
│                                         │
│  On Update:                             │
│  ├── Update sidebar list                │
│  ├── Update unread counts               │
│  └── Trigger re-render                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  subscribeToMessages(conversationId)    │
│                                         │
│  Listen to new messages in conversation │
│                                         │
│  On New Message:                        │
│  ├── Append to message list             │
│  ├── Scroll to bottom                   │
│  ├── Mark as read                       │
│  └── Trigger re-render                  │
└─────────────────────────────────────────┘
```

## 🎨 UI State Machine

```
Initial State: LOADING
      │
      ├── User not logged in ──► Redirect to /auth
      │
      └── User logged in
              │
              ├── No conversations ──► EMPTY_STATE
              │                         └── Show "Browse Brands" button
              │
              └── Has conversations ──► CONVERSATION_LIST
                      │
                      ├── No conversation selected ──► EMPTY_CHAT
                      │                                 └── Show "Select a conversation"
                      │
                      └── Conversation selected ──► ACTIVE_CHAT
                              │
                              ├── Loading messages ──► MESSAGES_LOADING
                              │
                              └── Messages loaded ──► MESSAGES_READY
                                      │
                                      ├── User typing ──► INPUT_ACTIVE
                                      │
                                      └── Sending message ──► MESSAGE_SENDING
                                              │
                                              ├── Success ──► MESSAGES_READY
                                              │
                                              └── Error ──► SHOW_ERROR
```

## 🔗 Navigation Routes

```
Routes:
/fog-services ──────────────► FogServicesPage
                                │
                                ├── Click Brand Card
                                │
                                ↓
/fog-service-brand ─────────► FogServiceBrandPage
                                │
                                ├── [Message Brand] ──┐
                                │                     │
                                ├── Click Service     │
                                │                     │
                                ↓                     │
/fog-service-detail ────────► FogServiceDetailPage   │
                                │                     │
                                └── [Message Brand] ──┤
                                                      │
                                                      ↓
/messages ───────────────────► MessagesPage
                                │
                                ├── [View Brand] ──► /fog-service-brand
                                │
                                └── Click Service in welcome ──► /fog-service-detail
```

---

**Legend:**
- ● = Online indicator
- ② = Unread count badge
- [Button] = Clickable button
- ──► = Navigation/flow direction
- │ ├ └ = Tree structure
- ◄── = Data flow back
