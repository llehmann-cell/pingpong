import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import api from '../api/axiosConfig';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.log('Error fetching friends:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await api.get(`/players?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.log('Error searching players:', error);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await api.post(`/friends/${friendId}`);
      Alert.alert('Succès', 'Ami ajouté !');
      fetchFriends();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || "Impossible d'ajouter cet ami");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RECHERCHER UN JOUEUR</Text>
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Pseudo du joueur..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>CHERCHER</Text>
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{item.pseudo}</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(item.id)}>
                  <Text style={styles.addButtonText}>AJOUTER</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 40 }]}>MES AMIS ({friends.length})</Text>
      
      {friends.length === 0 ? (
        <Text style={styles.emptyText}>Vous n'avez pas encore d'amis.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <Text style={styles.friendName}>{item.pseudo}</Text>
              <Text style={styles.friendRating}>ELO {Math.round(item.r)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchButton: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: 200,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  friendCard: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  friendName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendRating: {
    color: '#888',
    fontSize: 14,
  }
});
