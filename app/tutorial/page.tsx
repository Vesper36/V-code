'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KeyRound, BarChart3, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function TutorialPage() {
  const steps = [
    {
      icon: KeyRound,
      title: '1. 添加 API Key',
      description: '在 Keys 页面点击"添加 Key"按钮，输入您的 API Key 和自定义名称。',
      tips: ['支持添加多个 Key', 'Key 会安全存储在本地浏览器', '可以随时删除或编辑']
    },
    {
      icon: BarChart3,
      title: '2. 查看数据统计',
      description: '在 Dashboard 页面查看所有 Key 的使用情况、余额和调用统计。',
      tips: ['实时更新数据', '支持多维度图表展示', '可以查看历史趋势']
    },
    {
      icon: Settings,
      title: '3. 管理和监控',
      description: '监控每个 Key 的限额使用情况，及时了解余额和调用次数。',
      tips: ['限额接近时会有警告提示', '支持查看详细的 Token 消耗', '可以导出数据报表']
    }
  ]

  const faqs = [
    {
      question: 'API Key 存储在哪里？',
      answer: 'API Key 安全存储在您的浏览器本地存储中，不会上传到任何服务器。'
    },
    {
      question: '如何获取 API Key？',
      answer: '请联系管理员获取您的专属 API Key。'
    },
    {
      question: '数据多久更新一次？',
      answer: '数据每 5 分钟自动刷新一次，您也可以手动点击刷新按钮。'
    },
    {
      question: '支持哪些模型？',
      answer: '支持所有 New API 中转的模型，包括 GPT-4、GPT-3.5、Claude 等。'
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">使用教程</h1>
        <p className="text-gray-600 dark:text-gray-400">
          快速上手 API Key Dashboard
        </p>
      </div>

      {/* 步骤指南 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">快速开始</h2>
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-500">
                    {step.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <HelpCircle className="w-6 h-6" />
          常见问题
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 快捷操作 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">准备好开始了吗？</h3>
            <p className="text-gray-600 dark:text-gray-400">
              立即添加您的第一个 API Key
            </p>
          </div>
          <Link href="/keys">
            <Button size="lg">
              前往 Keys 页面
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
