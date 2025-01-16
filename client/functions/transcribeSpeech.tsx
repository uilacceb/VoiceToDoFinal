import { Audio } from "expo-av";
import { MutableRefObject } from "react";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as Device from "expo-device";

export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (isPrepared) {
      await audioRecordingRef?.current?.stopAndUnloadAsync();

      const recordingUri = audioRecordingRef?.current?.getURI() || "";
      const base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      audioRecordingRef.current = new Audio.Recording();

      if (recordingUri && base64Uri) {
        const audioConfig = {
          encoding: Platform.OS === "ios" ? "LINEAR16" : "AMR_WB",
          sampleRateHertz: Platform.OS === "ios" ? 44100 : 16000,
          languageCode: "en-US",
        };

        const rootOrigin =
          Platform.OS === "android"
            ? Device.isDevice
              ? "192.168.2.19" // Local IP address of your development machine
              : "10.0.2.2" // IP for Android Emulator
            : "192.168.2.19"; // iOS simulator or web
        const serverUrl = `http://${rootOrigin}:3000`;
        console.log(`Sending request to: ${serverUrl}/speech-to-text`);

        const serverResponse = await fetch(`${serverUrl}/speech-to-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioUrl: base64Uri, config: audioConfig }),
        })
          .then((res) => res.json())
          .catch((e: Error) => console.error(e));

        const results = serverResponse?.results;
        if (results) {
          const transcript = results?.[0].alternatives?.[0].transcript;
          if (!transcript) return undefined;
          return transcript;
        } else {
          console.error("No transcript found");
          return undefined;
        }
      }
    } else {
      console.error("Recording must be prepared prior to unloading");
      return undefined;
    }
  } catch (e) {
    console.error("Failed to transcribe speech!", e);
    return undefined;
  }
};
