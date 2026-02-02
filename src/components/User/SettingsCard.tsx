/* eslint-disable @typescript-eslint/no-explicit-any */
import { Copy, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { t } from "i18next"

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
      title: t("Common.success"),
      description: t("userProfile.messages.copied"),
      variant: "destructive",
    })
  }

  return (
    <>
      <Card className="border-0 shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>{t("userProfile.settings.title")}</CardTitle>
          <CardDescription>{t("userProfile.settings.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${profile.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-base">{t("userProfile.settings.twoFactor")}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-11">
                {profile.twoFactorEnabled
                  ? t("userProfile.settings.twoFactorEnabled")
                  : t("userProfile.settings.twoFactorDisabled")}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                {profile.twoFactorEnabled ? t("userProfile.settings.status.enabled") : t("userProfile.settings.status.disabled")}
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
                  {twoFALoading ? t("Common.loading") : t("userProfile.actions.enable2fa")}
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
            <DialogTitle>{t("userProfile.settings.setup.title")}</DialogTitle>
            <DialogDescription>
              {t("userProfile.settings.setup.instruction")}
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
                  <Label>{t("userProfile.settings.setup.manual")}</Label>
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
                  <Label>{t("userProfile.settings.setup.enterCode")}</Label>
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
                    {twoFALoading ? t("userProfile.actions.verifying") : t("userProfile.actions.setup2fa")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onShow2FADialog(false)}
                    disabled={twoFALoading}
                  >
                    {t("userProfile.actions.cancel")}
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
            <DialogTitle>{t("userProfile.settings.disable.title")}</DialogTitle>
            <DialogDescription>
              {t("userProfile.settings.disable.instruction")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("userProfile.settings.disable.verificationCode")}</Label>
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
                {twoFALoading ? t("userProfile.actions.disabling") : t("userProfile.actions.disable")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onShowDisable2FADialog(false)}
                disabled={twoFALoading}
              >
                {t("userProfile.actions.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
