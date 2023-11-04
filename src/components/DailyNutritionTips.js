import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';




const DailyNutritionTips = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const options = {
        method: 'GET',
        url: 'https://edamam-recipe-search.p.rapidapi.com/search',
        params: { q: 'chicken' },
        headers: {
          'X-RapidAPI-Key': 'ad388b1d98mshf2c7750256ea7d2p1e67fcjsn4d1a44336865',
          'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com',
        },
      };

      const response = await axios.request(options);
      const randomRecipes = response.data.hits
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setRecipes(randomRecipes);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const randomizeMeal = async (index) => {
    const newRecipes = [...recipes];
    const options = {
      method: 'GET',
      url: 'https://edamam-recipe-search.p.rapidapi.com/search',
      params: { q: 'chicken' },
      headers: {
        'X-RapidAPI-Key': 'ad388b1d98mshf2c7750256ea7d2p1e67fcjsn4d1a44336865',
        'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com',
      },
    };

    try {
      const response = await axios.request(options);
      const randomRecipe = response.data.hits[Math.floor(Math.random() * response.data.hits.length)];
      newRecipes[index] = randomRecipe;
      setRecipes(newRecipes);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Daily Nutrition Ideas</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E7C7B" />
          <Text style={styles.loadingMessage}>Loading...</Text>
        </View>
      ) : (
          <ScrollView>
        <View style={styles.container}>
          {recipes.map((recipe, index) => (
            <View key={index} style={styles.recipeItem}>
              <Image
                style={styles.recipeImage}
                source={{ uri: recipe.recipe.image }}
              />
              <View style={styles.recipeDetails}>
                <TouchableOpacity onPress={() => Linking.openURL(recipe.recipe.url)}>
                  <Text style={styles.recipeLabel}>{recipe.recipe.label}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.randomizeMealButton}
                  onPress={() => randomizeMeal(index)}
                >
                  <Text style={styles.randomizeMealButtonText}>Randomize Meal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#1A1A1D',
    flex: 1,
    paddingTop: 50, // Add this line to increase the top padding
  },
  container: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
    title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    paddingTop: 10, // Add this line to increase the top padding for the title
  },
  recipeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  recipeDetails: {
    flex: 1,
  },
  recipeLabel: {
    color: '#0E7C7B',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginBottom: 10,
  },
  randomizeMealButton: {
    backgroundColor: '#0E7C7B',
    borderRadius: 5,
    padding: 10,
    alignSelf: 'flex-start',
  },
  randomizeMealButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
  },
});

export default DailyNutritionTips;

