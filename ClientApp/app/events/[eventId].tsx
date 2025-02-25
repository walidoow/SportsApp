import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Pressable, SafeAreaView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Event } from "@/types/event";
import ConfirmButton from "@/components/Helper Components/ConfirmButton";
import themeColors from "@/utils/constants/colors";
import { mhs, mvs } from "@/utils/helpers/uiScaler";
import { sportIconMap } from "@/utils/mappers/eventIconsMappers";
import { getEventById, joinEvent } from "@/utils/api/eventApiClient";
import SkillTag from "@/components/Event/SkillTag";
import CustomTabMenu from "@/components/Helper Components/CustomTabMenu";
import EventLocationMap from "@/components/Helper Components/EventLocationMap";

const EventPosts = () => {
  return (
    <View>
      <Text>Event Posts</Text>
    </View>
  );
}

const EventDetails = ({ event, handleJoinEvent }: { event: Event; handleJoinEvent: () => void }) => {
  const router = useRouter();
  const user = useSelector((state: { user: any }) => state.user);
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  // const [event, setEvent] = useState<Event | null>(null);
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Event Details */}
      {/* <View style={styles.details}>
        <Text style={styles.detailText}>
          📍 {event.locationResponse?.streetNumber} {event.locationResponse?.streetName}, {event.locationResponse.city}, {event.locationResponse.province}
        </Text>
        <Text style={styles.detailText}>
          📅 {new Date(event.date).toDateString()}
        </Text>
        <Text style={styles.detailText}>
          {event.isPrivate ? "🔒 Private Event" : "🌐 Public Event"}
        </Text> */}
        {/* Skill Tags */}
        {/* <View style={styles.skillTags}>
          {event.requiredSkillLevel.map((level, index) => (
            <SkillTag key={index} level={level} />
          ))}
        </View> */}
      {/* </View> */}

      {/* Event Location Map */}
      {event.locationResponse?.latitude && event.locationResponse?.longitude && (
        <View style={styles.section}>
          <EventLocationMap 
            latitude={parseFloat(event.locationResponse.latitude)} 
            longitude={parseFloat(event.locationResponse.longitude)} 
          />
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>
          {event.description || "No description provided for this event."}
        </Text>
      </View>

      {/* Participants */}
      <View style={styles.section}>
        <View style={styles.participantsHeader}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <Text style={styles.participantsCount}>
            {event.participants.filter((p) => p.attendStatus === "JOINED" || p.attendStatus === "CONFIRMED").length}/
            {event.maxParticipants}
          </Text>
        </View>
        <View style={styles.participantsContainer}>
          {event.participants.filter((p) => p.attendStatus === "JOINED" || p.attendStatus === "CONFIRMED").length >
            0 ? (
            event.participants
              .filter((p) => p.attendStatus === "JOINED" || p.attendStatus === "CONFIRMED")
              .map((participant) => (
                <Pressable
                  key={participant.userId}
                  onPress={() => {
                    if (participant.userId !== user.id) {
                      router.push({
                        pathname: `/userProfiles/[id]`,
                        params: { id: participant.userId },
                      });
                    }
                  }}
                >
                  <View style={styles.participant}>
                    <Image
                      source={require("@/assets/images/avatar-placeholder.png")}
                      style={[styles.participantAvatar, participant.userId === user.id && styles.currentUserBorder]}
                      testID="participant-avatar"
                    />
                    {participant.userId === user.id && (
                      <Text style={styles.currentUserText}>You</Text>
                    )}
                  </View>
                </Pressable>
              ))
          ) : (
            <Text style={styles.noParticipantsText}>
              No participants yet. Be the first to join!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const EventPage: React.FC = () => {
  const user = useSelector((state: { user: any }) => state.user);
  const [event, setEvent] = useState<Event | null>(null);
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(eventId!);
        setEvent(eventData);
      } catch (err) {
        setError("Failed to fetch event details.");
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEventDetails();
  }, [eventId]);

  const handleJoinEvent = async () => {
    try {
      await joinEvent(eventId!, user.id);
      setEvent((prevEvent) => {
        if (!prevEvent) return prevEvent;
        return {
          ...prevEvent,
          participants: [
            ...prevEvent.participants,
            { userId: user.id, attendStatus: "JOINED" },
          ],
        };
      });
    } catch (err) {
      setError("Failed to join the event.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  const isUserParticipant = event.participants.some(
    (participant) => participant.userId === user.id
  );

  let sportIcon = sportIconMap[event.sportType];

  const routes = [
    { key: "eventDetails", title: "Details", testID: "eventDetails" },
    { key: "eventPosts", title: "Posts", testID: "eventPosts" },
  ];
  
  const scenes = {
    eventDetails: <EventDetails event={event} handleJoinEvent={handleJoinEvent} />,
    eventPosts: <EventPosts />,
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-6">
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={event.sportType ? sportIcon as any : "help-circle-outline"}
          size={50}
          color="#94504b"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.eventName}>{event.eventName}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>
              📅 {new Date(event.date).toDateString()}
            </Text>
            <Text style={styles.detailText}>
              {event.isPrivate ? "🔒 Private Event" : "🌐 Public Event"}
            </Text>
            <View style={styles.skillTags}>
              {event.requiredSkillLevel.map((level, index) => (
                <SkillTag key={index} level={level} />
              ))}
            </View>
          </View>
          <View style={styles.jointButton}>
            {!isUserParticipant && (
              <ConfirmButton text="Join Event" onPress={handleJoinEvent} icon={undefined} iconPlacement={null} />
            )}
          </View>
        </View>
      </View>

      <CustomTabMenu routes={routes} scenes={scenes} backgroundColor={"#fff"} />
    </SafeAreaView>
  );
};

export default EventPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: mhs(15),
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: mhs(20),
  },
  errorText: {
    fontSize: mvs(16),
    color: "red",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: mvs(5),
    backgroundColor: "#ffffff",
    padding: mhs(15),
    borderRadius: mhs(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventName: {
    fontSize: mvs(20),
    fontWeight: "bold",
    marginLeft: mhs(15),
    color: "#333",
  },
  details: {
    marginBottom: mvs(15),
    backgroundColor: "#ffffff",
    padding: mhs(15),
    borderRadius: mhs(10),
  },
  detailText: {
    fontSize: mvs(14),
    color: "#555",
    marginBottom: mvs(5),
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: mvs(5),
  },
  section: {
    marginVertical: mvs(10),
    backgroundColor: "#ffffff",
    padding: mhs(15),
    borderRadius: mhs(10),
  },
  sectionTitle: {
    fontSize: mvs(16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: mvs(5),
  },
  sectionText: {
    fontSize: mvs(14),
    color: "#555",
  },
  participantsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: mvs(8),
  },
  participantsCount: {
    fontSize: mvs(16),
    color: "#777",
  },
  participantsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  participant: {
    alignItems: "center",
    marginRight: mhs(16),
  },
  participantAvatar: {
    width: mhs(45),
    height: mvs(45),
    borderRadius: mhs(30),
  },
  currentUserBorder: {
    borderWidth: mhs(3),
    borderRadius: mhs(30),
    borderColor: themeColors.primary,
  },
  currentUserText: {
    fontSize: mvs(12),
    marginTop: mvs(5),
    textAlign: "center",
  },
  noParticipantsText: {
    fontSize: mvs(13),
    color: "#777",
    textAlign: "center",
    marginVertical: mvs(16),
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: mhs(10),
  },
  jointButton: {
    marginRight: mhs(60),
  },
});
