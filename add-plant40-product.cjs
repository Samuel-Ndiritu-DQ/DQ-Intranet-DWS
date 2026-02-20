const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const plant40Body = `## Introduction to Plant4.0

In today's rapidly evolving industrial landscape, organizations need a robust solution to seamlessly integrate operational technology (OT) and information technology (IT) while driving efficiency, safety, and sustainability. Plant4.0 is the next-generation industrial operations and performance platform designed to meet these needs, creating smarter, more connected, and autonomous plants.

Plant4.0 unifies industrial assets, processes, energy management, performance tracking, and cybersecurity in a centralized workspace. By connecting and optimizing operations, Plant4.0 helps organizations transform from fragmented systems to a single, integrated, and data-driven operations platform. Whether you're managing assets, improving process efficiency, or securing your infrastructure, Plant4.0 is your go-to solution.

## Why Plant4.0 Matters

The primary purpose of Plant4.0 is to provide a unified, data-driven environment where operators, engineers, and leaders can access critical insights, make informed decisions, and improve plant performance. Here's how it achieves this:

### Real-Time Decision Support
Plant4.0 converts raw telemetry data from IoT devices and assets into actionable insights, helping teams make faster, better decisions.

### Scalable, Long-Term Digital Transformation
As organizations evolve towards fully digital, cognitive plants, Plant4.0 serves as a scalable foundation to continuously improve safety, reliability, and operational efficiency.

### Simplified Operations
With Plant4.0, teams no longer need to deal with siloed systems. It centralizes operations, providing clear visibility and seamless workflows across different departments and teams.

## Core Features of Plant4.0

### 1. Unified Industrial Workspace
- **Streamlined Access**: One role-aware workspace provides consistent navigation across multiple modules such as Assets & IoT, Process Automation, Asset Performance Management (APM), Energy Management, and Cybersecurity
- **Multi-Tenant & Multi-Site Support**: Whether you're managing multiple plants or sectors, Plant4.0 ensures clear data separation across sites and organizational units, facilitating smooth operations across diverse environments

### 2. Asset & IoT Management
- **Comprehensive Asset Visibility**: Create a contextual portfolio of fixed, mobile, and networked assets. Easily manage data from IoT sensors, telemetry, and maintenance records
- **360° Asset Insights**: Plant4.0 provides detailed insights into asset health, performance, location, and ownership, creating a comprehensive asset management system that supports informed decision-making

### 3. Process Automation & Control
- **Event-Driven Automation**: Set up triggers and alarms based on predefined conditions to automatically respond to operational changes. This allows teams to quickly detect and correct deviations
- **Governance and Compliance**: Plant4.0 ensures safe and compliant operations through versioning, approval workflows, and audit trails for changes in automation logic and control rules

### 4. Asset Performance Management (APM)
- **Proactive Maintenance**: Plant4.0 continuously monitors asset performance, leveraging real-time and historical data to predict and prevent failures before they occur
- **Optimize Operations**: It helps organizations prioritize asset maintenance, identify areas for improvement, and allocate resources effectively, ensuring that critical assets receive the attention they need

### 5. Operational Excellence & Lean Execution
- **Real-Time Performance Monitoring**: Gain visibility into key metrics like OEE (Overall Equipment Effectiveness), SAIDI, SAIFI, and losses, all in real time. Plant4.0 helps identify bottlenecks, optimize workflows, and improve productivity
- **Continuous Improvement (CI)**: Plant4.0 turns performance deviations into actionable improvement projects, helping teams close the loop on issues and track savings from lean initiatives

### 6. Energy Management & Sustainability
- **Track and Optimize Energy Consumption**: Plant4.0 tracks energy usage at every level—from individual assets to entire plants—helping organizations detect inefficiencies and minimize waste
- **Sustainability Goals**: Convert energy data into actionable sustainability metrics to report on emissions, energy consumption, and compliance with industry regulations

### 7. Cybersecurity for OT/IoT Environments
- **Comprehensive Security**: Plant4.0 provides an overview of security risks across your OT and IoT devices, helping identify threats and vulnerabilities
- **Advanced Threat Monitoring**: It supports real-time monitoring, incident response, and audit logging, ensuring robust protection against cyber threats that could disrupt industrial operations

## How Plant4.0 Benefits Your Operations

### Transformative Impact Across Key Areas

**Centralized Operations**: Break down silos across systems and departments. With Plant4.0, everything from asset management to energy optimization and process automation is integrated into a single platform. This seamless connection reduces friction and drives operational efficiency.

**Data-Driven Decision Making**: With Plant4.0, data is your most valuable asset. The platform turns raw data into actionable insights that support operational decision-making in real time, empowering teams at all levels to act faster and more accurately.

**Increased Efficiency and Reliability**: Plant4.0 continuously monitors the health and performance of industrial assets, reducing unplanned downtime and preventing unnecessary maintenance costs. Its predictive maintenance capabilities ensure optimal performance with minimal disruptions.

**Cost Savings and Sustainability**: By optimizing energy use, reducing waste, and improving operational efficiency, Plant4.0 delivers substantial cost savings. It also helps organizations meet sustainability goals by tracking and managing energy consumption and carbon emissions.

**Faster, Smarter Response to Issues**: Automated triggers, alarms, and workflows ensure that issues are detected early, escalated to the right teams, and resolved quickly, improving both operational uptime and overall plant performance.

## Who Can Benefit from Plant4.0?

Plant4.0 is ideal for organizations in complex industrial sectors, including manufacturing, oil & gas, mining, utilities, and water. The following roles can gain substantial benefits from the platform:

- **Plant Managers & Operations Leaders**: Gain a holistic view of operations, performance, and risk across your plant's assets, improving decision-making and efficiency
- **Engineering & Maintenance Teams**: Optimize asset performance, streamline maintenance workflows, and reduce unplanned downtime with predictive analytics and real-time monitoring
- **Energy & Sustainability Teams**: Improve energy usage, reduce emissions, and meet regulatory standards with real-time energy management and reporting
- **Cybersecurity Professionals**: Secure OT and IoT devices, identify vulnerabilities, and ensure robust cybersecurity compliance across your entire industrial environment

## The Future of Industrial Operations with Plant4.0

With Plant4.0, the future of industrial operations is about more than just automation—it's about turning data into actionable insights that drive smarter decision-making, enhance operational efficiency, and ensure long-term sustainability. The platform empowers plants to transform into connected, data-driven, and autonomous environments where operational excellence is not just a goal but a continuous journey.

As you step into the world of Plant4.0, you're not just learning a tool—you're becoming part of a new era of industrial operations that's faster, smarter, and more efficient. Let's take the next step in your journey to a digital, sustainable, and optimized industrial future.`;

async function addPlant40() {
  try {
    const { data, error} = await supabase
      .from('guides')
      .insert([
        {
          slug: 'plant-4-0',
          title: 'Plant 4.0',
          summary: 'Revolutionizing industrial operations with real-time data, smart automation, and unmatched efficiency!',
          body: plant40Body,
          domain: 'Products',
          guide_type: 'blueprint',
          hero_image_url: '/images/plant40.jpg'
        }
      ])
      .select();

    if (error) {
      console.error('Error adding Plant 4.0:', error);
    } else {
      console.log('✅ Successfully added Plant 4.0 product!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

addPlant40();
