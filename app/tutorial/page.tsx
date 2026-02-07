'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/useI18n";
import { Badge } from "@/components/ui/badge";

export default function TutorialPage() {
  const t = useTranslation();

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            {t.tutorial.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.tutorial.subtitle}
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 lg:gap-10">
        <aside className="hidden md:block sticky top-20 self-start">
          <ScrollArea className="h-[calc(100vh-8rem)] py-6 pr-6 lg:py-8 glass rounded-xl border border-white/10">
            <div className="w-full space-y-6 px-4">
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Getting Started</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm text-muted-foreground">
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#introduction">Introduction</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#authentication">Authentication</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#quick-start">Quick Start</a>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-primary">API Reference</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm text-muted-foreground">
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#chat-completions">Chat Completions</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#models">Models</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:text-primary transition-colors" href="#images">Images</a>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="space-y-12">
          <section id="introduction" className="space-y-4">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">V-AI API</Badge>
                <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Introduction</h2>
            </div>
            <p className="leading-7 text-muted-foreground text-lg">
              V-AI provides a unified interface for accessing state-of-the-art AI models. 
              Our API is fully compatible with the OpenAI API standard, allowing you to use existing client libraries 
              and tools with minimal configuration changes.
            </p>
          </section>

          <section id="authentication" className="space-y-4">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Authentication</h2>
            <p className="leading-7 text-muted-foreground">
              All API requests require an API key. You can generate and manage your API keys in the 
              <a href="/keys" className="font-medium text-primary hover:underline mx-1">Keys</a> 
              section of this dashboard.
            </p>
            <Card className="glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-primary">Authorization Header</CardTitle>
                <CardDescription>Include this header in all your requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="relative rounded bg-muted/50 px-[0.5rem] py-[0.3rem] font-mono text-sm block w-full overflow-x-auto">
                  Authorization: Bearer sk-your-api-key
                </code>
              </CardContent>
            </Card>
          </section>

          <section id="quick-start" className="space-y-6">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Quick Start</h2>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="glass p-1">
                <TabsTrigger value="curl" className="data-[state=active]:bg-primary/20">cURL</TabsTrigger>
                <TabsTrigger value="python" className="data-[state=active]:bg-primary/20">Python</TabsTrigger>
                <TabsTrigger value="js" className="data-[state=active]:bg-primary/20">Node.js</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-4">
                <Card className="bg-zinc-950 dark:bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto p-4">
                      <code className="text-sm text-zinc-50 font-mono leading-relaxed">
{`curl https://api-cli.proxy.vesper36.cc/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="python" className="mt-4">
                 <Card className="bg-zinc-950 dark:bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto p-4">
                      <code className="text-sm text-zinc-50 font-mono leading-relaxed">
{`from openai import OpenAI

client = OpenAI(
    api_key="sk-...",
    base_url="https://api-cli.proxy.vesper36.cc/v1"
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="js" className="mt-4">
                 <Card className="bg-zinc-950 dark:bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto p-4">
                      <code className="text-sm text-zinc-50 font-mono leading-relaxed">
{`import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-...',
  baseURL: 'https://api-cli.proxy.vesper36.cc/v1',
});

const chatCompletion = await openai.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'gpt-3.5-turbo',
});

console.log(chatCompletion.choices[0].message.content);`}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
}
