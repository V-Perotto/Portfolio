/**
 * ÚNICO arquivo de conteúdo do portfólio (FR-001). Toda informação do currículo vem daqui; os
 * componentes apenas a exibem. Para atualizar o site, edite só este arquivo.
 *
 * Guia de edição:
 * - Datas no formato "AAAA-MM" (ex.: "2026-03"). A ordem de exibição é calculada pelas datas
 *   (mais recente primeiro), não pela ordem neste arquivo.
 * - Vínculo em andamento: omita `end` — aparece "PRESENTE" com o selo HEAD. No máximo um.
 * - `confidential: true` indica que `company` já está anonimizado (ex.: "Empresa de Tecnologia
 *   (Confidencial)"); nunca coloque o nome real nesse caso.
 * - `featured: true` em uma skill a coloca na faixa contínua da seção de skills.
 * - `highlights` (métricas de impacto) só com números que o currículo sustente (Princípio I da
 *   constituição). Sem métricas, omita o campo — nada é exibido.
 * - Projetos: só trabalho confidencial (`confidential: true`) ou experiência acadêmica sem
 *   artefato público (`kind: 'academico'`) fica sem evidência — `evidence: []` exige um
 *   `noEvidenceReason` que diga qual é o caso, sem detalhes sigilosos. Projetos aparecem na
 *   ordem deste arquivo (relevância).
 * - Repositório privado: `private: true` na evidência (só com `kind: 'repositorio'`). O cartão
 *   mostra o cadeado, "privado" e o aviso de que o link pode não abrir para o visitante.
 * - `inProgress: true` num projeto mostra o selo EM DESENVOLVIMENTO, sem data. `relatedTo` mostra a
 *   empresa ligada ao projeto (`contexto = ...`).
 * - Challenges aparecem pela data de criação (`created`, mais recente primeiro), não pela ordem
 *   deste arquivo. Projetos comunitários não têm stack.
 * - Formação: `note` (observação) e `sources` (links de fonte) são opcionais.
 * - Campo obrigatório faltando ou com tipo errado quebra o `npm run build` apontando a linha do
 *   item (cada item tem `satisfies <Tipo>`) e o nome do campo.
 */
import type { Challenge, CommunityProject, Education, Experience, Project, Resume, SkillGroup } from '@/types/resume'

const data = {
  profile: {
    name: 'Vittorio Perotto',
    headline: 'Desenvolvedor Fullstack',
    typedPhrases: [
      'whoami',
      'Desenvolvedor Full-Stack',
      'Analista de Sistemas',
      'Arquiteto de Software',
      'echo "TypeScript · Vue · PostgreSQL"',
    ],
    staticPhraseIndex: 1,
    tagline: 'Transformando processos em sistemas escaláveis — de APIs a agentes de IA.',
    about: [
      'Analista de Sistemas e Desenvolvedor Fullstack. Experiência sólida no desenvolvimento de sistemas utilizando ',
      { text: 'TypeScript', highlight: 'green' },
      ' e ',
      { text: 'Vue', highlight: 'green' },
      ', com experiência técnica no desenho de processos e arquitetura de sistemas. Especialista em identificar oportunidades de melhoria e implementar soluções sustentáveis e escaláveis para otimização do fluxo de trabalho e experiência do usuário.',
    ],
    attributes: [
      { icon: '📍', label: 'Curitiba - PR, Brasil' },
      { icon: '🇮🇹', label: 'Dupla cidadania (Italiana)' },
      { icon: '🇧🇷', label: 'Português: nativo' },
      { icon: '🇬🇧', label: 'Inglês: avançado' },
      { icon: '🇮🇹', label: 'Italiano: básico' },
    ],
    seo: {
      title: 'Vittorio Perotto — Desenvolvedor Fullstack',
      description:
        'Portfólio de Vittorio Perotto — Analista de Sistemas e Desenvolvedor Fullstack em Curitiba-PR. Java (Quarkus), Python, TypeScript, arquitetura de sistemas e agentes de IA.',
    },
  },

  experiences: [
    {
      id: 'confidencial-2026',
      role: 'Programador Full-Stack',
      company: 'Empresa de Tecnologia (Confidencial)',
      confidential: true,
      location: 'Curitiba - PR',
      start: '2026-03',
      end: '2026-07',
      summary:
        'Desenvolvimento de aplicações web usando Angular e criação de agentes de IA utilizando LLMs para otimizar a tomada de decisão e a interação com o usuário.',
      tech: ['Angular', 'Agentes de IA', 'LLMs'],
    } satisfies Experience,
    {
      id: 'osuper',
      role: 'Programador Full-Stack',
      company: 'Osuper Sistemas LTDA',
      location: 'São Miguel do Oeste - SC',
      start: '2025-04',
      end: '2025-09',
      summary: 'Soluções de e-commerce com foco na melhoria da experiência do cliente e conversão de vendas.',
      tech: ['React', 'TypeScript', 'PostgreSQL', 'RabbitMQ', 'Redis'],
    } satisfies Experience,
    {
      id: 'quadritech',
      role: 'Engenheiro de Software',
      company: 'Quadritech Tecnologia',
      location: 'Curitiba - PR',
      start: '2023-10',
      end: '2024-12',
      summary:
        'Projetou a arquitetura do sistema policial ABIS desenhando seus processos. Desenvolveu rotinas para população de dados de testes consumindo APIs Java (Quarkus).',
      tech: ['Java', 'Quarkus', 'Arquitetura', 'APIs REST'],
    } satisfies Experience,
    {
      id: 'coinov',
      role: 'Consultor SAP SD',
      company: 'COINOV Consultoria e Serviços LTDA',
      location: 'Curitiba - PR',
      start: '2023-01',
      end: '2023-07',
      summary:
        'Análise funcional de processos de vendas e distribuição, garantindo aderência do sistema às necessidades do negócio. Interface entre usuários e soluções técnicas no ecossistema SAP.',
      tech: ['SAP SD', 'Análise Funcional', 'Processos'],
    } satisfies Experience,
    {
      id: 'prime-control',
      role: 'Desenvolvedor RPA',
      company: 'Prime Control e Prime Robot',
      location: 'Curitiba - PR',
      start: '2020-10',
      end: '2022-10',
      summary:
        'Desenhou e implantou melhorias de processos para clientes utilizando Python e ferramentas de OCR. Documentação técnica garantindo escalabilidade, orquestração via Jenkins e monitoramento de performance com Elasticsearch (Kibana).',
      tech: ['Python', 'OCR', 'Jenkins', 'Elasticsearch', 'Kibana'],
    } satisfies Experience,
  ],

  skillGroups: [
    {
      id: 'linguagens_frameworks',
      icon: 'code-xml',
      items: [
        { name: 'Python (Flask)', featured: true },
        { name: 'Java (Quarkus)', featured: true },
        { name: 'TypeScript', featured: true },
        { name: 'Vue.js', featured: true },
        { name: 'React', featured: true },
        { name: 'Angular', featured: true },
        { name: 'Node.js', featured: true },
        { name: 'C#' },
      ],
    } satisfies SkillGroup,
    {
      id: 'conceitos_web',
      icon: 'globe',
      items: [{ name: 'Programação Web' }, { name: 'APIs REST' }],
    } satisfies SkillGroup,
    {
      id: 'gestao_de_dados',
      icon: 'database',
      items: [
        { name: 'MongoDB', featured: true },
        { name: 'PostgreSQL', featured: true },
        { name: 'SQL Server' },
      ],
    } satisfies SkillGroup,
    {
      id: 'desenho_de_processos',
      icon: 'workflow',
      items: [
        { name: 'Design Patterns' },
        { name: 'Singleton' },
        { name: 'Factory' },
        { name: 'MVC' },
        { name: 'DDD' },
        { name: 'TDD' },
      ],
    } satisfies SkillGroup,
    {
      id: 'devops_qualidade',
      icon: 'server-cog',
      items: [
        { name: 'Git' },
        { name: 'Docker', featured: true },
        { name: 'Jenkins' },
        { name: 'RabbitMQ', featured: true },
        { name: 'Redis', featured: true },
        { name: 'Valkey', featured: true },
        { name: 'Elasticsearch' },
        { name: 'Clean Code' },
        { name: 'Agile/Scrum' },
      ],
    } satisfies SkillGroup,
  ],

  projects: [
    {
      id: 'srg',
      name: 'SRG',
      subtitle: 'Demonstrativo de Aluguéis',
      command: './run srg --status',
      purpose:
        'Sistema de demonstrativo de aluguéis: imóveis, inquilinos, despesas e resultados num painel, com um console de administração separado para operar a plataforma.',
      stack: ['Vue 3', 'TypeScript', 'NestJS', 'PostgreSQL', 'Prisma', 'Valkey', 'Docker', 'Nginx'],
      role: 'Autor: front-end, back-end e infraestrutura',
      kind: 'pessoal',
      tag: '[projeto pessoal]',
      inProgress: true,
      evidence: [
        { label: 'SRG-Vue · front-end', url: 'https://github.com/V-Perotto/SRG-Vue', kind: 'repositorio', private: true },
        { label: 'SRG-Admin · console de administração', url: 'https://github.com/V-Perotto/SRG-Admin', kind: 'repositorio', private: true },
        { label: 'SRG-Node · API', url: 'https://github.com/V-Perotto/SRG-Node', kind: 'repositorio', private: true },
        { label: 'SRG-Core · núcleo compartilhado', url: 'https://github.com/V-Perotto/SRG-Core', kind: 'repositorio', private: true },
        { label: 'SRG-DEVOPS · infraestrutura', url: 'https://github.com/V-Perotto/SRG-DEVOPS', kind: 'repositorio', private: true },
      ],
    } satisfies Project,
    {
      id: 'vscode-themes',
      name: 'Temas VS Code',
      subtitle: 'Open VSX Registry',
      command: 'ovsx get DistroLinux/* --describe',
      purpose: 'Dois temas visuais criados e publicados no Open VSX para VS Code e VSCodium.',
      stack: ['JSON de tema', 'VS Code Extension API', 'Open VSX Registry'],
      role: 'Autor e mantenedor',
      kind: 'open-source',
      tag: '[open-vsx · DistroLinux]',
      evidence: [
        {
          label: 'Grape Glass Theme',
          url: 'https://open-vsx.org/extension/DistroLinux/grape-glass-theme',
          kind: 'marketplace',
          accent: 'grape',
          badge: {
            src: 'https://img.shields.io/open-vsx/dt/DistroLinux/grape-glass-theme?style=for-the-badge&logo=vscodium&logoColor=%23389e81&logoSize=auto&labelColor=151515&label=Downloads&color=%23852ffc&cacheSeconds=60',
            alt: 'Downloads do Grape Glass Theme no Open VSX',
          },
        },
        {
          label: 'Shadow Lord - Son of Dathomir Theme',
          url: 'https://open-vsx.org/extension/DistroLinux/shadow-lord-son-of-dathomir-theme',
          kind: 'marketplace',
          accent: 'sith',
          badge: {
            src: 'https://img.shields.io/open-vsx/dt/DistroLinux/shadow-lord-son-of-dathomir-theme?style=for-the-badge&logo=vscodium&logoColor=%23D90404&logoSize=auto&labelColor=%23121212&label=Downloads&color=%23D90404&cacheSeconds=60',
            alt: 'Downloads do Shadow Lord - Son of Dathomir Theme no Open VSX',
          },
        },
      ],
    } satisfies Project,
    {
      id: 'italiami',
      name: 'ItaliaMi',
      subtitle: 'Sistema de Agendamento',
      command: './run italiami --describe',
      purpose:
        'Sistema para otimização de processos de agendamento de passaportes, reduzindo o tempo de pesquisa manual e sugerindo melhorias na jornada do usuário.',
      stack: ['Angular', 'C#', '.NET'],
      role: 'Automatizou o processo de agendamento do passaporte italiano',
      kind: 'pessoal',
      tag: '[projeto pessoal]',
      evidence: [
        { label: 'ItaliaMi-Back · back-end', url: 'https://github.com/V-Perotto/ItaliaMi-Back', kind: 'repositorio', private: true },
        { label: 'ItaliaMi-Front · front-end', url: 'https://github.com/V-Perotto/ItaliaMi-Front', kind: 'repositorio', private: true },
        { label: 'ItaliaMi-BOT · bot', url: 'https://github.com/V-Perotto/ItaliaMi-BOT', kind: 'repositorio', private: true },
      ],
    } satisfies Project,
    {
      id: 'ocr-prontuarios',
      name: 'OCR de Prontuários',
      subtitle: 'Prontuários civil e criminal',
      command: './run ocr_para_br --describe',
      purpose: 'Leitura de prontuários civis e criminais via OCR, transformando documentos digitalizados em texto.',
      stack: ['Python', 'OCR'],
      role: 'Autor e desenvolvedor',
      kind: 'profissional',
      tag: '[privado · Quadritech]',
      relatedTo: 'Quadritech Tecnologia',
      evidence: [{ label: 'OCR_Para_BR', url: 'https://github.com/V-Perotto/OCR_Para_BR', kind: 'repositorio', private: true }],
    } satisfies Project,
    {
      id: 'qclass-bot',
      name: 'QClass-BOT',
      subtitle: 'Aulas por CFC',
      command: './run qclass-bot --describe',
      purpose:
        'Bot que coleta e analisa os dados das aulas realizadas em cada CFC (Centro de Formação de Condutores) registrado.',
      stack: ['Python'],
      role: 'Autor e desenvolvedor',
      kind: 'profissional',
      tag: '[privado · Quadritech]',
      relatedTo: 'Quadritech Tecnologia',
      evidence: [{ label: 'QClass-BOT', url: 'https://github.com/V-Perotto/QClass-BOT', kind: 'repositorio', private: true }],
    } satisfies Project,
    {
      id: 'monitoria',
      name: 'Monitor de Curso',
      subtitle: 'PUC-PR, Curitiba',
      command: './run monitoria --describe',
      purpose: 'Mentorias de lógica de programação e pensamento matemático aplicadas à linguagem Java.',
      stack: ['Java'],
      role: 'Monitor da disciplina',
      kind: 'academico',
      tag: '[experiência acadêmica]',
      evidence: [],
      noEvidenceReason: 'Experiência acadêmica, sem artefato público',
    } satisfies Project,
  ],

  // exibidos pela data de criação (`created`), do mais recente para o mais antigo; a ordem aqui não importa
  challenges: [
    {
      id: 'axyatest_api',
      name: 'Axya',
      created: '2023-07',
      summary: 'API REST de exemplo com testes automatizados (TDD).',
      stack: ['Python', 'Flask', 'MySQL', 'Robot Framework'],
      url: 'https://github.com/V-Perotto/AxyaTest_API',
    } satisfies Challenge,
    {
      id: 'rpa_challenge-ny_times',
      name: 'NY Times (RPA)',
      created: '2024-01',
      summary: 'Robô que busca notícias no site do NY Times por frase, seção e período e salva os resultados em Excel.',
      stack: ['Python', 'Robocorp (RPA Framework)'],
      url: 'https://github.com/V-Perotto/RPA_Challenge-NY_Times',
    } satisfies Challenge,
    {
      id: 'teste-pandavideo',
      name: 'PandaVideo',
      created: '2024-10',
      summary: 'Back-end e front-end que consomem a API da PandaVideo, com autenticação e rotas protegidas.',
      stack: ['Node.js', 'Vue.js', 'MongoDB', 'Docker'],
      url: 'https://github.com/V-Perotto/teste-pandavideo',
    } satisfies Challenge,
    {
      id: 'executiva-service-tech-challenge',
      name: 'Executiva Service',
      created: '2025-10',
      summary: 'Gerenciador de tarefas full-stack com autenticação de usuário.',
      stack: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      url: 'https://github.com/V-Perotto/executiva-service-tech-challenge',
    } satisfies Challenge,
    {
      id: 'econet-challenge',
      name: 'Econet',
      created: '2026-01',
      summary: 'Front-end para gerenciar empresas e seus usuários.',
      stack: ['Vue 3', 'TypeScript', 'Vite', 'Axios', 'JSON Server'],
      url: 'https://github.com/V-Perotto/econet-challenge',
    } satisfies Challenge,
    {
      id: 'mobiis-challenge',
      name: 'Mobiis',
      created: '2026-02',
      summary: 'API de cadastro de usuários com autenticação.',
      stack: ['Node.js', 'TypeScript', 'MongoDB', 'Docker'],
      url: 'https://github.com/V-Perotto/mobiis-challenge',
    } satisfies Challenge,
    {
      id: 'cieepr-challenge',
      name: 'CIEE-PR',
      created: '2026-09',
      summary: 'Cadastro e consulta de candidatos, com extração de nome, e-mail e telefone de currículos em PDF.',
      stack: ['Angular', 'Node.js', 'TypeScript', 'SQL Server', 'Docker'],
      url: 'https://github.com/V-Perotto/cieepr-challenge',
    } satisfies Challenge,
  ],

  community: [
    {
      id: 'gincana-junina',
      name: 'Gincana Junina',
      institution: 'PUC-PR',
      location: 'Curitiba - PR',
      date: '2023-06',
      summary:
        'Projeto comunitário da PUC-PR: estudantes organizaram uma gincana junina na Escola Municipal Professora Nansyr Cecato Cavichiolo, no Parolin, com brincadeiras e distribuição de doces para as crianças.',
      role: 'Um dos estudantes organizadores (Sistemas de Informação)',
      source: {
        label: 'pucpr.br',
        url: 'https://www.pucpr.br/noticias/estudantes-da-pucpr-promovem-gincana-junina-em-escola-municipal-de-curitiba/',
      },
    } satisfies CommunityProject,
  ],

  education: [
    {
      course: 'Pós-Graduação em Cibersegurança',
      institution: 'PUC-PR',
      location: 'Curitiba - PR',
      startYear: 2025,
      endYear: 2027,
      status: 'em-curso',
    } satisfies Education,
    {
      course: 'Bacharelado em Sistemas de Informação',
      institution: 'PUC-PR',
      location: 'Curitiba - PR',
      startYear: 2020,
      endYear: 2024,
      status: 'concluido',
    } satisfies Education,
    {
      course: '1º Empregotech',
      institution: 'Prefeitura de Curitiba',
      location: 'Curitiba - PR',
      startYear: 2020,
      endYear: 2020,
      status: 'concluido',
      note: 'Programa de capacitação em tecnologia para jovens. Foi por meio dele que entrou na Prime Control, uma das patrocinadoras do programa.',
      sources: [
        { label: 'overbr.com.br', url: 'https://overbr.com.br/educacao/1o-empregotech-em-curitiba-capacita-300-jovens' },
        {
          label: 'curitiba.pr.gov.br',
          url: 'https://www.curitiba.pr.gov.br/noticias/1empregotech-comeca-no-domingo-com-seminario-na-opera-de-arame/54852',
        },
      ],
    } satisfies Education,
    {
      course: 'Técnico em Análise e Desenvolvimento de Sistemas',
      institution: 'SENAI-PR',
      location: 'Curitiba - PR',
      startYear: 2018,
      endYear: 2019,
      status: 'concluido',
    } satisfies Education,
  ],

  contacts: [
    { key: 'github', url: 'https://github.com/V-Perotto' },
    { key: 'linkedin', url: 'https://www.linkedin.com/in/vittorioperotto/' },
  ],
} satisfies Resume

// `satisfies` valida cada campo apontando a linha; o export usa o tipo amplo para os consumidores.
export const resume: Resume = data
