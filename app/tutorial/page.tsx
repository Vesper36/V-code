import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function TutorialPage() {
  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete guide to integrating and using the V-AI API.
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 lg:gap-10">
        <aside className="hidden md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium">Getting Started</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm text-muted-foreground">
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline text-foreground font-medium" href="#introduction">Introduction</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline" href="#authentication">Authentication</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline" href="#quick-start">Quick Start</a>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">API Reference</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm text-muted-foreground">
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline" href="#chat-completions">Chat Completions</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline" href="#models">Models</a>
                  <a className="group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline" href="#images">Images</a>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="space-y-8">
          <section id="introduction" className="space-y-4">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Introduction</h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              V-AI provides a unified interface for accessing state-of-the-art AI models. 
              Our API is fully compatible with the OpenAI API standard, allowing you to use existing client libraries 
              and tools with minimal configuration changes.
            </p>
          </section>

          <section id="authentication" className="space-y-4">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Authentication</h2>
            <p className="leading-7">
              All API requests require an API key. You can generate and manage your API keys in the 
              <a href="/keys" className="font-medium text-primary hover:underline mx-1">Keys</a> 
              section of this dashboard.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Authorization Header</CardTitle>
                <CardDescription>Include this header in all your requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  Authorization: Bearer sk-your-api-key
                </code>
              </CardContent>
            </Card>
          </section>

          <section id="quick-start" className="space-y-4">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">Quick Start</h2>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="js">Node.js</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto rounded-lg bg-black p-4">
                      <code className="text-sm text-white">
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
                 <Card>
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto rounded-lg bg-black p-4">
                      <code className="text-sm text-white">
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
                 <Card>
                  <CardContent className="pt-4">
                    <pre className="overflow-x-auto rounded-lg bg-black p-4">
                      <code className="text-sm text-white">
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