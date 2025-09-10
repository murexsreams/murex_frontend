import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Modal,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { performanceMonitor, memoryUtils, PerformanceMetrics } from '../../utils/performance';
import { imageCacheManager, imagePerformanceMonitor } from '../../utils/imageOptimization';

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  visible,
  onClose,
}) => {
  const { colors, spacing } = useTheme();
  const [isMonitoring, setIsMonitoring] = useState(__DEV__);
  const [metrics, setMetrics] = useState<Map<string, PerformanceMetrics>>(new Map());
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    setMetrics(new Map(performanceMonitor.getMetrics()));
    setMemoryInfo(memoryUtils.getMemoryInfo());
    setCacheStats(imageCacheManager.getCacheStats());
  }, []);

  useEffect(() => {
    if (visible && isMonitoring) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 1000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [visible, isMonitoring, updateMetrics]);

  const toggleMonitoring = useCallback(() => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    performanceMonitor.setEnabled(newState);
  }, [isMonitoring]);

  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
    updateMetrics();
  }, [updateMetrics]);

  const clearImageCache = useCallback(() => {
    imageCacheManager.clearCache();
    updateMetrics();
  }, [updateMetrics]);

  const forceGC = useCallback(() => {
    memoryUtils.forceGC();
    setTimeout(updateMetrics, 100);
  }, [updateMetrics]);

  const generateReport = useCallback(() => {
    const report = performanceMonitor.generateReport();
    const imageReport = imagePerformanceMonitor.generateImageReport();
    
    console.log('Performance Report:', report);
    console.log('Image Performance Report:', imageReport);
    
    // In a real app, you might want to share or export this report
    alert('Performance report generated. Check console for details.');
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold) return colors.success;
    if (value <= threshold * 1.5) return '#FFA500'; // Orange
    return colors.error;
  };

  const renderMetricCard = (title: string, value: string, color?: string) => (
    <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <Text style={[styles.metricValue, { color: color || colors.text }]}>
        {value}
      </Text>
    </View>
  );

  const renderPerformanceMetrics = () => {
    const metricsArray = Array.from(metrics.entries());
    
    if (metricsArray.length === 0) {
      return (
        <Text style={[styles.noData, { color: colors.textSecondary }]}>
          No performance data available
        </Text>
      );
    }

    return metricsArray.map(([id, metric]) => (
      <View key={id} style={[styles.metricRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.metricId, { color: colors.text }]} numberOfLines={1}>
          {id}
        </Text>
        <View style={styles.metricValues}>
          <Text style={[styles.metricTime, { 
            color: getPerformanceColor(metric.renderTime, 16) 
          }]}>
            {formatTime(metric.renderTime)}
          </Text>
          {metric.memoryUsage && (
            <Text style={[styles.metricMemory, { color: colors.textSecondary }]}>
              {formatBytes(metric.memoryUsage)}
            </Text>
          )}
        </View>
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Performance Dashboard
          </Text>
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Monitoring Controls */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Monitoring
            </Text>
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
                Enable Performance Monitoring
              </Text>
              <Switch
                value={isMonitoring}
                onValueChange={toggleMonitoring}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
          </View>

          {/* Memory Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Memory Usage
            </Text>
            <View style={styles.metricsGrid}>
              {memoryInfo ? (
                <>
                  {renderMetricCard(
                    'Used Memory',
                    formatBytes(memoryInfo.used),
                    getPerformanceColor(memoryInfo.used, 50 * 1024 * 1024)
                  )}
                  {renderMetricCard(
                    'Total Memory',
                    formatBytes(memoryInfo.total)
                  )}
                  {renderMetricCard(
                    'Memory Limit',
                    formatBytes(memoryInfo.limit)
                  )}
                  {renderMetricCard(
                    'Usage %',
                    `${((memoryInfo.used / memoryInfo.total) * 100).toFixed(1)}%`,
                    getPerformanceColor((memoryInfo.used / memoryInfo.total) * 100, 70)
                  )}
                </>
              ) : (
                <Text style={[styles.noData, { color: colors.textSecondary }]}>
                  Memory information not available
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={forceGC}
            >
              <Text style={styles.actionButtonText}>Force Garbage Collection</Text>
            </Pressable>
          </View>

          {/* Image Cache Statistics */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Image Cache
            </Text>
            <View style={styles.metricsGrid}>
              {cacheStats ? (
                <>
                  {renderMetricCard(
                    'Cached Images',
                    cacheStats.entryCount.toString()
                  )}
                  {renderMetricCard(
                    'Cache Size',
                    formatBytes(cacheStats.totalSize),
                    getPerformanceColor(cacheStats.totalSize, 30 * 1024 * 1024)
                  )}
                  {renderMetricCard(
                    'Average Size',
                    formatBytes(cacheStats.averageSize)
                  )}
                  {renderMetricCard(
                    'Oldest Entry',
                    cacheStats.oldestEntry > 0 
                      ? `${Math.round((Date.now() - cacheStats.oldestEntry) / 1000 / 60)}m ago`
                      : 'N/A'
                  )}
                </>
              ) : (
                <Text style={[styles.noData, { color: colors.textSecondary }]}>
                  No cache data available
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={clearImageCache}
            >
              <Text style={styles.actionButtonText}>Clear Image Cache</Text>
            </Pressable>
          </View>

          {/* Performance Metrics */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Performance Metrics
              </Text>
              <Pressable
                style={[styles.smallButton, { backgroundColor: colors.textSecondary }]}
                onPress={clearMetrics}
              >
                <Text style={styles.smallButtonText}>Clear</Text>
              </Pressable>
            </View>
            <View style={styles.metricsContainer}>
              {renderPerformanceMetrics()}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Actions
            </Text>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={generateReport}
            >
              <Text style={styles.actionButtonText}>Generate Performance Report</Text>
            </Pressable>
          </View>

          {/* Performance Tips */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Performance Tips
            </Text>
            <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • Keep render times under 16ms for 60fps
              </Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • Monitor memory usage to prevent crashes
              </Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • Use virtualized lists for large datasets
              </Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • Optimize images and enable caching
              </Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                • Debounce user interactions
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlLabel: {
    fontSize: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  metricCard: {
    width: '48%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    maxHeight: 300,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  metricId: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTime: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  metricMemory: {
    fontSize: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 4,
  },
});