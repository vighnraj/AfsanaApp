// Fallback Charts - Lightweight replacements for react-native-gifted-charts
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple Bar Chart
export const BarChart = ({
  data = [],
  barWidth = 24,
  spacing = 10,
  hideRules = false,
  roundedTop = false,
  roundedBottom = false,
  yAxisThickness = 0,
  xAxisThickness = 0,
  noOfSections = 4,
  yAxisTextStyle = {},
  xAxisLabelTextStyle = {},
}) => {
  const max = Math.max(1, ...data.map(d => d.value || 0));
  const chartHeight = 140;

  return (
    <View style={styles.barChartContainer}>
      <View style={styles.barChartBars}>
        {data.map((d, i) => {
          const barHeight = Math.max(4, (d.value / max) * chartHeight);
          return (
            <View key={i} style={[styles.barWrapper, { marginHorizontal: spacing / 2 }]}>
              <Text style={styles.barValue}>{d.value}</Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    width: barWidth,
                    backgroundColor: d.frontColor || d.color || '#6366F1',
                    borderTopLeftRadius: roundedTop ? 6 : 0,
                    borderTopRightRadius: roundedTop ? 6 : 0,
                    borderBottomLeftRadius: roundedBottom ? 6 : 0,
                    borderBottomRightRadius: roundedBottom ? 6 : 0,
                  }
                ]}
              />
              <Text style={[styles.barLabel, xAxisLabelTextStyle]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Simple Line Chart (displays as labeled data points)
export const LineChart = ({
  data = [],
  height = 160,
  color = '#6366F1',
  thickness = 2,
  dataPointsColor = '#4F46E5',
  curved = false,
  hideRules = false,
  yAxisThickness = 0,
  xAxisThickness = 0,
  yAxisTextStyle = {},
  xAxisLabelTextStyle = {},
}) => {
  const max = Math.max(1, ...data.map(d => d.value || 0));

  return (
    <View style={[styles.lineChartContainer, { height }]}>
      <View style={styles.lineChartPoints}>
        {data.map((d, i) => {
          const pointHeight = Math.max(8, (d.value / max) * (height - 40));
          return (
            <View key={i} style={styles.lineChartPoint}>
              <View style={styles.lineChartColumn}>
                <Text style={styles.lineChartValue}>{d.value}</Text>
                <View
                  style={[
                    styles.lineChartBar,
                    { height: pointHeight, backgroundColor: color }
                  ]}
                />
              </View>
              <Text style={[styles.lineChartLabel, xAxisLabelTextStyle]}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Enhanced Pie/Donut Chart
export const PieChart = ({
  data = [],
  radius = 70,
  innerRadius = 0,
  donut = false,
  centerLabelComponent,
  showText = false,
  textColor = '#333',
  textSize = 12,
}) => {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
  const outerSize = radius * 2;
  const innerSize = donut ? innerRadius * 2 : 0;

  // Calculate segments (simplified as colored rings for now)
  const segments = data.map((d, i) => ({
    ...d,
    percentage: ((d.value || 0) / total) * 100,
  }));

  return (
    <View style={[styles.pieChartContainer, { width: outerSize, height: outerSize }]}>
      {/* Outer ring with segments */}
      <View style={[styles.pieOuter, { width: outerSize, height: outerSize, borderRadius: radius }]}>
        {/* Simplified: show primary color with gradient effect */}
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.pieSegment,
              {
                position: 'absolute',
                width: outerSize,
                height: outerSize,
                borderRadius: radius,
                backgroundColor: seg.color || '#6366F1',
                opacity: 0.9 - (i * 0.15),
                transform: [{ rotate: `${i * (360 / segments.length)}deg` }],
              }
            ]}
          />
        ))}

        {/* Inner circle for donut effect */}
        {donut && innerRadius > 0 && (
          <View
            style={[
              styles.pieInner,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerRadius,
              }
            ]}
          >
            {centerLabelComponent ? centerLabelComponent() : null}
          </View>
        )}
      </View>

      {/* Legend below */}
      {showText && (
        <View style={styles.pieLegend}>
          {segments.map((seg, i) => (
            <View key={i} style={styles.pieLegendItem}>
              <View style={[styles.pieLegendDot, { backgroundColor: seg.color }]} />
              <Text style={[styles.pieLegendText, { color: textColor, fontSize: textSize }]}>
                {seg.text || seg.label}: {Math.round(seg.percentage)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Bar Chart Styles
  barChartContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  barChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },

  // Line Chart Styles
  lineChartContainer: {
    width: '100%',
    paddingHorizontal: 8,
    justifyContent: 'flex-end',
  },
  lineChartPoints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    flex: 1,
    paddingBottom: 24,
  },
  lineChartPoint: {
    alignItems: 'center',
  },
  lineChartColumn: {
    alignItems: 'center',
  },
  lineChartValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  lineChartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 8,
  },
  lineChartLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 9,
    color: '#888',
  },

  // Pie Chart Styles
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  pieSegment: {
    position: 'absolute',
  },
  pieInner: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieLegend: {
    marginTop: 12,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pieLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pieLegendText: {
    fontSize: 11,
  },
});

export default { BarChart, LineChart, PieChart };