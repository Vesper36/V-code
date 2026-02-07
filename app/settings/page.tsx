'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, Trash2, Download } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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
    const data = {
      keys: localStorage.getItem('api_keys') || '[]',
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-keys-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理您的偏好设置和数据
        </p>
      </div>

      {/* 主题设置 */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">外观</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            选择您喜欢的主题模式
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Sun className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">浅色</div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Moon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">深色</div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">跟随系统</div>
          </button>
        </div>
      </Card>

      {/* 数据管理 */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">数据管理</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            导出或清除您的本地数据
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <Label className="font-medium">导出数据</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                下载所有 API Keys 的备份文件
              </p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <div>
              <Label className="font-medium text-red-600 dark:text-red-400">
                清除所有数据
              </Label>
              <p className="text-sm text-red-600 dark:text-red-400">
                删除所有本地存储的 API Keys 和设置
              </p>
            </div>
            <Button
              onClick={handleClearData}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showClearConfirm ? '确认清除？' : '清除数据'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 关于 */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">关于</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>版本</span>
            <span className="font-mono">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>构建时间</span>
            <span>{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex justify-between">
            <span>技术栈</span>
            <span>Next.js 16 + React 19</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
