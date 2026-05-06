import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import api from '../api/axiosConfig';

export default function MatchEntryScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [scoreP1, setScoreP1] = useState(1.0); // 1.0 = Win, 0.0 = Loss

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

  const handleSubmit = async () => {
    if (!selectedOpponent) {
      Alert.alert('Erreur', 'Veuillez sélectionner un adversaire');
      return;
    }

    try {
      await api.post('/match', {
        player2_id: selectedOpponent.id,
        score_p1: scoreP1,
      });
      Alert.alert('Match Enregistré', 'Le calcul Glicko est en cours.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || "Impossible d'enregistrer le match");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SÉLECTIONNER L'ADVERSAIRE</Text>
      
      {friends.length === 0 ? (
        <Text style={styles.emptyText}>Vous n'avez pas encore d'amis. Ajoutez-en d'abord dans l'onglet Amis.</Text>
      ) : (
        <View style={styles.friendsListContainer}>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.opponentCard,
                  selectedOpponent?.id === item.id && styles.opponentCardSelected
                ]}
                onPress={() => setSelectedOpponent(item)}
              >
                <Text style={[
                  styles.opponentName,
                  selectedOpponent?.id === item.id && styles.opponentNameSelected
                ]}>
                  {item.pseudo}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {selectedOpponent && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>RÉSULTAT DU MATCH</Text>
          <View style={styles.scoreButtonsContainer}>
            <TouchableOpacity 
              style={[styles.scoreButton, scoreP1 === 1.0 && styles.scoreButtonActive]}
              onPress={() => setScoreP1(1.0)}
            >
              <Text style={[styles.scoreButtonText, scoreP1 === 1.0 && styles.scoreButtonTextActive]}>
                J'AI GAGNÉ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.scoreButton, scoreP1 === 0.0 && styles.scoreButtonActive]}
              onPress={() => setScoreP1(0.0)}
            >
              <Text style={[styles.scoreButtonText, scoreP1 === 0.0 && styles.scoreButtonTextActive]}>
                J'AI PERDU
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.submitButton, !selectedOpponent && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedOpponent}
      >
        <Text style={styles.submitButtonText}>VALIDER LE MATCH</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  friendsListContainer: {
    height: 100,
    marginBottom: 20,
  },
  opponentCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  opponentCardSelected: {
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  opponentName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  opponentNameSelected: {
    color: '#000',
  },
  resultSection: {
    marginTop: 20,
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  scoreButton: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  scoreButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  scoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreButtonTextActive: {
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
