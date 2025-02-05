package app.sportahub.eventservice.service.event;

import app.sportahub.eventservice.dto.request.*;
import app.sportahub.eventservice.dto.response.EventResponse;
import app.sportahub.eventservice.enums.SkillLevelEnum;
import app.sportahub.eventservice.exception.event.*;
import app.sportahub.eventservice.mapper.event.EventMapper;
import app.sportahub.eventservice.model.event.Event;
import app.sportahub.eventservice.model.event.participant.Participant;
import app.sportahub.eventservice.model.event.participant.ParticipantAttendStatus;
import app.sportahub.eventservice.repository.EventRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    private final EventMapper eventMapper = Mappers.getMapper(EventMapper.class);

    @InjectMocks
    private EventServiceImpl eventService;

    @BeforeEach
    void setUp() {
        eventService = new EventServiceImpl(eventRepository, eventMapper);
    }

    private EventRequest getEventRequest() {
        LocationRequest locationRequest = new LocationRequest(
                "testLocationName",
                "1",
                "testStreetName",
                "testCity",
                "testProvince",
                "testCountry",
                "A1B 2C3",
                "testLine2",
                "555-555-5555",
                "2",
                "3");

        ParticipantRequest participantRequest = new ParticipantRequest(
                "validUserId",
                ParticipantAttendStatus.JOINED, LocalDate.of(2024, 1, 1)
        );

        TeamRequest teamRequest = new TeamRequest(
                "validTeamId"
        );

        List<ParticipantRequest> participantRequests = new ArrayList<>();
        participantRequests.add(participantRequest);

        List<TeamRequest> teamRequests = new ArrayList<>();
        teamRequests.add(teamRequest);

        List<String> whiteListedUsers = new ArrayList<>();
        whiteListedUsers.add("whiteListedUser1");

        return new EventRequest(
                "testEventName",
                "testEventType",
                "testSportType",
                locationRequest,
                LocalDate.of(2024, 1, 1),
                LocalTime.of(10,55),
                LocalTime.of(18, 55),
                "testDuration",
                32,
                participantRequests,
                "testID",
                teamRequests,
                "testCutOffTime",
                "testDescription",
                false,
                whiteListedUsers,
                EnumSet.allOf(SkillLevelEnum.class)
        );
    }

    @Test
    public void createEventShouldReturnSuccessfulCreation() {
        // Arrange
        EventRequest eventRequest = getEventRequest();

        when(eventRepository.findEventByEventName(eventRequest.eventName())).thenReturn(Optional.empty());

        Event createdEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId("123")
                .withCreationDate(Timestamp.valueOf(LocalDateTime.now()))
                .withUpdatedAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();

        when(eventRepository.save(any(Event.class))).thenReturn(createdEvent);

        // Act
        EventResponse result = eventService.createEvent(eventRequest);

        // Assert
        assertNotNull(result);
        assertEquals("123", result.id());
        assertEquals(eventRequest.eventName(), result.eventName());
        assertEquals(eventRequest.sportType(), result.sportType());
        assertEquals(eventRequest.location().name(), result.locationResponse().name());
        assertEquals(eventRequest.location().city(), result.locationResponse().city());
        assertEquals(eventRequest.location().province(), result.locationResponse().province());
        assertEquals(eventRequest.location().country(), result.locationResponse().country());
        assertEquals(eventRequest.date(), result.date());
        assertEquals(eventRequest.maxParticipants(), result.maxParticipants());
        assert eventRequest.participants() != null;
        assertEquals(eventRequest.participants().getFirst().userId(), result.participants().getFirst().userId());
        assertEquals(eventRequest.createdBy(), result.createdBy());
        assert eventRequest.teams() != null;
        assertEquals(eventRequest.teams().getFirst().teamId(), result.teams().getFirst().getTeamId());
        assertEquals(eventRequest.cutOffTime(), result.cutOffTime());
        assertEquals(eventRequest.description(), result.description());
        assertEquals(eventRequest.isPrivate(), result.isPrivate());
        assert eventRequest.whitelistedUsers() != null;
        assertEquals(eventRequest.whitelistedUsers().getFirst(), result.whitelistedUsers().getFirst());
        assertEquals(eventRequest.requiredSkillLevel(), result.requiredSkillLevel());

        verify(eventRepository, times(1)).findEventByEventName(eventRequest.eventName());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    public void createEventShouldThrowEventAlreadyExistsException() {
        // Arrange
        EventRequest eventRequest = getEventRequest();
        Event existingEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withEventName(eventRequest.eventName())
                .build();

        // Mock
        when(eventRepository.findEventByEventName(eventRequest.eventName())).thenReturn(Optional.of(existingEvent));

        // Act & Assert
        EventAlreadyExistsException exception = assertThrows(
                EventAlreadyExistsException.class, () -> eventService.createEvent(eventRequest)
        );

        assertEquals(
                "409 CONFLICT \"Event with this name: testEventName already exists.\"", exception.getMessage());

        // Verify interactions
        verify(eventRepository, times(1)).findEventByEventName(eventRequest.eventName());
        verify(eventRepository, never()).findEventById(anyString());
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    public void getEventByIdShouldReturnEvent() {
        String testId = "123";
        EventRequest eventRequest = getEventRequest();
        Optional<Event> expectedEvent = Optional.of(eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .build());

        when(eventRepository.findEventById(anyString())).thenReturn(expectedEvent);

        EventResponse result = eventService.getEventById(testId);

        assertNotNull(result);
        assertEquals(testId, result.id());
        assertEquals(eventRequest.eventName(), result.eventName());
        assertEquals(eventRequest.sportType(), result.sportType());
        assertEquals(eventRequest.location().name(), result.locationResponse().name());
        assertEquals(eventRequest.location().city(), result.locationResponse().city());
        assertEquals(eventRequest.location().province(), result.locationResponse().province());
        assertEquals(eventRequest.location().country(), result.locationResponse().country());
        assertEquals(eventRequest.date(), result.date());
        assertEquals(eventRequest.maxParticipants(), result.maxParticipants());
        assert eventRequest.participants() != null;
        assertEquals(eventRequest.participants().getFirst().userId(), result.participants().getFirst().userId());
        assertEquals(eventRequest.createdBy(), result.createdBy());
        assert eventRequest.teams() != null;
        assertEquals(eventRequest.teams().getFirst().teamId(), result.teams().getFirst().getTeamId());
        assertEquals(eventRequest.cutOffTime(), result.cutOffTime());
        assertEquals(eventRequest.description(), result.description());
        assertEquals(eventRequest.isPrivate(), result.isPrivate());
        assert eventRequest.whitelistedUsers() != null;
        assertEquals(eventRequest.whitelistedUsers().getFirst(), result.whitelistedUsers().getFirst());
        assertEquals(eventRequest.requiredSkillLevel(), result.requiredSkillLevel());

        verify(eventRepository, times(1)).findEventById(testId);
    }

    @Test
    public void getEventByIdShouldThrowEventDoesNotExistException() {
        String testId = new ObjectId().toHexString();

        EventDoesNotExistException exception = assertThrows(
                EventDoesNotExistException.class,
                () -> eventService.getEventById(testId)
        );

        assertEquals(
                "404 NOT_FOUND \"Event with id: " + testId + " does not exist.\"", exception.getMessage()
        );
    }

    @Test
    public void updateEventShouldReturnUpdatedEvent() {
        String testId = "123";
        EventRequest eventRequest = getEventRequest();

        Event existingEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .build();

        Event updatedEvent = existingEvent.toBuilder()
                .withUpdatedAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();

        when(eventRepository.findById(testId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(updatedEvent);

        EventResponse result = eventService.updateEvent(testId, eventRequest);

        assertNotNull(result);
        assertEquals(testId, result.id());
        assertEquals(eventRequest.eventName(), result.eventName());
        assertEquals(eventRequest.sportType(), result.sportType());
        assertEquals(eventRequest.location().name(), result.locationResponse().name());
        assertEquals(eventRequest.location().city(), result.locationResponse().city());
        assertEquals(eventRequest.location().province(), result.locationResponse().province());
        assertEquals(eventRequest.location().country(), result.locationResponse().country());
        assertEquals(eventRequest.date(), result.date());

        verify(eventRepository, times(1)).findById(testId);
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    public void updateEventShouldThrowEventDoesNotExistException() {
        String testId = "123";
        EventRequest eventRequest = getEventRequest();

        when(eventRepository.findById(testId)).thenReturn(Optional.empty());

        EventDoesNotExistException exception = assertThrows(
                EventDoesNotExistException.class, () -> eventService.updateEvent(testId, eventRequest)
        );

        assertEquals("404 NOT_FOUND \"Event with id: 123 does not exist.\"", exception.getMessage());
        verify(eventRepository, times(1)).findById(testId);
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    public void patchEventShouldReturnPatchedEvent() {
        String testId = "123";
        EventRequest eventRequest = getEventRequest();

        Event existingEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .build();

        when(eventRepository.findById(testId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenReturn(existingEvent);

        EventResponse result = eventService.patchEvent(testId, eventRequest);

        assertNotNull(result);
        assertEquals(testId, result.id());
        assertEquals(eventRequest.eventName(), result.eventName());
        assertEquals(eventRequest.sportType(), result.sportType());
        assertEquals(eventRequest.location().name(), result.locationResponse().name());
        assertEquals(eventRequest.location().city(), result.locationResponse().city());
        assertEquals(eventRequest.location().province(), result.locationResponse().province());
        assertEquals(eventRequest.location().country(), result.locationResponse().country());
        assertEquals(eventRequest.date(), result.date());

        verify(eventRepository, times(1)).findById(testId);
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    public void patchEventShouldThrowEventDoesNotExistException() {
        String testId = "123";
        EventRequest eventRequest = getEventRequest();

        when(eventRepository.findById(testId)).thenReturn(Optional.empty());

        EventDoesNotExistException exception = assertThrows(
                EventDoesNotExistException.class, () -> eventService.patchEvent(testId, eventRequest)
        );

        assertEquals("404 NOT_FOUND \"Event with id: 123 does not exist.\"", exception.getMessage());

        verify(eventRepository, times(1)).findById(testId);
        verify(eventRepository, never()).save(any(Event.class));
    }


    @Test
    public void deleteEventWhenSuccess() {
        Event eventMock = mock(Event.class);
        when(eventRepository.findEventById(anyString())).thenReturn(Optional.of(eventMock));
        eventService.deleteEvent("abc123");
        verify(eventRepository, times(1)
                .description("eventRepository.delete must only be called once and must be called with the Event initially fetched."))
                .delete(eq(eventMock));


    }

    @Test
    public void deleteEventWhenNotFound() {
        assertThrows(EventDoesNotExistException.class, () -> eventService.deleteEvent("wrong id"));
        verify(eventRepository, times(
                0
        )).delete(any());

    }

    @Test
    public void joinEventShouldSuccessfullyJoin() {
        // Arrange
        String testId = "123";
        String testUserId = "validUserId";
        Event event = Event.builder()
                .withId(testId)
                .withMaxParticipants(20)
                .withCutOffTime(LocalDateTime.now().plusYears(1).toString())
                .withIsPrivate(false)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(event));

        // Act & Assert
        eventService.joinEvent(testId, testUserId);

        assertEquals(ParticipantAttendStatus.JOINED, event.getParticipants().getFirst().getAttendStatus());
        verify(eventRepository, times(1)).findById(testId);
        verify(eventRepository, times(1)).save(event);
    }

    @Test
    public void joinEventShouldThrowEventDoesNotExistException() {
        // Arrange
        String testId = new ObjectId().toHexString();
        String testUserId = "validUserId";

        // Act & Assert
        assertThrows(EventDoesNotExistException.class, () -> eventService.joinEvent(testId, testUserId));
    }

    @Test
    public void joinFullEventShouldThrowEventFullException() {
        // Arrange
        String testId = "123";
        String testUserId = "validUserId";
        EventRequest eventRequest = getEventRequest();
        Event fullEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .withCutOffTime(LocalDateTime.now().plusYears(1).toString())
                .withMaxParticipants(0)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(fullEvent));

        // Act & Assert
        assertThrows(EventFullException.class, () -> eventService.joinEvent(testId, testUserId));
    }

    @Test
    public void joinEventWhenUserIsAlreadyParticipatingShouldThrowUserAlreadyParticipantException() {
        // Arrange
        String testId = "123";
        String testUserId = "validUserId";
        EventRequest eventRequest = getEventRequest();
        Event fullEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .withCutOffTime(LocalDateTime.now().plusYears(1).toString())
                .withParticipants(List.of(Participant.builder()
                        .withJoinedOn(LocalDate.from(LocalDateTime.now()))
                        .withUserId(testUserId)
                        .withAttendStatus(ParticipantAttendStatus.JOINED)
                        .build()))
                .withMaxParticipants(10)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(fullEvent));

        // Act & Assert
        assertThrows(UserAlreadyParticipantException.class, () -> eventService.joinEvent(testId, testUserId));
    }

    @Test
    public void joinEventWhenUserIsWhitelistedShouldAddParticipantSuccessfully() {
        // Arrange
        String testId = "123";
        String testUserId = "whitelistedUserId1";
        EventRequest eventRequest = getEventRequest();
        Event privateEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .withIsPrivate(true)
                .withCutOffTime(LocalDateTime.now().plusYears(1).toString())
                .withWhitelistedUsers(List.of("whitelistedUserId1", "whitelistedUserId2"))
                .withParticipants(new ArrayList<>())
                .withMaxParticipants(10)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(privateEvent));

        // Act
        eventService.joinEvent(testId, testUserId);

        // Assert
        assertEquals(ParticipantAttendStatus.JOINED, privateEvent.getParticipants().getFirst().getAttendStatus());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    public void joinEventWhenUserIsNotWhitelistedShouldThrowUserIsNotEventWhitelistedException() {
        // Arrange
        String testId = "123";
        String testUserId = "nonWhitelistedUserId";
        EventRequest eventRequest = getEventRequest();
        Event privateEvent = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .withIsPrivate(true)
                .withWhitelistedUsers(List.of("whitelistedUserId1", "whitelistedUserId2"))
                .withParticipants(new ArrayList<>())
                .withMaxParticipants(10)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(privateEvent));

        // Act & Assert
        assertThrows(UserIsNotEventWhitelistedException.class, () -> eventService.joinEvent(testId, testUserId));
    }

    @Test
    public void joinEventWhenCutoffTimeHasPassedShouldThrowEventRegistrationClosedException() {
        // Arrange
        String testId = "123";
        String testUserId = "validUserId";
        EventRequest eventRequest = getEventRequest();
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);

        Event eventWithCutoffPassed = eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId(testId)
                .withCutOffTime(cutoffTime.toString())
                .withParticipants(new ArrayList<>())
                .withMaxParticipants(10)
                .build();

        // Mock
        when(eventRepository.findById(testId)).thenReturn(Optional.of(eventWithCutoffPassed));

        // Act & Assert
        assertThrows(EventRegistrationClosedException.class, () -> eventService.joinEvent(testId, testUserId));
    }

    @Test
    public void getAllEventsShouldReturnSuccess() {
        // Arrange
        EventRequest eventRequest = getEventRequest();
        Optional<Event> event1 = Optional.of(eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId("testEventId1")
                        .withEventName("testEventName1")
                .build());
        Optional<Event> event2 = Optional.of(eventMapper.eventRequestToEvent(eventRequest)
                .toBuilder()
                .withId("testEventId2")
                .withEventName("testEventName2")
                .build());

        List<Event> eventList = new ArrayList<>();
        eventList.add(event1.orElseThrow());
        eventList.add(event2.orElseThrow());

        when(eventRepository.findAll()).thenReturn(eventList);

        // Act
        List<EventResponse> events = eventService.getAllEvents();

        // Assert
        assertNotNull(events);
        assertEquals(2, events.size());
        assertEquals(eventMapper.eventToEventResponse(eventList.getFirst()), events.getFirst());
        assertEquals(eventMapper.eventToEventResponse(eventList.get(1)), events.get(1));
        assertEquals(eventMapper.eventToEventResponse(eventList.getFirst()).id(), events.getFirst().id());
        assertEquals(eventMapper.eventToEventResponse(eventList.get(1)).id(), events.get(1).id());
    }
}
