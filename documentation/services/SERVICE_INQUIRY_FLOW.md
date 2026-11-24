# Service Inquiry Flow Implementation

## Overview
This document describes the automated service inquiry flow that allows users to seamlessly navigate from service details to messaging with pre-filled inquiry information.

## User Flow

### 1. Service Selection
When a user is on the **FogServiceDetailPage** viewing a service, they can:

#### For Package-based Services:
- Click the **"Select [Package Name]"** button on any package card
- Click the **"Continue"** button in the sidebar (selects the first package)

#### For Hourly-rate Services:
- Click the **"Continue"** button in the sidebar

### 2. Automatic Navigation
The system automatically:
1. Navigates to the **MessagesPage**
2. Passes the service inquiry context with the navigation
3. Opens the chat with the brand owner

### 3. Auto-generated Inquiry Message
The system automatically sends a professionally formatted inquiry message:

#### Package-based Service Example:
```
Hi! I'm interested in your service: "Website Development"

Package: Premium Package
Price: $1,500
Delivery Time: 7 days

I'd like to discuss this further. Can you provide more details?
```

#### Hourly-rate Service Example:
```
Hi! I'm interested in your service: "Consulting Services"

Hourly Rate: $100/hour
Minimum Hours: 5 hours

I'd like to discuss this further. Can you provide more details?
```

## Technical Implementation

### 1. FogServiceDetailPage.tsx
Added two handler functions:

```typescript
const handlePackageSelect = (pkg: any) => {
  navigate('messages', {
    brandId: service.brandOwnerId,
    serviceInquiry: {
      serviceName: service.title,
      packageName: pkg.name,
      price: `${pkg.currency} ${pkg.price.toLocaleString()}`,
      deliveryTime: pkg.deliveryTime
    }
  });
};

const handleHourlyRateSelect = () => {
  const hourlyRate = service.pricing.hourlyRate;
  navigate('messages', {
    brandId: service.brandOwnerId,
    serviceInquiry: {
      serviceName: service.title,
      hourlyRate: `${hourlyRate.currency} ${hourlyRate.rate.toLocaleString()}/hour`,
      minimumHours: hourlyRate.minimumHours
    }
  });
};
```

### 2. MessagesPage.tsx
Extended the context interface to support service inquiry:

```typescript
interface MessagesPageProps {
  navigate: (route: Route, context?: any) => void;
  context?: { 
    brandId?: string;
    serviceInquiry?: {
      serviceName: string;
      packageName?: string;
      price?: string;
      deliveryTime?: string;
      hourlyRate?: string;
      minimumHours?: number;
    };
  };
  user?: User | null;
  isLoggedIn?: boolean;
}
```

Added auto-send logic in `initializeConversation`:

```typescript
// Send service inquiry message if provided in context
if (context?.serviceInquiry) {
  const inquiry = context.serviceInquiry;
  let inquiryMessage = `Hi! I'm interested in your service: "${inquiry.serviceName}"\n\n`;

  if (inquiry.packageName) {
    // Package-based service
    inquiryMessage += `Package: ${inquiry.packageName}\n`;
    inquiryMessage += `Price: ${inquiry.price}\n`;
    if (inquiry.deliveryTime) {
      inquiryMessage += `Delivery Time: ${inquiry.deliveryTime}\n`;
    }
  } else if (inquiry.hourlyRate) {
    // Hourly-rate service
    inquiryMessage += `Hourly Rate: ${inquiry.hourlyRate}\n`;
    inquiryMessage += `Minimum Hours: ${inquiry.minimumHours} hours\n`;
  }

  inquiryMessage += `\nI'd like to discuss this further. Can you provide more details?`;

  // Wait a bit for welcome message to be sent, then send inquiry
  setTimeout(async () => {
    await sendMessage(
      user.uid,
      user.displayName || user.email || 'User',
      undefined,
      {
        conversationId: result.conversationId!,
        message: inquiryMessage,
        attachments: []
      }
    );
  }, 1000);
}
```

## Benefits

### For Users:
- ✅ One-click journey from browsing to inquiry
- ✅ No need to manually type service details
- ✅ Professional, structured inquiry message
- ✅ Faster communication with brand owners

### For Brand Owners:
- ✅ Clear understanding of what service the user wants
- ✅ Specific package/pricing information included
- ✅ Better qualified leads
- ✅ Easier to respond with relevant information

## Data Flow

```
FogServiceDetailPage
    ↓ (User clicks package/continue button)
    ↓ navigate('messages', { brandId, serviceInquiry })
    ↓
MessagesPage
    ↓ (Receives context with serviceInquiry)
    ↓ initializeConversation()
    ↓ - Creates conversation if needed
    ↓ - Sends welcome message
    ↓ - Waits 1 second
    ↓ - Composes inquiry message
    ↓ - Sends inquiry message automatically
    ↓
Brand Owner's Inbox
    ↓ (Sees formatted inquiry with service details)
```

## Testing Checklist

- [ ] Click package "Select" button → navigates to messages
- [ ] Click sidebar "Continue" button on package service → navigates to messages
- [ ] Click sidebar "Continue" button on hourly service → navigates to messages
- [ ] Welcome message appears in chat
- [ ] Inquiry message appears after welcome message (1 second delay)
- [ ] Package-based inquiry shows package name, price, delivery time
- [ ] Hourly-rate inquiry shows hourly rate and minimum hours
- [ ] Brand owner receives and can see the inquiry message
- [ ] Message format is professional and readable

## Future Enhancements

Potential improvements:
1. **Custom Message Templates**: Allow brands to customize the inquiry message format
2. **Attachment Support**: Auto-attach service images or documents
3. **Quick Replies**: Provide suggested responses for brand owners
4. **Analytics**: Track conversion rate from service view to inquiry
5. **Follow-up Automation**: Send reminder if brand doesn't respond within 24 hours
