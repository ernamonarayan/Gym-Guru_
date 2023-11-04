import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import pushUpPhoto from '../../assets/push_up_photo.jpg';
import cardioPhoto from '../../assets/cardio_photo.jpg';
import Loading from '../components/Loading';

const challenges = [
  { id: 1, title: '30-Day Push-up Challenge', difficulty: 'Intermediate', image: pushUpPhoto },
  { id: 2, title: '7-Day Cardio Challenge', difficulty: 'Beginner', image: cardioPhoto },
  // Add more challenges or fetch them from an API
];

const FeaturedChallenges = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace this with your actual data fetching function
    fetchChallenges().then(() => {
      setLoading(false);
    });
  }, []);

  const fetchChallenges = async () => {
    // Add your actual data fetching logic here
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.challengeItem}
      onPress={() => console.log('Challenge pressed')}
    >
      <Image style={styles.challengeImage} source={item.image} />
      <View style={styles.challengeTextContainer}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDifficulty}>{item.difficulty}</Text>
      </View>
      <Icon
        style={styles.arrowIcon}
        name="chevron-forward"
        size={30}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Text style={styles.title}>Featured Challenges</Text>
          <FlatList
            data={challenges}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </>
      )}
    </View>
  );
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1D',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#252525',
  },
  challengeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  challengeTextContainer: {
    padding: 10,
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  challengeDifficulty: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  arrowIcon: {
    marginLeft: 'auto',
    marginRight: 10,
  },
});

export default FeaturedChallenges;
