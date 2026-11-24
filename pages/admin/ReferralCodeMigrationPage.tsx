import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Play, 
  RefreshCw,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import {
  generateReferralCodesForExistingUsers,
  generateReferralCodeForSingleUser,
  verifyReferralCodes
} from '../../firebase/services/referralCodeMigration';
import toast from 'react-hot-toast';

interface MigrationResult {
  totalUsers: number;
  usersWithCodes: number;
  usersWithoutCodes: number;
  codesGenerated: number;
  errors: Array<{ userId: string; error: string }>;
}

interface VerificationReport {
  totalUsers: number;
  withCodes: number;
  withoutCodes: number;
  usersWithoutCodes: Array<{ id: string; email?: string; name?: string }>;
}

const ReferralCodeMigrationPage = () => {
  const [migrating, setMigrating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleMigration = async () => {
    if (!window.confirm(
      '⚠️ Are you sure you want to generate referral codes for all existing users?\n\n' +
      'This will:\n' +
      '- Scan all users in the database\n' +
      '- Generate unique referral codes for users without codes\n' +
      '- Update user documents with new codes\n\n' +
      'This action is safe to run multiple times (users with codes will be skipped).'
    )) {
      return;
    }

    try {
      setMigrating(true);
      setMigrationResult(null);
      toast.loading('Generating referral codes...', { id: 'migration' });

      const result = await generateReferralCodesForExistingUsers();
      
      setMigrationResult(result);
      
      if (result.errors.length === 0) {
        toast.success(
          `✅ Success! Generated ${result.codesGenerated} referral codes`,
          { id: 'migration', duration: 5000 }
        );
      } else {
        toast.error(
          `⚠️ Completed with ${result.errors.length} errors. Check console for details.`,
          { id: 'migration', duration: 5000 }
        );
      }

    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(
        `❌ Migration failed: ${error.message}`,
        { id: 'migration', duration: 5000 }
      );
    } finally {
      setMigrating(false);
    }
  };

  const handleVerification = async () => {
    try {
      setVerifying(true);
      setVerificationReport(null);
      toast.loading('Verifying referral codes...', { id: 'verify' });

      const report = await verifyReferralCodes();
      
      setVerificationReport(report);
      
      if (report.withoutCodes === 0) {
        toast.success(
          `✅ All ${report.totalUsers} users have referral codes!`,
          { id: 'verify', duration: 5000 }
        );
      } else {
        toast(
          `⚠️ ${report.withoutCodes} users still need referral codes`,
          { id: 'verify', duration: 5000, icon: '⚠️' }
        );
      }

    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(
        `❌ Verification failed: ${error.message}`,
        { id: 'verify', duration: 5000 }
      );
    } finally {
      setVerifying(false);
    }
  };

  const downloadReport = () => {
    const data = migrationResult || verificationReport;
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-code-${migrationResult ? 'migration' : 'verification'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[--color-bg-secondary] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[--color-text-primary] mb-2">
            Referral Code Migration Tool
          </h1>
          <p className="text-[--color-text-secondary]">
            Generate referral codes for all existing users who don't have one yet
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Admin Tool - Use with Caution
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This tool will update all user documents in Firestore. While it's safe to run multiple times 
                    (users with codes will be skipped), please verify the results after running.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {/* Verify Button */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span>1. Verify Current State</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[--color-text-secondary] mb-4">
                Check how many users currently have referral codes
              </p>
              <Button
                onClick={handleVerification}
                disabled={verifying}
                variant="outline"
                className="w-full"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Verify Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Migration Button */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-[--color-primary]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[--color-primary]" />
                <span>2. Run Migration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[--color-text-secondary] mb-4">
                Generate referral codes for all users without codes
              </p>
              <Button
                onClick={handleMigration}
                disabled={migrating}
                className="w-full"
              >
                {migrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Codes...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Migration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Report */}
        {verificationReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <span>Verification Report</span>
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[--color-bg-tertiary] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[--color-text-secondary]" />
                      <span className="text-sm text-[--color-text-secondary]">Total Users</span>
                    </div>
                    <p className="text-3xl font-bold text-[--color-text-primary]">
                      {verificationReport.totalUsers}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300">With Codes</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {verificationReport.withCodes}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {((verificationReport.withCodes / verificationReport.totalUsers) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-orange-700 dark:text-orange-300">Without Codes</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                      {verificationReport.withoutCodes}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {((verificationReport.withoutCodes / verificationReport.totalUsers) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {verificationReport.withoutCodes > 0 && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="mb-3"
                    >
                      {showDetails ? 'Hide' : 'Show'} Users Without Codes
                    </Button>

                    {showDetails && (
                      <div className="bg-[--color-bg-tertiary] rounded-lg p-4 max-h-64 overflow-y-auto">
                        <ul className="space-y-2">
                          {verificationReport.usersWithoutCodes.map((user, index) => (
                            <li key={user.id} className="text-sm text-[--color-text-secondary] flex items-center gap-2">
                              <span className="text-xs text-[--color-text-tertiary]">{index + 1}.</span>
                              <span>{user.email || user.name || user.id}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Migration Results */}
        {migrationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {migrationResult.errors.length === 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    <span>Migration Results</span>
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[--color-bg-tertiary] rounded-lg p-4">
                    <p className="text-sm text-[--color-text-secondary] mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-[--color-text-primary]">
                      {migrationResult.totalUsers}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Had Codes</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {migrationResult.usersWithCodes}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">Generated</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {migrationResult.codesGenerated}
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    migrationResult.errors.length > 0 
                      ? 'bg-red-50 dark:bg-red-900/10' 
                      : 'bg-gray-50 dark:bg-gray-900/10'
                  }`}>
                    <p className={`text-sm mb-1 ${
                      migrationResult.errors.length > 0 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>Errors</p>
                    <p className={`text-2xl font-bold ${
                      migrationResult.errors.length > 0 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {migrationResult.errors.length}
                    </p>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Errors ({migrationResult.errors.length})
                    </h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600 dark:text-red-400">
                          <span className="font-mono text-xs">User {error.userId}:</span> {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {migrationResult.errors.length === 0 && migrationResult.codesGenerated > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        Migration Successful!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        All users now have referral codes and can start referring others.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>How to Use This Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[--color-primary] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-[--color-text-primary] mb-1">Verify First</h4>
                  <p className="text-sm text-[--color-text-secondary]">
                    Click "Verify Now" to see how many users currently have referral codes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[--color-primary] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-[--color-text-primary] mb-1">Run Migration</h4>
                  <p className="text-sm text-[--color-text-secondary]">
                    Click "Start Migration" to generate referral codes for all users without codes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[--color-primary] text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-[--color-text-primary] mb-1">Verify Again</h4>
                  <p className="text-sm text-[--color-text-secondary]">
                    Run verification again to confirm all users now have referral codes
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Notes
                </h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>This tool is safe to run multiple times (users with codes will be skipped)</li>
                  <li>All existing referral codes will be preserved</li>
                  <li>The migration follows the same structure as new user signups</li>
                  <li>Generated codes are unique and use the same format (username_1234)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferralCodeMigrationPage;
