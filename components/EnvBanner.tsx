"use client"
import React, { useEffect, useState } from "react"

export default function EnvBanner() {
  const [label, setLabel] = useState<string | null>(null)
  const [color, setColor] = useState<string>("#ff8800")

  useEffect(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : ""

    let resolvedLabel: string | null = null
    let resolvedColor = "#ff8800"

    // Only show banner for local dev and Vercel deployments.
    // Do NOT indicate "mock" status here — user requested no mock notification.
    if (host.includes("localhost") || host === "127.0.0.1") {
      resolvedLabel = "Local"
      resolvedColor = "#ff8800"
    } else if (host.endsWith(".vercel.app") || host.includes("vercel.app")) {
      const isPreview = host.split(".")[0].includes("-") || host.split(".")[0].includes("preview")
      resolvedLabel = isPreview ? "Vercel Preview" : "Vercel"
      resolvedColor = "#7b61ff"
    } else {
      // Custom domains / production: do not show banner to avoid confusing end users
      resolvedLabel = null
    }

    setLabel(resolvedLabel)
    setColor(resolvedColor)

    if (resolvedLabel) {
      const prev = document.body.style.paddingTop
      document.body.style.paddingTop = "28px"
      return () => {
        document.body.style.paddingTop = prev
      }
    }
    return
  }, [])

  if (!label) return null

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        height: 28,
        background: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        zIndex: 9999,
        boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
      }}
      aria-hidden={false}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
  )
}
