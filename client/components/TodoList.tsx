import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import {
  creatingTask,
  gettingTask,
  deletingTask,
  updatingTask,
} from "../services/taskService";
import { supermarketItems } from "@/constants/SupermarketItems";
import { Audio } from "expo-av";
import { recordSpeech } from "@/functions/recordSpeech";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

interface Task {
  _id: string;
  taskName: string;
  completed: boolean;
}

interface CurrentTask {
  taskName: string;
  completed: boolean;
}

export default function TodoList() {
  const [toDoList, setToDoList] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<CurrentTask>({
    taskName: "",
    completed: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecordingRef = useRef(new Audio.Recording());
  const [isFocus, setIsFocused] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [blinkOpacity] = useState(new Animated.Value(1));
  const blinkAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleClear = () => setCurrentTask({ taskName: "", completed: false });
  const refreshPage = () => {
    setRefresh((prev) => !prev);
  };

  const Record = async () => {
    try {
      if (!isRecording) {
        setIsRecording(true);
        await recordSpeech(audioRecordingRef);
      } else {
        if (blinkAnimationRef.current) {
          blinkAnimationRef.current.stop();
        }
        // Reset opacity to 1 before stopping recording
        blinkOpacity.setValue(1);
        setIsRecording(false);
        setIsTranscribing(true);
        try {
          const speechTranscript = await transcribeSpeech(audioRecordingRef);
          if (speechTranscript) {
            setTranscribedSpeech(speechTranscript);
            setCurrentTask((prev) => ({ ...prev, taskName: speechTranscript }));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsTranscribing(false);
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
      if (blinkAnimationRef.current) {
        blinkAnimationRef.current.stop();
      }
      blinkOpacity.setValue(1);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    let blinkAnimation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      // Create a blinking animation
      blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkOpacity, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimationRef.current = blinkAnimation;
      blinkAnimation.start();
    }
    return () => {
      if (blinkAnimation) {
        blinkAnimation.stop();
      }
      // Always reset opacity to 1 when cleaning up
      blinkOpacity.setValue(1);
    };
  }, [isRecording]);

  useEffect(() => {
    currentTask.taskName = currentTask.taskName.toLowerCase().trim();

    if (currentTask.taskName) {
      if (currentTask.taskName.includes("delete")) {
        deleteTaskVoice(currentTask.taskName.replace(/delete/g, "").trim());
      } else if (currentTask.taskName.includes("complete")) {
        completeTaskVoice(currentTask.taskName.replace(/complete/g, "").trim());
      } else if (currentTask.taskName.includes("uncheck")) {
        unCheckTaskVoice(currentTask.taskName.replace(/uncheck/g, "").trim());
      } else if (currentTask.taskName.includes("add")) {
        currentTask.taskName = currentTask.taskName.replace(/add/g, "").trim();
        // addTask();
        let IsProductFound = false;
        supermarketItems.forEach((item) => {
          if (transcribedSpeech.includes(item.toLowerCase())) {
            IsProductFound = true;
            currentTask.taskName = item.toLowerCase();
            addTask();
          }
        });

        if (!IsProductFound) {
          Alert.alert(
            "Sorry",
            `We don't have product: ${currentTask.taskName}`
          );
        }
        handleClear();
      } else {
        // addTask();
      }

      refreshPage();
    }
  }, [currentTask]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const interval = setInterval(async () => {
          const tasks = await gettingTask(); // Fetch the latest tasks
          setToDoList(tasks);
        }, 2000); // Poll every 1 second
        return () => clearInterval(interval);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch tasks:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!currentTask.taskName.trim()) {
      setError("Task name is required!");
      setTimeout(() => setError(""), 2000);

      return;
    }
    try {
      const index = toDoList.findIndex(
        (task) => task.taskName === currentTask.taskName
      );
      if (index !== -1) {
        Alert.alert(`${currentTask.taskName} is already in the list`);
        return;
      }
      const data = await creatingTask(currentTask);
      setToDoList([...toDoList, data]);
      setCurrentTask({ taskName: "", completed: false });
    } catch (error) {
      setError("There has been an error, please try again later");
    }
  };

  const deleteTaskVoice = async (taskNameToDelete: string) => {
    const index = toDoList.findIndex(
      (task) => task.taskName === taskNameToDelete
    );
    if (index !== -1) {
      try {
        const taskToDelete = toDoList[index];
        await deletingTask(taskToDelete._id);
        const updatedList = toDoList.filter((_, index1) => index1 !== index);
        setToDoList(updatedList);
        setCurrentTask({ taskName: "", completed: false });
      } catch (error) {
        Alert.alert("Error", "Failed to delete task");
      }
    }
  };

  const deleteTask = async (id: string, indexOfTaskToDelete: number) => {
    try {
      await deletingTask(id);
      const updatedList = toDoList.filter(
        (_, index) => index !== indexOfTaskToDelete
      );
      setToDoList(updatedList);
    } catch (error) {
      Alert.alert("Error", "Failed to delete task");
    }
  };

  const completeTaskVoice = async (taskNameToDelete: string) => {
    const index = toDoList.findIndex(
      (task) => task.taskName === taskNameToDelete
    );
    if (index !== -1) {
      try {
        const taskToUpdate = toDoList[index];
        if (!taskToUpdate.completed) {
          const updatedTask = {
            taskName: taskToUpdate.taskName,
            completed: true,
          };
          await updatingTask(taskToUpdate._id, updatedTask);

          setToDoList(
            toDoList.map((task, i) =>
              i === index ? { ...task, completed: !task.completed } : task
            )
          );
          setCurrentTask({ taskName: "", completed: false });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to update task");
      }
    }
  };

  const unCheckTaskVoice = async (taskNameToDelete: string) => {
    const index = toDoList.findIndex(
      (task) => task.taskName === taskNameToDelete
    );
    if (index !== -1) {
      try {
        const taskToUpdate = toDoList[index];
        if (taskToUpdate.completed) {
          const updatedTask = {
            taskName: taskToUpdate.taskName,
            completed: false,
          };
          await updatingTask(taskToUpdate._id, updatedTask);

          setToDoList(
            toDoList.map((task, i) =>
              i === index ? { ...task, completed: !task.completed } : task
            )
          );
          setCurrentTask({ taskName: "", completed: false });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to update task");
      }
    }
  };

  const completeTask = async (id: string, index: number) => {
    try {
      const taskToUpdate = toDoList[index];
      const updatedTask = {
        taskName: taskToUpdate.taskName,
        completed: !taskToUpdate.completed,
      };

      await updatingTask(id, updatedTask);

      setToDoList(
        toDoList.map((task, i) =>
          i === index ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tasks...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }: { item: Task; index: number }) => (
    <View style={styles.taskContainer}>
      <Text style={[styles.taskText, item.completed && styles.completedTask]}>
        {item.taskName}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            item.completed && styles.completedTaskButton,
          ]}
          onPress={() => completeTask(item._id, index)}
        >
          <Text style={styles.buttonText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item._id, index)}
        >
          <Text style={styles.buttonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>Supermarket List</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tomato Sauce"
            value={currentTask.taskName}
            onChangeText={(text: string) =>
              setCurrentTask({ ...currentTask, taskName: text })
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={addTask}
          />
          {isFocus && (
            <TouchableOpacity onPress={handleClear} style={styles.clearbutton}>
              <MaterialIcons
                name="clear"
                size={24}
                color="grey"
              ></MaterialIcons>
            </TouchableOpacity>
          )}
          <Animated.View style={{ opacity: isRecording ? blinkOpacity : 1 }}>
            <TouchableOpacity
              style={[styles.microphoneButton, { backgroundColor: "#FF554F" }]}
              onPress={Record}
              // disabled={isRecording || isTranscribing}
            >
              {isRecording ? (
                <FontAwesome name="stop" size={16} color="white" />
              ) : (
                <FontAwesome name="microphone" size={20} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <FlatList
          data={toDoList}
          renderItem={renderItem}
          keyExtractor={(item: Task) => item._id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 20,
    marginBottom: 20,
    color: "#666",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#64748b",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20, // Adds padding at the bottom of the list
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  taskText: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  completeButton: {
    backgroundColor: "#22c55e",
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  microphoneButton: {
    backgroundColor: "#FF554F",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  clearbutton: {
    position: "absolute",
    right: "45%",
    top: 23,
    transform: [{ translateY: -12 }],
  },
  completedTaskButton: {
    backgroundColor: "#808080",
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
});
