import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../auth/login';

describe('LoginPage', () => {

  // beforeEach akan berjalan sebelum setiap 'it' block, me-reset mock
  beforeEach(() => {
    // Membersihkan catatan panggilan dari tes sebelumnya
    jest.clearAllMocks();
  });


  it('should navigate to home screen on successful login', async () => {

    render(<LoginScreen />);


  });
});
