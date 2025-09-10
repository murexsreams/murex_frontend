import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Filter, X, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TrackFilters } from '../../store/tracksStore';
import { Button } from '../ui/Button';

interface FilterBarProps {
  filters: TrackFilters;
  onFiltersChange: (filters: Partial<TrackFilters>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  visible: boolean;
  onToggleVisibility: () => void;
}

const GENRES = [
  'All',
  'Electronic',
  'Hip-Hop',
  'Indie Pop',
  'Rock',
  'Jazz',
  'Classical',
  'R&B',
  'Country',
  'Folk',
];

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'roi', label: 'Highest ROI' },
  { value: 'funding', label: 'Most Funded' },
];

const FUNDING_STATUS_OPTIONS = [
  { value: 'all', label: 'All Tracks' },
  { value: 'active', label: 'Active Funding' },
  { value: 'completed', label: 'Fully Funded' },
];

const ROI_RANGES = [
  { min: 0, max: 100, label: 'All ROI' },
  { min: 0, max: 10, label: '0-10%' },
  { min: 10, max: 20, label: '10-20%' },
  { min: 20, max: 30, label: '20-30%' },
  { min: 30, max: 100, label: '30%+' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  visible,
  onToggleVisibility,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof TrackFilters];
    return value !== undefined && value !== '' && value !== 'all';
  });

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.genre && filters.genre !== 'All') count++;
    if (filters.sortBy) count++;
    if (filters.fundingStatus && filters.fundingStatus !== 'all') count++;
    if (filters.minROI !== undefined || filters.maxROI !== undefined) count++;
    return count;
  };

  const handleGenreSelect = (genre: string) => {
    onFiltersChange({ genre: genre === 'All' ? undefined : genre });
  };

  const handleSortSelect = (sortBy: string) => {
    onFiltersChange({ sortBy: sortBy as TrackFilters['sortBy'] });
  };

  const handleFundingStatusSelect = (status: string) => {
    onFiltersChange({ 
      fundingStatus: status === 'all' ? undefined : status as TrackFilters['fundingStatus'] 
    });
  };

  const handleROIRangeSelect = (range: { min: number; max: number }) => {
    if (range.min === 0 && range.max === 100) {
      onFiltersChange({ minROI: undefined, maxROI: undefined });
    } else {
      onFiltersChange({ 
        minROI: range.min, 
        maxROI: range.max === 100 ? undefined : range.max 
      });
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters();
    setShowModal(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setShowModal(false);
  };

  const renderQuickFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickFilters}
    >
      {/* Genre Pills */}
      {GENRES.slice(0, 5).map((genre) => {
        const isSelected = filters.genre === genre || (genre === 'All' && !filters.genre);
        return (
          <TouchableOpacity
            key={genre}
            style={[
              styles.filterPill,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              }
            ]}
            onPress={() => handleGenreSelect(genre)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: isSelected ? colors.background : colors.text }
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {/* More Filters Button */}
      <TouchableOpacity
        style={[
          styles.filterPill,
          styles.moreFiltersButton,
          {
            backgroundColor: hasActiveFilters ? colors.primary + '20' : colors.surface,
            borderColor: hasActiveFilters ? colors.primary : colors.border,
          }
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Filter size={16} color={hasActiveFilters ? colors.primary : colors.text} />
        <Text
          style={[
            styles.filterPillText,
            { color: hasActiveFilters ? colors.primary : colors.text }
          ]}
        >
          More
        </Text>
        {hasActiveFilters && (
          <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.filterBadgeText, { color: colors.background }]}>
              {getActiveFilterCount()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal Header */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Genre Section */}
          <View style={styles.filterSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Genre</Text>
            <View style={styles.optionsGrid}>
              {GENRES.map((genre) => {
                const isSelected = filters.genre === genre || (genre === 'All' && !filters.genre);
                return (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => handleGenreSelect(genre)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.background : colors.text }
                      ]}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sort By Section */}
          <View style={styles.filterSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
            <View style={styles.optionsColumn}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = filters.sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => handleSortSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionRowText,
                        { color: isSelected ? colors.primary : colors.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Funding Status Section */}
          <View style={styles.filterSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Funding Status</Text>
            <View style={styles.optionsColumn}>
              {FUNDING_STATUS_OPTIONS.map((option) => {
                const isSelected = filters.fundingStatus === option.value || 
                  (option.value === 'all' && !filters.fundingStatus);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => handleFundingStatusSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionRowText,
                        { color: isSelected ? colors.primary : colors.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ROI Range Section */}
          <View style={styles.filterSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expected ROI</Text>
            <View style={styles.optionsColumn}>
              {ROI_RANGES.map((range, index) => {
                const isSelected = 
                  (range.min === 0 && range.max === 100 && !filters.minROI && !filters.maxROI) ||
                  (filters.minROI === range.min && 
                   (filters.maxROI === range.max || (range.max === 100 && !filters.maxROI)));
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => handleROIRangeSelect(range)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionRowText,
                        { color: isSelected ? colors.primary : colors.text }
                      ]}
                    >
                      {range.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Modal Footer */}
        <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
          <Button
            title="Clear All"
            onPress={handleClearFilters}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Apply Filters"
            onPress={handleApplyFilters}
            variant="primary"
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {renderQuickFilters()}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  quickFilters: {
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsColumn: {
    gap: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionRowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});