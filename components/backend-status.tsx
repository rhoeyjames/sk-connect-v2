"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Server } from "lucide-react"
import apiClient from "@/lib/api"

export default function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [error, setError] = useState<string>("")

  const checkBackendStatus = async () => {
    setStatus("checking")
    setError("")
    
    try {
      await apiClient.healthCheck()
      setStatus("connected")
      setLastCheck(new Date())
    } catch (error: any) {
      setStatus("disconnected")
      setError(error.message || "Failed to connect to backend")
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>
      case "connected":
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">API Server</span>
          </div>
          {getStatusBadge()}
        </div>

        {status === "disconnected" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Backend server is not available"}
            </AlertDescription>
          </Alert>
        )}

        {status === "connected" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Backend API is running on {process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sk-connect-backend-production.up.railway.app'}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={checkBackendStatus}
            disabled={status === "checking"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {lastCheck && (
            <span className="text-xs text-muted-foreground">
              Last check: {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        {status === "disconnected" && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p><strong>To start the backend:</strong></p>
            <code className="block bg-muted p-2 rounded text-xs">
              cd backend && npm run dev
            </code>
            <p>Or use the npm script:</p>
            <code className="block bg-muted p-2 rounded text-xs">
              npm run backend
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
