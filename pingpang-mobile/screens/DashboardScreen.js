import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axiosConfig';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data);
    } catch (error) {
      console.log('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <>
          <View style={styles.profileHeader}>
            <Text style={styles.pseudoText}>{user.pseudo}</Text>
            {user.is_admin && <Text style={styles.adminBadge}>ADMIN</Text>}
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>RATING GLICKO</Text>
            <Text style={styles.ratingText}>{Math.round(user.r)}</Text>
            <View style={styles.subStatsRow}>
              <View style={styles.subStat}>
                <Text style={styles.subStatLabel}>RD</Text>
                <Text style={styles.subStatValue}>{Math.round(user.rd)}</Text>
              </View>
              <View style={styles.subStat}>
                <Text style={styles.subStatLabel}>VOLATILITY</Text>
                <Text style={styles.subStatValue}>{user.vol.toFixed(3)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MatchEntry')}>
              <Text style={styles.actionButtonText}>SAISIR UN MATCH</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.outlineButton]} onPress={() => navigation.navigate('Friends')}>
              <Text style={styles.outlineButtonText}>MES AMIS</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 20,
  },
  pseudoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  adminBadge: {
    backgroundColor: '#ff4444',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  subStat: {
    alignItems: 'center',
  },
  subStatLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  subStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  outlineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoutButton: {
    marginTop: 'auto',
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
