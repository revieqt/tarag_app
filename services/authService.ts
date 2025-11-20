import { BACKEND_URL } from '@/constants/Config';

interface LoginResponse {
  user: {
    _id: string;
    fname: string;
    lname?: string;
    username: string;
    email: string;
    bdate: string;
    gender: string;
    contactNumber?: string;
    profileImage: string;
    type: string;
    status: string;
    bio: string;
    isFirstLogin: boolean;
    likes: string[];
    isProUser: boolean;
    createdOn: string;
    expPoints: number;
    safetyState: {
      isInAnEmergency: boolean;
      emergencyType: string;
    };
    visibilitySettings: {
      isProfilePublic: boolean;
      isPersonalInfoPublic: boolean;
      isTravelInfoPublic: boolean;
    };
    securitySettings: {
      is2FAEnabled: boolean;
    };
    taraBuddySettings: {
      isTaraBuddyEnabled: boolean;
      preferredGender?: string
      preferredDistance?: number;
      preferredAgeRange?: number[];
      preferredZodiac?: string[];
    };
  };
  accessToken: string;
  refreshToken: string;
}

export const loginUser = async (identifier: string, password: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

interface RegisterUserData {
  fname: string;
  lname?: string;
  bdate: string;
  gender: string;
  contactNumber?: string;
  username: string;
  email: string;
  password: string;
}

interface VerificationResponse {
  code: string;
  id: string;
}

export const sendEmailVerificationCode = async (email: string): Promise<VerificationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send verification code');
    }

    const data = await response.json();
    return data as VerificationResponse;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send verification code');
  }
};

export const verifyEmail = async (email: string, code: string, sentCode: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, sentCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email verification failed');
    }

    const data = await response.json();
    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Email verification failed');
  }
};

export const registerUser = async (userData: RegisterUserData) => {
  try {
    const requestData = {
      ...userData,
      type: 'traveler', // Default user type
      lname: userData.lname,
      contactNumber: userData.contactNumber,
    };
    
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const resetPassword = async (identifier: string, newPassword: string) => {
  try {
    // First check if identifier looks like an email
    const isEmail = identifier.includes('@');
    const payload = isEmail 
      ? { email: identifier, newPassword }
      : { userId: identifier, newPassword };
    
    const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset password');
    }

    const data = await response.json();
    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password');
  }
};

interface UpdatePasswordParams {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  accessToken: string;
}

export const updatePassword = async ({
  userId,
  oldPassword,
  newPassword,
  confirmPassword,
  accessToken
  }: UpdatePasswordParams) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmPassword
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update password');
    }

    const data = await response.json();
    return true;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update password');
  }
};