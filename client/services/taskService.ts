interface Task {
  _id: string;
  taskName: string;
  completed: boolean;
}

interface TaskInput {
  taskName: string;
  completed: boolean;
}

const API_URL = `http://192.168.2.19:3000`;
console.log(API_URL);
export const creatingTask = async (task: TaskInput): Promise<Task> => {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data;
};

export const gettingTask = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(
      "Failed to fetch users:",
      errorData.message || "Unknown error"
    );
    throw new Error(errorData.message || "Failed to fetch tasks");
  }

  const data = await response.json();
  return data;
};

export const deletingTask = async (id: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Delete task failed");
  }

  const data = await response.json();
  return data;
};

export const updatingTask = async (
  id: string,
  updatedTask: TaskInput
): Promise<Task> => {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTask),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "update task failed");
  }

  const data = await response.json();
  return data;
};
