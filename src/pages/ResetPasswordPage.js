import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import { Auth } from 'aws-amplify';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';


const ResetPasswordPage = ({ route, navigation }) => {
  const { email } = route.params;
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        titleOpacity.setValue(0);
        formTranslateY.setValue(50);
      };
    }, []),
  );

  const resetPassword = async () => {
  setError('');

  try {
    await Auth.forgotPasswordSubmit(email, confirmationCode, newPassword);
    console.log('Password reset successful!');
    Alert.alert('Success', 'Your password has been reset. Please sign in with your new password.', [
      { text: 'OK', onPress: () => navigation.navigate('SignIn') },
    ]);
  } catch (error) {
    console.error('Error resetting password:', error);
    setError('Invalid confirmation code or password');
    Alert.alert('Error', 'Invalid confirmation code or password. Please try again.');
  }
};


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={30} color="#FFFFFF" />
      </TouchableOpacity>
      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Reset Password</Animated.Text>
      <Animated.View style={[styles.formContainer, { transform: [{ translateY: formTranslateY }] }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <CustomInput
          containerStyle={styles.input}
          onChangeText={setConfirmationCode}
          value={confirmationCode}
          placeholder="Confirmation Code"
          keyboardType="numeric"
          textContentType="oneTimeCode"
          placeholderTextColor="#FFFFFF"
        />
        <CustomInput
          containerStyle={styles.input}
          onChangeText={setNewPassword}
          value={newPassword}
          placeholder="New Password"
          secureTextEntry
          textContentType="password"
          placeholderTextColor="#FFFFFF"
        />
        <CustomButton title="Reset Password" onPress={resetPassword} style={styles.button} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  error: {
    color: '#E63946',
    marginBottom: 10,
  },
  formContainer: {
    width: '80%',
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    width: '100%',
  },

});

export default ResetPasswordPage;
