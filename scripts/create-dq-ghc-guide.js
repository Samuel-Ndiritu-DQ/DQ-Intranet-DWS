import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DQ_GHC_SUMMARY = `The DQ Golden Honeycomb of Competencies (GHC) is a master framework—a Framework of Frameworks—that articulates the complete DNA of DigitalQatalyst. It brings together visionary, strategic, operational, psychological, and behavioural design dimensions into a single, unified organisational system.`;

const DQ_GHC_BODY = `# DQ Golden Honeycomb of Competencies (GHC)

The DQ Golden Honeycomb of Competencies (GHC) is a master framework—a Framework of Frameworks—that articulates the complete DNA of DigitalQatalyst.

## Our Foundation & DNA

DQ is on a mission to "Accelerate Life's Transactions Improvements, using Digital Blueprints."

We aim to achieve this tall order by helping organisations—across all sectors of the economy—better leverage digital technologies to deliver highly engaging and pro-active services in every interaction and transaction they offer.

This is a big, bold, and audacious endeavour. Yet, we are not scared.

We are confident we will succeed in this mission because we are guided in all we do by the DQ Golden Honeycomb of Competencies (GHC).

## GHC - What is it

The DQ Golden Honeycomb of Competencies (GHC) is a master framework—a Framework of Frameworks—that articulates the complete DNA of DigitalQatalyst.

It brings together visionary, strategic, operational, psychological, and behavioural design dimensions into a single, unified organisational system.

The GHC defines:
- How we think
- How we work
- How we create value
- How we grow—internally and with every partner we serve.

At the heart of the GHC are 7 interlinked core elements, each addressing a foundational question that underpins a high-performing, purpose-driven digital organisation.

## GHC - Why such a framework

In an age where agility, intelligence, and coherence define organisational success, the DQ GHC stands as the master compass for DigitalQatalyst.

For employees, the GHC offers clarity, alignment, and identity. It distills our complex digital ecosystem into seven practical and powerful pillars that guide every Qatalyst—our changemakers—in their roles.

For customers and partners, the GHC instils confidence. It is the invisible architecture behind every engagement.

For investors and stakeholders, the GHC reflects deep organisational maturity. It shows that DigitalQatalyst is not just reactive to market changes but proactively engineered for sustained growth, scale, and influence.

## 01. The DQ Vision (Purpose)

"People don't buy what you do, they buy why you do it." — Simon Sinek.

Every organisation has a mission. But not every organisation is clear on why it exists.

At DigitalQatalyst, our work is bold, technical, and complex — but it is rooted in something simple: A belief that the world moves forward when human needs and digital systems are designed to serve one another — intelligently, and consistently.

That belief is the heartbeat of everything we do. It's what unifies hundreds of choices we make daily — in how we work, what we build, and where we focus.

Our why is this: To perfect life's transactions.

This vision is not powered by guesswork. It is driven by Digital Blueprints — modular frameworks and systems that guide organisations in their evolution from traditional structures to Digital Cognitive Organisations (DCOs).

## 02. HoV (Culture)

At DQ, we believe culture is not something you hope for. It's something you build.

Every company has values — written on walls, buried in onboarding slides. But what matters is how those values show up when stakes are high, time is short, or no one is watching.

That's why we built a culture system. We call it the House of Values (HoV).

It's made up of three Mantras that guide how Qatalysts think, behave, and collaborate.

### 1. Self-Development
This mantra reinforces that growth is not passive — it's a daily responsibility.

"We grow ourselves and others through every experience."

- Emotional Intelligence — We stay calm, present, and accountable under pressure
- Growth Mindset — We embrace feedback, learn from failure, and evolve fast

### 2. Lean Working
This is how we protect momentum and reduce waste.

"We pursue clarity, efficiency, and prompt outcomes in everything we do."

- Purpose – We stay connected to why the work matters
- Perceptive – We anticipate needs and make thoughtful choices
- Proactive – We take initiative and move things forward
- Perseverance – We push through setbacks with focus
- Precision – We sweat the details that drive performance

### 3. Value Co-Creation
Collaboration isn't optional — it's how we scale intelligence.

"We partner with others to create greater impact together."

- Customer – We design with empathy for those we serve
- Learning – We remain open, curious, and teachable
- Collaboration – We work as one, not in silos
- Responsibility – We own our decisions and their consequences
- Trust – We build it through honesty, clarity, and consistency

These are reinforced by 12 Guiding Values — practical behaviors that help us lead with focus, collaborate with trust, and perform under pressure.

At DQ, culture isn't an extra layer. It's the structure beneath everything we do.

## 03. Persona (Identity)

Every transformation journey begins with people. And at DQ, we've learned: it's not just about hiring talent. It's about finding fit.

The DQ Persona is our shared identity — a set of traits and behaviours that define not just who thrives here, but why they do.

In every interaction, across every role — from employees to clients, partners to investors — the most impactful people at DQ are:

- Purpose-driven – Anchored in the why
- Perceptive – Aware of system, self, and signals
- Proactive – Acting before being asked
- Persevering – Unshaken by ambiguity or challenge
- Precise – Making clarity and craft non-negotiable

This Persona shapes how we build teams, assign roles, and make partnerships. It helps us move faster — because we don't waste energy on misalignment.

In a world where skills evolve quickly, fit is the future. And at DQ, fit means more than matching values — it means amplifying the mission.

## 04. Agile TMS

The Agile TMS (Task Management System) is how DQ turns strategy into motion — every day, in every team. It's the living rhythm of how we plan, prioritise, deliver, and adapt — all without sacrificing speed or coherence.

Agile TMS breaks down work into clear, actionable units — with ownership, urgency, and intent baked in. This isn't just about managing tasks, it's about creating momentum — with purpose.

Our teams move in weekly sprints, daily check-ins, and structured reviews. We use rituals like Co-Working Sessions (CWS), Blitz Sprints, and Feedback Loops to unblock friction and drive clarity.

And most importantly, we treat every task as a signal — a chance to ask: Does this move the needle? Is this tied to a larger outcome? Will this help us get better, not just busier?

## 05. Agile SoS (Governance)

Most organisations treat governance like brakes. At DQ, it's a steering wheel.

Agile SoS — our System of Systems — is the governance model that helps us move fast without losing direction. It's not about control. It's about coherence — ensuring that quality, alignment, and value flow through everything we do.

It's composed of four systems:

- System of Governance (SoG) — sets strategic direction and operating rhythm
- System of Quality (SoQ) — reinforces excellence and builds mastery
- System of Value (SoV) — defines impact, aligns outcomes
- System of Discipline (SoD) — tackles root frictions, not just symptoms

They are designed layers that help us scale — where each team knows how to move, and why it matters.

This is how we make agility sustainable. Not just for today — but for the future we're building.

## 06. Agile Flows (Value Streams)

Ideas are easy. What's hard is getting them across the finish line — intact, on time, and aligned to purpose.

Agile Flows is our answer to that challenge. It's how we design and manage value streams across the DQ organisation — from market insight to customer impact.

Rather than siloing work by function, we structure it by flow — end-to-end streams. Each stream connects product, design, engineering, delivery, and strategy — with shared artefacts and handoffs that keep everyone in sync.

### The Six Stages of the Value Chain:

1. Market to Lead - Where opportunities begin.
2. Lead to Opportunity - Where interest becomes intent.
3. Opportunity to Order - Where solutions are formalized.
4. Order to Fulfillment - Where delivery begins.
5. Fulfillment to Revenue - Where outcomes are recognized.
6. Revenue to Loyalty - Where value is sustained.

This architecture allows us to: Eliminate duplication, Reduce blockers, See problems before they scale, Deliver as one.

Because when you design delivery like a system, you create room for excellence to scale.

## 07. Agile 6xD (Products)

Transformation isn't something we talk about. It's something we build.

The Agile 6xD Framework is how DQ designs, builds, and scales digital transformation — not as a one-time project, but as a living, evolving process.

It's built on Six Essential Perspectives — each answering a fundamental question every organisation must face on its path to relevance in the digital age.

### The 6 Digital Perspectives:

1. Digital Economy (DE) - Why should organisations change?
2. Digital Cognitive Organisation (DCO) - Where are organisations headed?
3. Digital Business Platforms (DBP) - What must be built to enable transformation?
4. Digital Transformation 2.0 (DT2.0) - How should transformation be designed and deployed?
5. Digital Worker & Workspace (DW:WS) - Who delivers the change, and how do they work?
6. Digital Accelerators (Tools) - When will value be realised, and how fast, effective, and aligned will it be?

Together, these six perspectives form a transformation compass — a blueprint that helps organisations move with clarity, discipline, and speed.

They help organisations not only design for change, but live it — continuously learning, adapting, and delivering value in rhythm with a fast-changing digital world.

## GHC - In Short

The Golden Honeycomb of Competencies (GHC) brings structure to how we think, work, and grow.

Each cell in this StoryBook reflects one part of the system — from the values that shape our culture, to the agile rhythms that guide our work, to the strategy and frameworks that align us around shared outcomes.

In short, the DQ GHC shapes our operating system. It is the north star for all Qatalysts; the bedrock upon which we will continue to shape better digital futures—transaction by transaction, life by life, organisation by organisation.`;

function getUniqueImage(guideId, title) {
  const hash = createHash('md5').update(`${guideId}-${title}`).digest('hex');
  const hashNum = parseInt(hash.substring(0, 8), 16);
  const photoIds = [
    '1552664730-d307ca884978', '1522071820081-009f0129c71c', '1551288049-bebda4e38f71',
    '1454165804606-c3d57bc86b40', '1460925895917-afdab827c52f', '1556742049-0cfed4f6a45d',
    '1557800636-23f87b1063e4', '1521737854947-0b219b6c2c94', '1553877522-25bcdc54f2de',
    '1507003211169-0a1dd7228fbb', '1516321318469-88ce825ef878', '1556761175-597af40f565e',
    '1556073709-9fae23b835b2', '1557804816-2b21ebcb1977', '1559827261-9cbd8d3600a9',
    '1559827261-9cbd8d3600a9', '1551288049-bebda4e38f71', '1557800636-23f87b1063e4',
  ];
  const photoId = photoIds[hashNum % photoIds.length];
  const uniqueParam = hash.substring(0, 6);
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=400&fit=crop&q=80&u=${uniqueParam}`;
}

async function createDQGHCGuide() {
  console.log('📝 Creating DQ GHC guide...\n');

  const slug = 'dq-ghc';
  const title = 'DQ Golden Honeycomb of Competencies (GHC)';

  // Check if it already exists by slug
  const { data: existing } = await supabase
    .from('guides')
    .select('id, title, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    console.log('⚠️  DQ GHC guide already exists:');
    console.log(`   - ${existing.title} (ID: ${existing.id}, Slug: ${existing.slug})`);
    console.log('\nUpdating existing guide...');
    
    const guideId = existing.id;
    const imageUrl = getUniqueImage(guideId, title);
    
    const { error: updateError } = await supabase
      .from('guides')
      .update({
        title: title,
        summary: DQ_GHC_SUMMARY,
        body: DQ_GHC_BODY,
        domain: 'Strategy',
        sub_domain: 'ghc',
        guide_type: 'Framework',
        unit: 'Stories',
        location: 'DXB',
        hero_image_url: imageUrl,
        status: 'Approved',
        last_updated_at: new Date().toISOString()
      })
      .eq('id', guideId);

    if (updateError) {
      console.error(`❌ Error updating: ${updateError.message}`);
      process.exit(1);
    } else {
      console.log(`✅ Successfully updated DQ GHC guide!`);
      console.log(`   Guide is now available at: /marketplace/guides/${slug}`);
    }
    return;
  }

  // Create new guide
  const guideId = `temp-${Date.now()}`;
  const imageUrl = getUniqueImage(guideId, title);

  const newGuide = {
    title: title,
    slug: slug,
    summary: DQ_GHC_SUMMARY,
    body: DQ_GHC_BODY,
    domain: 'Strategy',
    sub_domain: 'ghc',
    guide_type: 'Framework',
    unit: 'Stories',
    location: 'DXB',
    hero_image_url: imageUrl,
    status: 'Approved'
  };

  const { data, error } = await supabase
    .from('guides')
    .insert(newGuide)
    .select();

  if (error) {
    console.error('❌ Error creating guide:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ Successfully created DQ GHC guide!');
    console.log(`   ID: ${data[0].id}`);
    console.log(`   Title: ${data[0].title}`);
    console.log(`   Slug: ${data[0].slug}`);
    console.log(`   Domain: Strategy`);
    console.log(`   Sub-Domain: ghc`);
    console.log(`   Guide Type: Framework`);
    console.log(`   Guide is now available at: /marketplace/guides/${slug}`);
  }
}

createDQGHCGuide().catch(console.error);

