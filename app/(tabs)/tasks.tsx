import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import {
  useTasks,
  useUpdateTask,
  useCreateTask,
  useDeleteTask,
} from "@/hooks/useTasks";
import { ApiTask } from "@/services/api";
import { useState } from "react";
import TaskModal from "@/components/TaskModal";
import FloatingActionButton from "@/components/FloatingActionButton";

const categories = [
  { id: "all", label: "All", color: "bg-gray-500" },
  { id: "work", label: "Work", color: "bg-blue-500" },
  { id: "personal", label: "Personal", color: "bg-green-500" },
  { id: "shopping", label: "Shopping", color: "bg-yellow-500" },
  { id: "health", label: "Health", color: "bg-red-500" },
];

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const user = useAtomValue(userAtom);
  const { data: tasks = [], isLoading, error } = useTasks(user?.id || "");
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  const toggleTask = (task: ApiTask) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: { completed: !task.completed },
    });
  };

  const addSampleTask = () => {
    if (!user) return;
    createTaskMutation.mutate({
      title: "New Task from Server",
      description: "This task is created via API",
      completed: false,
      category: "work",
      priority: "medium",
      userId: user.id,
    });
  };

  const openTaskModal = (task: ApiTask | null = null) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setModalVisible(false);
  };

  const filteredTasks =
    selectedCategory === "all"
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-600 text-lg">Error loading tasks</Text>
        <Text className="text-gray-600">{error.message}</Text>
      </View>
    );
  }

  const renderTask = ({ item }: { item: ApiTask }) => (
    <Pressable onPress={() => openTaskModal(item)}>
      <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold ${
                item.completed ? "text-gray-500 line-through" : "text-gray-900"
              }`}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text className="text-gray-600 mt-1">{item.description}</Text>
            )}
            <View className="flex-row items-center mt-2">
              <View
                className={`px-2 py-1 rounded-full mr-2 ${
                  categories.find((c) => c.id === item.category)?.color ||
                  "bg-gray-500"
                }`}
              >
                <Text className="text-white text-xs font-medium">
                  {categories.find((c) => c.id === item.category)?.label}
                </Text>
              </View>
              <View
                className={`px-2 py-1 rounded-full ${
                  item.priority === "high"
                    ? "bg-red-100"
                    : item.priority === "medium"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    item.priority === "high"
                      ? "text-red-800"
                      : item.priority === "medium"
                        ? "text-yellow-800"
                        : "text-green-800"
                  }`}
                >
                  {item.priority}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => toggleTask(item)}
            disabled={updateTaskMutation.isPending}
            className={`w-6 h-6 rounded-full border-2 ${
              item.completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300"
            } ${updateTaskMutation.isPending ? "opacity-50" : ""}`}
          >
            {item.completed && (
              <Text className="text-white text-center text-xs leading-5">
                ✓
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">My Tasks</Text>
        <Text className="text-gray-600 mb-4">
          {tasks.length} tasks • {tasks.filter((t) => t.completed).length}{" "}
          completed
        </Text>
      </View>

      {/* Category Filter */}
      <View className="flex-row px-4 mb-4 space-x-2">
        {categories.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedCategory(item.id)}
            className={`px-4 py-2 rounded-full mr-3 ${
              selectedCategory === item.id ? item.color : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-medium ${
                selectedCategory === item.id ? "text-white" : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-1 px-4">
        {filteredTasks.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg mb-4">No tasks yet</Text>
            <Pressable
              onPress={addSampleTask}
              disabled={createTaskMutation.isPending}
              className="bg-primary-500 px-6 py-3 rounded-lg disabled:opacity-50"
            >
              <Text className="text-white font-semibold">
                {createTaskMutation.isPending ? "Adding..." : "Add Sample Task"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FloatingActionButton onPress={() => openTaskModal()} />

      <TaskModal
        visible={modalVisible}
        onClose={closeTaskModal}
        task={selectedTask}
      />
    </View>
  );
}
