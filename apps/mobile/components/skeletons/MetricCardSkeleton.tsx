import React from 'react';
import { View } from 'react-native';

export function MetricCardSkeleton() {
  return (
    <View
      className="rounded-xl p-3 mr-3"
      style={{
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <View style={{ width: 60, height: 11, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 4 }} />
      <View style={{ width: 80, height: 28, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, marginBottom: 4 }} />
      <View style={{ width: 50, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
    </View>
  );
}
