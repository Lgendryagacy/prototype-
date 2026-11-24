import React, { useState } from 'react';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { sendPasswordReset } from '../firebase/services/authService';

// This is a demo component to test password reset functionality
// In a real app, you'd navigate to this with the actual reset code from Firebase email
export default function PasswordResetDemo() {
  const [email, setEmail] = useState('');
  const [testCode, setTestCode] = useState('');
  const [result, setResult] = useState<string>('');

  const handleSendReset = async () => {
    if (!email) {
      setResult('Please enter an email');
      return;
    }

    try {
      const response = await sendPasswordReset(email);
      if (response.success) {
        setResult(`SUCCESS: ${response.message}`);
      } else {
        setResult(`ERROR: ${response.error}`);
      }
    } catch (error) {
      setResult(`ERROR: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for password reset"
            />
          </div>
          
          <Button onClick={handleSendReset}>
            Send Password Reset Email
          </Button>
          
          <div className="mt-4">
            <p className="text-sm font-medium">Test Reset Password:</p>
            <p className="text-xs text-gray-600 mb-2">
              To test reset password, you'll need a real reset code from Firebase email.
              You can navigate to: /reset-password?oobCode=YOUR_RESET_CODE
            </p>
            <Button 
              onClick={() => window.open('/reset-password', '_blank')}
              variant="outline"
            >
              Open Reset Password Page
            </Button>
          </div>
          
          {result && (
            <div className={`p-3 rounded ${result.startsWith('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
