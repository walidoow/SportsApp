import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";

interface GooglePlacesInputProps {
  setLocation: (location: any) => void;
}

interface LocationData {
  name: string;
  streetNumber: string;
  streetName: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  setLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const GOOGLE_PLACES_API_KEY = "AIzaSyCIQzQHX5obH2Ev4jIX1qVy5i2zDn8nrYI";

  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
        placeholder="Search for a location"
        minLength={2}
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            const locationData = {
              name: details.name,
              streetNumber:
                details.address_components.find((comp) =>
                  comp.types.includes("street_number")
                )?.long_name || "",
              streetName:
                details.address_components.find((comp) =>
                  comp.types.includes("route")
                )?.long_name || "",
              city:
                details.address_components.find((comp) =>
                  comp.types.includes("locality")
                )?.long_name || "",
              province:
                details.address_components.find((comp) =>
                  comp.types.includes("administrative_area_level_1")
                )?.long_name || "",
              country:
                details.address_components.find((comp) =>
                  comp.types.includes("country")
                )?.long_name || "",
              postalCode:
                details.address_components.find((comp) =>
                  comp.types.includes("postal_code")
                )?.long_name || "",
              latitude: details.geometry.location.lat.toString(),
              longitude: details.geometry.location.lng.toString(),
            };

            setSelectedLocation(locationData);
            setLocation(locationData);
          }
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: "en",
        }}
        styles={{
          textInput: {
            height: 50,
            borderWidth: 1,
            paddingHorizontal: 10,
          },
          listView: {
            borderWidth: 1,
            borderColor: "#ccc",
            backgroundColor: "white",
          },
          poweredContainer: {
            display: "none",
            height: 0,
            opacity: 0,
          },
          powered: {
            display: "none",
            height: 0,
            opacity: 0,
          },
        }}
      />

      {selectedLocation && (
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            borderWidth: 1,
            backgroundColor: "#fff",
          }}
          onPress={() => setSelectedLocation(null)}
        >
          <Text style={{ fontWeight: "bold" }}>Selected Location:</Text>
          <Text>{selectedLocation.name}</Text>
          <Text>
            {selectedLocation.streetNumber} {selectedLocation.streetName}
          </Text>
          <Text>
            {selectedLocation.city}, {selectedLocation.province}
          </Text>
          <Text>
            {selectedLocation.country} - {selectedLocation.postalCode}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GooglePlacesInput;
