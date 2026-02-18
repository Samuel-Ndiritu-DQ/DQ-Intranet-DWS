-- DQ Glossary Terms Seed Data
-- Seeds the glossary_terms table with the 10 approved core DWS glossary terms

-- Define constants
\set OWNER_NAME 'Digital Qatalyst'
\set STATUS_ACTIVE 'Active'
\set CATEGORY_FRAMEWORKS 'frameworks-models'
\set CATEGORY_PLATFORMS 'platforms-tools'
\set CATEGORY_GOVERNANCE 'governance-systems'
\set CATEGORY_ROLES 'roles-structures'
\set CATEGORY_WAYS 'ways-of-working'

-- Define slug constants
\set SLUG_DWS 'dws'
\set SLUG_DWS_1 'dws-1'
\set SLUG_DWS_2 'dws-2'
\set SLUG_DWS_3 'dws-3'
\set SLUG_DBP 'dbp'
\set SLUG_DCO 'dco'
\set SLUG_L24 'l24-working-rooms'
\set SLUG_DTMF 'dtmf'
\set SLUG_DT2_0 'dt2-0'
\set SLUG_GHC 'ghc'

-- Define array element constants
\set ELEM_DWS_CORE 'dws-core'
\set ELEM_GOVERNANCE 'governance'
\set ELEM_LEARNING_CENTER 'learning-center'

-- Clear existing data (optional - comment out if you want to preserve existing data)
-- TRUNCATE TABLE glossary_terms;

-- Insert the 10 approved glossary terms
INSERT INTO glossary_terms (term, slug, short_definition, full_definition, category, used_in, related_terms, status, owner, updated_at)
VALUES
  (
    'Digital Work Solution (DWS)',
    :'SLUG_DWS',
    'The comprehensive digital transformation framework and operating model used across DQ to deliver digital capabilities and solutions.',
    'At DQ, Digital Work Solution (DWS) is our core operating framework that defines how we design, build, and deliver digital transformation. In DWS, we structure our work across four key dimensions: Digital Work Space (DWS.1), Digital Work Sectors (DWS.2), Digital Working Studios (DWS.3), and supporting governance systems. DWS provides the operational language and methodology that all DQ teams use to align on delivery approaches, quality standards, and transformation outcomes.',
    :'CATEGORY_FRAMEWORKS',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS_1', :'SLUG_DWS_2', :'SLUG_DWS_3', :'SLUG_DBP', :'SLUG_DCO'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Work Space (DWS.1)',
    :'SLUG_DWS_1',
    'The digital environment and infrastructure where DQ associates collaborate, access tools, and execute digital work.',
    'In DWS, Digital Work Space (DWS.1) refers to the integrated digital environment that enables DQ associates to collaborate, access shared resources, and execute their work. At DQ, DWS.1 encompasses our workspace platforms, collaboration tools, knowledge repositories, and the digital infrastructure that connects teams across locations. It is the operational layer where DWS principles are applied daily, ensuring consistent access to frameworks, guidelines, and shared resources.',
    :'CATEGORY_PLATFORMS',
    ARRAY[:'ELEM_DWS_CORE', :'SLUG_L24'],
    ARRAY[:'SLUG_DWS', :'SLUG_DWS_2', :'SLUG_DWS_3'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Work Sectors (DWS.2)',
    :'SLUG_DWS_2',
    'The industry-specific domains and vertical markets where DQ applies digital transformation capabilities.',
    'At DQ, Digital Work Sectors (DWS.2) represent the industry verticals and market domains where we apply our digital transformation expertise. In DWS, sectors such as Government 4.0, Retail 4.0, Hospitality 4.0, and others define the operational contexts where DQ teams deliver solutions. DWS.2 provides the sector-specific knowledge, frameworks, and best practices that guide how we adapt DWS principles to different industry requirements and transformation goals.',
    :'CATEGORY_FRAMEWORKS',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DWS_1', :'SLUG_DWS_3'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Working Studios (DWS.3)',
    :'SLUG_DWS_3',
    'The organizational units and delivery teams within DQ that execute digital transformation projects and initiatives.',
    'In DWS, Digital Working Studios (DWS.3) are the operational delivery units within DQ that execute digital transformation work. At DQ, studios represent specialized teams organized around capabilities, technologies, or client engagements. DWS.3 defines how studios operate within the DWS framework, including their structure, governance, quality standards, and how they collaborate across the DWS ecosystem. Studios apply DWS.1 tools and DWS.2 sector knowledge to deliver transformation outcomes.',
    :'CATEGORY_ROLES',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DWS_1', :'SLUG_DWS_2'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Business Platform (DBP)',
    :'SLUG_DBP',
    'The integrated platform and technology stack that enables digital business operations and transformation delivery.',
    'At DQ, Digital Business Platform (DBP) is the foundational technology platform that supports digital business operations and transformation delivery. In DWS, DBP provides the core infrastructure, services, and capabilities that enable studios to build and deliver digital solutions efficiently. DBP encompasses development tools, deployment pipelines, data platforms, and shared services that reduce rework and accelerate delivery across DQ projects.',
    :'CATEGORY_PLATFORMS',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DCO'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Cognitive Organization (DCO)',
    :'SLUG_DCO',
    'The organizational model and operating structure that enables DQ to operate as a learning, adaptive digital organization.',
    'In DWS, Digital Cognitive Organization (DCO) represents DQ''s organizational model for operating as a continuously learning, adaptive digital organization. At DQ, DCO defines how we structure decision-making, knowledge sharing, and organizational learning to maintain agility and digital mastery. DCO encompasses governance structures, learning systems, and operational practices that enable DQ to evolve its capabilities and respond to changing digital transformation needs.',
    :'CATEGORY_GOVERNANCE',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE', :'ELEM_LEARNING_CENTER'],
    ARRAY[:'SLUG_DWS', :'SLUG_GHC', :'SLUG_L24'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'L24 Working Rooms',
    :'SLUG_L24',
    'The structured collaboration spaces and working environments where DQ teams execute focused work sessions and delivery activities.',
    'At DQ, L24 Working Rooms are the operational collaboration spaces where teams conduct focused work sessions, planning, and delivery activities. In DWS, L24 Working Rooms provide structured environments for teams to apply DWS frameworks, access shared resources, and execute transformation work. These rooms support various work modes including design sprints, development cycles, knowledge sharing, and cross-studio collaboration, all aligned with DWS principles and quality standards.',
    :'CATEGORY_WAYS',
    ARRAY[:'SLUG_L24', :'ELEM_DWS_CORE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DWS_1', :'SLUG_DCO'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Transformation 2.0 (DT2.0)',
    :'SLUG_DT2_0',
    'The evolved approach to digital transformation that emphasizes continuous adaptation, platform thinking, and ecosystem integration.',
    'At DQ, Digital Transformation 2.0 (DT2.0) represents our evolved framework for transformation that moves beyond traditional project-based approaches. In DWS, DT2.0 emphasizes continuous adaptation, platform-based architectures, and ecosystem integration. DT2.0 guides how DQ teams approach transformation initiatives, focusing on building sustainable digital capabilities rather than one-time implementations. This framework informs DWS delivery practices and quality standards.',
    :'CATEGORY_FRAMEWORKS',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DTMF'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Digital Transformation Management Framework (DTMF)',
    :'SLUG_DTMF',
    'The management and governance framework that guides how DQ plans, executes, and measures digital transformation initiatives.',
    'In DWS, Digital Transformation Management Framework (DTMF) provides the management structure and governance practices for planning, executing, and measuring transformation initiatives. At DQ, DTMF defines how we structure transformation programs, manage stakeholder alignment, track progress, and ensure quality outcomes. DTMF integrates with DWS operational practices, providing the management layer that enables studios to deliver transformation effectively while maintaining alignment with DQ standards and client expectations.',
    :'CATEGORY_GOVERNANCE',
    ARRAY[:'ELEM_DWS_CORE', :'ELEM_GOVERNANCE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DT2_0'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  ),
  (
    'Golden Honeycomb of Competence (GHC)',
    :'SLUG_GHC',
    'The competency framework that defines the essential skills, behaviors, and capabilities expected of DQ associates.',
    'At DQ, Golden Honeycomb of Competence (GHC) is the authoritative competency model that defines the skills, behaviors, and capabilities required for digital mastery. In DWS, GHC provides the operational language for associate development, performance evaluation, and career progression. GHC encompasses technical competencies, digital thinking, collaboration skills, and leadership capabilities that enable associates to contribute effectively to DQ transformation work. The framework guides learning programs, performance management, and organizational capability development.',
    :'CATEGORY_FRAMEWORKS',
    ARRAY[:'ELEM_LEARNING_CENTER', :'ELEM_GOVERNANCE', :'ELEM_DWS_CORE'],
    ARRAY[:'SLUG_DWS', :'SLUG_DCO'],
    :'STATUS_ACTIVE',
    :'OWNER_NAME',
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  term = EXCLUDED.term,
  short_definition = EXCLUDED.short_definition,
  full_definition = EXCLUDED.full_definition,
  category = EXCLUDED.category,
  used_in = EXCLUDED.used_in,
  related_terms = EXCLUDED.related_terms,
  status = EXCLUDED.status,
  owner = EXCLUDED.owner,
  updated_at = NOW();

