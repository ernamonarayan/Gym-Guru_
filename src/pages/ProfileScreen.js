import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
  Easing,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Auth, API, Storage} from 'aws-amplify';
import { getUserProfile } from '../graphql/queries';
import GlobalStyles from '../styles/GlobalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '../graphql/mutations';
import defaultAvatar from '../../assets/cover_photo_1.png';
import logo from '../../assets/gymguru-high-resolution-logo-color-on-transparent-background.png';
import LoadingScreen from '../components/Loading';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [avatarScale] = useState(new Animated.Value(1));
  const [pulseValue] = useState(new Animated.Value(0));
  const [avatarLoading, setAvatarLoading] = useState(false);


  const startPulseAnimation = () => {
    pulseValue.setValue(0);
    Animated.timing(pulseValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => startPulseAnimation());
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      if (currentUser) {
        console.log('Current user:', currentUser);
        const userProfileData = await API.graphql({
          query: getUserProfile,
          variables: { id: currentUser.attributes.sub },
          authMode: 'AMAZON_COGNITO_USER_POOLS',
        });

        const userProfile = userProfileData.data.getUserProfile;

        // Fetch the avatar URL from S3 if it exists
        if (userProfile.avatar) {
          const avatarUrl = await Storage.get(userProfile.avatar, {
            // Add cache-busting query parameter
            level: 'public',
            identityId: false,
            queryStringParameters: { t: Date.now().toString() },
          });
          userProfile.avatar = avatarUrl;
        }

        setUserData(userProfile);
        fadeIn(); // Call fadeIn animation after setting user data
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setAvatarLoading(true); // set avatarLoading to true every time the profile is fetched
      fetchUserProfile();
    });
    startPulseAnimation();
    return unsubscribe;
  }, [navigation]);

  const uploadImageToS3 = async (uri, contentType, userId) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageName = `avatars/${userId}_avatar.jpg`;

      const result = await Storage.put(imageName, blob, {
        contentType,
        level: 'public',
      });

      return result.key;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw error;
    }
  };

  const updateAvatarInProfile = async (userId, avatarKey) => {
  try {
    const result = await API.graphql({
      query: updateUserProfile,
      variables: {
        input: {
          id: userId,
          avatar: avatarKey,
        },
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    });

    return result.data.updateUserProfile;
  } catch (error) {
    console.error('Error updating avatar in user profile:', error);
    throw error;
  }
};

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 4],
    quality: 1,
  });

  console.log(result);

  if (!result.canceled) {
    try {
      setAvatarLoading(true); // Set avatarLoading to true before uploading the image
      const asset = result.assets[0];
      const avatarKey = await uploadImageToS3(asset.uri, asset.type, userData.id);

      const updatedProfile = await updateAvatarInProfile(userData.id, avatarKey);

      // Fetch the avatar URL from S3
      if (updatedProfile.avatar) {
        const avatarUrl = await Storage.get(updatedProfile.avatar, {
          // Add cache-busting query parameter
          level: 'public',
          identityId: false,
          queryStringParameters: { t: Date.now().toString() },
        });
        updatedProfile.avatar = avatarUrl;
      }

      setUserData(updatedProfile);

      Alert.alert(
        'Image Uploaded',
        'Your new avatar has been uploaded.',
      );
    } catch (error) {
      Alert.alert(
        'Error Uploading Image',
        'There was an error uploading your new avatar. Please try again later.',
      );
    } finally {
      setAvatarLoading(false); // Set avatarLoading to false after the upload process is complete
    }
  }
};




  const handleEditProfile = () => {
  navigation.navigate('ProfileEdit', { setLoading });
};

  const handleCreateProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  if (loading) {
  return <LoadingScreen />;
}

  if (!userData) {
    return (
      <View style={styles.profileContainer}>
        <Text style={styles.noProfileText}>
          No profile found. Please create your profile.
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProfile}
        >
          <Text style={styles.createText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
  <Animated.View
    style={[
      styles.profileContainer,
      { opacity: fadeAnim, backgroundColor: '#1A1A1D' },
    ]}
  >
    <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
      <TouchableOpacity
        onPressIn={() => {
          Animated.timing(avatarScale, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(avatarScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
          pickImage();
        }}
      >
        <ImageBackground
          source={userData.avatar ? { uri: userData.avatar } : defaultAvatar}
          style={styles.profileImage}
          onLoadEnd={() => setAvatarLoading(false)}
          imageStyle={{ borderRadius: 75 }}
        >
          <View
            style={[
              styles.avatarLoadingOverlay,
              {
                backgroundColor: avatarLoading
                  ? 'rgba(26, 26, 29, 0.5)'
                  : 'transparent',
              },
            ]}
          >
            {avatarLoading && (
              <ActivityIndicator size="large" color="#0E7C7B" />
            )}
          </View>
        </ImageBackground>
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              opacity: pulseValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  scale: pulseValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.cameraIcon}>
          <MaterialIcons name="add-a-photo" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
    <Text style={styles.name}>{userData.name}</Text>
    <Text style={styles.age}>Age: {userData.age}</Text>
    <Text style={styles.age}>Weight: {userData.weight} kg</Text>
    <Text style={styles.age}>Height: {userData.height} cm</Text>
    <Text style={styles.age}>Gender: {userData.gender}</Text>
    <Text style={styles.age}>Workout Days: {userData.workoutDays}</Text>
    <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
      <Text style={styles.editButtonText}>Edit</Text>
    </TouchableOpacity>
  </Animated.View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  age: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noProfileText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0E7C7B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  editButton: {
    backgroundColor: '#0E7C7B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  pulseCircle: {
  position: 'absolute',
  width: 150,
  height: 150,
  borderRadius: 75,
  borderWidth: 2,
  borderColor: '#0E7C7B',
  opacity: 0,
},
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#0E7C7B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1D',
  },
  logo: {
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').width * 0.5,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  avatarLoadingOverlay: {
  position: 'absolute',
  width: 150,
  height: 150,
  borderRadius: 75,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(26, 26, 29, 0.5)',
  },




});

export default ProfileScreen;

