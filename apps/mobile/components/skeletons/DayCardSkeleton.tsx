import React from 'react';
import { View } from 'react-native';

export function DayCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-level-1" style={{ minHeight: 96 }}>
      <View className="flex-row items-center justify-between">
        <View style={{ width: 120, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
        <View style={{ width: 60, height: 20, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
      </View>
      <View className="my-3" style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
      <View style={{ width: '100%', height: 60, backgroundColor: '#F3F4F6', borderRadius: 8 }} />
    </View>
  );
}

export function DayCardSkeletonList({ count = 7 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DayCardSkeleton key={i} />
      ))}
    </>
  );
}
