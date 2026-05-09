import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import { getProgressHistory } from "../lib/supabaseUtils";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

export default function ProgressHistoryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    loadProgressHistory();
  }, []);

  const loadProgressHistory = async () => {
    try {
      setLoading(true);
      const data = await getProgressHistory();
      setProgressData(data || []);
    } catch (error) {
      console.log("Error loading progress history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const labels = progressData.map((item) => formatDateLabel(item.date));

  const bmiValues = progressData.map((item) => Number(item.bmi || 0));

  const weightValues = progressData.map((item) => Number(item.weight || 0));

  const latestProgress = progressData[progressData.length - 1];

  const firstProgress = progressData[0];

  const weightChange =
    latestProgress && firstProgress
      ? Number(latestProgress.weight || 0) - Number(firstProgress.weight || 0)
      : 0;

  const bmiChange =
    latestProgress && firstProgress
      ? Number(latestProgress.bmi || 0) - Number(firstProgress.bmi || 0)
      : 0;

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(41, 196, 57, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#29c439",
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "rgba(0, 0, 0, 0.08)",
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#29c439" />
        <Text style={styles.loadingText}>Đang tải lịch sử tiến trình...</Text>
      </View>
    );
  }

  if (progressData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Chưa có dữ liệu tiến trình</Text>
        <Text style={styles.emptyText}>
          Hãy thực hiện dự đoán BMI để hệ thống lưu lịch sử cân nặng và BMI.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>Health Progress</Text>
          <Text style={styles.screenSubtitle}>
            Theo dõi BMI, cân nặng và nguy cơ béo phì theo thời gian
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>BMI hiện tại</Text>
          <Text style={styles.summaryValue}>
            {Number(latestProgress?.bmi || 0).toFixed(1)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Cân nặng</Text>
          <Text style={styles.summaryValue}>
            {Number(latestProgress?.weight || 0).toFixed(1)} kg
          </Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Thay đổi BMI</Text>
          <Text
            style={[
              styles.summaryValue,
              bmiChange > 0 ? styles.warningText : styles.goodText,
            ]}
          >
            {bmiChange >= 0 ? "+" : ""}
            {bmiChange.toFixed(1)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Thay đổi cân nặng</Text>
          <Text
            style={[
              styles.summaryValue,
              weightChange > 0 ? styles.warningText : styles.goodText,
            ]}
          >
            {weightChange >= 0 ? "+" : ""}
            {weightChange.toFixed(1)} kg
          </Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>BMI theo thời gian</Text>

        <LineChart
          data={{
            labels,
            datasets: [{ data: bmiValues }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          fromZero={false}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Cân nặng theo thời gian</Text>

        <LineChart
          data={{
            labels,
            datasets: [{ data: weightValues }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
          }}
          bezier
          fromZero={false}
          style={styles.chart}
        />
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.chartTitle}>Lịch sử gần đây</Text>

        {progressData
          .slice()
          .reverse()
          .map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyDate}>
                  {new Date(item.date).toLocaleDateString("vi-VN")}
                </Text>
                <Text style={styles.historyRisk}>
                  {item.obesity_risk || "No risk data"}
                </Text>
              </View>

              <View style={styles.historyValues}>
                <Text style={styles.historyValue}>
                  BMI {Number(item.bmi || 0).toFixed(1)}
                </Text>
                <Text style={styles.historyValue}>
                  {Number(item.weight || 0).toFixed(1)} kg
                </Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
    padding: 20,
  },
  screenTitle: {
    fontSize: rf(3),
    fontWeight: "bold",
    color: "#222",
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: rf(1.7),
    color: "#666",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#edffdd",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: rf(1.8),
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#edffdd",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: rf(2.3),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: rf(1.7),
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: rf(1.5),
    color: "#666",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: rf(2.4),
    fontWeight: "bold",
    color: "#333",
  },
  goodText: {
    color: "#29c439",
  },
  warningText: {
    color: "#FF6B6B",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: rf(2),
    fontWeight: "bold",
    color: "#333",
    marginLeft: 16,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyDate: {
    fontSize: rf(1.7),
    fontWeight: "600",
    color: "#333",
  },
  historyRisk: {
    fontSize: rf(1.5),
    color: "#666",
    marginTop: 4,
  },
  historyValues: {
    alignItems: "flex-end",
  },
  historyValue: {
    fontSize: rf(1.5),
    color: "#444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },
});
