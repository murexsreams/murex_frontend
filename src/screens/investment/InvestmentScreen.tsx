import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useTheme';
import { InvestmentModal } from '../../components/investment/InvestmentModal';
import { RootStackParamList } from '../../navigation/AppNavigator';

type InvestmentScreenRouteProp = RouteProp<RootStackParamList, 'Investment'>;
type InvestmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Investment'>;

export const InvestmentScreen: React.FC = () => {
  const route = useRoute<InvestmentScreenRouteProp>();
  const navigation = useNavigation<InvestmentScreenNavigationProp>();
  const { colors } = useTheme();
  
  const { trackId } = route.params;

  // Mock track data - in a real app, this would come from a store or API
  const mockTrack = {
    id: trackId,
    title: 'Sample Track',
    artist: 'Sample Artist',
    coverArt: 'https://via.placeholder.com/300',
    fundingGoal: 10000,
    currentFunding: 3500,
    expectedROI: 15.5,
    minimumInvestment: 100,
    totalShares: 1000,
    availableShares: 650,
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleInvest = (amount: number, shares: number) => {
    // Handle investment logic here
    console.log('Investment:', { amount, shares, trackId });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <InvestmentModal
        visible={true}
        onClose={handleClose}
        track={mockTrack}
        onInvest={handleInvest}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});