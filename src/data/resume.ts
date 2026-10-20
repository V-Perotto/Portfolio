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
 * - `inProductionSince: 'AAAA-MM-DD'` mostra o selo EM PRODUÇÃO e a linha `desde = 01 OUT 2026` (com o
 *   dia); nunca junto com `inProgress`. `details` acrescenta linhas `rótulo = valor` depois de `contexto` (rótulo em
 *   minúsculas, sem acento: `hardware`, `sistema`, `acesso`). `apps` lista os apps de um servidor: o nome
 *   é uma `TechName` (com ícone em `TECH_ICONS`) e a explicação é uma linha fiel ao uso.
 * - Infraestrutura pessoal sem acesso público (4ª exceção do Princípio II, v3.1.0): `kind: 'side-project'`
 *   com `evidence: []` e `screenshot`. A captura original fica em `tools/source/`; as versões publicadas
 *   (`public/`, nome com a data da captura) saem de `node tools/build-screenshots.mjs`. O `alt` diz a data
 *   e o que o painel mostra; nenhum texto, nome de arquivo ou imagem pode trazer IP, domínio, porta, nome
 *   de rede ou usuário.
 * - Tecnologias (skills, `tech` das experiências, `stack` de projetos e challenges): só nomes da
 *   união `TechName` (src/types/resume.ts), cada um com ícone em `TECH_ICONS` (src/lib/tech-icons.ts).
 *   Tecnologia nova: acrescente o nome nos dois. Ícone novo: acrescente-o no manifesto de
 *   tools/build-tech-icons.mjs e rode o script (devicon → vectorlogo.zone → Lucide pelo assunto).
 * - `command` do projeto é a linha de comando temática da janela, sem `./run`.
 * - Challenges aparecem pela data de criação (`created`, mais recente primeiro), não pela ordem
 *   deste arquivo. Projetos comunitários não têm stack.
 * - Formação: `note` (observação) e `sources` (links de fonte) são opcionais. `id` é um slug curto
 *   e único (minúsculas, sem acento, com hífen), que vira o nome do arquivo `AAAA_<id>.yml` na janela
 *   `~/formacao` (ex.: `2025_ciberseguranca.yml`); o nome inteiro tem no máximo 31 caracteres.
 * - Foto de experiência (feature 010): `photo` com a legenda sem a data (`caption`) e o dia (`taken`,
 *   'AAAA-MM-DD'); a legenda exibida é `# 1º dia na Prime Control · 15 OUT 2020`. As versões publicadas
 *   (`public/carreira/…`) saem de `node tools/build-certificates.mjs`, que desfoca os rostos de terceiros.
 * - Certificados (feature 010): `certificatePlatforms` na ordem das pastas da janela `~/certificados`.
 *   Certificado novo: `id` (slug curto, minúsculas, sem acento, com hífen, até 20 caracteres, único na
 *   plataforma: vira `AAAA-MM-DD_<id>.yml`), `title` exatamente como impresso, `issued` 'AAAA-MM-DD',
 *   `hours`, e `kind`/`syllabus` só quando o certificado os traz. `verification`: `{ url }` quando o
 *   endereço impresso ainda abre o certificado (com `code`, o código vira o texto do link), `{ code }`
 *   quando não abre. Plataforma nova: `id` (a pasta), `name` e `image` (tamanho real das imagens).
 *   Depois, acrescente a origem no manifesto de tools/build-certificates.mjs e rode o script: ele gera a
 *   miniatura (640 px) e o tamanho real em `public/certificados/<plataforma>/`.
 * - Privacidade (feature 010): nenhum dado de documento (RG, CPF, data de nascimento, naturalidade) em
 *   texto nem em imagem; as tarjas pretas são aplicadas pelo script, na imagem. O código de um
 *   certificado que leva aos documentos no site do emissor não é publicado (sem `verification`).
 * - Campo obrigatório faltando ou com tipo errado quebra o `npm run build` apontando a linha do
 *   item (cada item tem `satisfies <Tipo>`) e o nome do campo.
 */
import type {
  Certificate,
  CertificatePlatform,
  Challenge,
  CommunityProject,
  Education,
  Experience,
  Project,
  Resume,
  SkillGroup,
} from '@/types/resume'

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
    tagline: 'Transformando processos em sistemas escaláveis',
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
      photo: {
        src: 'carreira/prime-control/integracao-2020-10-15-512.webp',
        srcWidth: 512,
        full: 'carreira/prime-control/integracao-2020-10-15-1024.webp',
        width: 1024,
        height: 768,
        alt: 'Integração dos novos funcionários na Prime Control em 15/10/2020: seis pessoas de máscara ao redor de uma mesa com notebooks, com Vittorio Perotto na ponta direita, de frente, e a projeção "Bem-vindo Prime Hero!". Os rostos das outras pessoas estão desfocados.',
        caption: '1º dia na Prime Control',
        taken: '2020-10-15',
      },
    } satisfies Experience,
  ],

  skillGroups: [
    {
      id: 'linguagens_frameworks',
      icon: 'code-xml',
      items: [
        { name: 'Python (Flask)' },
        { name: 'Java (Quarkus)' },
        { name: 'TypeScript' },
        { name: 'Vue.js' },
        { name: 'React' },
        { name: 'Angular' },
        { name: 'Node.js' },
        { name: 'C#' },
      ],
    } satisfies SkillGroup,
    {
      id: 'conceitos_web',
      icon: 'globe',
      loopDirection: 'to-right',
      items: [{ name: 'Programação Web' }, { name: 'APIs REST' }],
    } satisfies SkillGroup,
    {
      id: 'gestao_de_dados',
      icon: 'database',
      items: [
        { name: 'MongoDB' },
        { name: 'PostgreSQL' },
        { name: 'SQL Server' },
      ],
    } satisfies SkillGroup,
    {
      id: 'desenho_de_processos',
      icon: 'workflow',
      loopDirection: 'to-right',
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
        { name: 'Docker' },
        { name: 'Jenkins' },
        { name: 'RabbitMQ' },
        { name: 'Redis' },
        { name: 'Valkey' },
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
      command: 'srg --status',
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
      id: 'debianserver',
      name: 'DebianServer',
      subtitle: 'Meu homeserver',
      command: 'debianserver --status',
      purpose:
        'Servidor caseiro self-hosted num notebook reaproveitado: guarda as fotos do celular, dá acesso à IA local, a uma Wikipedia offline e à sincronização de notas, sem depender de nuvem de terceiros.',
      stack: ['Debian', 'CasaOS', 'Docker', 'Tailscale', 'Ollama', 'Samba'],
      role: 'Autor: instalação, configuração e manutenção',
      kind: 'side-project',
      tag: '[side-project]',
      inProductionSince: '2026-10-01',
      details: [
        { label: 'hardware', value: 'Notebook reaproveitado: Lenovo ideapad 330-15IKB, Intel Core i5-8250U' },
        { label: 'sistema', value: 'CasaOS sobre Debian 13, com os apps em containers Docker' },
        {
          label: 'acesso',
          value: 'Tailscale (VPN) de fora de casa, sem porta aberta na internet; no celular, os arquivos por SMB',
        },
      ],
      apps: [
        {
          name: 'Ente Photos',
          summary:
            'Backup automático das fotos e vídeos do celular, criptografados de ponta a ponta e guardados no próprio servidor, no lugar de uma nuvem de terceiros.',
        },
        {
          name: 'OpenWebUI',
          summary:
            'Interface de chat com IA: serve de ponte para os modelos locais (Ollama) que rodam no desktop, numa RTX 3060 de 12 GB, e pesquisa na web pelo SearXNG.',
        },
        { name: 'Kiwix', summary: 'Cópia offline da Wikipedia em português.' },
        { name: 'Syncthing', summary: 'Mantém o cofre do Obsidian sincronizado entre o desktop, o celular e o servidor.' },
        { name: 'SearXNG', summary: 'Metabuscador próprio, usado como fonte de busca na web do OpenWebUI.' },
        { name: 'Watchtower', summary: 'Atualiza sozinho os containers dos outros apps quando sai uma versão nova.' },
      ],
      evidence: [],
      screenshot: {
        src: 'projetos/debianserver/painel-2026-10-20-800.webp',
        srcWidth: 800,
        full: 'projetos/debianserver/painel-2026-10-20-1396.webp',
        width: 1396,
        height: 809,
        alt: 'Painel do CasaOS do DebianServer em 20/10/2026: CPU a 3%, RAM a 26% de 11,6 GB, disco com 122 GB usados de 460 GB e os apps App Store, Files, OpenWebUI, Syncthing, Watchtower, SearXNG, Kiwix Server e Ente Photos.',
        caption: 'painel do CasaOS do DebianServer',
        captured: '2026-10',
      },
    } satisfies Project,
    {
      id: 'vscode-themes',
      name: 'Temas VS Code',
      subtitle: 'Open VSX Registry',
      command: 'ovsx get DistroLinux/* --describe',
      purpose: 'Dois temas visuais criados e publicados no Open VSX para VS Code e VSCodium.',
      stack: ['JSON', 'VS Code Extension API', 'Open VSX Registry'],
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
      command: 'italiami --describe',
      purpose:
        'Sistema para otimização de processos de agendamento de passaportes, reduzindo o tempo de pesquisa manual e sugerindo melhorias na jornada do usuário.',
      stack: ['Angular', 'C#', '.NET'],
      role: 'Autor e desenvolvedor',
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
      command: 'ocr_para_br --describe',
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
      command: 'qclass-bot --describe',
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
      command: 'monitoria --describe',
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
    {
      id: 'bomjesus-challenge',
      name: 'Bom Jesus (FAE)',
      created: '2026-10',
      summary:
        'Gestão acadêmica: API REST e interface web para cadastrar, consultar, atualizar e excluir alunos e professores de uma instituição de ensino.',
      stack: ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'H2', 'Docker'],
      url: 'https://github.com/V-Perotto/bomjesus-challenge',
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
      id: 'ciberseguranca',
      course: 'Pós-Graduação em Cibersegurança',
      institution: 'PUC-PR',
      location: 'Curitiba - PR',
      startYear: 2025,
      endYear: 2027,
      status: 'em-curso',
    } satisfies Education,
    {
      id: 'sistemas-de-informacao',
      course: 'Bacharelado em Sistemas de Informação',
      institution: 'PUC-PR',
      location: 'Curitiba - PR',
      startYear: 2020,
      endYear: 2024,
      status: 'concluido',
    } satisfies Education,
    {
      id: 'empregotech',
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
      id: 'tecnico-ads',
      course: 'Técnico em Análise e Desenvolvimento de Sistemas',
      institution: 'SENAI-PR',
      location: 'Curitiba - PR',
      startYear: 2018,
      endYear: 2019,
      status: 'concluido',
    } satisfies Education,
  ],

  // pastas na ordem do pedido do autor; dentro de cada uma, do mais recente para o mais antigo (feature 010)
  certificatePlatforms: [
    {
      id: 'dio',
      name: 'DIO',
      image: { width: 1200, height: 849 },
      certificates: [
        { id: 'empregotech-basico', title: 'Programa EmpregoTech Curitiba - Básico', issued: '2020-07-29', hours: 39, kind: 'bootcamp', verification: { url: 'https://hermes.dio.me/certificates/207D7222.pdf' } } satisfies Certificate,
        { id: 'empregotech-inter', title: 'Programa Empregotech Curitiba - Intermediário', issued: '2020-07-29', hours: 79, kind: 'bootcamp', verification: { url: 'https://hermes.dio.me/certificates/E1741B9C.pdf' } } satisfies Certificate,
        { id: 'node-filas', title: 'Desafio prático: Arquitetura interna no Node e filas', issued: '2020-07-07', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/A35EA586.pdf' } } satisfies Certificate,
        { id: 'node-backend', title: 'Desenvolvimento back-end com Node.js', issued: '2020-07-06', hours: 5, verification: { url: 'https://hermes.dio.me/certificates/04197A25.pdf' } } satisfies Certificate,
        { id: 'node-api-crushes', title: 'Desafio prático: Criando uma API em Node.js para gerenciar seus crushes', issued: '2020-07-06', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/2A52F6C3.pdf' } } satisfies Certificate,
        { id: 'postgresql', title: 'Conceitos e melhores práticas com bancos de dados PostgreSQL', issued: '2020-07-03', hours: 9, verification: { url: 'https://hermes.dio.me/certificates/1D1848C9.pdf' } } satisfies Certificate,
        { id: 'node-express', title: 'Introdução ao Node.js com Express', issued: '2020-07-03', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/20FDACA9.pdf' } } satisfies Certificate,
        { id: 'redux', title: 'Desafio prático: Como gerenciar o estado das aplicações com Redux', issued: '2020-07-01', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/09DC6357.pdf' } } satisfies Certificate,
        { id: 'js-com-react', title: 'Desafio prático: Praticando JavaScript com React', issued: '2020-07-01', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/37389BE3.pdf' } } satisfies Certificate,
        { id: 'reactjs-web', title: 'Desenvolvimento de aplicações para internet com ReactJS', issued: '2020-07-01', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/63AD8F56.pdf' } } satisfies Certificate,
        { id: 'react-typescript', title: 'Desafio prático: React.js com TypeScript', issued: '2020-07-01', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/A37A0FDD.pdf' } } satisfies Certificate,
        { id: 'intro-reactjs', title: 'Introdução ao ReactJS', issued: '2020-07-01', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/F95A98CB.pdf' } } satisfies Certificate,
        { id: 'performance-web', title: 'Desafio prático: Performance Web Utilizando JavaScript', issued: '2020-06-30', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/6302A4C9.pdf' } } satisfies Certificate,
        { id: 'tdd-javascript', title: 'Desafio prático: TDD com JavaScript', issued: '2020-06-30', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/83658A4D.pdf' } } satisfies Certificate,
        { id: 'js-es6-avancado', title: 'Desenvolvimento avançado com JavaScript ES6', issued: '2020-06-29', hours: 5, verification: { url: 'https://hermes.dio.me/certificates/A505E509.pdf' } } satisfies Certificate,
        { id: 'styled-components', title: 'Desafio prático: Utilizando Styled Components (CSS-in-JS)', issued: '2020-06-29', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/FB4F39F0.pdf' } } satisfies Certificate,
        { id: 'js-es6-essencial', title: 'JavaScript ES6 essencial', issued: '2020-06-24', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/AA7D3B45.pdf' } } satisfies Certificate,
        { id: 'promises', title: 'Desafio prático: Entendendo Promises de uma vez por todas', issued: '2020-06-22', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/C162ED32.pdf' } } satisfies Certificate,
        { id: 'modelagem-negocios', title: 'Modelagem de Negócios', issued: '2020-06-20', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/6C7F9089.pdf' } } satisfies Certificate,
        { id: 'javascript-web', title: 'Programação para internet com JavaScript', issued: '2020-06-20', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/EE630C61.pdf' } } satisfies Certificate,
        { id: 'negocios-digitais', title: 'Fundamentos de Negócios Digitais Escaláveis', issued: '2020-06-12', hours: 6, verification: { url: 'https://hermes.dio.me/certificates/B00E13E2.pdf' } } satisfies Certificate,
        { id: 'hexagonal', title: 'Expert Lesson: Arquitetura Hexagonal: mantendo aplicações saudáveis', issued: '2020-05-19', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/79B5C5C4.pdf' } } satisfies Certificate,
        { id: 'arquitetura-avancado', title: 'Arquitetura de Sistemas Avançado', issued: '2020-05-18', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/61817017.pdf' } } satisfies Certificate,
        { id: 'ddd-arquitetura', title: 'Expert Lesson: DDD e arquitetura de software', issued: '2020-05-18', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/DA144088.pdf' } } satisfies Certificate,
        { id: 'bootstrap', title: 'Construindo páginas para internet com Bootstrap', issued: '2020-05-16', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/79F59175.pdf' } } satisfies Certificate,
        { id: 'html5-css3', title: 'Programação para internet com HTML5 e CSS3', issued: '2020-05-13', hours: 6, verification: { url: 'https://hermes.dio.me/certificates/3085EBFF.pdf' } } satisfies Certificate,
        { id: 'mentalidade', title: 'Mentalidade Empreendedora', issued: '2020-04-21', hours: 3, verification: { url: 'https://hermes.dio.me/certificates/265A8CDF.pdf' } } satisfies Certificate,
        { id: 'intraempreendedor', title: 'Fundamentos do Intraempreendedorismo', issued: '2020-04-21', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/4DD49C6E.pdf' } } satisfies Certificate,
        { id: 'scrum', title: 'Projetos ágeis com SCRUM', issued: '2020-04-21', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/F861E33A.pdf' } } satisfies Certificate,
        { id: 'github', title: 'Introdução ao GitHub e comandos essenciais para trabalhar em equipe', issued: '2020-04-20', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/4091DB01.pdf' } } satisfies Certificate,
        { id: 'git', title: 'Introdução ao Git e Controle de Versões', issued: '2020-04-17', hours: 2, verification: { url: 'https://hermes.dio.me/certificates/1D2A9D24.pdf' } } satisfies Certificate,
        { id: 'arquitetura-sistemas', title: 'Fundamentos de Arquitetura de Sistemas', issued: '2020-04-17', hours: 7, verification: { url: 'https://hermes.dio.me/certificates/B10F8D56.pdf' } } satisfies Certificate,
        { id: 'logica-programacao', title: 'Lógica de programação essencial', issued: '2020-04-13', hours: 4, verification: { url: 'https://hermes.dio.me/certificates/F4F49CF0.pdf' } } satisfies Certificate,
      ],
    } satisfies CertificatePlatform,
    {
      id: 'prime-academy',
      name: 'Prime Academy',
      image: { width: 1039, height: 717 },
      certificates: [
        { id: 'scrum', title: 'Metodologia Agile SCRUM', issued: '2020-10-29', hours: 8, verification: { code: '168f93bcd15b398af83a157e33202ad8' } } satisfies Certificate,
        { id: 'apis', title: 'APIs', issued: '2020-10-27', hours: 3, verification: { code: '666923b8ee6805a1a5040c2ddcb47d02' } } satisfies Certificate,
        { id: 'bdd', title: 'BDD – Behaviour Driven Development', issued: '2020-10-27', hours: 2, verification: { code: '5bf3c2add2d82159cec7ac218a11230d' } } satisfies Certificate,
        { id: 'csharp-convencoes', title: 'Convenções de codificação em C#', issued: '2020-10-27', hours: 2, verification: { code: 'e5785b86ff4d61433754503c05ccb18d' } } satisfies Certificate,
        { id: 'hp-alm-qc', title: 'Elaboração de Cenários de Testes HP ALM QC', issued: '2020-10-27', hours: 2, verification: { code: 'd20273ae5ee5a86c82cbabdb01780bb6' } } satisfies Certificate,
        { id: 'rabbiit', title: 'Rabbiit – Para que serve e como usar', issued: '2020-10-27', hours: 2, verification: { code: 'a5f54e2556ca25bea1fac3c2f80e8683' } } satisfies Certificate,
        { id: 'sql-basico', title: 'SQL Básico', issued: '2020-10-27', hours: 2, verification: { code: '48bf6fbc0f69c700e8ec0d17659578cc' } } satisfies Certificate,
        { id: 'chatbots', title: 'Chatbots – Como garantir a qualidade', issued: '2020-10-22', hours: 2, verification: { code: '2ee613c0e8e285565a7e880cb5060649' } } satisfies Certificate,
        { id: 'hp-alm-uft', title: 'Automação de Testes com HP ALM e HP UFT', issued: '2020-10-22', hours: 2, verification: { code: '4b4cee33d2026da828dfd05894890a92' } } satisfies Certificate,
        { id: 'varejo', title: 'Noções Básicas de Varejo', issued: '2020-10-22', hours: 8, verification: { code: '8092f935cfd11640ec458190b391dbd0' } } satisfies Certificate,
        { id: 'abertura-bugs', title: 'Abertura de Bugs', issued: '2020-10-21', hours: 2, verification: { code: '4724401e92e002d48f8c50f37f8a9505' } } satisfies Certificate,
        { id: 'web-ruby', title: 'Automação Web com Ruby', issued: '2020-10-21', hours: 2, verification: { code: '6f86d57c6a499535e099e5ef4c427074' } } satisfies Certificate,
        { id: 'gtd', title: 'Produtividade pessoal com GTD', issued: '2020-10-21', hours: 2, verification: { code: '3243d5b2b9c88cfe9a5537e757589162' } } satisfies Certificate,
        { id: 'teste-software', title: 'Teste de Software', issued: '2020-10-21', hours: 2, verification: { code: '081e713f457f669896bc2b0b21332a36' } } satisfies Certificate,
        { id: 'testador-agil', title: 'Webinar – O papel de um testador em uma equipe ágil', issued: '2020-10-19', hours: 2, verification: { code: '6e95244e8d13a7803111187d00dab2e7' } } satisfies Certificate,
        { id: 'casos-de-teste', title: 'Especificação de Caso de Teste', issued: '2020-10-16', hours: 2, verification: { code: '1bc03e7949ee25c72bcc1e95fcde174a' } } satisfies Certificate,
        { id: 'continuous-testing', title: 'Webinar – Acelerando entregas com Continuous Testing', issued: '2020-10-15', hours: 1, verification: { code: 'e63ee59d496e845ace929922e769290b' } } satisfies Certificate,
        { id: 'bdd-caso-de-teste', title: 'Webinar – BDD não é Caso de Teste!', issued: '2020-10-15', hours: 2, verification: { code: '469d097f2798061c2c8a485859ef7544' } } satisfies Certificate,
        { id: 'ct-academy', title: 'Continous Testing Academy – Iniciante', issued: '2020-10-15', hours: 3, verification: { code: 'd9983eba12ca8d6bda0a706e770963d5' } } satisfies Certificate,
        { id: 'conhecendo-prime', title: 'Webinar – Conhecendo a Prime Control', issued: '2020-10-15', hours: 1, verification: { code: '2ee8f214754d929af93616eb9336e781' } } satisfies Certificate,
      ],
    } satisfies CertificatePlatform,
    {
      id: 'udemy',
      name: 'Udemy',
      image: { width: 1200, height: 893 },
      certificates: [
        { id: 'robot-avancado', title: 'Automação de Testes com Robot Framework - Avançado', issued: '2020-11-13', hours: 7, verification: { url: 'https://ude.my/UC-fa70c848-4678-4ccd-a50e-b92905d589f5' } } satisfies Certificate,
        { id: 'robot-basico', title: 'Automação de Testes com Robot Framework - Básico', issued: '2020-11-11', hours: 4, verification: { url: 'https://ude.my/UC-6d75d1fc-c72a-4df4-8cf1-9b572b69e489' } } satisfies Certificate,
      ],
    } satisfies CertificatePlatform,
    {
      id: 'senai',
      name: 'SENAI',
      image: { width: 1200, height: 849 },
      certificates: [
        {
          id: 'ia',
          title: 'Inteligência Artificial',
          issued: '2020-12-30',
          hours: 40,
          syllabus: [
            'Inteligência Artificial',
            'Aprendizagem de máquina',
            'Agentes inteligentes',
            'Mecanismos de busca em IA',
            'Resolução de problemas por busca',
            'Inferência - lógica de primeira ordem',
            'Representação de conhecimento',
            'Raciocínio em incerteza',
            'Tomada de decisão e planejamento',
            'Interação com o ambiente e robótica',
          ],
        } satisfies Certificate,
      ],
    } satisfies CertificatePlatform,
    {
      id: 'promenady',
      name: 'Promenady',
      image: { width: 1200, height: 849 },
      certificates: [
        { id: 'abap-funcionais', title: 'Visão de Abap para Funcionais', issued: '2023-02-18', hours: 8, verification: { url: 'https://e-certificado.com/login/autenticar?c=1641746ADFBD682A10825550', code: '1641746ADFBD682A10825550' } } satisfies Certificate,
        { id: 'taxbra-avancado', title: 'TAXBRA - Nível Avançado', issued: '2023-02-11', hours: 8, verification: { url: 'https://e-certificado.com/login/autenticar?c=1638164AC6232AEC10825550', code: '1638164AC6232AEC10825550' } } satisfies Certificate,
        { id: 'taxbra-basico', title: 'TAXBRA - Nível Básico', issued: '2023-01-28', hours: 8, verification: { url: 'https://e-certificado.com/login/autenticar?c=1638154ABCB3441910825550', code: '1638154ABCB3441910825550' } } satisfies Certificate,
        { id: 'localizacao-br', title: 'Localização Brasileira', issued: '2023-01-21', hours: 8, verification: { url: 'https://e-certificado.com/login/autenticar?c=1629842A7AF02A6B10825550', code: '1629842A7AF02A6B10825550' } } satisfies Certificate,
        { id: 'formacao-consultores', title: 'Formação de Consultores', issued: '2023-01-16', hours: 80, verification: { url: 'https://e-certificado.com/login/autenticar?c=1641756A81BF361B10825550', code: '1641756A81BF361B10825550' } } satisfies Certificate,
      ],
    } satisfies CertificatePlatform,
  ],


  contacts: [
    { key: 'github', url: 'https://github.com/V-Perotto' },
    { key: 'linkedin', url: 'https://www.linkedin.com/in/vittorioperotto/' },
  ],
} satisfies Resume

// `satisfies` valida cada campo apontando a linha; o export usa o tipo amplo para os consumidores.
export const resume: Resume = data
