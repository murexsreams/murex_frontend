// Crash reporting and error monitoring service
interface ErrorReport {
  id: string;
  type: 'react_error' | 'unhandled_promise' | 'global_error' | 'manual_error';
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userId?: string | null;
  userAgent?: string;
  url?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
  breadcrumbs?: Breadcrumb[];
}

interface Breadcrumb {
  timestamp: string;
  message: string;
  category: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

class CrashReportingService {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private isEnabled = true;
  private userId: string | null = null;

  // Initialize the service
  init(config: { userId?: string; enabled?: boolean } = {}) {
    this.userId = config.userId || null;
    this.isEnabled = config.enabled !== false;
    
    if (this.isEnabled) {
      this.setupGlobalHandlers();
      this.addBreadcrumb('Crash reporting initialized', 'system', 'info');
    }
  }

  // Enable/disable crash reporting
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.addBreadcrumb('Crash reporting enabled', 'system', 'info');
    }
  }

  // Set user context
  setUser(userId: string | null) {
    this.userId = userId;
    this.addBreadcrumb(`User context set: ${userId}`, 'auth', 'info');
  }

  // Add breadcrumb for debugging context
  addBreadcrumb(
    message: string,
    category: string = 'general',
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      message,
      category,
      level,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  // Report error manually
  reportError(
    error: Error | string,
    context?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    tags?: Record<string, string>
  ) {
    if (!this.isEnabled) return;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      id: this.generateErrorId(),
      type: 'manual_error',
      message: errorObj.message,
      stack: errorObj.stack,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      context,
      severity,
      tags,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.sendReport(report);
    this.addBreadcrumb(`Error reported: ${errorObj.message}`, 'error', 'error');
  }

  // Report React component error
  reportReactError(error: Error, errorInfo: any, severity: 'high' | 'critical' = 'high') {
    if (!this.isEnabled) return;

    const report: ErrorReport = {
      id: this.generateErrorId(),
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      severity,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.sendReport(report);
    this.addBreadcrumb(`React error: ${error.message}`, 'react', 'error');
  }

  // Report performance metrics
  reportPerformance(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      id: this.generateErrorId(),
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
    };

    this.sendPerformanceMetric(metric);
  }

  // Set up global error handlers
  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const report: ErrorReport = {
          id: this.generateErrorId(),
          type: 'unhandled_promise',
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          timestamp: new Date().toISOString(),
          userId: this.userId,
          severity: 'high',
          breadcrumbs: [...this.breadcrumbs],
        };
        this.sendReport(report);
        this.addBreadcrumb('Unhandled promise rejection', 'promise', 'error');
      });

      // Handle global JavaScript errors
      window.addEventListener('error', (event) => {
        const report: ErrorReport = {
          id: this.generateErrorId(),
          type: 'global_error',
          message: event.message,
          stack: event.error?.stack,
          timestamp: new Date().toISOString(),
          userId: this.userId,
          url: event.filename,
          severity: 'high',
          breadcrumbs: [...this.breadcrumbs],
        };
        this.sendReport(report);
        this.addBreadcrumb(`Global error: ${event.message}`, 'javascript', 'error');
      });
    }
  }

  // Send error report to backend
  private async sendReport(report: ErrorReport) {
    try {
      if (__DEV__) {
        console.group('🚨 Crash Report');
        console.error('Error Report:', report);
        console.groupEnd();
        return;
      }

      // In production, send to your crash reporting service
      const response = await fetch('/api/crash-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        console.error('Failed to send crash report:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending crash report:', error);
    }
  }

  // Send performance metric to backend
  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      if (__DEV__) {
        console.log('📊 Performance Metric:', metric);
        return;
      }

      // In production, send to your performance monitoring service
      const response = await fetch('/api/performance-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });

      if (!response.ok) {
        console.error('Failed to send performance metric:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending performance metric:', error);
    }
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Get current breadcrumbs
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  // Clear breadcrumbs
  clearBreadcrumbs() {
    this.breadcrumbs = [];
    this.addBreadcrumb('Breadcrumbs cleared', 'system', 'info');
  }
}

// Create singleton instance
export const crashReporting = new CrashReportingService();

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      crashReporting.reportPerformance(`render_${componentName}`, renderTime, 'ms', {
        component: componentName,
      });
    };
  },

  // Measure API call time
  measureApiCall: (endpoint: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const apiTime = endTime - startTime;
      crashReporting.reportPerformance(`api_${endpoint}`, apiTime, 'ms', {
        endpoint,
      });
    };
  },

  // Monitor memory usage
  monitorMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      crashReporting.reportPerformance('memory_used', memory.usedJSHeapSize, 'bytes');
      crashReporting.reportPerformance('memory_total', memory.totalJSHeapSize, 'bytes');
      crashReporting.reportPerformance('memory_limit', memory.jsHeapSizeLimit, 'bytes');
    }
  },
};

export default {
  crashReporting,
  performanceMonitor,
};