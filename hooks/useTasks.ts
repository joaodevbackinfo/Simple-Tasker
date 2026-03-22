import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../app/(tabs)/home';

const TASKS_KEY = '@simpletasker:tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega tarefas do storage ao iniciar
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const json = await AsyncStorage.getItem(TASKS_KEY);
      if (json) setTasks(JSON.parse(json));
    } catch (e) {
      console.error('Erro ao carregar tarefas:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (e) {
      console.error('Erro ao salvar tarefas:', e);
    }
  };

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      status: 'pendente',
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    const updated = [newTask, ...tasks];
    await saveTasks(updated);
    return newTask;
  }, [tasks]);

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...changes } : t);
    await saveTasks(updated);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    await saveTasks(updated);
  }, [tasks]);

  const completeTask = useCallback(async (id: string) => {
    await updateTask(id, { status: 'concluida' });
  }, [updateTask]);

  return { tasks, loading, addTask, updateTask, deleteTask, completeTask };
}
