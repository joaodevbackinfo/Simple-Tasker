import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator, Modal,
} from 'react-native';
import { useTasks } from '../../hooks/useTasks';
import CreateTaskScreen from './creatask';

const COLORS = {
  primary: '#4F46E5', secondary: '#7C3AED', dark: '#1E1B4B',
  gray: '#6B7280', lightGray: '#F3F4F6', white: '#FFFFFF',
  success: '#10B981', warning: '#F59E0B', bgPage: '#F8F7FF',
};

export type Priority = 'baixa' | 'media' | 'alta';
export type TaskStatus = 'pendente' | 'concluida';
export interface Task {
  id: string; title: string; description?: string;
  dueDate: string; priority: Priority; status: TaskStatus; createdAt: string;
}

type Filter = 'todas' | 'pendente' | 'concluida' | 'alta';

const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  bg: '#FEF3C7', text: '#92400E' },
  media: { label: 'Média', bg: '#EEF2FF', text: '#3730A3' },
  baixa: { label: 'Baixa', bg: '#D1FAE5', text: '#065F46' },
};

const FILTER_LABELS: Record<Filter, string> = {
  todas: 'Todas', pendente: 'Pendentes', concluida: 'Concluídas', alta: 'Alta prioridade',
};

export default function HomeScreen() {
  const { tasks, loading, addTask, updateTask, deleteTask, completeTask } = useTasks();
  const [activeFilter, setActiveFilter] = useState<Filter>('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'todas') return true;
    if (activeFilter === 'alta') return task.priority === 'alta';
    return task.status === activeFilter;
  });

  const handleOpenCreate = () => { setEditingTask(undefined); setModalVisible(true); };
  const handleOpenEdit = (task: Task) => { setEditingTask(task); setModalVisible(true); };

  const handleSave = async (data: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    if (editingTask) await updateTask(editingTask.id, data);
    else await addTask(data);
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setModalVisible(false);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const prio = PRIORITY_CONFIG[item.priority];
    const isDone = item.status === 'concluida';
    return (
      <TouchableOpacity
        style={[styles.taskCard, isDone && styles.taskCardDone, item.priority === 'alta' && !isDone && styles.taskCardHigh]}
        onPress={() => handleOpenEdit(item)} activeOpacity={0.8}
      >
        <TouchableOpacity
          style={[styles.checkbox, isDone && styles.checkboxDone]}
          onPress={() => !isDone && completeTask(item.id)} activeOpacity={0.7}
        >
          {isDone && <Text style={styles.checkIcon}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={1}>{item.title}</Text>
          {item.description ? <Text style={styles.taskDesc} numberOfLines={1}>{item.description}</Text> : null}
          <View style={styles.taskMeta}>
            <Text style={styles.taskDate}>📅 {item.dueDate}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: prio.bg }]}>
              <Text style={[styles.priorityText, { color: prio.text }]}>{prio.label}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.taskArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.userName}>Minhas Tarefas 👋</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>ST</Text></View>
        </View>
        <View style={styles.statsRow}>
          {[
            { num: tasks.length, lbl: 'Total' },
            { num: tasks.filter(t => t.status === 'pendente').length, lbl: 'Pendentes' },
            { num: tasks.filter(t => t.status === 'concluida').length, lbl: 'Concluídas' },
          ].map(stat => (
            <View key={stat.lbl} style={styles.statPill}>
              <Text style={styles.statNum}>{stat.num}</Text>
              <Text style={styles.statLbl}>{stat.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal data={Object.keys(FILTER_LABELS) as Filter[]}
          keyExtractor={item => item} showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
              onPress={() => setActiveFilter(item)} activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
                {FILTER_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredTasks} keyExtractor={item => item.id} renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhuma tarefa aqui</Text>
            <Text style={styles.emptySubtitle}>Toque em + para criar uma nova tarefa</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleOpenCreate} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <CreateTaskScreen
          task={editingTask}
          onSave={handleSave}
          onCancel={() => setModalVisible(false)}
          onDelete={editingTask ? () => handleDelete(editingTask.id) : undefined}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bgPage },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgPage },
  header:           { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting:         { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  userName:         { fontSize: 20, fontWeight: '700', color: COLORS.white },
  avatar:           { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText:       { fontSize: 14, fontWeight: '700', color: COLORS.white },
  statsRow:         { flexDirection: 'row', gap: 8 },
  statPill:         { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  statNum:          { fontSize: 20, fontWeight: '800', color: COLORS.white },
  statLbl:          { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterContainer:  { backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  filterList:       { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.lightGray, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText:       { fontSize: 12, fontWeight: '500', color: COLORS.gray },
  filterTextActive: { color: COLORS.white },
  listContent:      { padding: 16, paddingBottom: 80 },
  taskCard:         { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: '#E5E7EB', borderLeftWidth: 3, borderLeftColor: '#E5E7EB' },
  taskCardDone:     { borderLeftColor: COLORS.success, opacity: 0.75 },
  taskCardHigh:     { borderLeftColor: COLORS.warning },
  checkbox:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxDone:     { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkIcon:        { fontSize: 11, color: COLORS.white, fontWeight: '700' },
  taskInfo:         { flex: 1, minWidth: 0 },
  taskTitle:        { fontSize: 14, fontWeight: '600', color: '#111827' },
  taskTitleDone:    { textDecorationLine: 'line-through', color: '#9CA3AF' },
  taskDesc:         { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  taskMeta:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  taskDate:         { fontSize: 11, color: '#9CA3AF' },
  priorityBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  priorityText:     { fontSize: 10, fontWeight: '600' },
  taskArrow:        { fontSize: 22, color: '#D1D5DB', marginLeft: 8 },
  emptyContainer:   { alignItems: 'center', paddingTop: 60 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyTitle:       { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  emptySubtitle:    { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  fab:              { position: 'absolute', bottom: 24, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabIcon:          { fontSize: 28, color: COLORS.white, lineHeight: 32 },
});
