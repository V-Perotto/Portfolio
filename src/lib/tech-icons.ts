import type { TechIconId, TechName } from '@/types/resume'

/**
 * Ícone de cada tecnologia exibida (chips e loops de skills; FR-012, FR-013, FR-017, research R1 e R3
 * da 003): id de um <symbol> de src/assets/tech-icons/sprite.svg. Ordem de preferência das fontes:
 * devicon → vectorlogo.zone → Lucide pelo assunto; o Valkey vem do homarr-labs/dashboard-icons, por
 * pedido do autor (FR-043 da 004). Variações de nome da mesma tecnologia apontam para
 * o mesmo id. O `Record` obriga toda `TechName` a ter ícone; tests/unit/tech-icons.spec.ts confere
 * que cada id existe no sprite.
 */
export const TECH_ICONS: Record<TechName, TechIconId> = {
  // devicon
  Python: 'devicon-python',
  'Python (Flask)': 'devicon-python',
  Flask: 'devicon-flask',
  Java: 'devicon-java',
  'Java (Quarkus)': 'devicon-java',
  Quarkus: 'devicon-quarkus',
  TypeScript: 'devicon-typescript',
  'Vue.js': 'devicon-vuejs',
  'Vue 3': 'devicon-vuejs',
  React: 'devicon-react',
  Angular: 'devicon-angular',
  'Node.js': 'devicon-nodejs',
  'C#': 'devicon-csharp',
  '.NET': 'devicon-dot-net',
  MongoDB: 'devicon-mongodb',
  PostgreSQL: 'devicon-postgresql',
  'SQL Server': 'devicon-microsoftsqlserver',
  MySQL: 'devicon-mysql',
  Git: 'devicon-git',
  Docker: 'devicon-docker',
  Jenkins: 'devicon-jenkins',
  RabbitMQ: 'devicon-rabbitmq',
  Redis: 'devicon-redis',
  Elasticsearch: 'devicon-elasticsearch',
  Kibana: 'devicon-kibana',
  NestJS: 'devicon-nestjs',
  Prisma: 'devicon-prisma',
  Vite: 'devicon-vitejs',
  Axios: 'devicon-axios',
  JSON: 'devicon-json',
  'VS Code Extension API': 'devicon-vscode',

  // vectorlogo.zone: falta no devicon (SAP) ou lá só existe o logotipo escrito (nginx)
  'SAP SD': 'vectorlogo-sap',
  Nginx: 'vectorlogo-nginx',

  // homarr-labs/dashboard-icons, por pedido do autor (feature 004)
  Valkey: 'dashboard-valkey',

  // Lucide, pelo assunto: sem logotipo no devicon nem no vectorlogo.zone
  OCR: 'lucide-scan-text',
  LLMs: 'lucide-brain-circuit',
  'Agentes de IA': 'lucide-bot',
  'Robocorp (RPA Framework)': 'lucide-bot',
  'Robot Framework': 'lucide-list-checks',
  Arquitetura: 'lucide-blocks',
  'APIs REST': 'lucide-webhook',
  'Programação Web': 'lucide-app-window',
  'Análise Funcional': 'lucide-clipboard-list',
  Processos: 'lucide-workflow',
  'Open VSX Registry': 'lucide-package',
  'JSON Server': 'lucide-server',
  'Design Patterns': 'lucide-shapes',
  Singleton: 'lucide-circle-dot',
  Factory: 'lucide-factory',
  MVC: 'lucide-panels-top-left',
  DDD: 'lucide-boxes',
  TDD: 'lucide-flask-conical',
  'Clean Code': 'lucide-brush-cleaning',
  'Agile/Scrum': 'lucide-iteration-cw',
}
