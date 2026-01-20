/* eslint-disable @typescript-eslint/no-explicit-any */
import { Smartphone, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface SettingsCardProps {
  profile: any
  show2FADialog: boolean
  showDisable2FADialog: boolean
  twoFASetup: {
    qrCode: string
    secret: string
    backupCodes: string[]
  } | null
  verificationCode: string
  disableCode: string
  twoFALoading: boolean
  onEnable2FA: () => void
  onVerify2FA: () => void
  onDisable2FA: () => void
  onShow2FADialog: (show: boolean) => void
  onShowDisable2FADialog: (show: boolean) => void
  onVerificationCodeChange: (code: string) => void
  onDisableCodeChange: (code: string) => void
}

export function SettingsCard({
  profile,
  show2FADialog,
  showDisable2FADialog,
  twoFASetup,
  verificationCode,
  disableCode,
  twoFALoading,
  onEnable2FA,
  onVerify2FA,
  onDisable2FA,
  onShow2FADialog,
  onShowDisable2FADialog,
  onVerificationCodeChange,
  onDisableCodeChange,
}: SettingsCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Success",
      description: "Copied to clipboard!",
      variant: "destructive",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and two-factor authentication</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              {profile.twoFactorEnabled ? (
                <div className="space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onShowDisable2FADialog(true)}
                    disabled={twoFALoading}
                  >
                    Disable
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onEnable2FA}
                  disabled={twoFALoading}
                  size="sm"
                >
                  {twoFALoading ? "Setting up..." : "Enable 2FA"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={onShow2FADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFASetup && (
              <>
                <div className="flex justify-center">
                  <img
                    src={twoFASetup.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Or enter this code manually:</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={twoFASetup.secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(twoFASetup.secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Enter verification code from your app:</Label>
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => onVerificationCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={onVerify2FA}
                    disabled={twoFALoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {twoFALoading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onShow2FADialog(false)}
                    disabled={twoFALoading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={onShowDisable2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter a verification code from your authenticator app to disable 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code:</Label>
              <Input
                placeholder="000000"
                value={disableCode}
                onChange={(e) => onDisableCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={onDisable2FA}
                disabled={twoFALoading || disableCode.length !== 6}
                className="flex-1"
              >
                {twoFALoading ? "Disabling..." : "Disable 2FA"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onShowDisable2FADialog(false)}
                disabled={twoFALoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
