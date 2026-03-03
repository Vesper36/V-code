'use client'

import Link from 'next/link'
import { BookOpen, Zap, Shield, Code, TrendingUp, Users } from 'lucide-react'

export default function DocsHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-6">
            <BookOpen size={48} className="text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4">V-CODE 文档中心</h1>
          <p className="text-xl text-muted-foreground mb-6">
            企业级 OpenAI 兼容 API 网关平台
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            统一接入多个上游 AI 模型，极简 API，极致性能，智能负载均衡，赋能您的 AI 应用开发。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/docs/beginner-tutorial"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              快速开始
            </Link>
            <Link
              href="/docs/api-reference"
              className="px-6 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              API 参考
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground mt-1">支持模型</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">服务可用性</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground mt-1">统一 API Key</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm text-primary font-medium mb-2">Core Features</div>
            <h2 className="text-3xl font-bold mb-4">为什么选择 V-CODE？</h2>
            <p className="text-muted-foreground">
              一站式 AI API 网关解决方案，让您轻松接入最强大的 AI 模型
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">OpenAI 兼容</h3>
              <p className="text-sm text-muted-foreground">
                完全兼容 OpenAI API 格式，无缝对接现有应用，零学习成本。
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">智能负载均衡</h3>
              <p className="text-sm text-muted-foreground">
                自动故障转移与智能路由，确保高并发下的服务稳定性与低延迟。
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">额度管理</h3>
              <p className="text-sm text-muted-foreground">
                灵活的总额度、日额度、月额度配置，精准控制 API 消耗。
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">多语言 SDK</h3>
              <p className="text-sm text-muted-foreground">
                支持 Python、Node.js、curl 等多种语言，开箱即用。
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">速率限制</h3>
              <p className="text-sm text-muted-foreground">
                RPM/TPM 双重限制，防止滥用，保护服务稳定性。
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">完善文档</h3>
              <p className="text-sm text-muted-foreground">
                从入门到进阶，覆盖所有使用场景的详细文档。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm text-primary font-medium mb-2">Documentation</div>
            <h2 className="text-3xl font-bold mb-4">快速导航</h2>
            <p className="text-muted-foreground">
              根据您的需求，选择合适的文档开始
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/docs/beginner-tutorial"
              className="p-6 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                入门指南
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                零基础入门教程、快速开始指南
              </p>
              <div className="text-sm text-primary">查看文档 →</div>
            </Link>

            <Link
              href="/docs/api-reference"
              className="p-6 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                API 文档
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                完整的 API 参考、SDK 示例、工具集成
              </p>
              <div className="text-sm text-primary">查看文档 →</div>
            </Link>

            <Link
              href="/docs/errors-troubleshooting"
              className="p-6 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                帮助中心
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                错误码排障、额度管理、常见问题
              </p>
              <div className="text-sm text-primary">查看文档 →</div>
            </Link>

            <Link
              href="/docs/streaming-best-practices"
              className="p-6 bg-background border rounded-lg hover:border-primary/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                进阶功能
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                流式输出、参数调优、安全最佳实践
              </p>
              <div className="text-sm text-primary">查看文档 →</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}