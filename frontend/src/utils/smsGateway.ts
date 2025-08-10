import { SMS_GATEWAY_CONFIG } from '../config/smsGateway.config';

interface SMSConfig {
  serverUrl: string;
  authToken: string;
  maxRetries: number;
  retryDelay: number;
}

const activeConfig = SMS_GATEWAY_CONFIG[SMS_GATEWAY_CONFIG.ACTIVE_SERVICE];

const smsConfig: SMSConfig = {
  serverUrl: activeConfig.url,
  authToken: activeConfig.token,
  maxRetries: 3,
  retryDelay: 2000,
};

interface SMSResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const sendSMS = async (
  phoneNumber: string,
  message: string,
  retryCount = 0
): Promise<SMSResponse> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`Sending SMS to ${formattedPhone}`);

    const response = await fetch('/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_GATEWAY_CONFIG.LOCAL.token}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message
      })
    });

    const contentType = response.headers.get('content-type');
    let data;

    try {
      data = contentType?.includes('application/json') 
        ? await response.json()
        : { success: false, message: await response.text() };
    } catch (e) {
      data = { success: false, message: 'Invalid response format' };
    }

    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        console.log('Auth failed with LOCAL token, trying CLOUD token...');
        const cloudResponse = await fetch('/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SMS_GATEWAY_CONFIG.CLOUD.token}`
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: message
          })
        });

        if (cloudResponse.ok) {
          return { success: true, message: 'SMS sent using cloud service' };
        }
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, message: 'SMS sent successfully' };

  } catch (error: any) {
    console.error('Error sending SMS:', error);

    if (retryCount < smsConfig.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendSMS(phoneNumber, message, retryCount + 1);
    }

    return {
      success: false,
      message: 'Failed to send SMS',
      error: error.message
    };
  }
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

// Format phone number to E.164 format
export const formatPhoneNumber = (phoneNumber: string): string => {
  let formatted = phoneNumber.replace(/\D/g, '');
  if (!formatted.startsWith('91')) {
    formatted = '91' + formatted;
  }
  return '+' + formatted;
};
