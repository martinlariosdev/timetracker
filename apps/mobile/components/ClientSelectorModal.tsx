import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { CLIENTS_QUERY } from '@/lib/graphql/queries';

interface Client {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface ClientSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: { id: string; name: string }) => void;
  selectedClientId?: string;
}

export function ClientSelectorModal({
  visible,
  onClose,
  onSelect,
  selectedClientId,
}: ClientSelectorModalProps) {
  const [search, setSearch] = useState('');
  const { data, loading, error } = useAuthenticatedQuery(CLIENTS_QUERY, {
    skip: !visible,
  });

  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    const clients = data.clients as Client[];
    if (!search.trim()) return clients;

    const searchLower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.toLowerCase().includes(searchLower),
    );
  }, [data, search]);

  const handleSelect = (client: Client) => {
    onSelect({ id: client.id, name: client.name });
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4"
          style={{
            height: 56,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={{ width: 44, height: 44 }}
            className="items-center justify-center"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-h4 font-semibold text-gray-900">
            Select Client
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Search */}
        <View className="px-4 py-3">
          <View
            className="flex-row items-center bg-gray-100 rounded-lg px-3"
            style={{ height: 44 }}
          >
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or code..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-base text-gray-900"
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Search clients"
            />
          </View>
        </View>

        {/* Client List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-body text-gray-500 mt-3">
              Loading clients...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-body text-gray-700 mt-3 text-center">
              Failed to load clients. Please try again.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center mt-12 px-6">
                <Ionicons
                  name="search-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-body text-gray-500 mt-3 text-center">
                  {search
                    ? `No clients matching "${search}"`
                    : 'No clients available'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedClientId === item.id;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between px-4"
                  style={{
                    height: 60,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  }}
                  accessibilityLabel={`${item.name}, code ${item.code}${isSelected ? ', selected' : ''}`}
                  accessibilityRole="button"
                >
                  <View className="flex-1">
                    <Text
                      className={`text-body font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-caption text-gray-500 mt-0.5">
                      {item.code}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={22} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
