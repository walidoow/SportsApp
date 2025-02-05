import React, { useRef } from 'react';
import { FlatList, View, StyleSheet, Alert, Animated, RefreshControl, Text} from 'react-native';
import EventCard from './EventCard';
import { Event } from '@/types/event';
import { router } from 'expo-router';

// FIXME Sample event data until we can fetch from an API
const events: Event[] = [
  {
    id: '67806df20ba257b189946ff25',
    eventName: 'Victory Sprint',
    eventType: 'Private',
    sportType: 'Football',
    locationResponse: {
      name: 'Central Park',
      streetNumber: '59',
      streetName: 'Central Park W',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      postalCode: '10023',
      phoneNumber: '212-310-6600',
      latitude: '40.785091',
      longitude: '-73.968285',
    },
    date: '2023-06-15',
    maxParticipants: 50,
    participants: [],
    createdBy: 'user123',
    teams: [],
    cutOffTime: '2023-06-14T22:00:00',
    description: 'Join us for a thrilling sprint event in Central Park. A challenge for both beginners and intermediate runners.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  },
  {
    id: '67806f20ba257b1899v46ff25',
    eventName: 'Lovely Sprint',
    eventType: 'Private',
    sportType: 'Basketball',
    locationResponse: {
      name: 'Central Park',
      streetNumber: '59',
      streetName: 'Central Park W',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      postalCode: '10023',
      phoneNumber: '212-310-6600',
      latitude: '40.785091',
      longitude: '-73.968285',
    },
    date: '2025-06-15',
    maxParticipants: 50,
    participants: [],
    createdBy: 'user123',
    teams: [],
    cutOffTime: '2025-06-14T22:00:00',
    description: 'Join us for a thrilling sprint event in Central Park. A challenge for both beginners and intermediate runners.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  },
  {
    id: '6780s6f20ba257b189946ff25',
    eventName: '1v1 For Money',
    eventType: 'Public',
    sportType: 'Baseball',
    locationResponse: {
      name: 'Central Park',
      streetNumber: '59',
      streetName: 'Central Park W',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      postalCode: '10023',
      phoneNumber: '212-310-6600',
      latitude: '40.785091',
      longitude: '-73.968285',
    },
    date: '2025-06-15',
    maxParticipants: 50,
    participants: [],
    createdBy: 'user123',
    teams: [],
    cutOffTime: '2025-06-13T22:00:00',
    description: 'Join us for a thrilling sprint event in Central Park. A challenge for both beginners and intermediate runners.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  },
  {
    id: '67806f20ba257b189946aff25',
    eventName: 'Victory Sprint',
    eventType: 'Private',
    sportType: 'Hockey',
    locationResponse: {
      name: 'Central Park',
      streetNumber: '59',
      streetName: 'Central Park W',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      postalCode: '10023',
      phoneNumber: '212-310-6600',
      latitude: '40.785091',
      longitude: '-73.968285',
    },
    date: '2024-01-16',
    maxParticipants: 50,
    participants: [],
    createdBy: 'user123',
    teams: [],
    cutOffTime: '2024-1-15T22:00:00',
    description: 'Join us for a thrilling sprint event in Central Park. A challenge for both beginners and intermediate runners.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  },
  {
    id: '67806f20ba257b189946ff25',
    eventName: 'Victory Sprint',
    eventType: 'Public',
    sportType: 'Soccer',
    locationResponse: {
      name: 'Central Park',
      streetNumber: '59',
      streetName: 'Central Park W',
      city: 'New York',
      province: 'NY',
      country: 'USA',
      postalCode: '10023',
      phoneNumber: '212-310-6600',
      latitude: '40.785091',
      longitude: '-73.968285',
    },
    date: '2022-01-14',
    maxParticipants: 50,
    participants: [],
    createdBy: 'user123',
    teams: [],
    cutOffTime: '2022-1-15T22:00:00',
    description: 'Join us for a thrilling sprint event in Central Park. A challenge for both beginners and intermediate runners.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
  },
  {
    id: '67806f20ba257b189946ff23',
    eventName: 'Final Push',
    eventType: 'Public',
    sportType: 'Golf',
    locationResponse: {
      name: 'Cycling Arena',
      streetNumber: '25',
      streetName: 'Cycle Lane',
      city: 'Austin',
      province: 'TX',
      country: 'USA',
      postalCode: '73301',
      phoneNumber: '512-555-1234',
      latitude: '30.267153',
      longitude: '-97.743057',
    },
    date: '2025-07-20',
    maxParticipants: 30,
    participants: [],
    createdBy: 'user456',
    teams: [],
    cutOffTime: '2025-2-11T01:28:00',
    description: 'An exciting cycling event for beginners and advanced participants. Push yourself to the limit!',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER', 'ADVANCED'],
  },
  {
    id: '67806f20bda257b189946ff23',
    eventName: 'Fast Break',
    eventType: 'Private',
    sportType: 'Tennis',
    locationResponse: {
      name: 'Downtown Court',
      streetNumber: '300',
      streetName: 'Main St',
      city: 'Chicago',
      province: 'IL',
      country: 'USA',
      postalCode: '60601',
      phoneNumber: '312-555-5678',
      latitude: '41.878113',
      longitude: '-87.629799',
    },
    date: '2022-08-05',
    maxParticipants: 20,
    participants: [],
    createdBy: 'user789',
    teams: [],
    cutOffTime: '2022-08-04T19:30:00',
    description: 'Experience the thrill of a fast-paced basketball match in the heart of Chicago. For advanced players only.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['ADVANCED'],
  },
  {
    id: '67806f20ba257b1899er6ff23',
    eventName: 'Joud Event',
    eventType: 'Private',
    sportType: 'Hiking',
    locationResponse: {
      name: 'Soccer Field',
      streetNumber: '15',
      streetName: 'Elm St',
      city: 'Los Angeles',
      province: 'CA',
      country: 'USA',
      postalCode: '90001',
      phoneNumber: '323-555-8765',
      latitude: '34.052235',
      longitude: '-118.243683',
    },
    date: '2024-09-10',
    maxParticipants: 25,
    participants: [],
    createdBy: 'user321',
    teams: [],
    cutOffTime: '2024-09-009T19:30:00',
    description: 'A friendly soccer match open to beginners. Have fun and improve your skills on the field!',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['BEGINNER'],
  },
  {
    id: '67806f20bda257b18f9946ff23',
    eventName: 'Fast Break',
    eventType: 'Public',
    sportType: 'Boxing',
    locationResponse: {
      name: 'Downtown Court',
      streetNumber: '300',
      streetName: 'Main St',
      city: 'Chicago',
      province: 'IL',
      country: 'USA',
      postalCode: '60601',
      phoneNumber: '312-555-5678',
      latitude: '41.878113',
      longitude: '-87.629799',
    },
    date: '2021-08-05',
    maxParticipants: 20,
    participants: [],
    createdBy: 'user789',
    teams: [],
    cutOffTime: '2021-7-025T19:30:00',
    description: 'Experience the thrill of a fast-paced basketball match in the heart of Chicago. For advanced players only.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['ADVANCED'],
  },
  {
    id: '67806f20bdda257b18f9946ff23',
    eventName: 'Fast Break',
    eventType: 'Public',
    sportType: 'Cycling',
    locationResponse: {
      name: 'Downtown Court',
      streetNumber: '300',
      streetName: 'Main St',
      city: 'Chicago',
      province: 'IL',
      country: 'USA',
      postalCode: '60601',
      phoneNumber: '312-555-5678',
      latitude: '41.878113',
      longitude: '-87.629799',
    },
    date: '2025-08-05',
    maxParticipants: 20,
    participants: [],
    createdBy: 'user789',
    teams: [],
    cutOffTime: '2025-1-025T19:30:00',
    description: 'Experience the thrill of a fast-paced basketball match in the heart of Chicago. For advanced players only.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['ADVANCED'],
  },
  {
    id: '67806f20bda257b18f9g946ff23',
    eventName: 'Fast Break',
    eventType: 'Public',
    sportType: 'Rugby',
    locationResponse: {
      name: 'Downtown Court',
      streetNumber: '300',
      streetName: 'Main St',
      city: 'Chicago',
      province: 'IL',
      country: 'USA',
      postalCode: '60601',
      phoneNumber: '312-555-5678',
      latitude: '41.878113',
      longitude: '-87.629799',
    },
    date: '2025-08-05',
    maxParticipants: 20,
    participants: [],
    createdBy: 'user789',
    teams: [],
    cutOffTime: '2025-4-025T19:30:00',
    description: 'Experience the thrill of a fast-paced basketball match in the heart of Chicago. For advanced players only.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['ADVANCED'],
  },
  {
    id: '67806fs20bda257b18f9946ff23',
    eventName: 'Fast Break',
    eventType: 'Public',
    sportType: 'Ping-Pong',
    locationResponse: {
      name: 'Downtown Court',
      streetNumber: '300',
      streetName: 'Main St',
      city: 'Chicago',
      province: 'IL',
      country: 'USA',
      postalCode: '60601',
      phoneNumber: '312-555-5678',
      latitude: '41.878113',
      longitude: '-87.629799',
    },
    date: '2025-08-05',
    maxParticipants: 20,
    participants: [],
    createdBy: 'user789',
    teams: [],
    cutOffTime: '2025-5-025T19:30:00',
    description: 'Experience the thrill of a fast-paced basketball match in the heart of Chicago. For advanced players only.',
    isPrivate: false,
    whitelistedUsers: [],
    requiredSkillLevel: ['ADVANCED'],
  }
];


const EventsList = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  const handleEventPress = (eventId: string) => {
    // FIXME should reroute to the event page once finished
    eventId = "6782edf7ba257b189946ff27";
    router.push(`/events/${eventId}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // FIXME Here we will simulate a network request once the endpoint is ready
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };
  
  return (
    <View>
       <View style={styles.container}>
      
        {/* TODO Animated.FlatList is a wrapper around FlatList incase i want to add animation to the scroll */}
        <FlatList
            data={events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <EventCard event={item} onPress={handleEventPress} isForProfile={true}/>
            )}
            // Adding pull-to-refresh functionality
            refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
        />
        <View>
            <Text> hi </Text> 
        </View> 
    </View>
    
    </View>
    
    
  );
};

export default EventsList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
});
