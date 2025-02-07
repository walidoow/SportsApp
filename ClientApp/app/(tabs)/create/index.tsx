import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  StatusBar,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from "react-native";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "expo-router";
import ConfirmButton from "@/components/Helper Components/ConfirmButton";
import themeColors from "@/utils/constants/colors";
import { hs, vs, mhs } from "@/utils/helpers/uiScaler";
import { createEvent } from "@/services/eventService";
import { useSelector } from "react-redux";
import supportedSports from "@/utils/constants/supportedSports";
import GooglePlacesInput from "@/components/Helper Components/GooglePlacesInput";
import CustomDateTimePicker from "@/components/Helper Components/CustomDateTimePicker";
import { Ionicons } from "@expo/vector-icons";
import EventLocationMap from "@/components/Helper Components/EventLocationMap";

const Create = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<EventFormData>({
    defaultValues: {
      eventName: "",
      eventType: "public",
      sportType: "",
      maxParticipants: "",
      description: "",
    },
  });
  const router = useRouter();
  const [isSportTypeModalVisible, setSportTypeModalVisible] = useState(false);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [cutOffDate, setCutOffDate] = useState<Date | null>(null);
  const [cutOffTime, setCutOffTime] = useState<Date | null>(null);
  const [requiredSkillLevel, setRequiredSkillLevel] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showLocationPage, setShowLocationPage] = useState(false);
  interface Location {
    name: string;
    city: string;
    province: string;
    country: string;
    latitude: string;
    longitude: string;
  }

  const [location, setLocation] = useState<Location | null>(null);
  const [clearLocationTrigger, setClearLocationTrigger] = useState(false);
  const [step, setStep] = useState(1);

  const user = useSelector((state: { user: any }) => state.user);

  interface EventFormData {
    eventName: string;
    eventType: string;
    sportType: string;
    locationName: string;
    city: string;
    province: string;
    country: string;
    cutOffTime: string;
    description: string;
    maxParticipants: string;
    requiredSkillLevel: string[];
  }

  const onSubmit = async (data: EventFormData) => {
    if (!location) {
      Alert.alert("Oops..", "Please select a location.");
      return;
    }

    try {
      if (!cutOffDate || !cutOffTime || !eventDate || !startTime || !endTime) {
        Alert.alert("Oops..", "Please select all date and time fields");
        return;
      }

      if (data.description.length === 0) {
        Alert.alert("Oops..", "Description is required");
        return;
      }

      const formattedStartTime = startTime
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
        .replace(/\s?(AM|PM)$/, "");

      const formattedEndTime = endTime
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
        .replace(/\s?(AM|PM)$/, "");

      const combinedCutOffDateTime = new Date(
        cutOffDate.getFullYear(),
        cutOffDate.getMonth(),
        cutOffDate.getDate(),
        cutOffTime.getHours(),
        cutOffTime.getMinutes()
      );

      const combinedStartDateTime = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );

      if (combinedCutOffDateTime >= combinedStartDateTime) {
        Alert.alert(
          "Oops..",
          "Cutoff time must be before the event start time."
        );
        return;
      }
      const eventRequest = {
        eventName: data.eventName,
        eventType: data.eventType,
        sportType: data.sportType,
        location,
        date: eventDate ? eventDate.toISOString().split("T")[0] : "",
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        duration: "",
        maxParticipants: parseInt(data.maxParticipants, 10),
        participants: [],
        createdBy: user.id,
        teams: [],
        cutOffTime: combinedCutOffDateTime.toISOString().slice(0, 19),
        description: data.description,
        isPrivate: data.eventType === "private",
        whiteListedUsers: [],
        requiredSkillLevel: requiredSkillLevel.map((level) =>
          level.toUpperCase()
        ),
      };

      await createEvent(eventRequest);

      reset({
        eventName: "",
        eventType: "public",
        sportType: "",
        cutOffTime: "",
        description: "",
        maxParticipants: "",
      });
      setEventDate(null);
      setCutOffDate(null);
      setCutOffTime(null);
      setRequiredSkillLevel([]);
      setSuccessModalVisible(true);
      setStartTime(null);
      setEndTime(null);
      setLocation(null);
      setClearLocationTrigger((prev) => !prev);
      setShowLocationPage(false);
      setStep(1);
      Alert.alert("Success", "Event created successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      if (error.message === "Network Error") {
        Alert.alert("Error", "Network Error");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const renderSportTypeModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSportTypeModalVisible}
        onRequestClose={() => setSportTypeModalVisible(false)}
        accessibilityLabel="Sport Selection Modal"
      >
        <TouchableWithoutFeedback
          testID="modal-overlay"
          onPress={() => setSportTypeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <FlatList
                data={supportedSports}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.flatListContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setValue("sportType", item.name, {
                        shouldValidate: true,
                      });
                      setSportTypeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.scrollableList}
              />
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity
                  onPress={() => setSportTypeModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const watch = useWatch({ control });

  const toggleSkillLevel = (level: string) => {
    const updatedSkillLevels = requiredSkillLevel.includes(level)
      ? requiredSkillLevel.filter((item) => item !== level)
      : [...requiredSkillLevel, level];

    setRequiredSkillLevel(updatedSkillLevels);
    setValue("requiredSkillLevel", updatedSkillLevels);
  };

  if (showLocationPage) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Select Location
        </Text>
        <GooglePlacesInput
          setLocation={setLocation}
          clearTrigger={clearLocationTrigger}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowLocationPage(false)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const SummaryItem: React.FC<{
    label: string;
    value: string | undefined;
    icon: string;
  }> = ({ label, value, icon }) => (
    <View style={styles.summaryItem}>
      <Ionicons name={icon as any} size={20} color={themeColors.primary} />
      {label ? <Text style={styles.summaryLabel}>{label}</Text> : null}
      <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );

  const validateStep = async (currentStep: number) => {
    try {
      await handleSubmit(() => {})();
    } catch (e) {
      return false;
    }

    const formValues = watch;

    switch (currentStep) {
      case 1:
        if (
          !formValues.eventName ||
          !formValues.eventType ||
          !formValues.sportType ||
          !formValues.maxParticipants ||
          !formValues.requiredSkillLevel?.length ||
          !formValues.description
        ) {
          Alert.alert("Oops!", "Please complete all fields before proceeding.");
          return false;
        }
        break;

      case 2:
        if (
          !eventDate ||
          !startTime ||
          !endTime ||
          !cutOffDate ||
          !cutOffTime
        ) {
          Alert.alert("Oops!", "Please select all date and time fields.");
          return false;
        }

        if (cutOffDate.getTime() >= eventDate.getTime()) {
          Alert.alert("Oops!", "Cutoff date must be before the event date.");
          return false;
        }
        break;

      case 3:
        if (!location) {
          Alert.alert("Oops!", "Please select a location.");
          return false;
        }
        break;

      default:
        return true;
    }

    return true;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.container,
            { paddingTop: StatusBar.currentHeight || vs(24) },
          ]}
        >
          {step === 1 && (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>General Information</Text>
                <Text style={styles.inputLabel}>Event Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                  <Controller
                    control={control}
                    name="eventName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Enter Event Name"
                        placeholderTextColor={themeColors.text.placeholder}
                        style={styles.inputField}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value || ""}
                      />
                    )}
                  />
                </View>
                {errors.eventName && (
                  <Text style={styles.errorText}>
                    {errors.eventName.message}
                  </Text>
                )}

                <Text style={styles.inputLabel}>Event Type</Text>
                <View style={styles.segmentedControl}>
                  {["public", "private"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setValue("eventType", type)}
                      style={[
                        styles.segmentButton,
                        watch.eventType === type &&
                          styles.segmentButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentButtonText,
                          watch.eventType === type &&
                            styles.segmentButtonTextSelected,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.rowContainer}>
                  <View style={styles.inputHalfContainer}>
                    <Text style={styles.inputLabel}>Sport Type</Text>
                    <TouchableOpacity
                      style={[styles.inputContainer, styles.equalHeightInput]}
                      onPress={() => {
                        setSportTypeModalVisible(true);
                      }}
                    >
                      <Ionicons
                        name="football-outline"
                        size={20}
                        color={themeColors.primary}
                      />
                      <Text style={styles.inputField}>
                        {watch.sportType || "Select a Sport"}
                      </Text>
                    </TouchableOpacity>
                    {errors.sportType && (
                      <Text style={styles.errorText}>
                        {errors.sportType.message}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputHalfContainer}>
                    <Text style={styles.inputLabel}>Max Participants</Text>
                    <View
                      style={[styles.inputContainer, styles.equalHeightInput]}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={themeColors.primary}
                      />
                      <Controller
                        control={control}
                        name="maxParticipants"
                        rules={{
                          validate: (v) =>
                            parseInt(v, 10) > 1 || "Must be at least 2",
                        }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            placeholder="Enter max"
                            placeholderTextColor={themeColors.text.placeholder}
                            style={[
                              styles.inputField,
                              {
                                height: 40,
                                textAlignVertical: "center",
                                paddingVertical: 5,
                              },
                            ]}
                            onChangeText={onChange}
                            value={value || ""}
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>
                    {errors.maxParticipants && (
                      <Text style={styles.errorText}>
                        {errors.maxParticipants.message}
                      </Text>
                    )}
                  </View>
                </View>

                {isSportTypeModalVisible && renderSportTypeModal()}

                <Text style={styles.inputLabel}>Required Skill Level</Text>
                <View style={styles.skillLevelGroup}>
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <TouchableOpacity
                      key={level}
                      testID={`skill-level-${level}`}
                      style={[
                        styles.skillLevelOption,
                        requiredSkillLevel.includes(level) &&
                          styles.skillLevelSelected,
                      ]}
                      onPress={() => toggleSkillLevel(level)}
                    >
                      <Text
                        style={[
                          styles.skillLevelText,
                          requiredSkillLevel.includes(level) &&
                            styles.skillLevelTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Description</Text>
                <View
                  style={[styles.inputContainer, styles.descriptionContainer]}
                >
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Enter Description"
                        placeholderTextColor={themeColors.text.placeholder}
                        style={styles.descriptionField}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value || ""}
                        multiline
                        numberOfLines={4}
                      />
                    )}
                  />
                </View>
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message}
                  </Text>
                )}
              </View>
            </>
          )}

          {step === 2 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Event Date & Time</Text>

              <Text style={styles.inputLabel}>Event Date</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={themeColors.primary}
                />
                <CustomDateTimePicker
                  value={eventDate}
                  mode="date"
                  label=""
                  onChange={(selectedDate) => setEventDate(selectedDate)}
                />
              </View>

              <View style={styles.sideBySideContainer}>
                <View style={styles.inputHalfContainer}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <View style={styles.inputHalf}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={themeColors.primary}
                    />
                    <CustomDateTimePicker
                      value={startTime}
                      mode="time"
                      label=""
                      onChange={(selectedTime) => setStartTime(selectedTime)}
                    />
                  </View>
                </View>

                <View style={styles.inputHalfContainer}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <View style={styles.inputHalf}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={themeColors.primary}
                    />
                    <CustomDateTimePicker
                      value={endTime}
                      mode="time"
                      label=""
                      onChange={(selectedTime) => setEndTime(selectedTime)}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Register by (Date)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={themeColors.primary}
                />
                <CustomDateTimePicker
                  value={cutOffDate}
                  mode="date"
                  label=""
                  onChange={(selectedDate) => setCutOffDate(selectedDate)}
                />
              </View>

              <Text style={styles.inputLabel}>Register by (Time)</Text>
              <View style={styles.inputHalfCutoffTime}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={themeColors.primary}
                />
                <CustomDateTimePicker
                  value={cutOffTime}
                  mode="time"
                  label=""
                  onChange={(selectedTime) => setCutOffTime(selectedTime)}
                />
              </View>

              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  onPress={() => setStep(step - 1)}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="arrow-back-circle"
                    size={28}
                    color={themeColors.primary}
                  />
                  <Text style={styles.navButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep(step + 1)}
                  style={styles.navButton}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                  <Ionicons
                    name="arrow-forward-circle"
                    size={28}
                    color={themeColors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
              <Text style={styles.inputLabel}>Select Location</Text>
              <GooglePlacesInput
                setLocation={setLocation}
                clearTrigger={clearLocationTrigger}
              />

              {location?.latitude && location?.longitude && (
                <View
                  key={`${location.latitude}-${location.longitude}`}
                  style={styles.mapContainer}
                >
                  <EventLocationMap
                    latitude={parseFloat(location.latitude)}
                    longitude={parseFloat(location.longitude)}
                  />
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.summaryContainer}>
                <View style={styles.summaryHeader}>
                  <TouchableOpacity
                    onPress={() => setStep(step - 1)}
                    style={styles.summaryBackButton}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={themeColors.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.summaryTitle}>Event Summary</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>General Information</Text>
                  <SummaryItem
                    label="Event Name:"
                    value={watch.eventName}
                    icon="calendar-outline"
                  />
                  <SummaryItem
                    label="Event Type:"
                    value={watch.eventType}
                    icon="people-outline"
                  />
                  <SummaryItem
                    label="Sport:"
                    value={watch.sportType}
                    icon="football-outline"
                  />
                  <SummaryItem
                    label="Participants:"
                    value={watch.maxParticipants}
                    icon="people-circle-outline"
                  />
                  <SummaryItem
                    label="Skill Level:"
                    value={requiredSkillLevel.join(", ") || "None"}
                    icon="ribbon-outline"
                  />
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Time & Location</Text>
                  <SummaryItem
                    label=""
                    value={eventDate?.toDateString()}
                    icon="calendar"
                  />
                  <SummaryItem
                    label=""
                    value={
                      startTime && endTime
                        ? `From ${startTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })} to ${endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}`
                        : "Not selected"
                    }
                    icon="time-outline"
                  />
                  <SummaryItem
                    label=""
                    value={
                      startTime && endTime
                        ? `Register by ${cutOffDate?.toDateString()} at ${cutOffTime?.toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}`
                        : "Not selected"
                    }
                    icon="time-outline"
                  />
                  <SummaryItem
                    label=""
                    value={
                      location
                        ? `${location.name}, ${location.city}, ${location.province}`
                        : "Not Selected"
                    }
                    icon="location-outline"
                  />
                </View>

                <View style={styles.descriptionCard}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <ScrollView style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>
                      {watch.description || "No description provided"}
                    </Text>
                  </ScrollView>
                </View>

                <View style={styles.buttonContainer}>
                  <ConfirmButton
                    text="Create Event"
                    onPress={handleSubmit(onSubmit)}
                    icon={undefined}
                    iconPlacement={null}
                  />
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.navigationContainer}>
            {step > 1 && step !== 4 ? (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                style={styles.navButton}
              >
                <Ionicons
                  name="arrow-back-circle"
                  size={32}
                  color={themeColors.primary}
                />
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {step < 4 && (
              <TouchableOpacity
                onPress={async () => {
                  const isValid = await validateStep(step);
                  if (isValid) {
                    setStep(step + 1);
                  }
                }}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={32}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: themeColors.background.light,
    padding: hs(16),
    borderRadius: mhs(8),
    alignItems: "center",
  },
  flatListContainer: {
    alignItems: "center",
  },
  scrollableList: {
    maxHeight: vs(200),
    width: "100%",
  },
  modalItem: {
    padding: hs(12),
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border.light,
    width: "90%",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: mhs(16),
    color: themeColors.text.dark,
  },
  closeButtonContainer: {
    marginTop: vs(16),
  },
  modalCloseButton: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(20),
    borderRadius: mhs(25),
    backgroundColor: themeColors.primary,
  },
  modalCloseButtonText: {
    color: themeColors.text.light,
    fontWeight: "bold",
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background.light,
  },
  backButton: {
    alignSelf: "center",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: themeColors.primary,
    backgroundColor: themeColors.background.lightGrey,
  },
  backButtonText: {
    color: themeColors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: themeColors.background.light,
    borderColor: "#ddd",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeColors.primary,
    marginHorizontal: 5,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeColors.text.dark,
    marginLeft: 8,
    flexWrap: "nowrap",
  },
  summaryValue: {
    fontSize: 16,
    color: themeColors.text.dark,
    marginLeft: 4,
    flex: 1,
    flexShrink: 1,
    textAlign: "left",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionBox: {
    maxHeight: 120,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  descriptionText: {
    fontSize: 16,
    color: themeColors.text.dark,
  },
  summaryContainer: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: themeColors.background.light,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 1,
    left: 50,
    right: 50,
    paddingVertical: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapContainer: {
    marginTop: 10,
    marginBottom: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: themeColors.background.light,
  },
  summaryBackButton: {
    marginRight: 60,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeColors.primary,
    textAlign: "center",
  },
  sectionContainer: {
    backgroundColor: themeColors.background.light,
    padding: 15,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.background.lightGrey,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputField: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: themeColors.text.dark,
  },
  descriptionContainer: {
    alignItems: "flex-start",
  },
  descriptionField: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: themeColors.text.dark,
    textAlignVertical: "top",
    height: 100,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentButtonSelected: {
    backgroundColor: themeColors.primary,
  },
  segmentButtonText: {
    fontSize: 16,
    color: themeColors.text.dark,
  },
  segmentButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: themeColors.text.error,
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: vs(10),
    marginLeft: -5,
    width: "102.5%",
  },
  inputHalfContainer: {
    flex: 1,
    marginHorizontal: hs(5),
  },
  equalHeightInput: {
    height: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeColors.primary,
    marginBottom: 10,
  },
  sideBySideContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "102.5%",
    marginLeft: -5,
  },
  inputHalf: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.background.lightGrey,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputHalfCutoffTime: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.background.lightGrey,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    width: "48%",
    borderColor: "#ddd",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: themeColors.primary,
    marginBottom: 5,
    marginLeft: 5,
  },
  skillLevelOption: {
    padding: hs(12),
    borderWidth: 1,
    borderColor: themeColors.border.light,
    borderRadius: mhs(8),
    backgroundColor: themeColors.background.lightGrey,
  },
  skillLevelText: {
    fontSize: mhs(14),
    color: themeColors.text.dark,
  },
  skillLevelTextSelected: {
    color: themeColors.text.light,
    fontWeight: "bold",
  },
  skillLevelGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: vs(16),
  },
  skillLevelSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
});

export default Create;
