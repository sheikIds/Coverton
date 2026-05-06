import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ViewQuotationCardShimmer = () => {
  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.row}>
        <ShimmerPlaceHolder
          style={styles.circle}
          LinearGradient={LinearGradient}
        />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <ShimmerPlaceHolder
            style={styles.smallLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.mediumLine, { marginTop: 6 }]}
            LinearGradient={LinearGradient}
          />
        </View>
        <ShimmerPlaceHolder
          style={styles.statusPill}
          LinearGradient={LinearGradient}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Info Grid Row 1 */}
      <View style={styles.gridRow}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.smallLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.mediumLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>

      {/* Info Grid Row 2 */}
      <View style={[styles.gridRow, { marginTop: 10 }]}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.smallLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.smallLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>

      {/* Footer — Amounts */}
      <View style={styles.footerRow}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.smallLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ShimmerPlaceHolder
            style={styles.tinyLine}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={[styles.amountLine, { marginTop: 4 }]}
            LinearGradient={LinearGradient}
          />
        </View>
        <ShimmerPlaceHolder
          style={styles.chevron}
          LinearGradient={LinearGradient}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  tinyLine: {
    width: 60,
    height: 8,
    borderRadius: 4,
  },
  smallLine: {
    width: 90,
    height: 10,
    borderRadius: 4,
  },
  mediumLine: {
    width: 140,
    height: 12,
    borderRadius: 4,
  },
  amountLine: {
    width: 110,
    height: 14,
    borderRadius: 4,
  },
  statusPill: {
    width: 70,
    height: 22,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  gridRow: {
    flexDirection: 'row',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  chevron: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});

export default ViewQuotationCardShimmer;
