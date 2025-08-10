export interface DocumentationSection {
  title: string;
  content: string;
  code?: string;
  image?: string;
}

export interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  sections: DocumentationSection[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export const documentationData: DocumentationItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using Rail Madad platform',
    icon: 'FileText',
    sections: [
      {
        title: 'Welcome to Rail Madad',
        content: 'Rail Madad is the official grievance portal of Indian Railways. This platform allows passengers to lodge complaints, track their status, and receive timely resolution.'
      },
      {
        title: 'Creating Your Account',
        content: 'To get started, you need to create an account. Click on the "Sign Up" button on the login page and fill in your details including name, email, phone number, and other required information.'
      },
      {
        title: 'First Login',
        content: 'After creating your account, you will receive a verification email. Please verify your email address before attempting to log in. Once verified, you can access all platform features.'
      },
      {
        title: 'Dashboard Overview',
        content: 'Your dashboard provides a comprehensive view of your complaints, their status, and quick access to file new complaints. The navigation menu on the left gives you access to all platform features.'
      }
    ]
  },
  {
    id: 'filing-complaints',
    title: 'Filing Complaints',
    description: 'Step-by-step guide to file and track complaints',
    icon: 'BarChart2',
    sections: [
      {
        title: 'Types of Complaints',
        content: 'Rail Madad accepts various types of complaints including:\n• Coach cleanliness issues\n• Food quality problems\n• Staff behavior concerns\n• Technical issues\n• Booking and refund problems\n• Safety and security concerns'
      },
      {
        title: 'Filing a New Complaint',
        content: '1. Navigate to the "File Complaint" section\n2. Select the appropriate category\n3. Provide detailed description of the issue\n4. Upload supporting documents or images\n5. Submit your complaint\n6. Note down your complaint ID for tracking'
      },
      {
        title: 'Required Information',
        content: 'When filing a complaint, please provide:\n• Train number and date of journey\n• Coach number and seat/berth number\n• Detailed description of the issue\n• Any supporting evidence (photos, receipts)\n• Contact information for follow-up'
      },
      {
        title: 'Tracking Your Complaint',
        content: 'You can track your complaint status using:\n• Complaint ID through the tracking section\n• Email notifications sent to your registered email\n• SMS updates to your registered mobile number\n• Dashboard notifications when you log in'
      }
    ]
  },
  {
    id: 'live-support',
    title: 'Live Support',
    description: 'Get real-time assistance from our support team',
    icon: 'Bot',
    sections: [
      {
        title: 'Live Chat Support',
        content: 'Our live chat feature connects you with trained support agents who can assist with your queries in real-time. Chat support is available 24/7 for immediate assistance.'
      },
      {
        title: 'Voice Call Support',
        content: 'For complex issues, you can request a voice call with our support team. Voice support helps in detailed discussion of technical issues and provides personalized assistance.'
      },
      {
        title: 'Video Call Support',
        content: 'Video calls are available for issues that require visual demonstration or when you need to show documents/evidence. This feature uses WhatsApp for better accessibility.'
      },
      {
        title: 'Agent Availability',
        content: 'Our support agents are categorized by expertise areas:\n• Technical Support\n• Booking and Refunds\n• General Inquiries\n• Complaint Resolution\n• Emergency Assistance\n\nAgent availability is shown in real-time with their specializations and preferred communication methods.'
      }
    ]
  },
  {
    id: 'smart-features',
    title: 'Smart Features',
    description: 'Advanced features for enhanced user experience',
    icon: 'Headphones',
    sections: [
      {
        title: 'Smart Classification',
        content: 'Our AI-powered system automatically categorizes complaints based on the description provided, ensuring faster routing to appropriate departments for quicker resolution.'
      },
      {
        title: 'Multi-language Support',
        content: 'The platform supports multiple Indian languages including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, and more. Language preferences are saved for future visits.'
      },
      {
        title: 'Quick Resolution',
        content: 'Common issues are resolved automatically through our smart resolution system. Frequent problems like PNR status, train delays, and general inquiries get instant responses.'
      },
      {
        title: 'Analytics Dashboard',
        content: 'Track your complaint history, resolution times, and feedback ratings. The analytics help us improve our services and provide better assistance.'
      }
    ]
  },
  {
    id: 'account-settings',
    title: 'Account Settings',
    description: 'Manage your profile and preferences',
    icon: 'Settings',
    sections: [
      {
        title: 'Profile Management',
        content: 'Update your personal information, contact details, and profile picture through the settings page. Keep your information current for better service delivery.'
      },
      {
        title: 'Notification Preferences',
        content: 'Customize how you receive updates:\n• Email notifications for complaint updates\n• SMS alerts for status changes\n• Push notifications for urgent matters\n• Marketing and promotional emails'
      },
      {
        title: 'Privacy Settings',
        content: 'Control your data privacy settings including:\n• Data sharing preferences\n• Communication preferences\n• Account visibility settings\n• Data download and deletion options'
      },
      {
        title: 'Security Features',
        content: 'Enhance your account security with:\n• Two-factor authentication (2FA)\n• Password management\n• Login history and device management\n• Account activity monitoring'
      }
    ]
  },
  {
    id: 'mobile-app',
    title: 'Mobile Experience',
    description: 'Using Rail Madad on mobile devices',
    icon: 'Globe',
    sections: [
      {
        title: 'Mobile Web App',
        content: 'Rail Madad is optimized for mobile browsers, providing a seamless experience across all devices. The responsive design ensures all features are accessible on mobile.'
      },
      {
        title: 'Offline Capabilities',
        content: 'Basic features work offline, allowing you to draft complaints and access previously loaded content even without internet connectivity.'
      },
      {
        title: 'Mobile-Specific Features',
        content: '• Camera integration for uploading complaint evidence\n• GPS location services for accurate complaint filing\n• Push notifications for real-time updates\n• Touch-optimized interface for easy navigation'
      },
      {
        title: 'Installation Guide',
        content: 'Add Rail Madad to your home screen:\n1. Open the website in your mobile browser\n2. Tap the "Add to Home Screen" option\n3. Confirm the installation\n4. Access Rail Madad like a native app'
      }
    ]
  },
  {
    id: 'user-profile',
    title: 'User Profile',
    description: 'Managing your personal information and preferences',
    icon: 'User',
    sections: [
      {
        title: 'Personal Information',
        content: 'Your profile contains essential information for complaint processing and communication. Keep your contact details updated to receive timely notifications about your complaints.'
      },
      {
        title: 'Travel Preferences',
        content: 'Set your preferred travel routes, stations, and train types to get personalized suggestions and relevant updates about services affecting your regular journeys.'
      },
      {
        title: 'Communication History',
        content: 'View your complete interaction history with our support team, including chat logs, call records, and email correspondence for future reference.'
      },
      {
        title: 'Feedback and Ratings',
        content: 'Your feedback helps us improve our services. Rate your experience with complaint resolution, support interactions, and overall platform usability.'
      }
    ]
  },
  {
    id: 'security-privacy',
    title: 'Security & Privacy',
    description: 'Understanding our security measures and privacy policies',
    icon: 'Shield',
    sections: [
      {
        title: 'Data Protection',
        content: 'Your personal information is protected using industry-standard encryption and security protocols. We comply with government data protection regulations and best practices.'
      },
      {
        title: 'Account Security',
        content: 'Protect your account with:\n• Strong password requirements\n• Two-factor authentication\n• Regular security audits\n• Suspicious activity monitoring\n• Secure logout from all devices'
      },
      {
        title: 'Privacy Controls',
        content: 'You have full control over your data:\n• Choose what information to share\n• Download your data anytime\n• Request account deletion\n• Manage cookie preferences\n• Control communication settings'
      },
      {
        title: 'Compliance',
        content: 'Rail Madad complies with:\n• IT Act 2000 and amendments\n• Personal Data Protection guidelines\n• Government security standards\n• Railway security protocols\n• International privacy frameworks'
      }
    ]
  }
];

export const faqData: FAQ[] = [
  {
    question: 'How do I create an account on Rail Madad?',
    answer: 'Click on the "Sign Up" button on the login page, fill in your details including name, email, phone number, and create a password. You will receive a verification email that you must confirm before logging in.'
  },
  {
    question: 'What types of complaints can I file?',
    answer: 'You can file complaints related to coach cleanliness, food quality, staff behavior, technical issues, booking problems, refund issues, safety concerns, and any other railway-related grievances.'
  },
  {
    question: 'How long does it take to resolve a complaint?',
    answer: 'Resolution time varies based on the complexity of the issue. Simple complaints are often resolved within 24-48 hours, while complex issues may take 5-7 business days. You will receive regular updates on the progress.'
  },
  {
    question: 'Can I track my complaint status?',
    answer: 'Yes, you can track your complaint using the complaint ID provided when you submit your complaint. You can also view all your complaints and their status in your dashboard.'
  },
  {
    question: 'Is there a mobile app for Rail Madad?',
    answer: 'Rail Madad is available as a progressive web app (PWA) that works like a native mobile app. You can add it to your home screen for easy access and offline functionality.'
  },
  {
    question: 'How do I contact live support?',
    answer: 'You can access live support through the "Real-time Support" section. Choose from chat, voice, or video call options based on your preference and the nature of your issue.'
  },
  {
    question: 'What should I do if I forgot my password?',
    answer: 'Click on "Forgot Password" on the login page, enter your registered email address, and you will receive a password reset link. Follow the instructions in the email to create a new password.'
  },
  {
    question: 'Can I file a complaint on behalf of someone else?',
    answer: 'Yes, you can file a complaint on behalf of family members or friends, but you should provide accurate details about the affected passenger and the journey information.'
  },
  {
    question: 'How do I upload documents or photos with my complaint?',
    answer: 'When filing a complaint, you will see an option to upload files. Click on the upload area and select images or documents from your device. Supported formats include JPG, PNG, PDF, and common document formats.'
  },
  {
    question: 'What if I am not satisfied with the resolution?',
    answer: 'If you are not satisfied with the resolution, you can escalate the complaint through the platform or provide feedback. You can also contact higher authorities through the escalation process available in your complaint details.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, Rail Madad uses industry-standard encryption and security measures to protect your personal information. We comply with government data protection regulations and privacy guidelines.'
  },
  {
    question: 'Can I use Rail Madad in my regional language?',
    answer: 'Yes, Rail Madad supports multiple Indian languages. You can change your language preference in the settings, and the interface will be translated to your preferred language.'
  },
  {
    question: 'How do I update my profile information?',
    answer: 'Go to your profile section in the dashboard, click on "Edit Profile", update your information, and save the changes. Make sure to keep your contact information current for proper communication.'
  },
  {
    question: 'What is the Railway Helpline number?',
    answer: 'The Railway Helpline number is 139, which is toll-free and available 24/7. For security emergencies, you can also call 182.'
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account through the profile settings. Please note that this action is irreversible and will remove all your data including complaint history.'
  }
];
