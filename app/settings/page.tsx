'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Trash2, Download, Languages, Bell, Database } from 'lucide-react'
import { useState } from 'react'
import { useTranslation, useI18n } from '@/lib/i18n/useI18n'
import { useStore } from '@/lib/store/useStore'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const t = useTranslation()
  const { setLanguage, language } = useI18n()
  const { updateSettings } = useStore()

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLanguage(lang)
    updateSettings({ language: lang })
  }

  const handleClearData = () => {
    if (showClearConfirm) {
      localStorage.clear()
      window.location.href = '/login'
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  const handleExportData = () => {
    const storeData = localStorage.getItem('v-code-storage');
    let keysData = '[]';
    if (storeData) {
      try {
        const parsed = JSON.parse(storeData);
        keysData = JSON.stringify(parsed.state?.keys || []);
      } catch {
        keysData = '[]';
      }
    }
    const data = {
      keys: keysData,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `v-code-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card className="p-6 space-y-4 glass">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t.settings.appearance}</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <Sun className="w-6 h-6" />
              <div className="text-sm font-medium">Light</div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <Moon className="w-6 h-6" />
              <div className="text-sm font-medium">Dark</div>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <Monitor className="w-6 h-6" />
              <div className="text-sm font-medium">System</div>
            </button>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6 space-y-4 glass">
           <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t.settings.language}</h2>
          </div>
          <div className="flex gap-4">
            <Button 
                variant={language === 'zh' ? 'default' : 'outline'} 
                onClick={() => handleLanguageChange('zh')}
                className="flex-1"
            >
                中文
            </Button>
            <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                onClick={() => handleLanguageChange('en')}
                className="flex-1"
            >
                English
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {/* Data Management */}
          <Card className="p-6 space-y-6 glass">
            <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{t.settings.data}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a backup of your API keys
                  </p>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-destructive">{t.settings.clearData}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.clearDataDesc}
                  </p>
                </div>
                <Button
                  onClick={handleClearData}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {showClearConfirm ? 'Confirm?' : 'Clear'}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* About */}
          <Card className="p-6 space-y-6 glass">
             <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{t.settings.about}</h2>
            </div>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">{t.settings.version}</span>
                    <span className="font-mono font-medium">v1.2.0</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Build</span>
                    <span>2026-02-07</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Stack</span>
                    <span>Next.js 16 • React 19 • Tailwind 4</span>
                </div>
            </div>
          </Card>
      </div>
    </div>
  )
}
