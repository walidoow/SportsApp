import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Event } from "@/types/event";
import SkillTag from "../Event/SkillTag";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// all the show props are optional and default to true to modularize the component
interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  showSkillTags?: boolean;
  showCapacity?: boolean;
  showDescription?: boolean;
  showDetailPreview?: boolean;
  showDate?: boolean;
  showLocation?: boolean;
  showSportType?: boolean;
  showTimeLeft?: boolean;
  isForProfile?: boolean;
}

export const stringToDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return new Date(+year, +month - 1, +day);
};
const CalendarEventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  isForProfile = false,
  showDescription = isForProfile ? false : true,
  showLocation = isForProfile ? false : true,
  showSportType = true,
}) => {
  // Sport Icon Mapping (type-safe)
  const sportIcons: {
    [key: string]: keyof typeof MaterialCommunityIcons.glyphMap;
  } = {
    Football: "soccer",
    Basketball: "basketball",
    Baseball: "baseball",
    Hockey: "hockey-puck",
    Soccer: "soccer",
    Golf: "golf",
    Tennis: "tennis",
    Hiking: "hiking",
    Boxing: "boxing-glove",
    Cycling: "bike",
    Rugby: "rugby",
    Running: "run",
    "Ping-Pong": "table-tennis",
  };

  const currentTime = new Date();
  const cutoffTime = new Date(event.cutOffTime);
  let hoursLeft = 0;
  let minutesLeft = 0;

  // Ensure both currentTime and cutoffTime are valid
  let timeLeftShown = "";
  let eventStarted = false;
  let canJoin = true;

  if (!isNaN(cutoffTime.getTime())) {
    const timeLeft = cutoffTime.getTime() - currentTime.getTime();
    if (timeLeft > 1) {
      // Calculate remaining time in minutes, hours, and days
      minutesLeft = Math.floor(timeLeft / (1000 * 60));
      hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const weeksLeft = Math.floor(daysLeft / 7);

      if (minutesLeft < 60) {
        timeLeftShown = `${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}`;
      } else if (hoursLeft < 24) {
        timeLeftShown = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
      } else if (daysLeft < 7) {
        timeLeftShown = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
      } else {
        timeLeftShown = `${weeksLeft} week${weeksLeft > 1 ? "s" : ""}`;
      }
    } else {
      eventStarted = true;
      canJoin = false;
    }
  } else {
    eventStarted = true;
    canJoin = false;
  }

  // Dynamic styling for the card
  const dynamicCardStyle = {
    backgroundColor: eventStarted && isForProfile ? "#B9B9B9" : "#ffffff", // Light red for expired, white for active
    borderColor: canJoin ? "#f5c2c7" : "#cccccc", // Red border for expired, grey for active
    padding: isForProfile ? 7 : 15,
  };

  return (
    <TouchableOpacity
      testID="event-card"
      style={[styles.card, dynamicCardStyle]}
      onPress={() => onPress(event.id)}
    >
      <Text style={styles.eventName}>{event.eventName}</Text>

      {showSportType && (
        <View style={styles.sportIconContainer}>
          <MaterialCommunityIcons
            name={sportIcons[event.sportType] || "help-circle-outline"}
            size={40}
            color="#94504b"
          />
        </View>
      )}

      {showLocation && (
        <Text style={styles.location}>
          📍 {event.locationResponse.city}, {event.locationResponse.province}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CalendarEventCard;

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    width: "98%",
    justifyContent:"center"
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  skillLevelContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  eventDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  sportIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  description: {
    fontSize: 13,
    color: "#777",
    marginBottom: 5,
  },
  capacity: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
    fontWeight: "bold",
    position: "absolute",
    bottom: 15,
    right: 15,
  },
  timeLeft: {
    marginTop: 10,
    fontSize: 14,
    color: "#0C9E04",
  },
});
