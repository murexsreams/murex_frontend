import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { ArtistDashboard } from '../dashboard/ArtistDashboard';
import { InvestorDashboard } from '../dashboard/InvestorDashboard';

export const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();

  // Show appropriate dashboard based on user role
  if (user?.role === 'artist') {
    return <ArtistDashboard />;
  }

  return <InvestorDashboard />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});