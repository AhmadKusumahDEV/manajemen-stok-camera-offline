import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SizeStepperProps } from '../../types/type';

const IconPlaceholder = ({ name, style }: { name: string, style?: object }) => (
    <Text style={[stepperStyles.iconPlaceholder, style]}>{`${name}`}</Text>
);


export const SizeStepper = ({ entry, onQuantityChange }: SizeStepperProps) => {
    const handleDecrement = () => {
        if (entry.quantity > 0) {
            onQuantityChange(entry.sizeId, entry.quantity - 1);
        }
    };

    const handleIncrement = () => {
        onQuantityChange(entry.sizeId, entry.quantity + 1);
    };

    const handleTextChange = (text: string) => {
        const num = parseInt(text, 10);
        onQuantityChange(entry.sizeId, isNaN(num) ? 0 : num);
    };

    return (
        <View style={stepperStyles.stepperRow}>
            <Text style={stepperStyles.stepperLabel}>Size: {entry.sizeName}</Text>
            <View style={stepperStyles.stepperControls}>
                <TouchableOpacity onPress={handleDecrement} style={stepperStyles.stepperButton}>
                    <IconPlaceholder name="-" />
                </TouchableOpacity>
                <TextInput
                    style={stepperStyles.stepperInput}
                    value={String(entry.quantity)}
                    onChangeText={handleTextChange}
                    keyboardType="number-pad"
                    textAlign="center"
                />
                <TouchableOpacity onPress={handleIncrement} style={stepperStyles.stepperButton}>
                    <IconPlaceholder name="+" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// StyleSheet khusus untuk SizeStepper
const stepperStyles = StyleSheet.create({
    stepperRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    stepperLabel: {
        fontSize: 16,
        color: '#333',
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E9F5FF',
        borderRadius: 18,
    },
    stepperInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginHorizontal: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    iconPlaceholder: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
