import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axiosConfig';

export default function ClubsScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create Club state
  const [newClubName, setNewClubName] = useState('');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Search Club state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Members state
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
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

  React.useEffect(() => {
    if (user?.club_id) {
      fetchMembers();
      if (user.club_role === 'owner' || user.club_role === 'admin') {
        fetchRequests();
      }
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.get('/clubs/members');
      setMembers(response.data);
    } catch (error) {
      console.log('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get('/clubs/requests');
      setRequests(response.data);
    } catch (error) {
      console.log('Error fetching requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateClub = async () => {
    if (!newClubName.trim()) {
      Alert.alert('Erreur', 'Le nom du club est requis');
      return;
    }
    try {
      setCreating(true);
      await api.post('/clubs', {
        name: newClubName,
        description: newClubDescription,
      });
      Alert.alert('Succès', 'Club créé avec succès !');
      setNewClubName('');
      setNewClubDescription('');
      fetchUser();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de créer le club');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      const response = await api.get(`/clubs?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.log('Error searching clubs:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinClub = async (clubId, clubName) => {
    try {
      await api.post(`/clubs/${clubId}/join`);
      Alert.alert('Succès', `Demande envoyée au club ${clubName}`);
      fetchUser();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Impossible d\'envoyer la demande');
    }
  };

  const handleAcceptRequest = async (membershipId) => {
    try {
      await api.patch(`/clubs/requests/${membershipId}/accept`);
      Alert.alert('Succès', 'Joueur accepté !');
      fetchRequests();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de l\'acceptation');
    }
  };

  const handleRejectRequest = async (membershipId) => {
    try {
      await api.patch(`/clubs/requests/${membershipId}/reject`);
      fetchRequests();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors du refus');
    }
  };

  const handleKickMember = async (membershipId) => {
    Alert.alert(
      'Exclure',
      'Voulez-vous vraiment exclure ce membre ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exclure',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/clubs/members/${membershipId}`);
              fetchMembers();
            } catch (error) {
              Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de l\'exclusion');
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = async (membershipId, newRole) => {
    try {
      await api.patch(`/clubs/members/${membershipId}/role`, { role: newRole });
      fetchMembers();
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors du changement de rôle');
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Officier';
      default: return 'Membre';
    }
  };

  const handleLeaveClub = async () => {
    Alert.alert(
      'Quitter le club',
      'Êtes-vous sûr de vouloir quitter votre club actuel ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/clubs/leave');
              fetchUser();
            } catch (error) {
              Alert.alert('Erreur', error.response?.data?.detail || 'Impossible de quitter le club');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4fc3f7" />
      </View>
    );
  }

  // User is already in a club
  if (user?.club_id) {
    const isManager = user.club_role === 'owner' || user.club_role === 'admin';
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Mon Club</Text>
          <Text style={styles.clubName}>{user.club_name}</Text>
          <Text style={styles.roleText}>Rôle: {user.club_role}</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveClub}>
            <Text style={styles.dangerButtonText}>Quitter le club</Text>
          </TouchableOpacity>
        </View>

        {isManager && (
          <View style={styles.card}>
            <Text style={styles.title}>Demandes d'adhésion</Text>
            {loadingRequests ? (
              <ActivityIndicator color="#4fc3f7" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.requestItem}>
                    <Text style={styles.requestName}>{item.player_pseudo}</Text>
                    <View style={styles.requestActions}>
                      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptRequest(item.id)}>
                        <Text style={styles.acceptButtonText}>Accepter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item.id)}>
                        <Text style={styles.rejectButtonText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucune demande en attente.</Text>
                }
              />
            )}
          </View>
        )}

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.title}>Membres du club</Text>
          {loadingMembers ? (
            <ActivityIndicator color="#4fc3f7" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const canKick = 
                  isManager && 
                  item.player_id !== user.id && 
                  item.role !== 'owner' &&
                  !(user.club_role === 'admin' && item.role === 'admin');
                
                const canChangeRole = user.club_role === 'owner' && item.player_id !== user.id && item.role !== 'owner';

                return (
                  <View style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{item.player_pseudo}</Text>
                      <Text style={styles.memberRole}>{getRoleLabel(item.role)}</Text>
                    </View>
                    <View style={styles.memberActions}>
                      {canChangeRole && (
                        <TouchableOpacity 
                          style={styles.outlineActionBtn} 
                          onPress={() => handleChangeRole(item.id, item.role === 'admin' ? 'member' : 'admin')}
                        >
                          <Text style={styles.outlineActionBtnText}>
                            {item.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {canKick && (
                        <TouchableOpacity style={styles.kickButton} onPress={() => handleKickMember(item.id)}>
                          <Text style={styles.kickButtonText}>Exclure</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun membre trouvé.</Text>
              }
            />
          )}
        </View>
      </View>
    );
  }

  // User has a pending request but is not in a club
  if (user?.pending_club_id) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Demande en cours</Text>
          <Text style={styles.emptyText}>
            Vous avez une demande d'adhésion en attente.
          </Text>
        </View>
      </View>
    );
  }

  // User is not in a club
  return (
    <View style={styles.container}>
      {/* Create Club Section */}
      <View style={styles.card}>
        <Text style={styles.title}>Créer un Club</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du club"
          placeholderTextColor="#666"
          value={newClubName}
          onChangeText={setNewClubName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description (optionnelle)"
          placeholderTextColor="#666"
          value={newClubDescription}
          onChangeText={setNewClubDescription}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateClub} disabled={creating}>
          {creating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryButtonText}>Créer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Club Section */}
      <View style={[styles.card, { flex: 1 }]}>
        <Text style={styles.title}>Rechercher un Club</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
            placeholder="Nom du club..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={searching}>
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Chercher</Text>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.clubItem}>
              <View style={styles.clubInfo}>
                <Text style={styles.clubItemName}>{item.name}</Text>
                {item.description ? <Text style={styles.clubItemDesc}>{item.description}</Text> : null}
                <Text style={styles.clubItemMembers}>{item.members_count} membre(s)</Text>
              </View>
              <TouchableOpacity
                style={item.id === user?.pending_club_id ? styles.pendingButton : styles.joinButton}
                onPress={() => item.id !== user?.pending_club_id && handleJoinClub(item.id, item.name)}
                disabled={item.id === user?.pending_club_id}
              >
                <Text style={item.id === user?.pending_club_id ? styles.pendingButtonText : styles.joinButtonText}>
                  {item.id === user?.pending_club_id ? 'En attente' : 'Rejoindre'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun club trouvé.</Text>
          }
        />
      </View>
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
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  clubName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clubItem: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  clubInfo: {
    flex: 1,
    marginRight: 10,
  },
  clubItemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clubItemDesc: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  clubItemMembers: {
    color: '#4fc3f7',
    fontSize: 12,
    marginTop: 5,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  roleText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  pendingButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pendingButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 12,
  },
  requestItem: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  requestName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  acceptButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rejectButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
  memberItem: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  memberInfo: {
    flex: 1,
    marginRight: 10,
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberRole: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  outlineActionBtn: {
    borderWidth: 1,
    borderColor: '#4fc3f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  outlineActionBtnText: {
    color: '#4fc3f7',
    fontSize: 10,
    fontWeight: 'bold',
  },
  kickButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  kickButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
