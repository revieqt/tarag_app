import { StyleSheet, View, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import { useState } from 'react';
import GradientBlobs from '@/components/GradientBlobs';
import Wave from '@/components/Wave';
import { useRouter } from 'expo-router';  
import { useInternetConnection } from '@/utils/checkInternetConnection';
import { CustomAlert } from '@/components/Alert';
import { loginUser } from '@/services/authService';
import { useSession } from '@/context/SessionContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();
  const isConnected = useInternetConnection();

  const handleRegisterRedirect = () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
    } else {
      router.push('/auth/register');
    }
  };

  const { updateSession } = useSession();

  const handleLogin = async () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await loginUser(email, password);
      
      if (result.user.status === 'pending') {
        router.push({
          pathname: '/auth/verifyEmail' as any,
          params: { email: result.user.email }
        });
        return;
      }

      // Check if 2FA is enabled
      if (result.user.securitySettings?.is2FAEnabled) {
        router.push({
          pathname: '/auth/verifyEmail' as any,
          params: { 
            email: result.user.email, 
            is2FA: 'true',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            userData: JSON.stringify(result.user)
          }
        });
        return;
      }

      const userData = {
        id: result.user._id,
        fname: result.user.fname,
        lname: result.user.lname,
        username: result.user.username,
        email: result.user.email,
        bdate: new Date(result.user.bdate),
        gender: result.user.gender,
        contactNumber: result.user.contactNumber,
        profileImage: result.user.profileImage,
        likes: result.user.likes || [],
        isProUser: result.user.isProUser,
        bio: result.user.bio || '',
        status: result.user.status,
        type: result.user.type,
        expPoints: result.user.expPoints,
        createdOn: new Date(result.user.createdOn),
        isFirstLogin: result.user.isFirstLogin,
        safetyState: result.user.safetyState,
        visibilitySettings: {
          isProfilePublic: true,
          isTravelInfoPublic: true,
          isPersonalInfoPublic: true,
        },
        securitySettings: {
          is2FAEnabled: false,
        },
        taraBuddySettings: {
          isTaraBuddyEnabled: false,
        },
      };

      await updateSession({
        user: userData,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      if (result.user.isFirstLogin) {
        router.push('/account/firstLogin' as any);
      } else {
        router.replace('/home' as any);
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleforgotPassword = () => {
    if (!isConnected) {
      setShowNoInternetAlert(true);
    } else {
      router.push('/auth/forgotPassword');
    }
  };

  return (
    <ThemedView color='secondary' style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerContainer}>
            <GradientBlobs />
            <ThemedText type='title' style={{color: '#fff'}}>Smart Plans</ThemedText>
            <ThemedText style={{color: '#fff'}}>
              Safer Journeys, Travel with TaraG!
            </ThemedText>
          </View>
          
          <Wave/>
          <ThemedView style={styles.formContainer} color='primary'>
            <TextField
              placeholder="Email / Username"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              isFocused={focusedInput === 'email'}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              isFocused={focusedInput === 'password'}
            />

            <TouchableOpacity
              onPress={handleforgotPassword}
            >
              <ThemedText style={{ textAlign: 'right', opacity: .7}}>
                Forgot Password?
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={{ textAlign: 'center', color: 'red'}}>{errorMsg || ''}</ThemedText>

            <Button
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              type="primary"
              loading={loading}
              buttonStyle={{ width: '100%', marginTop: 10 }}
            />

            <TouchableOpacity
              onPress={handleRegisterRedirect}>
              <ThemedText style={{textAlign: 'center', marginTop: 10, opacity: .7}}>Dont have an account yet? Register</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={showNoInternetAlert}
        title="No Internet Connection"
        message="You need an internet connection to create an account. Please check your connection and try again."
        icon="warning-outline"
        fadeAfter={3000}
        onClose={() => setShowNoInternetAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => setShowNoInternetAlert(false) }
        ]}
      />
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer:{
    padding: 16,
    marginTop: -5,
  }
});
