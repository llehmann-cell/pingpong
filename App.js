import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const visualPerformance = require('./assets/visual-performance.png');
const visualClubTable = require('./assets/visual-club-table.png');
const visualClubCafe = require('./assets/visual-club-cafe.png');

const tabs = ['Today', 'Play', 'Clubs', 'Rank', 'Gear'];
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const baseFeed = [
  {
    id: 'feed-1',
    player: 'Maya Chen',
    event: 'won a ranked best-of-five',
    detail: '11-8, 9-11, 11-6, 11-7 at Belleville Spin Lab',
    signal: '+18 PPR',
  },
  {
    id: 'feed-2',
    player: 'Noah Klein',
    event: 'defended local legend',
    detail: '14 check-ins this month on Table 04',
    signal: 'Legend',
  },
  {
    id: 'feed-3',
    player: 'Ari Benali',
    event: 'finished a coach block',
    detail: '42 minutes with backhand receive focus',
    signal: '9 day streak',
  },
];

const opponents = [
  { name: 'Elena Rossi', rating: 1788, note: 'Serve receive drills', distance: '1.2 km', match: '94%' },
  { name: 'Maya Chen', rating: 2148, note: 'Attack first, ranked set', distance: '2.8 km', match: '88%' },
  { name: 'Noah Klein', rating: 1818, note: 'Spin heavy defender', distance: '850 m', match: '82%' },
];

const rivalRatings = [
  { name: 'I. Navarro', rating: 2194, tag: 'World class' },
  { name: 'Maya Chen', rating: 2148, tag: 'Attack first' },
  { name: 'S. Ito', rating: 2112, tag: 'Control wall' },
  { name: 'Noah Klein', rating: 1818, tag: 'Spin heavy' },
];

const tableSpots = [
  {
    name: 'Table 04',
    area: 'Canal Saint-Martin',
    address: 'Quai de Valmy, Paris',
    legend: 'Noah',
    visits: 14,
    format: 'Outdoor concrete',
    crowd: 'Busy after 18:30',
    x: '34%',
    y: '38%',
  },
  {
    name: 'Spin Lab',
    area: 'Belleville Club',
    address: 'Rue de Belleville, Paris',
    legend: 'Maya',
    visits: 11,
    format: 'Indoor club tables',
    crowd: 'Ranked ladder tonight',
    x: '66%',
    y: '28%',
  },
  {
    name: 'Riverside Pair',
    area: 'Quai training zone',
    address: 'Bassin de la Villette, Paris',
    legend: 'Ari',
    visits: 8,
    format: 'Two public tables',
    crowd: 'Open challenge queue',
    x: '48%',
    y: '68%',
  },
];

const mapTiles = [
  { id: 'nw', source: { uri: 'https://tile.openstreetmap.org/14/8299/5635.png' } },
  { id: 'ne', source: { uri: 'https://tile.openstreetmap.org/14/8300/5635.png' } },
  { id: 'sw', source: { uri: 'https://tile.openstreetmap.org/14/8299/5636.png' } },
  { id: 'se', source: { uri: 'https://tile.openstreetmap.org/14/8300/5636.png' } },
];

const bookingSlots = [
  { time: '16:00', label: '3 tables available', info: 'T2/T3/T4', tag: 'Off peak' },
  { time: '16:30', label: '3 tables available', info: 'T2/T3/T4', tag: 'Off peak' },
  { time: '17:00', label: '4 tables available', info: 'T1/T2/T3/T4', tag: '' },
  { time: '17:30', label: '4 tables available', info: 'T1/T2/T3/T4', tag: '' },
  { time: '18:30', label: '2 tables available', info: 'Happy hour nearby', tag: 'Peak' },
];

const drills = [
  { id: 'warmup', title: 'Warmup rallies', meta: '6 min rhythm' },
  { id: 'serve', title: 'Short serve reads', meta: '10 receives' },
  { id: 'backhand', title: 'Backhand open-up', meta: '5 cross-court chains' },
  { id: 'ranked', title: 'Ranked game to 11', meta: 'Verify score' },
];

const challenges = [
  { title: 'Backhand control', target: '3 sessions this week', progress: 72 },
  { title: 'Ranked courage', target: 'Challenge 2 higher-rated players', progress: 50 },
  { title: 'Table hunter', target: 'Play 4 new public tables', progress: 25 },
];

const leagueLeaders = [
  { name: 'Emma', points: '4,820 XP', rank: 1 },
  { name: 'Lila', points: '4,610 XP', rank: 2 },
  { name: 'Noa', points: '4,180 XP', rank: 3 },
  { name: 'Sami', points: '3,970 XP', rank: 4 },
];

const gearSignals = [
  { label: 'Racket hours', value: '183 / 200', tone: 'coral' },
  { label: 'Rubber wear', value: 'Medium', tone: 'green' },
  { label: 'Next scan', value: 'After session', tone: 'amber' },
];

const feelingOptions = ['Sharp', 'Tired', 'Nervous', 'Confident', 'Frustrated'];

const starterMessages = [
  { id: 'msg-1', author: 'Lila', text: 'Available for a rotation tonight?' },
  { id: 'msg-2', author: 'Noa', text: 'Looking for a doubles partner Thursday.' },
  { id: 'msg-3', author: 'Emma', text: 'I can play at 18:30.', mine: true },
];

function addMinutesLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function MiniLabel({ children, light }) {
  return <Text style={[styles.miniLabel, light && styles.miniLabelLight]}>{children}</Text>;
}

function BrandBar({ rating, pendingCount, userName, localMode, messageCount, onOpenMessages, onSignOut }) {
  return (
    <View style={styles.brandBar}>
      <View>
        <Text style={styles.wordmark}>PING PANG</Text>
        <Text style={styles.brandSubline}>Paris club network x world ranking</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open messages"
          onPress={onOpenMessages}
          style={styles.messageButton}
        >
          <Text style={styles.messageButtonText}>M</Text>
          <View style={styles.messageCount}>
            <Text style={styles.messageCountText}>{messageCount}</Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={onSignOut} style={styles.headerStats}>
          <Text style={styles.headerRating}>{rating}</Text>
          <Text style={styles.headerMeta}>{localMode ? 'Local preview' : userName || `${pendingCount} pending`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Button({ label, active, compact, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        active && styles.buttonActive,
        disabled && styles.buttonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, active && styles.buttonTextActive, disabled && styles.mutedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleCopy}>
        {eyebrow ? <MiniLabel>{eyebrow}</MiniLabel> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StatColumn({ value, label, accent }) {
  return (
    <View style={styles.statColumn}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Toast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

function MessageDrawer({ visible, messages, draft, setDraft, onClose, onSend }) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.drawerOverlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close messages" style={styles.drawerScrim} onPress={onClose} />
      <View style={styles.messageDrawer}>
        <View style={styles.drawerHead}>
          <Text style={styles.drawerTitle}>Messages</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close messages" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>x</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.messageList}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageBubble, message.mine && styles.messageBubbleMine]}>
              <Text style={[styles.messageAuthor, message.mine && styles.messageAuthorMine]}>{message.author}</Text>
              <Text style={[styles.messageText, message.mine && styles.messageTextMine]}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.messageForm}>
          <TextInput
            accessibilityLabel="Message"
            onChangeText={setDraft}
            placeholder="Write to the community..."
            placeholderTextColor="#7b8b83"
            style={styles.messageInput}
            value={draft}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={onSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authStatus,
  onSubmit,
  onLocalPreview,
}) {
  const isRegister = authMode === 'register';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.authShell}>
        <ImageBackground source={visualPerformance} resizeMode="cover" style={styles.authHero}>
          <View style={styles.heroShade} />
          <View style={styles.authHeroCopy}>
            <MiniLabel light>PingPang account</MiniLabel>
            <Text style={styles.authTitle}>Your matches, rivals, notes, and tables.</Text>
            <Text style={styles.authText}>
              Sign in to sync post-match reviews and opponent notes with the PingPang backend.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.authPanel}>
          <View style={styles.authToggle}>
            <Button label="Sign in" active={!isRegister} onPress={() => setAuthMode('login')} />
            <Button label="Register" active={isRegister} onPress={() => setAuthMode('register')} />
          </View>

          {isRegister ? (
            <TextInput
              accessibilityLabel="Name"
              autoCapitalize="words"
              onChangeText={setAuthName}
              placeholder="Player name"
              placeholderTextColor="#7b8b83"
              style={styles.authInput}
              value={authName}
            />
          ) : null}
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setAuthEmail}
            placeholder="email@example.com"
            placeholderTextColor="#7b8b83"
            style={styles.authInput}
            value={authEmail}
          />
          <TextInput
            accessibilityLabel="Password"
            onChangeText={setAuthPassword}
            placeholder="Password"
            placeholderTextColor="#7b8b83"
            secureTextEntry
            style={styles.authInput}
            value={authPassword}
          />

          {authStatus ? <Text style={styles.authStatus}>{authStatus}</Text> : null}

          <View style={styles.authActions}>
            <Button label={isRegister ? 'Create account' : 'Sign in'} active onPress={onSubmit} />
            <Button label="Local preview" onPress={onLocalPreview} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Feed({ items }) {
  return (
    <View style={styles.feedStack}>
      {items.map((item) => (
        <View style={styles.feedLine} key={item.id}>
          <View style={styles.feedInitial}>
            <Text style={styles.feedInitialText}>{item.player.slice(0, 1)}</Text>
          </View>
          <View style={styles.feedBody}>
            <Text style={styles.feedTitle}>
              <Text style={styles.feedName}>{item.player}</Text> {item.event}
            </Text>
            <Text style={styles.feedDetail}>{item.detail}</Text>
          </View>
          <View style={styles.feedSignal}>
            <Text style={styles.feedSignalText}>{item.signal}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TodayScreen({ stats, feed, goPlay, goClubs, goRank, goGear, quickTraining, challengeMaya, mayaPending }) {
  return (
    <>
      <ImageBackground source={visualPerformance} resizeMode="cover" style={styles.hero}>
        <View style={styles.heroShade} />
        <View style={styles.heroTopline}>
          <MiniLabel light>Live club graph</MiniLabel>
          <Text style={styles.heroCode}>PPR {stats.rating}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Train, rank, and own your table.</Text>
          <Text style={styles.heroText}>
            A Strava-style activity layer and chess-style rating system for real ping-pong matches.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.actionStrip}>
        <Button label="Open scorer" active onPress={goPlay} />
        <Button label="Log 45 min" onPress={quickTraining} />
        <Button label={mayaPending ? 'Maya pending' : 'Challenge Maya'} onPress={challengeMaya} />
      </View>

      <View style={styles.statStrip}>
        <StatColumn value={addMinutesLabel(stats.weeklyMinutes)} label="weekly play" accent />
        <StatColumn value={String(stats.streak)} label="day streak" />
        <StatColumn value={String(stats.matches)} label="ranked matches" />
      </View>

      <View style={styles.streakCard}>
        <View style={styles.cardHead}>
          <View>
            <MiniLabel>Streak</MiniLabel>
            <Text style={styles.cardTitle}>18 active days</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+120 XP</Text>
          </View>
        </View>
        <View style={styles.ballStreak}>
          {[true, true, true, true, false, false, false].map((done, index) => (
            <View key={`streak-${index}`} style={[styles.streakBall, done && styles.streakBallDone]} />
          ))}
        </View>
      </View>

      <View style={styles.homeGrid}>
        <Pressable accessibilityRole="button" onPress={goClubs} style={styles.simpleCard}>
          <Text style={styles.simpleCardMeta}>16:30</Text>
          <Text style={styles.simpleCardTitle}>3 tables available</Text>
          <Text style={styles.simpleCardText}>Table 1, 2 or 4. Off peak.</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goPlay} style={styles.simpleCard}>
          <Text style={styles.simpleCardMeta}>Matching</Text>
          <Text style={styles.simpleCardTitle}>4 compatible players</Text>
          <Text style={styles.simpleCardText}>Paris. 1300-1900 PPR.</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goGear} style={styles.simpleCard}>
          <Text style={styles.simpleCardMeta}>Last performance</Text>
          <Text style={styles.simpleCardTitle}>Topspin 84 km/h</Text>
          <Text style={styles.simpleCardText}>540 shots. 78% endurance.</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={goRank} style={styles.simpleCard}>
          <Text style={styles.simpleCardMeta}>Challenge</Text>
          <Text style={styles.simpleCardTitle}>Top 10 this week</Text>
          <Text style={styles.simpleCardText}>220 XP left to gain.</Text>
        </Pressable>
      </View>

      <View style={styles.coachPanel}>
        <View style={styles.coachMark}>
          <Text style={styles.coachMarkText}>AI</Text>
        </View>
        <View style={styles.coachCopy}>
          <MiniLabel light>Aura coach</MiniLabel>
          <Text style={styles.darkCardTitle}>Short serve receive is still the next block.</Text>
          <Text style={styles.darkCardText}>
            Your last logged game ended with two missed first attacks. Tonight's plan keeps the
            opening sequence tight.
          </Text>
        </View>
      </View>

      <SectionTitle eyebrow="Community" title="Live from your circle" action="Play" onAction={goPlay} />
      <Feed items={feed} />

      <SectionTitle eyebrow="Tonight" title="Belleville ladder night" action="Clubs" />
      <View style={styles.editorialPanel}>
        <Image source={visualClubCafe} resizeMode="cover" style={styles.panelImage} />
        <View style={styles.panelCopy}>
          <Text style={styles.panelTitle}>32 players, Swiss rounds, verified PPR.</Text>
          <Text style={styles.panelText}>
            Club nights create clean match history, rivalries, and table records without spreadsheets.
          </Text>
        </View>
      </View>
    </>
  );
}

function OpponentCard({ opponent, pending, selected, savedNote, onInvite, onSelect }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Face ${opponent.name}`}
      onPress={onSelect}
      style={[styles.opponentCard, selected && styles.opponentCardSelected]}
    >
      <View style={styles.avatarBlock}>
        <Text style={styles.avatarText}>{opponent.name.slice(0, 1)}</Text>
      </View>
      <View style={styles.opponentCopy}>
        <Text style={styles.opponentName}>{opponent.name}</Text>
        <Text style={styles.opponentMeta}>
          {opponent.rating} PPR. {opponent.note}. {opponent.distance}
        </Text>
        {savedNote ? <Text style={styles.savedOpponentNote}>Last note: {savedNote.note}</Text> : null}
      </View>
      <View style={styles.opponentActions}>
        <View style={styles.matchPercentPill}>
          <Text style={styles.matchPercentText}>{opponent.match}</Text>
        </View>
        <Button label={selected ? 'Facing' : 'Face'} compact active={selected} onPress={onSelect} />
        <Button label={pending ? 'Sent' : 'Invite'} compact active={!pending} onPress={onInvite} />
      </View>
    </Pressable>
  );
}

function ScoreButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.scoreButton, pressed && styles.pressed]}
    >
      <Text style={styles.scoreButtonText}>{label}</Text>
    </Pressable>
  );
}

function PostMatchReview({
  matchReview,
  reviewFeeling,
  reviewFeedback,
  opponentNoteDraft,
  setReviewFeeling,
  setReviewFeedback,
  setOpponentNoteDraft,
  submitReview,
  skipReview,
}) {
  return (
    <View style={styles.reviewPanel}>
      <View style={styles.reviewHeader}>
        <View>
          <MiniLabel light>Post match</MiniLabel>
          <Text style={styles.reviewTitle}>How did it feel against {matchReview.opponentName}?</Text>
        </View>
        <Text style={styles.reviewDelta}>{matchReview.delta > 0 ? '+' : ''}{matchReview.delta} PPR</Text>
      </View>

      <View style={styles.feelingGrid}>
        {feelingOptions.map((feeling) => {
          const active = reviewFeeling === feeling;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={feeling}
              onPress={() => setReviewFeeling(feeling)}
              style={[styles.feelingChip, active && styles.feelingChipActive]}
            >
              <Text style={[styles.feelingText, active && styles.feelingTextActive]}>{feeling}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        accessibilityLabel="Match feedback"
        multiline
        onChangeText={setReviewFeedback}
        placeholder="What happened in the match? Serves, pressure, tactics, fitness..."
        placeholderTextColor="#7b8b83"
        style={styles.reviewInput}
        value={reviewFeedback}
      />
      <TextInput
        accessibilityLabel="Opponent notes"
        multiline
        onChangeText={setOpponentNoteDraft}
        placeholder="Notes for next time you face this opponent..."
        placeholderTextColor="#7b8b83"
        style={[styles.reviewInput, styles.opponentNoteInput]}
        value={opponentNoteDraft}
      />

      <View style={styles.reviewActions}>
        <Button label="Save review" active onPress={submitReview} />
        <Button label="Skip" onPress={skipReview} />
      </View>
    </View>
  );
}

function PlayScreen({
  score,
  sets,
  selectedOpponent,
  opponentNotes,
  matchReview,
  reviewFeeling,
  reviewFeedback,
  opponentNoteDraft,
  completedDrills,
  pendingChallenges,
  addPoint,
  resetScore,
  claimSet,
  saveMatch,
  invite,
  selectOpponent,
  setReviewFeeling,
  setReviewFeedback,
  setOpponentNoteDraft,
  submitReview,
  skipReview,
  toggleDrill,
}) {
  const canYouClaim = score.you >= 11 && score.you - score.them >= 2;
  const canThemClaim = score.them >= 11 && score.them - score.you >= 2;
  const selectedNotes = opponentNotes[selectedOpponent.name];

  return (
    <>
      <View style={styles.playHero}>
        <MiniLabel light>Match room</MiniLabel>
        <Text style={styles.playHeroTitle}>Score now. Review after the handshake.</Text>
        <View style={styles.facingPanel}>
          <View>
            <Text style={styles.facingLabel}>Facing</Text>
            <Text style={styles.facingName}>{selectedOpponent.name}</Text>
          </View>
          <Text style={styles.facingRating}>{selectedOpponent.rating} PPR</Text>
        </View>
        {selectedNotes?.note ? (
          <View style={styles.previousNotePanel}>
            <Text style={styles.previousNoteLabel}>Previous opponent note</Text>
            <Text style={styles.previousNoteText}>{selectedNotes.note}</Text>
            {selectedNotes.feedback ? <Text style={styles.previousNoteMeta}>{selectedNotes.feedback}</Text> : null}
          </View>
        ) : null}
        <View style={styles.scoreBoard}>
          <View style={styles.scoreSide}>
            <Text style={styles.scoreName}>You</Text>
            <Text style={styles.scoreNumber}>{score.you}</Text>
            <Text style={styles.setText}>{sets.you} sets</Text>
            <ScoreButton label="+ point" onPress={() => addPoint('you')} />
          </View>
          <View style={styles.scoreDivider}>
            <Text style={styles.scoreVs}>vs</Text>
          </View>
          <View style={styles.scoreSide}>
            <Text style={styles.scoreName}>Rival</Text>
            <Text style={styles.scoreNumber}>{score.them}</Text>
            <Text style={styles.setText}>{sets.them} sets</Text>
            <ScoreButton label="+ point" onPress={() => addPoint('them')} />
          </View>
        </View>
        <View style={styles.scoreActions}>
          <Button label="You won set" compact active onPress={() => claimSet('you')} disabled={!canYouClaim} />
          <Button label="Rival won set" compact onPress={() => claimSet('them')} disabled={!canThemClaim} />
          <Button label="Reset" compact onPress={resetScore} />
        </View>
      </View>

      <View style={styles.saveStrip}>
        <Button label="Save ranked win" active onPress={() => saveMatch('win')} />
        <Button label="Save ranked loss" onPress={() => saveMatch('loss')} />
      </View>

      {matchReview ? (
        <PostMatchReview
          matchReview={matchReview}
          reviewFeeling={reviewFeeling}
          reviewFeedback={reviewFeedback}
          opponentNoteDraft={opponentNoteDraft}
          setReviewFeeling={setReviewFeeling}
          setReviewFeedback={setReviewFeedback}
          setOpponentNoteDraft={setOpponentNoteDraft}
          submitReview={submitReview}
          skipReview={skipReview}
        />
      ) : null}

      <SectionTitle eyebrow="Nearby" title="Players ready now" />
      <View style={styles.listStack}>
        {opponents.map((opponent) => (
          <OpponentCard
            key={opponent.name}
            opponent={opponent}
            selected={opponent.name === selectedOpponent.name}
            savedNote={opponentNotes[opponent.name]}
            pending={Boolean(pendingChallenges[opponent.name])}
            onInvite={() => invite(opponent.name)}
            onSelect={() => selectOpponent(opponent)}
          />
        ))}
      </View>

      <SectionTitle eyebrow="Coach" title="Tonight's block" action={`${Object.keys(completedDrills).length}/4`} />
      <View style={styles.planList}>
        {drills.map((drill, index) => {
          const done = Boolean(completedDrills[drill.id]);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => toggleDrill(drill.id)}
              style={[styles.planRow, done && styles.planRowDone]}
              key={drill.id}
            >
              <Text style={[styles.planIndex, done && styles.planIndexDone]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={styles.planTextWrap}>
                <Text style={styles.planTitle}>{drill.title}</Text>
                <Text style={styles.planMeta}>{drill.meta}</Text>
              </View>
              <Text style={[styles.checkMark, done && styles.checkMarkDone]}>{done ? 'Done' : 'Tap'}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle eyebrow="Challenges" title="Small goals, visible progress" action="3 live" />
      {challenges.map((challenge) => (
        <View style={styles.challengePanel} key={challenge.title}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengePercent}>{challenge.progress}%</Text>
          </View>
          <Text style={styles.challengeTarget}>{challenge.target}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
          </View>
        </View>
      ))}
    </>
  );
}

function RealTableMap({ tables, selectedSpot, setSelectedSpot }) {
  return (
    <View style={styles.mapStage}>
      <View style={styles.tileGrid}>
        {mapTiles.map((tile) => (
          <Image key={tile.id} source={tile.source} resizeMode="cover" style={styles.mapTile} />
        ))}
      </View>
      <View style={styles.mapWash} />
      <View style={styles.mapTopBar}>
        <View>
          <MiniLabel>OpenStreetMap</MiniLabel>
          <Text style={styles.realMapTitle}>Tables around Paris</Text>
        </View>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Live</Text>
        </View>
      </View>
      {tables.map((table) => {
        const active = table.name === selectedSpot.name;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Select ${table.name}`}
            key={table.name}
            onPress={() => setSelectedSpot(table)}
            style={[styles.mapPin, active && styles.mapPinActive, { left: table.x, top: table.y }]}
          >
            <Text style={styles.mapPinText}>{active ? 'P' : 'T'}</Text>
          </Pressable>
        );
      })}
      <Text style={styles.mapAttribution}>Map data OpenStreetMap contributors</Text>
    </View>
  );
}

function BookingRow({ slot, reserved, onReserve }) {
  return (
    <View style={styles.bookingRow}>
      <Text style={styles.bookingTime}>{slot.time}</Text>
      <View style={styles.bookingCopy}>
        {slot.tag ? (
          <View style={styles.bookingTag}>
            <Text style={styles.bookingTagText}>{slot.tag}</Text>
          </View>
        ) : null}
        <Text style={styles.bookingLabel}>{slot.label}</Text>
        <Text style={styles.bookingInfo}>{slot.info}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reserve ${slot.time}`}
        onPress={onReserve}
        style={[styles.reserveButton, reserved && styles.reserveButtonActive]}
      >
        <Text style={[styles.reserveButtonText, reserved && styles.reserveButtonTextActive]}>
          {reserved ? 'OK' : '+'}
        </Text>
      </Pressable>
    </View>
  );
}

function ClubsScreen({ tables, selectedSpot, setSelectedSpot, checkedIn, checkIn, reservedSlots, reserveSlot }) {
  const selectedVisits = selectedSpot.visits + (checkedIn[selectedSpot.name] || 0);

  return (
    <>
      <RealTableMap tables={tables} selectedSpot={selectedSpot} setSelectedSpot={setSelectedSpot} />

      <View style={styles.spotPanel}>
        <View style={styles.spotHeader}>
          <View>
            <MiniLabel>Selected table</MiniLabel>
            <Text style={styles.spotTitle}>{selectedSpot.name}</Text>
            <Text style={styles.spotAddress}>{selectedSpot.address}</Text>
          </View>
          <Button label="Check in" compact active onPress={checkIn} />
        </View>
        <View style={styles.spotGrid}>
          <StatColumn value={String(selectedVisits)} label="visits" accent />
          <StatColumn value={selectedSpot.legend} label="local legend" />
          <StatColumn value={selectedSpot.format} label="format" />
        </View>
        <Text style={styles.spotNote}>{selectedSpot.crowd}</Text>
      </View>

      <SectionTitle eyebrow="Segments" title="Ping-pong tables as places" action="Near you" />
      {tables.map((table) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectedSpot(table)}
          style={[styles.segmentLine, table.name === selectedSpot.name && styles.segmentLineActive]}
          key={table.name}
        >
          <View>
            <Text style={styles.segmentName}>{table.name}</Text>
            <Text style={styles.segmentArea}>{table.area}</Text>
          </View>
          <View style={styles.legendBlock}>
            <Text style={styles.legendLabel}>Local legend</Text>
            <Text style={styles.legendName}>{table.legend}</Text>
            <Text style={styles.legendVisits}>{table.visits + (checkedIn[table.name] || 0)} visits</Text>
          </View>
        </Pressable>
      ))}

      <SectionTitle eyebrow="Booking" title="Tables and events" action="Today" />
      <View style={styles.bookingPanel}>
        <View style={styles.bookingTabs}>
          <Text style={styles.bookingTabActive}>Tables</Text>
          <Text style={styles.bookingTab}>Events</Text>
        </View>
        <View style={styles.dateRow}>
          {['Wed 01/05', 'Thu 02/05', 'Fri 03/05', 'Sat 04/05'].map((date, index) => (
            <Text key={date} style={[styles.dateChip, index === 0 && styles.dateChipActive]}>
              {date}
            </Text>
          ))}
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <Text style={styles.filterChipActive}>Table</Text>
          <Text style={styles.filterChip}>Coach</Text>
        </View>
        <View style={styles.bookingList}>
          {bookingSlots.map((slot) => (
            <BookingRow
              key={slot.time}
              slot={slot}
              reserved={Boolean(reservedSlots[slot.time])}
              onReserve={() => reserveSlot(slot)}
            />
          ))}
        </View>
      </View>

      <View style={styles.eventCard}>
        <View>
          <MiniLabel>18:30 - 20:30</MiniLabel>
          <Text style={styles.eventTitle}>Happy Hours</Text>
          <Text style={styles.eventMeta}>8 spots left. Paris ladder night.</Text>
        </View>
        <Button label="Join" active compact onPress={() => reserveSlot({ time: '18:30 event', label: 'Happy Hours' })} />
      </View>

      <SectionTitle eyebrow="Clubs" title="A culture to share" action="Discover" />
      <View style={styles.clubDuo}>
        <View style={styles.clubTile}>
          <Text style={styles.clubTitle}>Spin District</Text>
          <Text style={styles.clubText}>418 members. Tuesday drills. Mixed-level ladder.</Text>
        </View>
        <View style={styles.clubTileDark}>
          <Text style={styles.clubTitleLight}>Outdoor Kings</Text>
          <Text style={styles.clubTextLight}>Public table hunters, rain calls, weekend meetups.</Text>
        </View>
      </View>
    </>
  );
}

function RankScreen({ rating, matches, pendingChallenges, challengeMaya }) {
  const ranked = useMemo(
    () =>
      [...rivalRatings, { name: 'You', rating, tag: `${matches} ranked matches`, highlight: true }]
        .sort((a, b) => b.rating - a.rating)
        .map((player, index) => ({ ...player, rank: index + 1 })),
    [matches, rating]
  );
  const you = ranked.find((player) => player.name === 'You');
  const next = ranked[you.rank - 2];
  const gap = next ? next.rating - rating : 0;

  return (
    <>
      <View style={styles.rankingStage}>
        <MiniLabel light>World ranking</MiniLabel>
        <Text style={styles.rankingNumber}>{rating}</Text>
        <Text style={styles.rankingText}>
          Chess-style progression for real table challenges. Win, verify, climb, repeat.
        </Text>
        <View style={styles.rankActions}>
          <Button
            label={pendingChallenges['Maya Chen'] ? 'Maya pending' : 'Challenge #2'}
            active
            onPress={challengeMaya}
          />
          <Button label={next ? `${gap} pts to #${next.rank}` : 'Top of table'} />
        </View>
      </View>

      <SectionTitle eyebrow="Leaderboard" title="Merit your place" action="Global" />
      <View style={styles.rankTable}>
        {ranked.map((player) => (
          <View style={[styles.rankRow, player.highlight && styles.rankRowActive]} key={player.name}>
            <Text style={styles.rankIndex}>{String(player.rank).padStart(2, '0')}</Text>
            <View style={styles.rankPlayer}>
              <Text style={styles.rankName}>{player.name}</Text>
              <Text style={styles.rankTag}>{player.tag}</Text>
            </View>
            <Text style={styles.rankRating}>{player.rating}</Text>
          </View>
        ))}
      </View>

      <SectionTitle eyebrow="XP League" title="Gold League Paris" action="128 players" />
      <View style={styles.leagueCard}>
        {leagueLeaders.map((player) => (
          <View style={styles.leagueRow} key={player.name}>
            <View style={styles.leagueRank}>
              <Text style={styles.leagueRankText}>{player.rank}</Text>
            </View>
            <Text style={styles.leagueName}>{player.name}</Text>
            <Text style={styles.leaguePoints}>{player.points}</Text>
          </View>
        ))}
      </View>

      <SectionTitle eyebrow="Identity" title="Badges people understand" />
      <View style={styles.badgeGrid}>
        {['Local Legend', 'Serve Reader', '12 Day Streak', 'Tournament Host'].map((badge) => (
          <View style={styles.badgeTile} key={badge}>
            <Text style={styles.badgeGlyph}>*</Text>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function GearScreen({ rubberScanned, scanRubber }) {
  return (
    <>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>EL</Text>
        </View>
        <Text style={styles.profileName}>Emma Lehmann</Text>
        <Text style={styles.profileMeta}>Rotation attacker. Paris. 1450 pts.</Text>
        <View style={styles.profileCounts}>
          <View style={styles.profileCount}>
            <Text style={styles.profileCountValue}>31</Text>
            <Text style={styles.profileCountLabel}>posts</Text>
          </View>
          <View style={styles.profileCount}>
            <Text style={styles.profileCountValue}>248</Text>
            <Text style={styles.profileCountLabel}>followers</Text>
          </View>
          <View style={styles.profileCount}>
            <Text style={styles.profileCountValue}>186</Text>
            <Text style={styles.profileCountLabel}>following</Text>
          </View>
        </View>
      </View>

      <View style={styles.performancePost}>
        <View style={styles.cardHead}>
          <View>
            <MiniLabel>Performance posted</MiniLabel>
            <Text style={styles.cardTitle}>Forehand topspin</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>84 km/h</Text>
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <View style={styles.metricTile}>
            <Text style={styles.metricValue}>540</Text>
            <Text style={styles.metricLabel}>shots</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricValue}>38 deg</Text>
            <Text style={styles.metricLabel}>avg angle</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricValue}>78%</Text>
            <Text style={styles.metricLabel}>endurance</Text>
          </View>
          <View style={styles.metricTile}>
            <Text style={styles.metricValue}>42 min</Text>
            <Text style={styles.metricLabel}>time</Text>
          </View>
        </View>
      </View>

      <View style={styles.gearStage}>
        <View style={styles.racketArt}>
          <View style={styles.racketFace} />
          <View style={styles.racketHandle} />
        </View>
        <View style={styles.gearCopy}>
          <MiniLabel light>Performance product</MiniLabel>
          <Text style={styles.gearTitle}>
            {rubberScanned ? 'Rubber scan saved for your next session.' : '17 hours until replacement reminder.'}
          </Text>
          <Text style={styles.gearText}>
            Recommendations use play hours, scan history, style, and players with similar improvement curves.
          </Text>
        </View>
      </View>

      <View style={styles.gearSignals}>
        {gearSignals.map((signal) => (
          <View style={styles.gearSignal} key={signal.label}>
            <Text style={styles.gearSignalLabel}>{signal.label}</Text>
            <Text style={[styles.gearSignalValue, styles[`tone_${signal.tone}`]]}>{signal.value}</Text>
          </View>
        ))}
      </View>

      <SectionTitle eyebrow="Camera" title="Rubber wear check" action={rubberScanned ? 'Saved' : 'Scan'} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan rubber wear"
        onPress={scanRubber}
        style={({ pressed }) => [styles.scanPanel, rubberScanned && styles.scanPanelActive, pressed && styles.pressed]}
      >
        <View style={styles.scanFrame}>
          <View style={[styles.scanLens, rubberScanned && styles.scanLensActive]} />
        </View>
        <View style={styles.scanTextWrap}>
          <Text style={styles.scanTitle}>{rubberScanned ? 'Grip looks consistent' : 'Photo after training'}</Text>
          <Text style={styles.scanText}>
            {rubberScanned
              ? 'Medium wear detected. Replacement reminder stays in 17 hours.'
              : 'Compare shine, edge damage, and grip decay against previous sessions.'}
          </Text>
        </View>
      </Pressable>

      <SectionTitle eyebrow="Connected" title="Outside signals" />
      <View style={styles.integrationGrid}>
        {['Garmin', 'Apple Health', 'Strava import'].map((name) => (
          <View style={styles.integrationTile} key={name}>
            <Text style={styles.integrationInitial}>{name.slice(0, 1)}</Text>
            <Text style={styles.integrationName}>{name}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Today');
  const [authMode, setAuthMode] = useState('login');
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [localMode, setLocalMode] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [rating, setRating] = useState(1842);
  const [weeklyMinutes, setWeeklyMinutes] = useState(400);
  const [matches, setMatches] = useState(12);
  const [feed, setFeed] = useState(baseFeed);
  const [score, setScore] = useState({ you: 0, them: 0 });
  const [sets, setSets] = useState({ you: 0, them: 0 });
  const [selectedOpponent, setSelectedOpponent] = useState(opponents[0]);
  const [opponentNotes, setOpponentNotes] = useState({});
  const [matchReview, setMatchReview] = useState(null);
  const [reviewFeeling, setReviewFeeling] = useState('Sharp');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [opponentNoteDraft, setOpponentNoteDraft] = useState('');
  const [completedDrills, setCompletedDrills] = useState({});
  const [pendingChallenges, setPendingChallenges] = useState({});
  const [selectedSpot, setSelectedSpot] = useState(tableSpots[0]);
  const [remoteTables, setRemoteTables] = useState([]);
  const [checkedIn, setCheckedIn] = useState({});
  const [reservedSlots, setReservedSlots] = useState({});
  const [messages, setMessages] = useState(starterMessages);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [rubberScanned, setRubberScanned] = useState(false);

  const pendingCount = Object.keys(pendingChallenges).length;
  const stats = { rating, weeklyMinutes, streak: 12, matches };
  const tableData = remoteTables.length ? remoteTables : tableSpots;

  async function apiRequest(path, { method = 'GET', body, token = authToken } = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  async function loadBackendData(token) {
    const [notesResponse, tablesResponse] = await Promise.all([
      apiRequest('/opponents/notes', { token }),
      apiRequest('/tables', { token }),
    ]);
    const notesByOpponent = {};
    notesResponse.notes?.forEach((item) => {
      notesByOpponent[item.opponentName] = {
        feeling: item.feeling,
        feedback: item.feedback,
        note: item.note,
        updatedAt: item.updatedAt,
      };
    });
    setOpponentNotes(notesByOpponent);

    if (tablesResponse.tables?.length) {
      setRemoteTables(tablesResponse.tables);
      setSelectedSpot(tablesResponse.tables[0]);
    }
  }

  async function submitAuth() {
    setAuthStatus('Connecting to PingPang API...');

    try {
      const path = authMode === 'register' ? '/auth/register' : '/auth/login';
      const payload = {
        email: authEmail,
        password: authPassword,
        ...(authMode === 'register' ? { name: authName } : {}),
      };
      const data = await apiRequest(path, { method: 'POST', body: payload, token: null });
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setRating(data.user.rating || 1842);
      setLocalMode(false);
      setAuthStatus('');
      await loadBackendData(data.token);
    } catch (error) {
      setAuthStatus(error.message);
    }
  }

  function startLocalPreview() {
    setLocalMode(true);
    setAuthStatus('');
  }

  function signOut() {
    setAuthToken(null);
    setCurrentUser(null);
    setLocalMode(false);
    setAuthPassword('');
  }

  function prependFeed(event) {
    setFeed((items) => [{ id: `feed-${Date.now()}`, ...event }, ...items].slice(0, 8));
  }

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2400);
  }

  function quickTraining() {
    setWeeklyMinutes((minutes) => minutes + 45);
    prependFeed({
      player: 'You',
      event: 'logged a training block',
      detail: '45 minutes. Serve receive and third-ball attack.',
      signal: '+45 min',
    });
  }

  function invite(name) {
    setPendingChallenges((items) => ({ ...items, [name]: true }));
    const opponent = opponents.find((item) => item.name === name);
    if (opponent) {
      setSelectedOpponent(opponent);
    }
    prependFeed({
      player: 'You',
      event: `challenged ${name}`,
      detail: 'Best-of-five request sent with verified scorekeeping.',
      signal: 'Pending',
    });
    showToast(`Match requested with ${name}.`);
  }

  function addPoint(side) {
    setScore((current) => ({ ...current, [side]: current[side] + 1 }));
  }

  function claimSet(side) {
    setSets((current) => ({ ...current, [side]: current[side] + 1 }));
    setScore({ you: 0, them: 0 });
  }

  function resetScore() {
    setScore({ you: 0, them: 0 });
    setSets({ you: 0, them: 0 });
  }

  function saveMatch(result) {
    const won = result === 'win';
    const delta = won ? 18 : -12;
    const savedScore = { ...score };
    const savedSets = { ...sets };
    if (!authToken) {
      setRating((value) => value + delta);
    }
    setWeeklyMinutes((minutes) => minutes + 38);
    setMatches((value) => value + 1);
    prependFeed({
      player: 'You',
      event: won ? `beat ${selectedOpponent.name}` : `lost to ${selectedOpponent.name}`,
      detail: `${savedSets.you}-${savedSets.them} sets, final game ${savedScore.you}-${savedScore.them}`,
      signal: authToken ? 'Pending' : `${delta > 0 ? '+' : ''}${delta} PPR`,
    });
    setMatchReview({
      opponentName: selectedOpponent.name,
      result,
      delta,
      sets: savedSets,
      score: savedScore,
    });
    setReviewFeeling(won ? 'Confident' : 'Frustrated');
    setReviewFeedback('');
    setOpponentNoteDraft(opponentNotes[selectedOpponent.name]?.note || '');
    resetScore();
  }

  function selectOpponent(opponent) {
    setSelectedOpponent(opponent);
  }

  async function submitReview() {
    if (!matchReview) {
      return;
    }
    const previous = opponentNotes[matchReview.opponentName] || {};
    const note = opponentNoteDraft.trim() || previous.note || '';
    const feedback = reviewFeedback.trim();
    setOpponentNotes((items) => ({
      ...items,
      [matchReview.opponentName]: {
        feeling: reviewFeeling,
        feedback,
        note,
        updatedAt: 'Today',
      },
    }));
    prependFeed({
      player: 'You',
      event: `reviewed ${matchReview.opponentName}`,
      detail: `${reviewFeeling}. ${feedback || 'Opponent notes saved for the next rematch.'}`,
      signal: 'Review',
    });

    if (authToken) {
      try {
        const data = await apiRequest('/matches', {
          method: 'POST',
          body: {
            opponentName: matchReview.opponentName,
            result: matchReview.result,
            ratingDelta: matchReview.delta,
            sets: matchReview.sets,
            score: matchReview.score,
            feeling: reviewFeeling,
            feedback,
            note,
          },
        });
        if (data.user) {
          setCurrentUser(data.user);
          setRating(data.user.rating);
        }
        if (data.match?.status === 'pending') {
          showToast('Match saved. Ranking updates after opponent confirmation.');
        } else if (data.match?.status === 'logged') {
          showToast('Match notes saved. Add the opponent as a player to verify ranking.');
        }
      } catch (error) {
        setAuthStatus(`Review saved locally. API sync failed: ${error.message}`);
      }
    }

    setMatchReview(null);
    setReviewFeedback('');
    setOpponentNoteDraft('');
    setActiveTab('Rank');
  }

  function skipReview() {
    setMatchReview(null);
    setReviewFeedback('');
    setOpponentNoteDraft('');
    setActiveTab('Rank');
  }

  function toggleDrill(id) {
    setCompletedDrills((items) => {
      const next = { ...items };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }

  function checkIn() {
    setCheckedIn((items) => ({ ...items, [selectedSpot.name]: (items[selectedSpot.name] || 0) + 1 }));
    prependFeed({
      player: 'You',
      event: `checked in at ${selectedSpot.name}`,
      detail: `${selectedSpot.area}. ${selectedSpot.crowd}.`,
      signal: '+1 visit',
    });
    showToast(`Checked in at ${selectedSpot.name}.`);
  }

  function reserveSlot(slot) {
    setReservedSlots((items) => ({ ...items, [slot.time]: true }));
    prependFeed({
      player: 'You',
      event: `reserved ${slot.label}`,
      detail: `${slot.time} at ${selectedSpot.name}.`,
      signal: 'Booked',
    });
    showToast(`${slot.label} reserved.`);
  }

  function sendMessage() {
    const text = messageDraft.trim();
    if (!text) {
      return;
    }
    setMessages((items) => [
      ...items,
      {
        id: `msg-${Date.now()}`,
        author: currentUser?.name || 'You',
        text,
        mine: true,
      },
    ]);
    setMessageDraft('');
    showToast('Message sent.');
  }

  function scanRubber() {
    setRubberScanned(true);
    prependFeed({
      player: 'You',
      event: 'saved a rubber wear scan',
      detail: 'Medium wear. Grip reminder unchanged.',
      signal: 'Gear',
    });
  }

  if (!authToken && !localMode) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authStatus={authStatus}
        onSubmit={submitAuth}
        onLocalPreview={startLocalPreview}
      />
    );
  }

  const screen = {
    Today: (
      <TodayScreen
        stats={stats}
        feed={feed}
        goPlay={() => setActiveTab('Play')}
        goClubs={() => setActiveTab('Clubs')}
        goRank={() => setActiveTab('Rank')}
        goGear={() => setActiveTab('Gear')}
        quickTraining={quickTraining}
        challengeMaya={() => invite('Maya Chen')}
        mayaPending={Boolean(pendingChallenges['Maya Chen'])}
      />
    ),
    Play: (
      <PlayScreen
        score={score}
        sets={sets}
        selectedOpponent={selectedOpponent}
        opponentNotes={opponentNotes}
        matchReview={matchReview}
        reviewFeeling={reviewFeeling}
        reviewFeedback={reviewFeedback}
        opponentNoteDraft={opponentNoteDraft}
        completedDrills={completedDrills}
        pendingChallenges={pendingChallenges}
        addPoint={addPoint}
        resetScore={resetScore}
        claimSet={claimSet}
        saveMatch={saveMatch}
        invite={invite}
        selectOpponent={selectOpponent}
        setReviewFeeling={setReviewFeeling}
        setReviewFeedback={setReviewFeedback}
        setOpponentNoteDraft={setOpponentNoteDraft}
        submitReview={submitReview}
        skipReview={skipReview}
        toggleDrill={toggleDrill}
      />
    ),
    Clubs: (
      <ClubsScreen
        tables={tableData}
        selectedSpot={selectedSpot}
        setSelectedSpot={setSelectedSpot}
        checkedIn={checkedIn}
        checkIn={checkIn}
        reservedSlots={reservedSlots}
        reserveSlot={reserveSlot}
      />
    ),
    Rank: (
      <RankScreen
        rating={rating}
        matches={matches}
        pendingChallenges={pendingChallenges}
        challengeMaya={() => invite('Maya Chen')}
      />
    ),
    Gear: <GearScreen rubberScanned={rubberScanned} scanRubber={scanRubber} />,
  }[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        <BrandBar
          rating={rating}
          pendingCount={pendingCount}
          userName={currentUser?.name}
          localMode={localMode}
          messageCount={messages.filter((message) => !message.mine).length}
          onOpenMessages={() => setMessagesOpen(true)}
          onSignOut={signOut}
        />
        <ScrollView
          accessibilityLabel={`${activeTab} screen`}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {screen}
        </ScrollView>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Open ${tab}`}
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tabCode, isActive && styles.tabCodeActive]}>{tab.slice(0, 1)}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>
        <MessageDrawer
          visible={messagesOpen}
          messages={messages}
          draft={messageDraft}
          setDraft={setMessageDraft}
          onClose={() => setMessagesOpen(false)}
          onSend={sendMessage}
        />
        <Toast message={toastMessage || authStatus} />
      </View>
    </SafeAreaView>
  );
}

const colors = {
  ink: '#0c1010',
  paper: '#ebe9e2',
  card: '#f2f0ea',
  white: '#ffffff',
  forest: '#073a31',
  forest2: '#0b4a3f',
  mint: '#8da19a',
  line: '#9ca9a3',
  coral: '#e6007e',
  blue: '#31413f',
  amber: '#d9ba69',
  violet: '#0b4a3f',
  court: '#31413f',
};

const shadow = Platform.select({
  web: {
    boxShadow: '0 18px 50px rgba(16, 20, 22, 0.18)',
  },
  default: {
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  shell: {
    alignSelf: 'center',
    backgroundColor: colors.paper,
    flex: 1,
    maxWidth: 760,
    width: '100%',
  },
  brandBar: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  wordmark: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  brandSubline: {
    color: '#d5e6dd',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  headerStats: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  headerRating: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '900',
  },
  headerMeta: {
    color: '#cfe1da',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  messageButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  messageCount: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -2,
    width: 16,
  },
  messageCountText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  content: {
    gap: 18,
    padding: 16,
    paddingBottom: 110,
  },
  authShell: {
    alignSelf: 'center',
    backgroundColor: colors.paper,
    flex: 1,
    maxWidth: 760,
    padding: 16,
    width: '100%',
  },
  authHero: {
    borderColor: colors.forest,
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 360,
    overflow: 'hidden',
    padding: 20,
  },
  authHeroCopy: {
    maxWidth: 430,
  },
  authTitle: {
    color: colors.white,
    fontSize: 43,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 45,
    marginTop: 8,
  },
  authText: {
    color: '#f4f2ed',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 12,
  },
  authPanel: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 4,
    borderWidth: 1,
    gap: 10,
    marginTop: 16,
    padding: 14,
  },
  authToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  authInput: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  authStatus: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  authActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    bottom: 88,
    left: 16,
    maxWidth: 360,
    paddingHorizontal: 14,
    paddingVertical: 13,
    position: 'absolute',
    right: 16,
    zIndex: 80,
  },
  toastText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 70,
  },
  drawerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12,16,16,0.38)',
  },
  messageDrawer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    flex: 1,
    maxWidth: 390,
    width: '88%',
    ...shadow,
  },
  drawerHead: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 74,
    padding: 16,
  },
  drawerTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  closeButtonText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  messageList: {
    gap: 10,
    padding: 16,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9f1ed',
    borderRadius: 14,
    maxWidth: '82%',
    padding: 12,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.forest,
  },
  messageAuthor: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  messageAuthorMine: {
    color: colors.white,
  },
  messageText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 4,
  },
  messageTextMine: {
    color: colors.white,
  },
  messageForm: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  messageInput: {
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 46,
    paddingHorizontal: 14,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 23,
    justifyContent: 'center',
    minWidth: 62,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  miniLabel: {
    color: colors.forest2,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  miniLabelLight: {
    color: '#d8e7e1',
  },
  hero: {
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    height: 540,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 20,
    ...shadow,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 63, 53, 0.24)',
  },
  heroTopline: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroCode: {
    backgroundColor: colors.card,
    borderColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroCopy: {
    maxWidth: 430,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 47,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 49,
  },
  heroText: {
    color: '#f5f2eb',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 14,
  },
  actionStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 10,
  },
  buttonCompact: {
    flex: 0,
    minHeight: 40,
    minWidth: 82,
    paddingHorizontal: 12,
  },
  buttonActive: {
    backgroundColor: colors.forest,
  },
  buttonDisabled: {
    backgroundColor: '#e1ded5',
    borderColor: colors.line,
  },
  buttonText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttonTextActive: {
    color: colors.white,
  },
  mutedText: {
    color: '#8c958f',
  },
  statStrip: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statColumn: {
    borderRightColor: colors.line,
    borderRightWidth: 1,
    flex: 1,
    minHeight: 94,
    padding: 13,
  },
  statValue: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 31,
  },
  statValueAccent: {
    color: colors.coral,
  },
  statLabel: {
    color: colors.forest2,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 7,
    textTransform: 'uppercase',
  },
  streakCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    ...shadow,
  },
  cardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 4,
  },
  xpPill: {
    backgroundColor: '#e9f1ed',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  xpPillText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  ballStreak: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  streakBall: {
    aspectRatio: 1,
    backgroundColor: '#f2f2ee',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
  },
  streakBallDone: {
    backgroundColor: '#f7f0d0',
    borderColor: colors.amber,
  },
  homeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  simpleCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 5,
    minHeight: 116,
    padding: 16,
    ...shadow,
  },
  simpleCardMeta: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '800',
  },
  simpleCardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  simpleCardText: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  coachPanel: {
    alignItems: 'flex-start',
    backgroundColor: colors.forest,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 15,
    padding: 18,
  },
  coachMark: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderColor: colors.white,
    borderRadius: 30,
    borderWidth: 3,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  coachMarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  coachCopy: {
    flex: 1,
  },
  darkCardTitle: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 8,
  },
  darkCardText: {
    color: '#dbe8e2',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 9,
  },
  sectionTitleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitleCopy: {
    flex: 1,
    paddingRight: 12,
  },
  sectionTitle: {
    color: colors.forest,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 31,
    marginTop: 4,
  },
  sectionAction: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  feedStack: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  feedLine: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 86,
    padding: 12,
  },
  feedInitial: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  feedInitialText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  feedBody: {
    flex: 1,
  },
  feedTitle: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
  },
  feedName: {
    fontWeight: '900',
  },
  feedDetail: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  feedSignal: {
    borderColor: colors.line,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  feedSignalText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  editorialPanel: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  panelImage: {
    height: 225,
    width: '100%',
  },
  panelCopy: {
    padding: 16,
  },
  panelTitle: {
    color: colors.forest,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 27,
  },
  panelText: {
    color: colors.court,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 8,
  },
  playHero: {
    backgroundColor: colors.forest,
    borderRadius: 6,
    padding: 18,
  },
  playHeroTitle: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 39,
    marginTop: 10,
  },
  facingPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
  },
  facingLabel: {
    color: '#d8e7e1',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  facingName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  facingRating: {
    color: colors.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  previousNotePanel: {
    backgroundColor: colors.card,
    borderRadius: 6,
    marginTop: 10,
    padding: 12,
  },
  previousNoteLabel: {
    color: colors.forest2,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previousNoteText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 4,
  },
  previousNoteMeta: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 5,
  },
  scoreBoard: {
    backgroundColor: '#0f5146',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 20,
    overflow: 'hidden',
  },
  scoreSide: {
    alignItems: 'center',
    flex: 1,
    minHeight: 190,
    padding: 14,
  },
  scoreName: {
    color: '#d8e7e1',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreNumber: {
    color: colors.white,
    fontSize: 78,
    fontWeight: '900',
    lineHeight: 86,
    marginTop: 4,
  },
  setText: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  scoreDivider: {
    alignItems: 'center',
    borderLeftColor: 'rgba(255,255,255,0.18)',
    borderLeftWidth: 1,
    justifyContent: 'center',
    width: 46,
  },
  scoreVs: {
    color: '#d8e7e1',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 4,
    minHeight: 40,
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  scoreButtonText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  saveStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewPanel: {
    backgroundColor: colors.forest,
    borderRadius: 6,
    gap: 12,
    padding: 16,
  },
  reviewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  reviewTitle: {
    color: colors.white,
    flex: 1,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 29,
    marginTop: 5,
  },
  reviewDelta: {
    backgroundColor: colors.card,
    borderRadius: 4,
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingChip: {
    backgroundColor: '#0f5146',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  feelingChipActive: {
    backgroundColor: colors.card,
  },
  feelingText: {
    color: '#d8e7e1',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  feelingTextActive: {
    color: colors.forest,
  },
  reviewInput: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 6,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 92,
    padding: 12,
    textAlignVertical: 'top',
  },
  opponentNoteInput: {
    minHeight: 76,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  listStack: {
    gap: 10,
  },
  opponentCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 86,
    padding: 12,
  },
  opponentCardSelected: {
    backgroundColor: '#e1f0e6',
  },
  avatarBlock: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  opponentCopy: {
    flex: 1,
  },
  opponentName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  opponentMeta: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  savedOpponentNote: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
    marginTop: 7,
  },
  opponentActions: {
    alignItems: 'flex-end',
    gap: 7,
  },
  matchPercentPill: {
    alignItems: 'center',
    backgroundColor: '#e9f1ed',
    borderRadius: 999,
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  matchPercentText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  planList: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  planRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 72,
    padding: 14,
  },
  planRowDone: {
    backgroundColor: '#e1f0e6',
  },
  planIndex: {
    color: colors.coral,
    fontSize: 18,
    fontWeight: '900',
    width: 36,
  },
  planIndexDone: {
    color: colors.forest,
  },
  planTextWrap: {
    flex: 1,
  },
  planTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  planMeta: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  checkMark: {
    color: '#60736b',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  checkMarkDone: {
    color: colors.forest,
  },
  challengePanel: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    padding: 14,
  },
  challengeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  challengePercent: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: '900',
  },
  challengeTarget: {
    color: '#60736b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  progressTrack: {
    backgroundColor: '#dedbd2',
    borderRadius: 999,
    height: 8,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.blue,
    borderRadius: 999,
    height: 8,
  },
  mapStage: {
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#d8dfd5',
    height: 455,
    overflow: 'hidden',
    position: 'relative',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
    width: '100%',
  },
  mapTile: {
    height: '50%',
    width: '50%',
  },
  mapWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244,241,232,0.12)',
  },
  mapTopBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,250,240,0.92)',
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    padding: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  realMapTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  liveBadge: {
    backgroundColor: colors.forest,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mapPin: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderColor: colors.white,
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    width: 36,
  },
  mapPinActive: {
    backgroundColor: colors.blue,
    transform: [{ scale: 1.18 }],
  },
  mapPinText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  mapAttribution: {
    backgroundColor: 'rgba(255,250,240,0.88)',
    bottom: 8,
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800',
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
  },
  mapCaption: {
    bottom: 18,
    left: 18,
    position: 'absolute',
    right: 18,
  },
  mapTitle: {
    color: colors.white,
    fontSize: 41,
    fontWeight: '900',
    lineHeight: 43,
    marginTop: 8,
  },
  spotPanel: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spotHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  spotTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 4,
  },
  spotAddress: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  spotGrid: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  spotNote: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    color: colors.court,
    fontSize: 14,
    fontWeight: '800',
    padding: 14,
  },
  segmentLine: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    padding: 14,
  },
  segmentLineActive: {
    backgroundColor: '#e1f0e6',
  },
  segmentName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  segmentArea: {
    color: '#60736b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  legendBlock: {
    alignItems: 'flex-end',
  },
  legendLabel: {
    color: '#60736b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  legendName: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  legendVisits: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  bookingPanel: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadow,
  },
  bookingTabs: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  bookingTabActive: {
    borderBottomColor: colors.amber,
    borderBottomWidth: 5,
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    minHeight: 52,
    paddingTop: 17,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bookingTab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 5,
    color: '#757575',
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    minHeight: 52,
    paddingTop: 17,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  dateRow: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  dateChip: {
    color: '#757575',
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  dateChipActive: {
    color: colors.ink,
  },
  filterRow: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    flexDirection: 'row',
    gap: 9,
    padding: 10,
  },
  filterLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 5,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  bookingList: {
    backgroundColor: colors.white,
  },
  bookingRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bookingTime: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    width: 70,
  },
  bookingCopy: {
    flex: 1,
  },
  bookingTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forest,
    borderRadius: 3,
    marginBottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  bookingTagText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bookingLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  bookingInfo: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  reserveButton: {
    alignItems: 'center',
    borderColor: colors.ink,
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  reserveButtonActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  reserveButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  reserveButtonTextActive: {
    color: colors.white,
    fontSize: 10,
  },
  eventCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    padding: 18,
    ...shadow,
  },
  eventTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 4,
  },
  eventMeta: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  clubDuo: {
    flexDirection: 'row',
    gap: 10,
  },
  clubTile: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    minHeight: 138,
    padding: 14,
  },
  clubTileDark: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    minHeight: 138,
    padding: 14,
  },
  clubTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  clubText: {
    color: '#60736b',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 8,
  },
  clubTitleLight: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  clubTextLight: {
    color: '#e8e4ff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 8,
  },
  rankingStage: {
    backgroundColor: colors.forest,
    borderRadius: 6,
    padding: 20,
  },
  rankingNumber: {
    color: colors.white,
    fontSize: 84,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 90,
    marginTop: 8,
  },
  rankingText: {
    color: '#dbe8e2',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 8,
  },
  rankActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  rankTable: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rankRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 70,
    padding: 12,
  },
  rankRowActive: {
    backgroundColor: '#e1f0e6',
  },
  rankIndex: {
    color: colors.coral,
    fontSize: 16,
    fontWeight: '900',
    width: 32,
  },
  rankPlayer: {
    flex: 1,
  },
  rankName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  rankTag: {
    color: '#60736b',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  rankRating: {
    color: colors.forest,
    fontSize: 20,
    fontWeight: '900',
  },
  leagueCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    ...shadow,
  },
  leagueRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
  },
  leagueRank: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  leagueRankText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  leagueName: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  leaguePoints: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '800',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeTile: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    gap: 10,
    minHeight: 64,
    padding: 12,
  },
  badgeGlyph: {
    color: colors.blue,
    fontSize: 20,
    fontWeight: '900',
  },
  badgeText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 24,
    ...shadow,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 38,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  profileAvatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  profileName: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 35,
    marginTop: 14,
    textAlign: 'center',
  },
  profileMeta: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  profileCounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  profileCount: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  profileCountValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  profileCountLabel: {
    color: '#757575',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  performancePost: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    ...shadow,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  metricTile: {
    backgroundColor: '#e9f1ed',
    borderRadius: 12,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 78,
    padding: 14,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  gearStage: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 18,
    padding: 20,
  },
  racketArt: {
    alignItems: 'center',
    height: 190,
    justifyContent: 'center',
    width: 120,
  },
  racketFace: {
    backgroundColor: colors.coral,
    borderColor: colors.white,
    borderRadius: 56,
    borderWidth: 5,
    height: 112,
    width: 112,
  },
  racketHandle: {
    backgroundColor: colors.amber,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 76,
    marginTop: -5,
    width: 28,
  },
  gearCopy: {
    flex: 1,
  },
  gearTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    marginTop: 8,
  },
  gearText: {
    color: '#dbe8e2',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: 10,
  },
  gearSignals: {
    flexDirection: 'row',
    gap: 10,
  },
  gearSignal: {
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    minHeight: 96,
    padding: 12,
  },
  gearSignalLabel: {
    color: '#60736b',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  gearSignalValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 14,
  },
  tone_coral: {
    color: colors.coral,
  },
  tone_green: {
    color: colors.forest,
  },
  tone_amber: {
    color: '#946410',
  },
  scanPanel: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  scanPanelActive: {
    backgroundColor: '#e1f0e6',
  },
  scanFrame: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 5,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  scanLens: {
    backgroundColor: colors.coral,
    borderColor: colors.white,
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    width: 36,
  },
  scanLensActive: {
    backgroundColor: colors.blue,
  },
  scanTextWrap: {
    flex: 1,
  },
  scanTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  scanText: {
    color: '#60736b',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 5,
  },
  integrationGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  integrationTile: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.forest,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
    padding: 10,
  },
  integrationInitial: {
    color: colors.blue,
    fontSize: 24,
    fontWeight: '900',
  },
  integrationName: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tabBar: {
    alignSelf: 'center',
    backgroundColor: colors.forest,
    borderColor: colors.card,
    borderRadius: 6,
    borderWidth: 1,
    bottom: 16,
    flexDirection: 'row',
    gap: 3,
    left: 16,
    maxWidth: 720,
    padding: 5,
    position: 'absolute',
    right: 16,
    ...shadow,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 4,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
  },
  tabButtonActive: {
    backgroundColor: colors.card,
  },
  tabCode: {
    color: '#c9d8d2',
    fontSize: 14,
    fontWeight: '900',
  },
  tabCodeActive: {
    color: colors.coral,
  },
  tabLabel: {
    color: '#c9d8d2',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.forest,
  },
  pressed: {
    opacity: 0.76,
  },
});
