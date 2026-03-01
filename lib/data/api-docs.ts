export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  response?: string;
}

export interface ApiModule {
  name: string;
  desc: string;
  endpoints: ApiEndpoint[];
}

export const apiModules: ApiModule[] = [
  {
    name: '用户管理',
    desc: '管理平台用户账户',
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/',
        summary: '获取用户列表（分页）',
        params: [
          { name: 'p', type: 'number', required: false, desc: '页码（从 0 开始）' },
          { name: 'size', type: 'number', required: false, desc: '每页数量，默认 20' },
        ],
        response: '{ "success": true, "data": { "items": [...], "total": 100 } }',
      },
      {
        method: 'GET',
        path: '/api/user/search',
        summary: '搜索用户',
        params: [
          { name: 'keyword', type: 'string', required: true, desc: '搜索关键词' },
        ],
      },
      {
        method: 'PUT',
        path: '/api/user/',
        summary: '更新用户信息（额度/分组）',
        params: [
          { name: 'id', type: 'number', required: true, desc: '用户 ID' },
          { name: 'quota', type: 'number', required: false, desc: '新额度' },
          { name: 'group', type: 'string', required: false, desc: '用户分组' },
        ],
      },
      {
        method: 'POST',
        path: '/api/user/manage',
        summary: '管理用户状态',
        params: [
          { name: 'id', type: 'number', required: true, desc: '用户 ID' },
          { name: 'status', type: 'number', required: true, desc: '1=启用, 2=禁用' },
          { name: 'action', type: 'string', required: true, desc: '操作类型: status' },
        ],
      },
    ],
  },
  {
    name: '密钥管理',
    desc: '管理 API 令牌/密钥',
    endpoints: [
      {
        method: 'GET',
        path: '/api/token/',
        summary: '获取令牌列表（分页）',
        params: [
          { name: 'p', type: 'number', required: false, desc: '页码（从 0 开始）' },
          { name: 'size', type: 'number', required: false, desc: '每页数量' },
        ],
      },
      {
        method: 'POST',
        path: '/api/token/',
        summary: '创建新令牌',
        params: [
          { name: 'name', type: 'string', required: true, desc: '令牌名称' },
          { name: 'remain_quota', type: 'number', required: false, desc: '初始额度' },
          { name: 'unlimited_quota', type: 'boolean', required: false, desc: '是否无限额度' },
          { name: 'expired_time', type: 'number', required: false, desc: '过期时间戳' },
          { name: 'models', type: 'string[]', required: false, desc: '允许的模型列表' },
        ],
        response: '{ "success": true, "data": { "key": "sk-..." } }',
      },
      {
        method: 'PUT',
        path: '/api/token/',
        summary: '更新令牌配置',
        params: [
          { name: 'id', type: 'number', required: true, desc: '令牌 ID' },
          { name: 'status', type: 'number', required: false, desc: '1=启用, 2=禁用' },
        ],
      },
      {
        method: 'DELETE',
        path: '/api/token/{id}/',
        summary: '删除令牌',
        params: [
          { name: 'id', type: 'number', required: true, desc: '令牌 ID（路径参数）' },
        ],
      },
    ],
  },
  {
    name: '渠道管理',
    desc: '管理上游 API 渠道',
    endpoints: [
      {
        method: 'GET',
        path: '/api/channel/',
        summary: '获取渠道列表（分页）',
        params: [
          { name: 'p', type: 'number', required: false, desc: '页码' },
          { name: 'size', type: 'number', required: false, desc: '每页数量' },
        ],
      },
      {
        method: 'POST',
        path: '/api/channel/',
        summary: '创建渠道',
        params: [
          { name: 'name', type: 'string', required: true, desc: '渠道名称' },
          { name: 'type', type: 'number', required: true, desc: '渠道类型 (1=OpenAI, 14=Anthropic, 24=Gemini...)' },
          { name: 'key', type: 'string', required: true, desc: 'API 密钥' },
          { name: 'base_url', type: 'string', required: false, desc: '自定义基础 URL' },
          { name: 'models', type: 'string', required: true, desc: '支持的模型（逗号分隔）' },
          { name: 'model_mapping', type: 'string', required: false, desc: '模型映射 JSON' },
          { name: 'priority', type: 'number', required: false, desc: '优先级' },
          { name: 'weight', type: 'number', required: false, desc: '权重' },
        ],
      },
      {
        method: 'PUT',
        path: '/api/channel/',
        summary: '更新渠道配置',
        params: [
          { name: 'id', type: 'number', required: true, desc: '渠道 ID' },
          { name: 'status', type: 'number', required: false, desc: '1=启用, 2=禁用' },
          { name: 'model_mapping', type: 'string', required: false, desc: '模型映射 JSON' },
        ],
      },
      {
        method: 'DELETE',
        path: '/api/channel/{id}/',
        summary: '删除渠道',
      },
      {
        method: 'GET',
        path: '/api/channel/test/{id}',
        summary: '测试渠道连通性',
        params: [
          { name: 'model', type: 'string', required: true, desc: '测试用模型名' },
        ],
        response: '{ "success": true, "time": 1234 }',
      },
    ],
  },
  {
    name: '模型管理',
    desc: '查询可用模型',
    endpoints: [
      {
        method: 'GET',
        path: '/v1/models',
        summary: '获取所有可用模型列表（OpenAI 兼容）',
        response: '{ "object": "list", "data": [{ "id": "gpt-4o", "object": "model" }] }',
      },
    ],
  },
  {
    name: '日志查询',
    desc: '查询系统使用日志',
    endpoints: [
      {
        method: 'GET',
        path: '/api/log/',
        summary: '获取日志列表（分页）',
        params: [
          { name: 'p', type: 'number', required: false, desc: '页码' },
          { name: 'size', type: 'number', required: false, desc: '每页数量' },
        ],
      },
      {
        method: 'GET',
        path: '/api/log/search',
        summary: '搜索日志',
        params: [
          { name: 'keyword', type: 'string', required: false, desc: '关键词' },
          { name: 'token_name', type: 'string', required: false, desc: '令牌名称' },
          { name: 'model_name', type: 'string', required: false, desc: '模型名称' },
          { name: 'start_timestamp', type: 'number', required: false, desc: '开始时间戳' },
          { name: 'end_timestamp', type: 'number', required: false, desc: '结束时间戳' },
        ],
      },
      {
        method: 'GET',
        path: '/api/log/self',
        summary: '获取当前用户日志',
        params: [
          { name: 'page', type: 'number', required: false, desc: '页码（从 1 开始）' },
          { name: 'per_page', type: 'number', required: false, desc: '每页数量' },
        ],
      },
    ],
  },
  {
    name: '系统配置',
    desc: '管理系统全局设置',
    endpoints: [
      {
        method: 'GET',
        path: '/api/option/',
        summary: '获取所有系统配置',
        response: '{ "success": true, "data": { "key": "value", ... } }',
      },
      {
        method: 'PUT',
        path: '/api/option/',
        summary: '更新系统配置',
        params: [
          { name: 'key', type: 'string', required: true, desc: '配置键名' },
          { name: 'value', type: 'string', required: true, desc: '配置值' },
        ],
      },
    ],
  },
  {
    name: 'OpenAI 兼容接口',
    desc: '标准 OpenAI API 格式，用于客户端调用',
    endpoints: [
      {
        method: 'POST',
        path: '/v1/chat/completions',
        summary: '对话补全',
        params: [
          { name: 'model', type: 'string', required: true, desc: '模型名称' },
          { name: 'messages', type: 'array', required: true, desc: '消息数组' },
          { name: 'temperature', type: 'number', required: false, desc: '温度 0-2' },
          { name: 'max_tokens', type: 'number', required: false, desc: '最大输出 token' },
          { name: 'stream', type: 'boolean', required: false, desc: '是否流式输出' },
        ],
      },
      {
        method: 'POST',
        path: '/v1/embeddings',
        summary: '文本嵌入',
        params: [
          { name: 'model', type: 'string', required: true, desc: '嵌入模型名称' },
          { name: 'input', type: 'string|array', required: true, desc: '输入文本' },
        ],
      },
      {
        method: 'POST',
        path: '/v1/images/generations',
        summary: '图像生成',
        params: [
          { name: 'model', type: 'string', required: false, desc: '模型名称 (默认 dall-e-3)' },
          { name: 'prompt', type: 'string', required: true, desc: '图像描述' },
          { name: 'size', type: 'string', required: false, desc: '尺寸: 1024x1024 等' },
          { name: 'n', type: 'number', required: false, desc: '生成数量' },
        ],
      },
    ],
  },
];
