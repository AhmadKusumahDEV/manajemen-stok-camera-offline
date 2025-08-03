import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';

type ToastProps = {
  message: string;
  visible: boolean;
  type: 'success' | 'error';
  onHide: () => void;
};

const ToastNotification = ({ message, visible, type, onHide }: ToastProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) {
    return null;
  }

  const isSuccess = type === 'success';
  const backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
  const iconText = isSuccess ? '✓' : '✗';

  return (
    <Animated.View style={[styles.toastContainer, { backgroundColor, opacity: fadeAnim }]}>
      <Text style={styles.toastIcon}>{iconText}</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 9999,
      },
      toastIcon: {
        color: 'white',
        fontSize: 16,
        marginRight: 10,
      },
      toastText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
      },
});

export default ToastNotification;
