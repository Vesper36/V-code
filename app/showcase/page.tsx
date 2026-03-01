'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Zap, Shield, Globe, Clock, Code, Server,
  ArrowRight, Sparkles, Brain, Image, MessageSquare,
} from 'lucide-react';

const features = [
  { icon: Globe, title: '多模型聚合', desc: '统一接口访问 OpenAI、Anthropic、Google、Meta 等主流 AI 模型' },
  { icon: Zap, title: '高性能转发', desc: '智能负载均衡，自动故障切换，保障服务高可用' },
  { icon: Shield, title: '安全可靠', desc: 'API Key 本地存储，请求加密传输，无数据留存' },
  { icon: Clock, title: '低延迟响应', desc: '全球节点加速，毫秒级转发延迟' },
  { icon: Code, title: 'OpenAI 兼容', desc: '完全兼容 OpenAI API 格式，零成本迁移' },
  { icon: Server, title: '自托管部署', desc: '支持 Docker 一键部署，完全掌控数据主权' },
];

const modelGroups = [
  { vendor: 'OpenAI', models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4-Turbo', 'o1', 'o1-mini', 'DALL-E 3'], color: 'text-green-500' },
  { vendor: 'Anthropic', models: ['Claude 4 Opus', 'Claude 4 Sonnet', 'Claude 3.5 Haiku'], color: 'text-orange-500' },
  { vendor: 'Google', models: ['Gemini 2.5 Pro', 'Gemini 2.0 Flash', 'Gemini 1.5 Pro'], color: 'text-blue-500' },
  { vendor: 'Meta', models: ['Llama 3.1 405B', 'Llama 3.1 70B', 'Llama 3.1 8B'], color: 'text-purple-500' },
];

const apiCapabilities = [
  { icon: MessageSquare, label: '对话补全', desc: 'Chat Completions API' },
  { icon: Brain, label: '文本嵌入', desc: 'Embeddings API' },
  { icon: Image, label: '图像生成', desc: 'Image Generation API' },
  { icon: Code, label: '代码生成', desc: 'Code Completion' },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ModelsSection />
      <CapabilitiesSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="container relative mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>OpenAI 兼容 API 网关</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-primary">V-CODE</span>
          <br />
          <span className="text-muted-foreground text-2xl sm:text-3xl lg:text-4xl font-normal mt-2 block">
            统一接口，聚合全球 AI 模型
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          一个 API Key，访问 OpenAI、Claude、Gemini、Llama 等主流模型。
          完全兼容 OpenAI 格式，零成本迁移，支持自托管部署。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/tutorial">
            <Button size="lg" className="gap-2">
              快速开始 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="outline">查看文档</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">核心特性</h2>
          <p className="mt-2 text-muted-foreground">为开发者打造的 AI 模型网关</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-6 glass hover:border-primary/30 transition-colors">
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ModelsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">支持模型</h2>
          <p className="mt-2 text-muted-foreground">持续接入全球主流 AI 模型</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modelGroups.map((g) => (
            <Card key={g.vendor} className="p-6 glass">
              <h3 className={`text-lg font-bold mb-3 ${g.color}`}>{g.vendor}</h3>
              <ul className="space-y-1.5">
                {g.models.map((m) => (
                  <li key={m} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">API 能力</h2>
          <p className="mt-2 text-muted-foreground">覆盖主流 AI 应用场景</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {apiCapabilities.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} className="p-6 glass text-center">
                <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-1">{c.label}</h3>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">定价方案</h2>
          <p className="mt-2 text-muted-foreground">按量计费，用多少付多少</p>
        </div>
        <div className="max-w-md mx-auto">
          <Card className="p-8 glass border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">按量付费</h3>
              <p className="text-muted-foreground mb-6">无月费，无最低消费</p>
              <ul className="text-left space-y-3 mb-8">
                {[
                  '与官方定价一致，无额外加价',
                  '支持所有已接入模型',
                  '实时用量统计与余额查询',
                  '不限速率（受上游限制）',
                  '7x24 服务可用',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button className="w-full">开始使用</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          只需一个 API Key，即可开始使用全球主流 AI 模型。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/tutorial">
            <Button size="lg" className="gap-2">
              查看教程 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/models">
            <Button size="lg" variant="outline">浏览模型</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
