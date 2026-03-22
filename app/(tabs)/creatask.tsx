import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Platform,
} from 'react-native';
import type { Task, Priority } from './home';

const COLORS = {
  primary: '#4F46E5', accent: '#06B6D4', dark: '#1E1B4B',
  gray: '#6B7280', lightGray: '#F3F4F6', inputBg: '#F5F3FF',
  inputBorder: '#E0E7FF', white: '#FFFFFF',
  success: '#10B981', warning: '#F59E0B', danger: '#EF4444', bgPage: '#F8F7FF',
};

interface CreateTaskScreenProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function isValidDate(dateStr: string): boolean {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; bg: string; border: string; text: string }[] = [
  { value: 'baixa', label: 'Baixa', bg: '#D1FAE5', border: COLORS.success, text: '#065F46' },
  { value: 'media', label: 'Média', bg: '#EEF2FF', border: COLORS.primary, text: '#3730A3' },
  { value: 'alta',  label: 'Alta',  bg: '#FEF3C7', border: COLORS.warning, text: '#92400E' },
];

export default function CreateTaskScreen({ task, onSave, onCancel, onDelete }: CreateTaskScreenProps) {
  const isEditing = Boolean(task);
  const [title, setTitle]             = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate]         = useState(task?.dueDate ?? '');
  const [priority, setPriority]       = useState<Priority>(task?.priority ?? 'media');
  const [errors, setErrors]           = useState<{ title?: string; dueDate?: string }>({});

  const validate = () => {
    const e: { title?: string; dueDate?: string } = {};
    if (!title.trim()) e.title = 'Título é obrigatório';
    if (!dueDate) e.dueDate = 'Data de conclusão é obrigatória';
    else if (!isValidDate(dueDate)) e.dueDate = 'Data inválida. Use DD/MM/AAAA';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ title: title.trim(), description: description.trim(), dueDate, priority });
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir tarefa',
      'Esta ação é permanente e não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onCancel} activeOpacity={0.8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
        {isEditing && onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Título */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>TÍTULO <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            placeholder="Qual é a tarefa?" placeholderTextColor="#C4B5FD"
            value={title} onChangeText={t => { setTitle(t); setErrors(e => ({ ...e, title: undefined })); }}
            maxLength={80} returnKeyType="next"
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          <Text style={styles.charCount}>{title.length}/80</Text>
        </View>

        {/* Descrição */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DESCRIÇÃO</Text>
          <TextInput
            style={[styles.input, styles.textArea]} placeholder="Adicione detalhes..."
            placeholderTextColor="#C4B5FD" value={description} onChangeText={setDescription}
            multiline numberOfLines={4} maxLength={300} textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/300</Text>
        </View>

        {/* Data */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DATA DE CONCLUSÃO <Text style={styles.required}>*</Text></Text>
          <View style={{ position: 'relative' }}>
            <Text style={styles.dateIcon}>📅</Text>
            <TextInput
              style={[styles.input, styles.dateInput, errors.dueDate ? styles.inputError : null]}
              placeholder="DD/MM/AAAA" placeholderTextColor="#C4B5FD"
              value={dueDate}
              onChangeText={t => { setDueDate(formatDateInput(t)); setErrors(e => ({ ...e, dueDate: undefined })); }}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
              maxLength={10} returnKeyType="done"
            />
          </View>
          {errors.dueDate ? <Text style={styles.errorText}>{errors.dueDate}</Text> : null}
          <Text style={styles.hint}>Formato: DD/MM/AAAA</Text>
        </View>

        {/* Prioridade */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PRIORIDADE</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map(opt => {
              const sel = priority === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.priorityOpt, sel && { backgroundColor: opt.bg, borderColor: opt.border }]}
                  onPress={() => setPriority(opt.value)} activeOpacity={0.8}
                >
                  <Text style={[styles.priorityOptText, sel && { color: opt.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.btnSaveText}>{isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={onCancel} activeOpacity={0.85}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bgPage },
  header:          { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  backBtn:         { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon:        { fontSize: 18, color: COLORS.white, fontWeight: '600' },
  headerTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.white, flex: 1 },
  deleteBtn:       { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deleteIcon:      { fontSize: 16 },
  body:            { flex: 1 },
  bodyContent:     { padding: 16, paddingBottom: 32, gap: 12 },
  fieldGroup:      { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: COLORS.inputBorder },
  fieldLabel:      { fontSize: 11, fontWeight: '600', color: COLORS.gray, letterSpacing: 0.5, marginBottom: 8 },
  required:        { color: COLORS.danger },
  input:           { backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: COLORS.dark },
  inputError:      { borderColor: COLORS.danger },
  textArea:        { height: 90, paddingTop: 11 },
  charCount:       { fontSize: 10, color: '#C4B5FD', textAlign: 'right', marginTop: 4 },
  hint:            { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  errorText:       { fontSize: 11, color: COLORS.danger, marginTop: 4 },
  dateIcon:        { position: 'absolute', left: 12, top: 11, fontSize: 16, zIndex: 1 },
  dateInput:       { paddingLeft: 38 },
  priorityRow:     { flexDirection: 'row', gap: 8 },
  priorityOpt:     { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 10, alignItems: 'center', backgroundColor: COLORS.lightGray },
  priorityOptText: { fontSize: 12, fontWeight: '600', color: COLORS.gray },
  btnSave:         { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnSaveText:     { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  btnCancel:       { borderWidth: 1.5, borderColor: COLORS.inputBorder, borderRadius: 16, paddingVertical: 13, alignItems: 'center' },
  btnCancelText:   { color: COLORS.gray, fontSize: 14, fontWeight: '500' },
});
