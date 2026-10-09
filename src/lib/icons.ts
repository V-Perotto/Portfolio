import { CodeXml, Database, Globe, ServerCog, Workflow } from '@lucide/vue'
import type { Component } from 'vue'
import type { SkillIconName } from '@/types/resume'

/** Ícone Lucide de cada grupo de skills (FR-034, research R2 da 002). Os dados guardam só o nome. */
export const SKILL_ICONS: Record<SkillIconName, Component> = {
  'code-xml': CodeXml,
  globe: Globe,
  database: Database,
  workflow: Workflow,
  'server-cog': ServerCog,
}
