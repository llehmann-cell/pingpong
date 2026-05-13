import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axiosConfig';

// ──────────────────────────────────────────
// Composant ligne d'un joueur dans le classement
// ──────────────────────────────────────────
function PlayerRow({ item, isMe }) {
  const medalColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
  const rankColor = medalColors[item.rank] || (isMe ? '#4fc3f7' : '#666');

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <Text style={[styles.rankText, { color: rankColor }]}>
        {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
      </Text>
      <Text style={[styles.pseudoText, isMe && styles.pseudoMe]} numberOfLines={1}>
        {item.pseudo}
        {isMe ? ' (moi)' : ''}
      </Text>
      <Text style={styles.ratingText}>{Math.round(item.r)}</Text>
    </View>
  );
}

// ──────────────────────────────────────────
// Écran principal
// ──────────────────────────────────────────
export default function RankingScreen() {
  const [tab, setTab] = useState('world'); // 'world' | 'national' | 'club'
  const [ranking, setRanking] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mon pays / club (depuis le profil)
  const [myCountry, setMyCountry] = useState(null);
  const [myClubId, setMyClubId] = useState(null);

  // Recherche de pays
  const [countryQuery, setCountryQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);

  // ── Charger les infos du profil connecté ────────
  useEffect(() => {
    const loadMyInfo = async () => {
      try {
        const meRes = await api.get('/me');
        setMyClubId(meRes.data?.club_id);
        const countryId = meRes.data?.country_id;
        if (countryId) {
          const cRes = await api.get(`/countries/${countryId}`);
          setMyCountry(cRes.data);
        }
      } catch (e) {
        // pas défini ou non connecté
      }
    };
    loadMyInfo();
  }, []);

  // ── Chargement du classement ───────────────
  const fetchRanking = useCallback(async (force = false) => {
    if (tab === 'club' && !myClubId) {
      setRanking([]);
      setMyRank(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!force) setLoading(true);
    try {
      let endpoint = '/ranking';
      if (tab === 'national' && selectedCountry) {
        endpoint = `/ranking/country/${selectedCountry.id}`;
      } else if (tab === 'club') {
        endpoint = '/ranking/club';
      }
      const [rankRes, meRes] = await Promise.all([
        api.get(endpoint),
        api.get('/ranking/me'),
      ]);
      setRanking(rankRes.data);
      setMyRank(meRes.data);
    } catch (e) {
      console.error('Ranking fetch error', e);
      setRanking([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, selectedCountry, myClubId]);

  useFocusEffect(
    useCallback(() => {
      fetchRanking();
    }, [fetchRanking])
  );

  // ── Recherche de pays ──────────────────────
  const searchTimeout = useRef(null);
  const handleCountrySearch = (text) => {
    setCountryQuery(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!text.trim()) { setCountries([]); return; }
      setCountryLoading(true);
      try {
        const res = await api.get(`/countries?q=${text}`);
        setCountries(res.data);
      } catch (e) {
        setCountries([]);
      } finally {
        setCountryLoading(false);
      }
    }, 300);
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
    setCountryQuery('');
    setCountries([]);
  };

  // ── Vérifier si un item est "moi" ──────────
  const isMe = (item) => myRank && item.id === myRank.id;

  // ── Le joueur connecté est-il dans la liste visible ? ──
  const myRankInList = ranking.some(isMe);

  return (
    <View style={styles.container}>

      {/* ── Tabs Mondial / National ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'world' && styles.tabActive]}
          onPress={() => { setTab('world'); setSelectedCountry(null); }}
        >
          <Text style={[styles.tabText, tab === 'world' && styles.tabTextActive]}>🌍 MONDIAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'national' && styles.tabActive]}
          onPress={() => {
            setTab('national');
            // Auto-sélection du pays du profil si rien n'est sélectionné
            if (!selectedCountry && myCountry) {
              setSelectedCountry(myCountry);
            }
          }}
        >
          <Text style={[styles.tabText, tab === 'national' && styles.tabTextActive]}>🏳️ NATIONAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'club' && styles.tabActive]}
          onPress={() => { setTab('club'); setSelectedCountry(null); }}
        >
          <Text style={[styles.tabText, tab === 'club' && styles.tabTextActive]}>🏟️ CLUB</Text>
        </TouchableOpacity>
      </View>

      {/* ── Sélecteur de pays (tab national) ── */}
      {tab === 'national' && (
        <View>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countrySelectorText}>
              {selectedCountry ? `🏳️ ${selectedCountry.name}` : 'Sélectionner un pays…'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Chip "Mon pays" — visible seulement si myCountry existe et est différent du sélectionné */}
          {myCountry && selectedCountry?.id !== myCountry.id && (
            <TouchableOpacity
              style={styles.myCountryChip}
              onPress={() => setSelectedCountry(myCountry)}
            >
              <Text style={styles.myCountryChipText}>🏠 Mon pays : {myCountry.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Classement ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text style={styles.loadingText}>Chargement du classement…</Text>
        </View>
      ) : tab === 'club' && !myClubId ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Vous n'appartenez à aucun club. Rejoignez-en un depuis l'onglet "Clubs" !
          </Text>
        </View>
      ) : ranking.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {tab === 'national' && !selectedCountry
              ? 'Sélectionnez un pays pour voir son classement.'
              : 'Aucun joueur dans ce classement.'}
          </Text>
        </View>
      ) : (
        <>
          {/* En-tête colonnes */}
          <View style={styles.headerRow}>
            <Text style={styles.headerRank}>RANG</Text>
            <Text style={styles.headerPseudo}>JOUEUR</Text>
            <Text style={styles.headerRating}>RATING</Text>
          </View>

          <FlatList
            data={ranking}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <PlayerRow item={item} isMe={isMe(item)} />}
            onRefresh={() => { setRefreshing(true); fetchRanking(true); }}
            refreshing={refreshing}
            contentContainerStyle={{ paddingBottom: myRank && !myRankInList ? 80 : 8 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}

      {/* ── Mon rang épinglé en bas (si hors top 100) ── */}
      {myRank && !myRankInList && !loading && (
        <View style={styles.myRankBar}>
          <View style={styles.myRankBarInner}>
            <Text style={styles.myRankBarLabel}>MON RANG</Text>
            <View style={styles.myRankBarContent}>
              <Text style={styles.myRankBarRank}>#{myRank.rank}</Text>
              <Text style={styles.myRankBarPseudo}>{myRank.pseudo}</Text>
              <Text style={styles.myRankBarRating}>{Math.round(myRank.r)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Modal recherche de pays ── */}
      <Modal visible={showCountryModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisir un pays</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un pays…"
              placeholderTextColor="#555"
              value={countryQuery}
              onChangeText={handleCountrySearch}
              autoFocus
            />

            {countryLoading && (
              <ActivityIndicator color="#4fc3f7" style={{ marginVertical: 12 }} />
            )}

            <FlatList
              data={countries}
              keyExtractor={(c) => String(c.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryItem} onPress={() => selectCountry(item)}>
                  <Text style={styles.countryItemText}>{item.name}</Text>
                  {item.code && <Text style={styles.countryCode}>{item.code}</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                countryQuery.length > 0 && !countryLoading ? (
                  <Text style={styles.emptyText}>Aucun pays trouvé.</Text>
                ) : null
              }
            />

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ──────────────────────────────────────────
// Styles
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#1e2a3a',
  },
  tabText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#4fc3f7',
  },

  // ── Country selector ──
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  countrySelectorText: {
    color: '#ccc',
    fontSize: 15,
  },
  chevron: {
    color: '#555',
    fontSize: 22,
  },

  // ── Header colonnes ──
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  headerRank: { color: '#333', fontSize: 11, fontWeight: 'bold', width: 60, letterSpacing: 1 },
  headerPseudo: { color: '#333', fontSize: 11, fontWeight: 'bold', flex: 1, letterSpacing: 1 },
  headerRating: { color: '#333', fontSize: 11, fontWeight: 'bold', width: 70, textAlign: 'right', letterSpacing: 1 },

  // ── Ligne joueur ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0a0a0a',
  },
  rowMe: {
    backgroundColor: '#0d1e2d',
  },
  rankText: {
    width: 60,
    fontSize: 15,
    fontWeight: 'bold',
  },
  pseudoText: {
    flex: 1,
    color: '#ddd',
    fontSize: 15,
  },
  pseudoMe: {
    color: '#4fc3f7',
    fontWeight: 'bold',
  },
  ratingText: {
    width: 70,
    textAlign: 'right',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#111',
    marginHorizontal: 16,
  },

  // ── Mon rang épinglé ──
  myRankBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a3a55',
    paddingBottom: 8,
  },
  myRankBarInner: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#0d1e2d',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a4a70',
  },
  myRankBarLabel: {
    color: '#4fc3f7',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  myRankBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRankBarRank: {
    color: '#4fc3f7',
    fontWeight: 'bold',
    fontSize: 16,
    width: 60,
  },
  myRankBarPseudo: {
    flex: 1,
    color: '#4fc3f7',
    fontSize: 15,
    fontWeight: 'bold',
  },
  myRankBarRating: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    width: 70,
    textAlign: 'right',
  },

  // ── États vides / loading ──
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#444',
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    color: '#444',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Modal pays ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalSheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  countryItemText: {
    color: '#ddd',
    fontSize: 15,
  },
  countryCode: {
    color: '#555',
    fontSize: 13,
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#ff5555',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
