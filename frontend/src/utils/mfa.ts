import { 
  getAuth, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator, 
  RecaptchaVerifier,
  getMultiFactorResolver
} from 'firebase/auth';
import { multiFactor } from 'firebase/auth';

export const setupMFA = async (recaptchaContainer: string) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error('No user logged in');

  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
    size: 'normal',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });

  const phoneProvider = new PhoneAuthProvider(auth);
  const phoneNumber = user.phoneNumber;
  
  if (!phoneNumber) throw new Error('No phone number associated with account');

  try {
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber, 
      recaptchaVerifier
    );
    return verificationId;
  } finally {
    recaptchaVerifier.clear();
  }
};

export const enrollMFA = async (verificationId: string, verificationCode: string) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error('No user logged in');

  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
  
  // Fix: Use multiFactor() function to get the MultiFactor instance
  await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');
};

export const handleMFAChallenge = async (
  error: any, // Change type to any since we need to access error differently
  verificationCode: string
) => {
  // Fix: Use getMultiFactorResolver to get the resolver
  const auth = getAuth();
  const resolver = getMultiFactorResolver(auth, error);
  
  const phoneOpts = {
    multiFactorHint: resolver.hints[0],
    session: resolver.session
  };
  
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneOpts);
  const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
  
  await resolver.resolveSignIn(multiFactorAssertion);
};
