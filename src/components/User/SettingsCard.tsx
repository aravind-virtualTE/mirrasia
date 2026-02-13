/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { Copy, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [backupCodesSaved, setBackupCodesSaved] = useState(false)
  const hasBackupCodes = (twoFASetup?.backupCodes?.length || 0) > 0

  useEffect(() => {
    if (show2FADialog) {
      setBackupCodesSaved(false)
    }
  }, [show2FADialog, twoFASetup?.secret])

  const copyToClipboard = async (text: string, successMessage?: string) => {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API unavailable")
      }
      await navigator.clipboard.writeText(text)
      toast({
        title: t("Common.success"),
        description: successMessage || t("userProfile.messages.copied"),
      })
    } catch (error) {
      console.error("Clipboard copy failed:", error)
      toast({
        title: t("error"),
        description: t("userProfile.messages.copyError"),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card className="border-0 shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>{t("userProfile.settings.title")}</CardTitle>
          <CardDescription>{t("userProfile.settings.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold">
              {t("userProfile.settings.help.title")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("userProfile.settings.help.description")}
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>{t("userProfile.settings.help.step1")}</li>
              <li>{t("userProfile.settings.help.step2")}</li>
              <li>{t("userProfile.settings.help.step3")}</li>
              <li>{t("userProfile.settings.help.step4")}</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("userProfile.settings.help.apps")}
            </p>
          </div>
          <div className="flex flex-col gap-4 p-4 border rounded-xl bg-card hover:bg-accent/5 transition-colors sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${profile.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-base">{t("userProfile.settings.twoFactor")}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-11">
                {profile.twoFactorEnabled
                  ? t("userProfile.messages.twoFactorEnabled")
                  : t("userProfile.messages.twoFactorDisabled")}
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"} className="w-fit">
                {profile.twoFactorEnabled ? t("userProfile.settings.status.enabled") : t("userProfile.settings.status.disabled")}
              </Badge>
              {profile.twoFactorEnabled ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onShowDisable2FADialog(true)}
                  disabled={twoFALoading}
                  className="w-full sm:w-auto"
                >
                  {t("userProfile.actions.disable")}
                </Button>
              ) : (
                <Button
                  onClick={onEnable2FA}
                  disabled={twoFALoading}
                  size="sm"
                  className="w-full sm:w-auto"
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
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p>{t("userProfile.settings.setup.step1")}</p>
                  <p>{t("userProfile.settings.setup.step2")}</p>
                  <p>{t("userProfile.settings.setup.step3")}</p>
                </div>
                <div className="flex justify-center">
                  <img
                    src={twoFASetup.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("userProfile.settings.setup.manual")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={twoFASetup.secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(twoFASetup.secret)}
                      aria-label={t("userProfile.actions.copySecret")}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {hasBackupCodes && (
                  <div className="space-y-3 rounded-md border p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Label>{t("userProfile.settings.setup.backupCodes")}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            twoFASetup.backupCodes.join("\n"),
                            t("userProfile.messages.backupCodesCopied")
                          )
                        }
                        aria-label={t("userProfile.actions.copyBackupCodes")}
                        className="w-full sm:w-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {twoFASetup.backupCodes.map((code, index) => (
                        <code
                          key={`${code}-${index}`}
                          className="rounded border bg-muted/50 px-2 py-1 text-xs text-center font-mono"
                        >
                          {code}
                        </code>
                      ))}
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="backup-codes-saved"
                        checked={backupCodesSaved}
                        onCheckedChange={(checked) => setBackupCodesSaved(checked === true)}
                      />
                      <Label
                        htmlFor="backup-codes-saved"
                        className="text-xs text-muted-foreground leading-5 cursor-pointer"
                      >
                        {t("userProfile.settings.setup.backupCodesConfirm")}
                      </Label>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="two-fa-verify-code">{t("userProfile.settings.setup.enterCode")}</Label>
                  <Input
                    id="two-fa-verify-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => onVerificationCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    aria-describedby="two-fa-verify-hint"
                  />
                  <p id="two-fa-verify-hint" className="text-xs text-muted-foreground">
                    {t("userProfile.settings.setup.codeHint")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={onVerify2FA}
                    disabled={
                      twoFALoading ||
                      verificationCode.length !== 6 ||
                      (hasBackupCodes && !backupCodesSaved)
                    }
                    className="w-full sm:flex-1"
                  >
                    {twoFALoading ? t("userProfile.actions.verifying") : t("userProfile.actions.setup2fa")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onShow2FADialog(false)}
                    disabled={twoFALoading}
                    className="w-full sm:w-auto"
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
              <Label htmlFor="two-fa-disable-code">{t("userProfile.settings.disable.verificationCode")}</Label>
              <Input
                id="two-fa-disable-code"
                placeholder="000000"
                value={disableCode}
                onChange={(e) => onDisableCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                aria-describedby="two-fa-disable-hint"
              />
              <p id="two-fa-disable-hint" className="text-xs text-muted-foreground">
                {t("userProfile.settings.disable.codeHint")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="destructive"
                onClick={onDisable2FA}
                disabled={twoFALoading || disableCode.length !== 6}
                className="w-full sm:flex-1"
              >
                {twoFALoading ? t("userProfile.actions.disabling") : t("userProfile.actions.disable")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onShowDisable2FADialog(false)}
                disabled={twoFALoading}
                className="w-full sm:w-auto"
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
