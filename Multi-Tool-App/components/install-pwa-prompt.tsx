"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function InstallPWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = () => setShowPrompt(true)
    window.addEventListener("showInstallPrompt", handler)
    return () => window.removeEventListener("showInstallPrompt", handler)
  }, [])

  const handleInstall = () => {
    if (typeof window.installPWA === "function") {
      window.installPWA()
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
      <p className="mb-2">Install Multi-Tool App for easy access!</p>
      <Button onClick={handleInstall}>Install</Button>
    </div>
  )
}

