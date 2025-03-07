import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Alert,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import EventCard from "./EventCard";
import { Event } from "@/types/event";
import { router } from "expo-router";
import { getAllRelevantEvents } from "@/services/eventService";
import { useSelector } from "react-redux";
import { calculateDistanceBetweenEventAndUserLocation } from "@/services/locationService";

const EventsList = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const Location = useSelector((state: { location: any }) => state.location);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getAllRelevantEvents(Location.longitude, Location.latitude, 25, true, false, 0, 10);
      const measuredEvents = eventsData.map((event:Event) => {
        return {
          ...event,
          far: calculateDistanceBetweenEventAndUserLocation(event, Location)
        }})
      setEvents(measuredEvents);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    }, [Location]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={handleEventPress}
            isForProfile={false}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default EventsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
