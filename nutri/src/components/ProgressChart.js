import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

/**
 * ProgressChart Component
 * Displays user's health progress tracking with interactive charts and insights
 * Features:
 * - Weight, BMI, and Obesity Risk tracking
 * - Interactive line charts
 * - Progress insights and interpretations
 * - Real-time data updates
 */
const ProgressChart = () => {
  // State management for progress tracking
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  
  // Fetch progress data from Supabase on component mount
  useEffect(() => {
    fetchProgressData();
  }, []);

  // Fetch user's progress tracking data from Supabase
  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format data for chart visualization
  const formatChartData = (metric) => {
    let data;
    if (metric === 'obesity_risk') {
      // Convert obesity risk levels to numeric values for visualization
      const riskLevels = {
        'Insufficient_Weight': 1,
        'Normal_Weight': 2,
        'Overweight_Level_I': 3,
        'Overweight_Level_II': 4,
        'Obesity_Type_I': 5,
        'Obesity_Type_II': 6,
        'Obesity_Type_III': 7
      };
      data = progressData.map(entry => riskLevels[entry[metric]] || 0);
    } else {
      data = progressData.map(entry => entry[metric]);
    }

    // Format dates for x-axis labels
    const labels = progressData.map(entry => {
      const date = new Date(entry.created_at);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(102, 205, 126, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };
  
  // Get appropriate y-axis label based on selected metric
  const getYAxisLabel = () => {
    switch (selectedMetric) {
      case 'weight':
        return 'Weight (kg)';
      case 'bmi':
        return 'BMI';
      case 'obesity_risk':
        return 'Risk Level';
      default:
        return '';
    }
  };
  
  // Calculate insights from the latest progress data
  const getInsights = () => {
    if (progressData.length < 2) return null;

    const latest = progressData[progressData.length - 1];
    const previous = progressData[progressData.length - 2];
    
    const insights = [];
    
    // Calculate weight changes
    const weightDiff = latest.weight - previous.weight;
    insights.push({
      metric: 'Weight',
      change: Math.abs(weightDiff).toFixed(1),
      direction: weightDiff > 0 ? 'increased' : 'decreased',
      unit: 'kg'
    });

    // Calculate BMI changes
    const bmiDiff = latest.bmi - previous.bmi;
    insights.push({
      metric: 'BMI',
      change: Math.abs(bmiDiff).toFixed(1),
      direction: bmiDiff > 0 ? 'increased' : 'decreased',
      unit: 'points'
    });

    // Track risk level changes
    if (latest.obesity_risk !== previous.obesity_risk) {
      insights.push({
        metric: 'Risk Level',
        change: 'changed',
        direction: 'to',
        unit: latest.obesity_risk
      });
    }

    return insights;
  };

    // Get metric-specific information and interpretations
  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'weight':
        return {
          title: 'Weight Progress',
          description: 'Track your weight changes over time. The graph shows your weight in kilograms.',
          icon: 'scale-outline',
          interpretation: progressData.length > 1 ? 
            `Your weight has ${progressData[progressData.length - 1].weight > progressData[progressData.length - 2].weight ? 'increased' : 'decreased'} since your last measurement.` :
            'Start tracking to see your weight progress.'
        };
      case 'bmi':
        return {
          title: 'BMI Tracking',
          description: 'Body Mass Index (BMI) helps assess your body composition. Normal range is 18.5-24.9.',
          icon: 'body-outline',
          interpretation: getBMIInterpretation(progressData[progressData.length - 1]?.bmi)
        };
      case 'obesity_risk':
        return {
          title: 'Risk Level Changes',
          description: 'Monitor how your obesity risk level changes with your health journey.',
          icon: 'fitness-outline',
          interpretation: getRiskInterpretation(progressData[progressData.length - 1]?.obesity_risk)
        };
      default:
        return {};
    }
  };
  
  // Interpret BMI values and provide feedback
  const getBMIInterpretation = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'You are currently underweight. Consider consulting a nutritionist.';
    if (bmi < 25) return 'You are in the healthy weight range. Keep up the good work!';
    if (bmi < 30) return 'You are in the overweight range. Consider increasing physical activity.';
    return 'You are in the obese range. Consider consulting a healthcare professional.';
  };

  // Interpret risk levels and provide feedback
  const getRiskInterpretation = (risk) => {
    if (!risk) return '';
    return `Your current risk level is ${risk.replace(/_/g, ' ')}. ${
      risk.includes('Normal') ? 
      'Keep maintaining your healthy lifestyle!' : 
      'Consider following the recommended diet and exercise plan.'
    }`;
  };

  const metricInfo = getMetricInfo();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading progress data...</Text>
      </View>
    );
  }

  const insights = getInsights();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      
      {progressData.length > 0 ? (
        <>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedMetric === 'weight' && styles.filterButtonActive]}
              onPress={() => setSelectedMetric('weight')}
            >
              <Ionicons name="scale-outline" size={20} color={selectedMetric === 'weight' ? '#ffffff' : '#666666'} />
              <Text style={[styles.filterButtonText, selectedMetric === 'weight' && styles.filterButtonTextActive]}>
                Weight
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedMetric === 'bmi' && styles.filterButtonActive]}
              onPress={() => setSelectedMetric('bmi')}
            >
              <Ionicons name="body-outline" size={20} color={selectedMetric === 'bmi' ? '#ffffff' : '#666666'} />
              <Text style={[styles.filterButtonText, selectedMetric === 'bmi' && styles.filterButtonTextActive]}>
                BMI
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedMetric === 'obesity_risk' && styles.filterButtonActive]}
              onPress={() => setSelectedMetric('obesity_risk')}
            >
              <Ionicons name="fitness-outline" size={20} color={selectedMetric === 'obesity_risk' ? '#ffffff' : '#666666'} />
              <Text style={[styles.filterButtonText, selectedMetric === 'obesity_risk' && styles.filterButtonTextActive]}>
                Risk Level
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricInfoContainer}>
            <View style={styles.metricHeaderContainer}>
              <Ionicons name={metricInfo.icon} size={24} color="#2c3e50" />
              <Text style={styles.metricTitle}>{metricInfo.title}</Text>
            </View>
            <Text style={styles.metricDescription}>{metricInfo.description}</Text>
          </View>

          <View style={styles.chartContainer}>
            <LineChart
              data={formatChartData(selectedMetric)}
              width={Dimensions.get('window').width - 70}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: selectedMetric === 'obesity_risk' ? 0 : 1,
                color: (opacity = 1) => `rgba(102, 205, 126, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#66cd7e'
                }
              }}
              bezier
              style={styles.chart}
              yAxisLabel={selectedMetric === 'weight' ? ' kg' : ''}
              yAxisSuffix={selectedMetric === 'bmi' ? ' BMI' : ''}
            />
          </View>

          <View style={styles.interpretationContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#2c3e50" />
            <Text style={styles.interpretationText}>{metricInfo.interpretation}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Current Weight</Text>
              <Text style={styles.statValue}>
                {progressData[progressData.length - 1].weight} kg
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Current BMI</Text>
              <Text style={styles.statValue}>
                {progressData[progressData.length - 1].bmi}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Risk Level</Text>
              <Text style={styles.statValue}>
                {progressData[progressData.length - 1].obesity_risk}
              </Text>
            </View>
          </View>

          {insights && insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>Recent Changes</Text>
              {insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightText}>
                    Your {insight.metric} has {insight.direction} by{' '}
                    {insight.change} {insight.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noDataText}>
          No progress data available yet. Complete your first assessment to start tracking!
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edffdd',
  },
  title: {
    fontSize: rf(2.5),
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    // paddingHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 120,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#66cd7e',
  },
  filterButtonText: {
    fontSize: rf(1.6),
    color: '#666666',
    marginLeft: 5,
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    // paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: rf(1.45),
    color: '#666666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: rf(1.8),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  insightsContainer: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 50,
    // borderLeftWidth: 4,
    // borderLeftColor: '#66cd7e',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: rf(2),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#66cd7e',
  },
  insightText: {
    fontSize: rf(1.6),
    color: '#2c3e50',
    lineHeight: 22,
  },
  noDataText: {
    fontSize: rf(1.8),
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  metricInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#66cd7e',
  },
  metricHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: rf(2),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  metricDescription: {
    fontSize: rf(1.6),
    color: '#666666',
    lineHeight: 20,
  },
  interpretationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  interpretationText: {
    fontSize: rf(1.6),
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});

export default ProgressChart; 
