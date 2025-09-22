import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Task } from "@shared/schema";
import { Plus, Check, Undo2, Trash2, Clock, CheckCircle, CircleDot, List, Settings, Save } from "lucide-react";

export default function Home() {
  const [taskInput, setTaskInput] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/tasks", { title, status: "pending" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTaskInput("");
      toast({
        title: "Task added",
        description: "Your task has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTask = () => {
    if (taskInput.trim()) {
      createTaskMutation.mutate(taskInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleMarkDone = (id: string) => {
    updateTaskMutation.mutate({ id, status: "done" });
  };

  const handleMarkPending = (id: string) => {
    updateTaskMutation.mutate({ id, status: "pending" });
  };

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">TaskFlow</h1>
            <p className="text-muted-foreground text-lg">Simple, efficient task management</p>
          </div>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">TaskFlow</h1>
          <p className="text-muted-foreground text-lg">Simple, efficient task management</p>
        </div>

        {/* Main Task Interface Card */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 mb-6">
          {/* Add New Task Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              <Plus className="inline-block text-primary mr-2 h-5 w-5" />
              Add New Task
            </h2>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your task..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                data-testid="input-task"
              />
              <Button 
                onClick={handleAddTask}
                disabled={!taskInput.trim() || createTaskMutation.isPending}
                className="btn-primary px-6 font-medium flex items-center gap-2"
                data-testid="button-add-task"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Tasks Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-card-foreground">
                <List className="inline-block text-primary mr-2 h-5 w-5" />
                My Tasks
              </h2>
              <div className="text-sm text-muted-foreground">
                <span data-testid="text-task-count">{tasks.length}</span> tasks total
              </div>
            </div>

            {/* Tasks Table */}
            {tasks.length > 0 ? (
              <div className="bg-muted rounded-lg overflow-hidden border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left py-4 px-6 font-medium text-secondary-foreground">
                        <Settings className="inline-block mr-2 h-4 w-4" />
                        Task
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-secondary-foreground">
                        <CircleDot className="inline-block mr-2 h-4 w-4" />
                        Status
                      </th>
                      <th className="text-center py-4 px-6 font-medium text-secondary-foreground">
                        <Settings className="inline-block mr-2 h-4 w-4" />
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {tasks.map((task) => (
                      <tr key={task.id} className="task-row border-b border-border" data-testid={`row-task-${task.id}`}>
                        <td className="py-4 px-6 text-card-foreground">
                          <div className="flex items-center">
                            {task.status === "done" ? (
                              <CheckCircle className="text-success mr-3 h-4 w-4" />
                            ) : (
                              <CircleDot className="text-primary mr-3 h-4 w-4" />
                            )}
                            <span 
                              className={task.status === "done" ? "line-through opacity-60" : ""}
                              data-testid={`text-task-title-${task.id}`}
                            >
                              {task.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={task.status === "done" ? "default" : "secondary"}
                            className={`status-badge ${
                              task.status === "done" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                            data-testid={`status-${task.id}`}
                          >
                            {task.status === "done" ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                Done
                              </>
                            ) : (
                              <>
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {task.status === "done" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkPending(task.id)}
                                disabled={updateTaskMutation.isPending}
                                className="text-muted-foreground hover:bg-secondary hover:text-secondary-foreground p-2"
                                title="Mark as Pending"
                                data-testid={`button-mark-pending-${task.id}`}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkDone(task.id)}
                                disabled={updateTaskMutation.isPending}
                                className="text-success hover:bg-success hover:text-white p-2"
                                title="Mark as Done"
                                data-testid={`button-mark-done-${task.id}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(task.id)}
                              disabled={deleteTaskMutation.isPending}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground p-2"
                              title="Delete Task"
                              data-testid={`button-delete-${task.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <List className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">Add your first task to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Persistence Status */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Save className="mr-2 h-4 w-4 text-success" />
              <span>Tasks automatically saved to tasks.json</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                Auto-save enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="modal-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash2 className="text-destructive text-xl mr-3 h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteTaskMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              data-testid="button-confirm-delete"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
