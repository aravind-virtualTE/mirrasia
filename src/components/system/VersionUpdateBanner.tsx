import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type VersionManifest = {
  version?: string
}

const POLL_INTERVAL_MS = 60_000
const CURRENT_VERSION = __APP_VERSION__

export default function VersionUpdateBanner() {
  const { t } = useTranslation()
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const isCheckingRef = useRef(false)

  const checkForUpdate = useCallback(async () => {
    if (!import.meta.env.PROD || isUpdateAvailable || isCheckingRef.current) {
      return
    }

    isCheckingRef.current = true
    try {
      const versionUrl = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`
      const response = await fetch(versionUrl, {
        cache: "no-store",
      })
      if (!response.ok) return

      const data = (await response.json()) as VersionManifest
      const serverVersion = typeof data.version === "string" ? data.version.trim() : ""

      if (serverVersion && serverVersion !== CURRENT_VERSION) {
        setIsUpdateAvailable(true)
      }
    } catch {
      // no-op
    } finally {
      isCheckingRef.current = false
    }
  }, [isUpdateAvailable])

  useEffect(() => {
    if (!import.meta.env.PROD || isUpdateAvailable) {
      return
    }

    void checkForUpdate()

    const intervalId = window.setInterval(() => {
      void checkForUpdate()
    }, POLL_INTERVAL_MS)

    const handleFocus = () => {
      void checkForUpdate()
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [checkForUpdate, isUpdateAvailable])

  if (!isUpdateAvailable) return null

  return (
    <div className="fixed left-1/2 top-3 z-[120] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2">
      <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-900/90 dark:text-amber-50">
        <AlertTitle>{t("appUpdate.title", "New version available")}</AlertTitle>
        <AlertDescription className="mt-2 flex items-center justify-between gap-3">
          <span>{t("appUpdate.description", "Please refresh the page for the latest version.")}</span>
          <Button size="sm" onClick={() => window.location.reload()}>
            {t("appUpdate.refreshNow", "Refresh")}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
