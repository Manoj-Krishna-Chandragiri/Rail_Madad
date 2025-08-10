import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const icon = isTerms ? <FileText className="h-6 w-6" /> : <Shield className="h-6 w-6" />;

  const termsContent = {
    terms: [
      {
        title: 'Acceptance of Terms',
        content: 'By accessing and using the Rail Madad platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
      },
      {
        title: 'Use License',
        content: 'Permission is granted to temporarily download one copy of the materials on Rail Madad for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n• modify or copy the materials\n• use the materials for any commercial purpose or for any public display\n• attempt to reverse engineer any software contained on the website\n• remove any copyright or other proprietary notations from the materials'
      },
      {
        title: 'Disclaimer',
        content: 'The materials on Rail Madad are provided on an \'as is\' basis. Rail Madad makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
      },
      {
        title: 'User Responsibilities',
        content: 'Users are responsible for:\n• Providing accurate and truthful information in complaints\n• Maintaining the confidentiality of their account credentials\n• Not misusing the platform for fraudulent purposes\n• Respecting other users and staff\n• Following all applicable laws and regulations\n• Not uploading harmful, offensive, or inappropriate content'
      },
      {
        title: 'Complaint Guidelines',
        content: 'When filing complaints:\n• Provide genuine and verifiable information\n• Include relevant details such as train number, date, and coach details\n• Attach supporting evidence when available\n• Use respectful language\n• Do not file duplicate complaints for the same issue\n• Allow reasonable time for resolution before escalation'
      },
      {
        title: 'Platform Usage',
        content: 'Users agree to:\n• Use the platform only for its intended purpose\n• Not attempt to hack, breach, or compromise security\n• Not share account credentials with others\n• Report any security vulnerabilities discovered\n• Accept that service may be temporarily unavailable for maintenance\n• Comply with all platform guidelines and policies'
      },
      {
        title: 'Data and Privacy',
        content: 'By using our services, you acknowledge that:\n• Your data will be processed according to our Privacy Policy\n• Complaint data may be shared with relevant railway departments\n• Communication history may be recorded for quality assurance\n• Personal information will be protected using appropriate security measures\n• You have rights regarding your personal data as outlined in our Privacy Policy'
      },
      {
        title: 'Limitation of Liability',
        content: 'In no event shall Rail Madad or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Rail Madad, even if Rail Madad or its authorized representative has been notified orally or in writing of the possibility of such damage.'
      },
      {
        title: 'Modifications',
        content: 'Rail Madad may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service. Users will be notified of significant changes to these terms.'
      },
      {
        title: 'Contact Information',
        content: 'If you have any questions about these Terms of Service, please contact us at:\n• Email: legal@railmadad.in\n• Phone: 139 (Railway Helpline)\n• Address: Railway Board, New Delhi, India\n\nThese terms are governed by the laws of India and any disputes shall be subject to the jurisdiction of Indian courts.'
      }
    ],
    privacy: [
      {
        title: 'Information We Collect',
        content: 'We collect information you provide directly to us, such as:\n• Personal identification information (name, email, phone number)\n• Account credentials and profile information\n• Complaint details and supporting documents\n• Communication history with our support team\n• Usage data and platform interaction logs\n• Device information and browser data for security purposes'
      },
      {
        title: 'How We Use Your Information',
        content: 'We use the information we collect to:\n• Process and resolve your complaints\n• Communicate with you about your complaints and account\n• Improve our services and user experience\n• Ensure platform security and prevent fraud\n• Comply with legal obligations and government requirements\n• Provide customer support and technical assistance\n• Send important updates about our services'
      },
      {
        title: 'Information Sharing',
        content: 'We may share your information with:\n• Relevant railway departments for complaint resolution\n• Government agencies as required by law\n• Service providers who assist in platform operations\n• Law enforcement when legally required\n• Third-party integrations with your explicit consent\n\nWe do not sell, trade, or rent your personal information to third parties for marketing purposes.'
      },
      {
        title: 'Data Security',
        content: 'We implement appropriate security measures to protect your information:\n• Encryption of data in transit and at rest\n• Regular security audits and updates\n• Access controls and authentication systems\n• Secure data centers and infrastructure\n• Employee training on data protection\n• Incident response procedures for security breaches\n\nHowever, no method of transmission over the internet is 100% secure.'
      },
      {
        title: 'Data Retention',
        content: 'We retain your information for as long as necessary to:\n• Provide our services and maintain your account\n• Comply with legal obligations and regulations\n• Resolve disputes and enforce agreements\n• Improve our services and prevent fraud\n\nComplaint data may be retained for extended periods as required by railway regulations and government policies.'
      },
      {
        title: 'Your Rights',
        content: 'You have the right to:\n• Access and review your personal information\n• Correct or update inaccurate information\n• Request deletion of your data (subject to legal requirements)\n• Export your data in a portable format\n• Opt-out of non-essential communications\n• File complaints about data processing with authorities\n\nTo exercise these rights, contact us through the platform or at privacy@railmadad.in'
      },
      {
        title: 'Cookies and Tracking',
        content: 'We use cookies and similar technologies to:\n• Remember your preferences and settings\n• Analyze platform usage and performance\n• Provide personalized experience\n• Ensure security and prevent fraud\n• Enable social media features and integrations\n\nYou can control cookie preferences through your browser settings, but some platform features may not function properly without cookies.'
      },
      {
        title: 'Third-Party Services',
        content: 'Our platform may integrate with third-party services:\n• Authentication providers (Google, Firebase)\n• Communication services (email, SMS, WhatsApp)\n• Analytics and monitoring tools\n• Payment processing services\n• Cloud storage and hosting providers\n\nThese services have their own privacy policies, and we encourage you to review them.'
      },
      {
        title: 'Children\'s Privacy',
        content: 'Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have it removed.'
      },
      {
        title: 'Updates to This Policy',
        content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by:\n• Posting the new policy on this page\n• Sending an email notification\n• Displaying a notice on the platform\n• Requiring acceptance of updated terms\n\nYour continued use of the platform after changes constitutes acceptance of the new policy.'
      },
      {
        title: 'Contact Us',
        content: 'If you have questions about this Privacy Policy, please contact us:\n• Email: privacy@railmadad.in\n• Phone: 139 (Railway Helpline)\n• Data Protection Officer: dpo@railmadad.in\n• Address: Railway Board, Rail Bhawan, New Delhi 110001\n\nWe are committed to addressing your privacy concerns promptly and transparently.'
      }
    ]
  };

  const content = isTerms ? termsContent.terms : termsContent.privacy;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
      } rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isTerms 
                ? theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                : theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              {icon}
            </div>
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            <div className={`p-4 rounded-lg ${
              isTerms
                ? theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                : theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Last updated: {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {isTerms 
                  ? 'Please read these Terms of Service carefully before using the Rail Madad platform.'
                  : 'This Privacy Policy describes how we collect, use, and protect your information when you use our services.'
                }
              </p>
            </div>

            {content.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className={`text-xl font-semibold ${
                  isTerms ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {section.title}
                </h3>
                
                <div className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                } leading-relaxed`}>
                  {section.content.split('\n').map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className={paragraph.startsWith('•') ? 'ml-4 mb-1' : 'mb-3'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              By using Rail Madad, you agree to these {isTerms ? 'terms' : 'privacy practices'}.
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className={`px-6 py-2 rounded-lg transition-colors text-white ${
                  isTerms 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
